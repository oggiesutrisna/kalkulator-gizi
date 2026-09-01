export interface NutrientDefinition {
  code: string;
  name: string;
  displayName: string;
  unit: string;
  excelHeader: string;
  sortOrder: number;
  isMacro?: boolean;
}

export const NUTRITION_FORMULA_VERSION = "1.0.0";
export const TKPI_SOURCE_VERSION = "2020";

export const TKPI_NUTRIENTS: readonly NutrientDefinition[] = [
  {
    code: "energy",
    name: "Energi",
    displayName: "Energi",
    unit: "kkal",
    excelHeader: "ENERGI",
    sortOrder: 1,
    isMacro: true,
  },
  {
    code: "protein",
    name: "Protein",
    displayName: "Protein",
    unit: "g",
    excelHeader: "PROTEIN",
    sortOrder: 2,
    isMacro: true,
  },
  {
    code: "fat",
    name: "Lemak",
    displayName: "Lemak",
    unit: "g",
    excelHeader: "LEMAK",
    sortOrder: 3,
    isMacro: true,
  },
  {
    code: "carbohydrate",
    name: "Karbohidrat",
    displayName: "Karbohidrat",
    unit: "g",
    excelHeader: "KH",
    sortOrder: 4,
    isMacro: true,
  },
  {
    code: "fiber",
    name: "Serat",
    displayName: "Serat Pangan",
    unit: "g",
    excelHeader: "SERAT",
    sortOrder: 5,
    isMacro: true,
  },
  {
    code: "water",
    name: "Air",
    displayName: "Kadar Air",
    unit: "g",
    excelHeader: "AIR",
    sortOrder: 6,
  },
  {
    code: "ash",
    name: "Abu",
    displayName: "Kadar Abu",
    unit: "g",
    excelHeader: "ABU",
    sortOrder: 7,
  },
  {
    code: "calcium",
    name: "Kalsium",
    displayName: "Kalsium (Ca)",
    unit: "mg",
    excelHeader: "KALSIUM",
    sortOrder: 8,
  },
  {
    code: "phosphorus",
    name: "Fosfor",
    displayName: "Fosfor (P)",
    unit: "mg",
    excelHeader: "FOSFOR",
    sortOrder: 9,
  },
  {
    code: "iron",
    name: "Besi",
    displayName: "Besi (Fe)",
    unit: "mg",
    excelHeader: "BESI",
    sortOrder: 10,
  },
  {
    code: "sodium",
    name: "Natrium",
    displayName: "Natrium (Na)",
    unit: "mg",
    excelHeader: "NATRIUM",
    sortOrder: 11,
  },
  {
    code: "potassium",
    name: "Kalium",
    displayName: "Kalium (K)",
    unit: "mg",
    excelHeader: "KALIUM",
    sortOrder: 12,
  },
  {
    code: "copper",
    name: "Tembaga",
    displayName: "Tembaga (Cu)",
    unit: "mg",
    excelHeader: "TEMBAGA",
    sortOrder: 13,
  },
  {
    code: "zinc",
    name: "Seng",
    displayName: "Seng (Zn)",
    unit: "mg",
    excelHeader: "SENG",
    sortOrder: 14,
  },
  {
    code: "retinol",
    name: "Retinol",
    displayName: "Retinol (Vit. A)",
    unit: "mcg",
    excelHeader: "RETINOL",
    sortOrder: 15,
  },
  {
    code: "beta_carotene",
    name: "Beta-Karoten",
    displayName: "Beta-Karoten",
    unit: "mcg",
    excelHeader: "B-KAR",
    sortOrder: 16,
  },
  {
    code: "total_carotene",
    name: "Karoten Total",
    displayName: "Karoten Total",
    unit: "mcg",
    excelHeader: "KAR-TOTAL",
    sortOrder: 17,
  },
  {
    code: "thiamin",
    name: "Tiamin",
    displayName: "Tiamin (Vit. B1)",
    unit: "mg",
    excelHeader: "THIAMIN",
    sortOrder: 18,
  },
  {
    code: "riboflavin",
    name: "Riboflavin",
    displayName: "Riboflavin (Vit. B2)",
    unit: "mg",
    excelHeader: "RIBOFLAVIN",
    sortOrder: 19,
  },
  {
    code: "niacin",
    name: "Niasin",
    displayName: "Niasin (Vit. B3)",
    unit: "mg",
    excelHeader: "NIASIN",
    sortOrder: 20,
  },
  {
    code: "vitamin_c",
    name: "Vitamin C",
    displayName: "Vitamin C",
    unit: "mg",
    excelHeader: "VIT_C",
    sortOrder: 21,
  },
] as const;

export const MEAL_TYPES = [
  { id: "breakfast", label: "Makan Pagi", defaultTime: "07:00" },
  { id: "morning_snack", label: "Snack Pagi", defaultTime: "10:00" },
  { id: "lunch", label: "Makan Siang", defaultTime: "12:30" },
  { id: "afternoon_snack", label: "Snack Sore", defaultTime: "16:00" },
  { id: "dinner", label: "Makan Malam", defaultTime: "19:00" },
] as const;

export type MealTypeId = (typeof MEAL_TYPES)[number]["id"];
export type WeightMode = "edible" | "gross";
