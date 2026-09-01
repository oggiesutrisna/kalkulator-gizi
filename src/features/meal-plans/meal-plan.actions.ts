"use server";

import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDatabase } from "@/db";
import { mealPlans, mealEntries, nutritionTargets, nutrients, foods, foodNutrients } from "@/db/schema";
import { SaveMealPlanInputSchema, SaveMealPlanInput } from "./meal-plan.schema";
import { SavedMealPlanListItem, SavedMealPlanDetail, PopulatedMealEntry } from "./meal-plan.types";
import { TKPI_SOURCE_VERSION, NUTRITION_FORMULA_VERSION, MealTypeId, WeightMode } from "@/domain/nutrition/nutrition.constants";

export async function saveMealPlanAction(
  rawInput: SaveMealPlanInput
): Promise<{ success: boolean; planId?: string; error?: string }> {
  const parsed = SaveMealPlanInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || "Data rencana menu tidak valid";
    return { success: false, error: firstError };
  }

  const { id, name, notes, entries, targets } = parsed.data;
  const db = getDatabase();

  try {
    let planId = id;

    if (planId) {
      // Check if exists
      const existing = await db.select().from(mealPlans).where(eq(mealPlans.id, planId)).limit(1);
      if (existing.length === 0) {
        planId = undefined; // Create new if ID not found
      } else {
        await db
          .update(mealPlans)
          .set({
            name,
            notes: notes || null,
            sourceVersion: TKPI_SOURCE_VERSION,
            formulaVersion: NUTRITION_FORMULA_VERSION,
            updatedAt: sql`now()`,
          })
          .where(eq(mealPlans.id, planId));
      }
    }

    if (!planId) {
      const inserted = await db
        .insert(mealPlans)
        .values({
          name,
          notes: notes || null,
          sourceVersion: TKPI_SOURCE_VERSION,
          formulaVersion: NUTRITION_FORMULA_VERSION,
        })
        .returning();
      planId = inserted[0].id;
    }
    // 1. Delete existing entries and replace
    await db.delete(mealEntries).where(eq(mealEntries.mealPlanId, planId));

    if (entries.length > 0) {
      const entryValues = entries.map((entry, index) => ({
        mealPlanId: planId!,
        mealType: entry.mealType,
        foodId: entry.foodId,
        weightGrams: entry.weightGrams,
        weightMode: entry.weightMode,
        position: entry.position ?? index,
      }));
      await db.insert(mealEntries).values(entryValues);
    }

    // 2. Delete existing targets and replace
    await db.delete(nutritionTargets).where(eq(nutritionTargets.mealPlanId, planId));

    const allNutrientDefs = await db.select().from(nutrients);
    const nutrientIdByCode: Record<string, string> = {};
    for (const n of allNutrientDefs) {
      nutrientIdByCode[n.code] = n.id;
    }

    const targetValues: { mealPlanId: string; nutrientId: string; targetValue: number }[] = [];
    for (const [code, val] of Object.entries(targets)) {
      if (val !== null && val !== undefined && Number.isFinite(val) && val > 0) {
        const nId = nutrientIdByCode[code];
        if (nId) {
          targetValues.push({
            mealPlanId: planId,
            nutrientId: nId,
            targetValue: val,
          });
        }
      }
    }

    if (targetValues.length > 0) {
      await db.insert(nutritionTargets).values(targetValues);
    }

    try {
      revalidatePath("/calculator");
      revalidatePath("/plans");
    } catch {
      // Ignored outside Next.js runtime (e.g. test environment)
    }

    return { success: true, planId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("saveMealPlanAction error:", message);
    return { success: false, error: `Gagal menyimpan rencana menu: ${message}` };
  }
}

export async function getSavedMealPlansAction(): Promise<SavedMealPlanListItem[]> {
  try {
    const db = getDatabase();
    const plans = await db
      .select({
        id: mealPlans.id,
        name: mealPlans.name,
        notes: mealPlans.notes,
        sourceVersion: mealPlans.sourceVersion,
        formulaVersion: mealPlans.formulaVersion,
        createdAt: mealPlans.createdAt,
        updatedAt: mealPlans.updatedAt,
      })
      .from(mealPlans)
      .orderBy(desc(mealPlans.updatedAt));

    if (plans.length === 0) {
      return [];
    }

    // Count entries per plan
    const counts = await db
      .select({
        mealPlanId: mealEntries.mealPlanId,
        count: sql<number>`count(*)`,
      })
      .from(mealEntries)
      .groupBy(mealEntries.mealPlanId);

    const countByPlanId: Record<string, number> = {};
    for (const c of counts) {
      countByPlanId[c.mealPlanId] = Number(c.count);
    }

    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      notes: p.notes,
      sourceVersion: p.sourceVersion,
      formulaVersion: p.formulaVersion,
      foodCount: countByPlanId[p.id] || 0,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.error("getSavedMealPlansAction error:", err);
    return [];
  }
}

