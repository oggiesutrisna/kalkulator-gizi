"use server";

import { z } from "zod";
import { like, or, eq, sql, inArray } from "drizzle-orm";
import { getDatabase } from "@/db";
import { foods, nutrients, foodNutrients } from "@/db/schema";
import { FoodWithNutrients, DatasetStatus } from "./food.types";
import { TKPI_SOURCE_VERSION } from "@/domain/nutrition/nutrition.constants";

const SearchInputSchema = z.object({
  query: z.string().trim().max(100),
  limit: z.number().int().min(1).max(50).default(20),
});

export async function searchFoodsAction(
  rawQuery: string,
  rawLimit: number = 20
): Promise<FoodWithNutrients[]> {
  const parsed = SearchInputSchema.safeParse({ query: rawQuery, limit: rawLimit });
  if (!parsed.success) {
    return [];
  }

  const { query, limit } = parsed.data;
  if (!query) {
    return [];
  }

  const db = getDatabase();
  const lowerPattern = `%${query.toLowerCase()}%`;

  // Search by code or name (case-insensitive, SQLite compatible)
  const matchedFoods = await db
    .select({
      id: foods.id,
      code: foods.code,
      name: foods.name,
      sourceDescription: foods.sourceDescription,
      bddPercent: foods.bddPercent,
    })
    .from(foods)
    .where(
      or(
        like(sql`lower(${foods.code})`, lowerPattern),
        like(sql`lower(${foods.name})`, lowerPattern)
      )
    )
    .limit(limit);

  if (matchedFoods.length === 0) {
    return [];
  }

  const foodIds = matchedFoods.map((f) => f.id);

  // Fetch all nutrients for matched foods in one query
  const allNutrientDefs = await db.select().from(nutrients);
  const nutrientCodeById: Record<string, string> = {};
  for (const n of allNutrientDefs) {
    nutrientCodeById[n.id] = n.code;
  }

  const nutrientRows = await db
    .select({
      foodId: foodNutrients.foodId,
      nutrientId: foodNutrients.nutrientId,
      valuePer100g: foodNutrients.valuePer100g,
    })
    .from(foodNutrients)
    .where(inArray(foodNutrients.foodId, foodIds));

  const nutrientMapByFoodId: Record<string, Record<string, number | null>> = {};
  for (const f of matchedFoods) {
    nutrientMapByFoodId[f.id] = {};
  }

  for (const nr of nutrientRows) {
    const nCode = nutrientCodeById[nr.nutrientId];
    if (nCode && nutrientMapByFoodId[nr.foodId]) {
      nutrientMapByFoodId[nr.foodId][nCode] = nr.valuePer100g;
    }
  }

  return matchedFoods.map((f) => ({
    ...f,
    nutrients: nutrientMapByFoodId[f.id] || {},
  }));
}

export async function getFoodByIdAction(foodId: string): Promise<FoodWithNutrients | null> {
  if (!foodId) return null;

  const db = getDatabase();
  const matched = await db.select().from(foods).where(eq(foods.id, foodId)).limit(1);
  if (matched.length === 0) return null;

  const food = matched[0];
  const allNutrientDefs = await db.select().from(nutrients);
  const nutrientCodeById: Record<string, string> = {};
  for (const n of allNutrientDefs) {
    nutrientCodeById[n.id] = n.code;
  }

  const nutrientRows = await db
    .select({
      nutrientId: foodNutrients.nutrientId,
      valuePer100g: foodNutrients.valuePer100g,
    })
    .from(foodNutrients)
    .where(eq(foodNutrients.foodId, foodId));

  const nutrientMap: Record<string, number | null> = {};
  for (const nr of nutrientRows) {
    const nCode = nutrientCodeById[nr.nutrientId];
    if (nCode) {
      nutrientMap[nCode] = nr.valuePer100g;
    }
  }

  return {
    id: food.id,
    code: food.code,
    name: food.name,
    sourceDescription: food.sourceDescription,
    bddPercent: food.bddPercent,
    nutrients: nutrientMap,
  };
}

export async function getDatasetStatusAction(): Promise<DatasetStatus> {
  try {
    const db = getDatabase();
    const foodCountResult = await db.select({ count: sql<number>`count(*)` }).from(foods);
    const nutrientCountResult = await db.select({ count: sql<number>`count(*)` }).from(nutrients);

    const foodCount = Number(foodCountResult[0]?.count || 0);
    const nutrientCount = Number(nutrientCountResult[0]?.count || 0);

    return {
      isImported: foodCount > 0,
      foodCount,
      nutrientCount,
      sourceVersion: TKPI_SOURCE_VERSION,
    };
  } catch {
    return {
      isImported: false,
      foodCount: 0,
      nutrientCount: 0,
      sourceVersion: TKPI_SOURCE_VERSION,
    };
  }
}
