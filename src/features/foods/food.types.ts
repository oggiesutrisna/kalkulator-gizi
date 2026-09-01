export interface FoodItem {
  id: string;
  code: string;
  name: string;
  sourceDescription: string | null;
  bddPercent: number | null;
}

export interface FoodWithNutrients extends FoodItem {
  nutrients: Record<string, number | null>;
}

export interface DatasetStatus {
  isImported: boolean;
  foodCount: number;
  nutrientCount: number;
  sourceVersion: string;
}
