import { FoodNutrientCalculation, MealNutrientCalculation } from "./nutrition.types";
import { MealTypeId, TKPI_NUTRIENTS } from "./nutrition.constants";

/**
 * Aggregates nutrient calculations for all foods in a single meal section.
 *
 * Sums numeric values for each nutrient.
 * If all items have null for a nutrient, the subtotal is null.
 * If at least one item has a numeric value, sums available numbers (treating missing as 0 in sum).
 */
export function calculateMealNutrients(
  mealType: MealTypeId,
  items: FoodNutrientCalculation[]
): MealNutrientCalculation {
  const totals: Record<string, number | null> = {};

  // Initialize all known nutrients
  for (const nDef of TKPI_NUTRIENTS) {
    totals[nDef.code] = null;
  }

  if (items.length === 0) {
    return {
      mealType,
      items: [],
      totals,
      foodCount: 0,
    };
  }

  for (const nDef of TKPI_NUTRIENTS) {
    const code = nDef.code;
    let sum = 0;
    let hasValue = false;

    for (const item of items) {
      const val = item.nutrients[code];
      if (val !== null && val !== undefined && Number.isFinite(val)) {
        sum += val;
        hasValue = true;
      }
    }

    totals[code] = hasValue ? sum : null;
  }

  return {
    mealType,
    items,
    totals,
    foodCount: items.length,
  };
}
