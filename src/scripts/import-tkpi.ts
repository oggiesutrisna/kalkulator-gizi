import * as fs from "fs";
import * as path from "path";
import { createRequire } from "module";
import * as dotenv from "dotenv";
import { eq, and, sql } from "drizzle-orm";
import { getDatabase } from "../db";
import { runMigrations } from "../db/migrate";
import { foodSources, foods, nutrients, foodNutrients } from "../db/schema";
import { TKPI_NUTRIENTS, TKPI_SOURCE_VERSION } from "../domain/nutrition/nutrition.constants";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

dotenv.config();

export interface ImportSummary {
  foodsProcessed: number;
  foodsInserted: number;
  foodsUpdated: number;
  nutrientsDetected: number;
  nutrientRecords: number;
  rowsSkipped: number;
  errors: number;
}

interface ParsedFoodRow {
  code: string;
  name: string;
  sourceDescription: string | null;
  bddPercent: number | null;
  nutrientValues: Record<string, number | null>;
}

export function findExcelWorkbook(): string | null {
  const envPath = process.env.TKPI_XLSX_PATH;
  if (envPath && fs.existsSync(envPath)) {
    return path.resolve(envPath);
  }

  const candidatePaths = [
    path.resolve(process.cwd(), "EXCEL PERHITUNGAN NILAI GIZI TKPI 2020.xlsx"),
    path.resolve(process.cwd(), "data/source/EXCEL PERHITUNGAN NILAI GIZI TKPI 2020.xlsx"),
    path.resolve(process.cwd(), "data/EXCEL PERHITUNGAN NILAI GIZI TKPI 2020.xlsx"),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  function searchDir(dir: string, depth: number): string | null {
    if (depth > 3) return null;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
        const fullPath = path.join(dir, entry.name);
        if (
          entry.isFile() &&
          entry.name.toLowerCase().endsWith(".xlsx") &&
          (entry.name.toLowerCase().includes("tkpi") || entry.name.toLowerCase().includes("gizi"))
        ) {
          return fullPath;
        }
        if (entry.isDirectory()) {
          const found = searchDir(fullPath, depth + 1);
          if (found) return found;
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  return searchDir(process.cwd(), 1);
}

function parseNumericCell(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") {
    return Number.isFinite(val) ? val : null;
  }
  const str = String(val).trim();
  if (str === "" || str === "-" || str.toLowerCase() === "na" || str.toLowerCase() === "null") {
    return null;
  }
  const normalizedStr = str.replace(/,/g, ".");
  const parsed = parseFloat(normalizedStr);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function importTkpiData(workbookPath?: string): Promise<ImportSummary> {
  const filePath = workbookPath || findExcelWorkbook();

  if (!filePath || !fs.existsSync(filePath)) {
    console.error("\n=======================================================");
    console.error(" [ERROR] TKPI 2020 Excel workbook not found!");
    console.error("=======================================================");
    console.error("Expected file: 'EXCEL PERHITUNGAN NILAI GIZI TKPI 2020.xlsx'");
    console.error("Please place the workbook in the project root directory or set");
    console.error("the TKPI_XLSX_PATH variable in your .env file.\n");
    throw new Error("TKPI 2020 workbook not found.");
  }

  console.log(`\n=======================================================`);
  console.log(` TKPI 2020 Nutrition Importer`);
  console.log(`=======================================================`);
  console.log(`Reading Excel file: ${filePath}`);

  await runMigrations();

  const db = getDatabase();

  const workbook = XLSX.readFile(filePath, { dense: false });
  const sheetName = workbook.SheetNames.find((s: string) => s.trim().toUpperCase() === "TKPI 2020") || workbook.SheetNames[0];

  console.log(`Using sheet: "${sheetName}"`);
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found in workbook.`);
  }

  console.log(`Ensuring food source: TKPI (${TKPI_SOURCE_VERSION})...`);
  const existingSources = await db
    .select()
    .from(foodSources)
    .where(and(eq(foodSources.name, "TKPI"), eq(foodSources.version, TKPI_SOURCE_VERSION)));

  let sourceId: string;
  if (existingSources.length > 0) {
    sourceId = existingSources[0].id;
  } else {
    const inserted = await db
      .insert(foodSources)
      .values({
        name: "TKPI",
        version: TKPI_SOURCE_VERSION,
        description: "Tabel Komposisi Pangan Indonesia 2020",
      })
      .returning();
    sourceId = inserted[0].id;
  }

  console.log(`Ensuring ${TKPI_NUTRIENTS.length} standard TKPI nutrients...`);
  const nutrientIdMap: Record<string, string> = {};

  for (const nDef of TKPI_NUTRIENTS) {
    const existing = await db.select().from(nutrients).where(eq(nutrients.code, nDef.code));
    if (existing.length > 0) {
      nutrientIdMap[nDef.code] = existing[0].id;
      await db
        .update(nutrients)
        .set({
          name: nDef.name,
          displayName: nDef.displayName,
          unit: nDef.unit,
          sortOrder: nDef.sortOrder,
        })
        .where(eq(nutrients.id, existing[0].id));
    } else {
      const inserted = await db
        .insert(nutrients)
        .values({
          code: nDef.code,
          name: nDef.name,
          displayName: nDef.displayName,
          unit: nDef.unit,
          sortOrder: nDef.sortOrder,
        })
        .returning();
      nutrientIdMap[nDef.code] = inserted[0].id;
    }
  }

  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1:Z1200");
  const rawRows: (unknown | undefined)[][] = [];

  for (let R = range.s.r; R <= range.e.r; ++R) {
    const row: (unknown | undefined)[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = sheet[cellAddress];
      row.push(cell ? cell.v : undefined);
    }
    rawRows.push(row);
  }

  let startRowIdx = 3;
  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i];
    if (row && typeof row[0] === "number" && row[1] && String(row[1]).trim().match(/^[A-Z]{2}\d{3}$/i)) {
      startRowIdx = i;
      break;
    }
  }

  console.log(`Detected data start at Excel row ${startRowIdx + 1}`);

  const nutrientColMap: Record<string, number> = {
    water: 4,
    energy: 5,
    protein: 6,
    fat: 7,
    carbohydrate: 8,
    fiber: 9,
    ash: 10,
    calcium: 11,
    phosphorus: 12,
    iron: 13,
    sodium: 14,
    potassium: 15,
    copper: 16,
    zinc: 17,
    retinol: 18,
    beta_carotene: 19,
    total_carotene: 20,
    thiamin: 21,
    riboflavin: 22,
    niacin: 23,
    vitamin_c: 24,
  };

  const parsedFoods: ParsedFoodRow[] = [];
  let skippedRows = 0;
  const warnings: string[] = [];

  for (let r = startRowIdx; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const rawCode = row[1];
    const rawName = row[2];
    const rawSource = row[3];
    const rawBdd = row[25];

    if (!rawCode && !rawName) {
      continue;
    }

    let code = rawCode ? String(rawCode).trim() : "";
    const name = rawName ? String(rawName).trim() : "";

    if (!code && name) {
      const rowNum = row[0] ? String(row[0]).trim() : `ROW${r + 1}`;
      code = `TKPI-${rowNum}`;
      warnings.push(`Row ${r + 1} ("${name}") had missing code, generated fallback code: "${code}"`);
    }

    if (!code || !name) {
      warnings.push(`Row ${r + 1} skipped: missing code or name (code="${code}", name="${name}")`);
      skippedRows++;
      continue;
    }

    const sourceDescription = rawSource ? String(rawSource).trim() : null;
    const bddPercent = parseNumericCell(rawBdd);

    const nutrientValues: Record<string, number | null> = {};
    for (const [nCode, colIdx] of Object.entries(nutrientColMap)) {
      nutrientValues[nCode] = parseNumericCell(row[colIdx]);
    }

    parsedFoods.push({
      code,
      name,
      sourceDescription,
      bddPercent,
      nutrientValues,
    });
  }

  console.log(`Parsed ${parsedFoods.length} food rows from Excel. Persisting to database...`);

  // Load existing foods map
  const existingFoods = await db
    .select({ id: foods.id, code: foods.code })
    .from(foods)
    .where(eq(foods.sourceId, sourceId));

  const existingFoodIdByCode: Record<string, string> = {};
  for (const ef of existingFoods) {
    existingFoodIdByCode[ef.code] = ef.id;
  }

  let insertedCount = 0;
  let updatedCount = 0;
  let nutrientRecordsCount = 0;

  for (const food of parsedFoods) {
    let foodId = existingFoodIdByCode[food.code];

    if (foodId) {
      await db
        .update(foods)
        .set({
          name: food.name,
          sourceDescription: food.sourceDescription,
          bddPercent: food.bddPercent,
          updatedAt: sql`now()`,
        })
        .where(eq(foods.id, foodId));
      updatedCount++;
    } else {
      const inserted = await db
        .insert(foods)
        .values({
          sourceId,
          code: food.code,
          name: food.name,
          sourceDescription: food.sourceDescription,
          bddPercent: food.bddPercent,
        })
        .returning();
      foodId = inserted[0].id;
      existingFoodIdByCode[food.code] = foodId;
      insertedCount++;
    }

    // Insert or update nutrients for this food
    const existingNutrients = await db
      .select({ id: foodNutrients.id, nutrientId: foodNutrients.nutrientId })
      .from(foodNutrients)
      .where(eq(foodNutrients.foodId, foodId));

    const existingFnIdByNutrientId: Record<string, string> = {};
    for (const en of existingNutrients) {
      existingFnIdByNutrientId[en.nutrientId] = en.id;
    }

    for (const [nCode, val] of Object.entries(food.nutrientValues)) {
      const nutrientId = nutrientIdMap[nCode];
      if (!nutrientId) continue;

      const fnId = existingFnIdByNutrientId[nutrientId];
      if (fnId) {
        await db
          .update(foodNutrients)
          .set({ valuePer100g: val })
          .where(eq(foodNutrients.id, fnId));
      } else {
        await db.insert(foodNutrients).values({
          foodId,
          nutrientId,
          valuePer100g: val,
        });
      }
      nutrientRecordsCount++;
    }
  }

  console.log(`\n=======================================================`);
  console.log(` TKPI 2020 Import Summary`);
  console.log(`=======================================================`);
  console.log(`Foods processed:     ${parsedFoods.length}`);
  console.log(`Foods inserted:      ${insertedCount}`);
  console.log(`Foods updated:       ${updatedCount}`);
  console.log(`Nutrients detected:  ${TKPI_NUTRIENTS.length}`);
  console.log(`Nutrient records:    ${nutrientRecordsCount}`);
  console.log(`Rows skipped:        ${skippedRows}`);
  console.log(`Warnings / Errors:   ${warnings.length}`);
  if (warnings.length > 0) {
    console.log(`Warnings detail:`);
    warnings.forEach((w) => console.log(`  - ${w}`));
  }
  console.log(`=======================================================\n`);

  return {
    foodsProcessed: parsedFoods.length,
    foodsInserted: insertedCount,
    foodsUpdated: updatedCount,
    nutrientsDetected: TKPI_NUTRIENTS.length,
    nutrientRecords: nutrientRecordsCount,
    rowsSkipped: skippedRows,
    errors: warnings.length,
  };
}

if (process.argv[1]?.includes("import-tkpi")) {
  importTkpiData()
    .then(() => {
      console.log("Import completed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Import failed:", err);
      process.exit(1);
    });
}
