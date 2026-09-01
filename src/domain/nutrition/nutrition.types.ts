import { MealTypeId, WeightMode } from "./nutrition.constants";

export interface FoodComposition {
  id: string;
  code: string;
  name: string;
  sourceDescription?: string | null;
  bddPercent?: number | null;
  nutrients: Record<string, number | null>;
}

export interface EffectiveWeightResult {
  enteredWeight: number;
  weightMode: WeightMode;
  bddPercent: number | null;
  effectiveWeight: number;
  warning?: string | null;
}

export interface FoodNutrientCalculation {
  foodId: string;
  foodCode: string;
  foodName: string;
  enteredWeight: number;
  weightMode: WeightMode;
  bddPercent: number | null;
  effectiveWeight: number;
  nutrients: Record<string, number | null>;
  warnings: string[];
}

export interface MealNutrientCalculation {
  mealType: MealTypeId;
  items: FoodNutrientCalculation[];
  totals: Record<string, number | null>;
  foodCount: number;
}

export interface DailyNutrientCalculation {
  meals: MealNutrientCalculation[];
  totals: Record<string, number | null>;
  mealCount: number;
  foodCount: number;
}

export interface NutrientAdequacy {
  nutrientCode: string;
  nutrientName: string;
  displayName: string;
  unit: string;
  sortOrder: number;
  isMacro?: boolean;
  intake: number | null;
  target: number | null;
  percentage: number | null;
}

export interface OverallCalculationResult {
  daily: DailyNutrientCalculation;
  adequacy: Record<string, NutrientAdequacy>;
  warnings: string[];
}
