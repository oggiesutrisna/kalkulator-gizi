import { MealTypeId, WeightMode } from "@/domain/nutrition/nutrition.constants";
import { FoodWithNutrients } from "../foods/food.types";

export interface CalculatorFoodEntry {
  tempId: string;
  foodId: string;
  food: FoodWithNutrients;
  weightGrams: number;
  weightMode: WeightMode;
}

export interface CalculatorState {
  planId: string | null;
  planName: string;
  notes: string;
  sections: Record<MealTypeId, CalculatorFoodEntry[]>;
  targets: Record<string, number | null>;
}
