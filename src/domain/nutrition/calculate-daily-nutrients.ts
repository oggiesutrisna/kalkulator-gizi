import { DailyNutrientCalculation, MealNutrientCalculation } from "./nutrition.types";
import { TKPI_NUTRIENTS } from "./nutrition.constants";

/**
 * Aggregates all meal sections into a daily total.
 *
 * Sums numeric values for each nutrient across all meals.
 * If all meals have null for a nutrient, daily total is null.
 */
export function calculateDailyNutrients(
  meals: MealNutrientCalculation[]
): DailyNutrientCalculation {
  const totals: Record<string, number | null> = {};

  for (const nDef of TKPI_NUTRIENTS) {
    totals[nDef.code] = null;
  }

  let totalFoodCount = 0;

  for (const nDef of TKPI_NUTRIENTS) {
    const code = nDef.code;
    let sum = 0;
    let hasValue = false;

    for (const meal of meals) {
      const val = meal.totals[code];
      if (val !== null && val !== undefined && Number.isFinite(val)) {
        sum += val;
        hasValue = true;
      }
    }

    totals[code] = hasValue ? sum : null;
  }

  for (const meal of meals) {
    totalFoodCount += meal.foodCount;
  }

  return {
    meals,
    totals,
    mealCount: meals.length,
    foodCount: totalFoodCount,
  };
}
