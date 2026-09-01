import { MealTypeId, WeightMode } from "@/domain/nutrition/nutrition.constants";
import { FoodWithNutrients } from "../foods/food.types";

export interface SavedMealPlanListItem {
  id: string;
  name: string;
  notes: string | null;
  sourceVersion: string;
  formulaVersion: string;
  foodCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PopulatedMealEntry {
  id?: string;
  mealType: MealTypeId;
  foodId: string;
  food: FoodWithNutrients;
  weightGrams: number;
  weightMode: WeightMode;
  position: number;
}

export interface SavedMealPlanDetail {
  id: string;
  name: string;
  notes: string | null;
  sourceVersion: string;
  formulaVersion: string;
  entries: PopulatedMealEntry[];
  targets: Record<string, number | null>;
  createdAt: string;
  updatedAt: string;
}