export async function getMealPlanByIdAction(planId: string): Promise<SavedMealPlanDetail | null> {
  if (!planId) return null;

  try {
    const db = getDatabase();
    const planRows = await db.select().from(mealPlans).where(eq(mealPlans.id, planId)).limit(1);
    if (planRows.length === 0) return null;

    const plan = planRows[0];

    // Fetch entries
    const entriesRows = await db
      .select({
        id: mealEntries.id,
        mealType: mealEntries.mealType,
        foodId: mealEntries.foodId,
        weightGrams: mealEntries.weightGrams,
        weightMode: mealEntries.weightMode,
        position: mealEntries.position,
        foodCode: foods.code,
        foodName: foods.name,
        sourceDescription: foods.sourceDescription,
        bddPercent: foods.bddPercent,
      })
      .from(mealEntries)
      .innerJoin(foods, eq(mealEntries.foodId, foods.id))
      .where(eq(mealEntries.mealPlanId, planId))
      .orderBy(mealEntries.position);

    const allNutrientDefs = await db.select().from(nutrients);
    const nutrientCodeById: Record<string, string> = {};
    for (const n of allNutrientDefs) {
      nutrientCodeById[n.id] = n.code;
    }

    // Collect all food IDs in this plan to batch-load nutrients
    const foodIds = [...new Set(entriesRows.map((e) => e.foodId))];
    const nutrientMapByFoodId: Record<string, Record<string, number | null>> = {};
    for (const fid of foodIds) {
      nutrientMapByFoodId[fid] = {};
    }

    if (foodIds.length > 0) {
      const fnRows = await db
        .select({
          foodId: foodNutrients.foodId,
          nutrientId: foodNutrients.nutrientId,
          valuePer100g: foodNutrients.valuePer100g,
        })
        .from(foodNutrients)
        .where(
          sql`${foodNutrients.foodId} IN (${sql.join(foodIds.map((id) => sql`${id}`), sql`, `)})`
        );

      for (const fn of fnRows) {
        const nCode = nutrientCodeById[fn.nutrientId];
        if (nCode && nutrientMapByFoodId[fn.foodId]) {
          nutrientMapByFoodId[fn.foodId][nCode] = fn.valuePer100g;
        }
      }
    }

    const populatedEntries: PopulatedMealEntry[] = entriesRows.map((er) => ({
      id: er.id,
      mealType: er.mealType as MealTypeId,
      foodId: er.foodId,
      weightGrams: er.weightGrams,
      weightMode: er.weightMode as WeightMode,
      position: er.position,
      food: {
        id: er.foodId,
        code: er.foodCode,
        name: er.foodName,
        sourceDescription: er.sourceDescription,
        bddPercent: er.bddPercent,
        nutrients: nutrientMapByFoodId[er.foodId] || {},
      },
    }));

    // Fetch targets
    const targetRows = await db
      .select({
        nutrientId: nutritionTargets.nutrientId,
        targetValue: nutritionTargets.targetValue,
      })
      .from(nutritionTargets)
      .where(eq(nutritionTargets.mealPlanId, planId));

    const targetsMap: Record<string, number | null> = {};
    for (const tr of targetRows) {
      const nCode = nutrientCodeById[tr.nutrientId];
      if (nCode) {
        targetsMap[nCode] = tr.targetValue;
      }
    }

    return {
      id: plan.id,
      name: plan.name,
      notes: plan.notes,
      sourceVersion: plan.sourceVersion,
      formulaVersion: plan.formulaVersion,
      entries: populatedEntries,
      targets: targetsMap,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  } catch (err) {
    console.error("getMealPlanByIdAction error:", err);
    return null;
  }
}

export async function deleteMealPlanAction(
  planId: string
): Promise<{ success: boolean; error?: string }> {
  if (!planId) return { success: false, error: "ID tidak valid" };

  try {
    const db = getDatabase();
    await db.delete(mealPlans).where(eq(mealPlans.id, planId));
    try {
      revalidatePath("/calculator");
      revalidatePath("/plans");
    } catch {
      // Ignored outside Next.js runtime
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Gagal menghapus rencana: ${message}` };
  }
}

export async function duplicateMealPlanAction(
  planId: string,
  customName?: string
): Promise<{ success: boolean; newPlanId?: string; error?: string }> {
  const detail = await getMealPlanByIdAction(planId);
  if (!detail) {
    return { success: false, error: "Rencana menu tidak ditemukan" };
  }

  const newName = customName || `${detail.name} (Salinan)`;
  const saveInput: SaveMealPlanInput = {
    name: newName,
    notes: detail.notes,
    entries: detail.entries.map((e) => ({
      mealType: e.mealType,
      foodId: e.foodId,
      weightGrams: e.weightGrams,
      weightMode: e.weightMode,
      position: e.position,
    })),
    targets: detail.targets,
  };

  const result = await saveMealPlanAction(saveInput);
  return {
    success: result.success,
    newPlanId: result.planId,
    error: result.error,
  };
}
