import { FoodComposition, FoodNutrientCalculation } from "./nutrition.types";
import { WeightMode } from "./nutrition.constants";
import { calculateEffectiveWeight } from "./calculate-effective-weight";

/**
 * Calculates nutrient amounts for a given food and entered weight.
 *
 * Formula: nutrientAmount = (valuePer100g * effectiveWeight) / 100
 *
 * Preserves null values when nutrient composition is unknown / not available.
 * Never produces NaN or Infinity.
 */
export function calculateFoodNutrients(
  food: FoodComposition,
  enteredWeight: number,
  weightMode: WeightMode = "edible"
): FoodNutrientCalculation {
  const weightResult = calculateEffectiveWeight(enteredWeight, weightMode, food.bddPercent);
  const warnings: string[] = [];

  if (weightResult.warning) {
    warnings.push(weightResult.warning);
  }

  const computedNutrients: Record<string, number | null> = {};

  for (const [nutrientCode, valuePer100g] of Object.entries(food.nutrients)) {
    if (valuePer100g === null || valuePer100g === undefined || !Number.isFinite(valuePer100g)) {
      computedNutrients[nutrientCode] = null;
    } else {
      const amount = (valuePer100g * weightResult.effectiveWeight) / 100;
      computedNutrients[nutrientCode] = Number.isFinite(amount) ? amount : null;
    }
  }

  return {
    foodId: food.id,
    foodCode: food.code,
    foodName: food.name,
    enteredWeight: weightResult.enteredWeight,
    weightMode: weightResult.weightMode,
    bddPercent: weightResult.bddPercent,
    effectiveWeight: weightResult.effectiveWeight,
    nutrients: computedNutrients,
    warnings,
  };
}
