import { describe, it, expect } from "vitest";
import {
  calculateEffectiveWeight,
  calculateFoodNutrients,
  calculateMealNutrients,
  calculateDailyNutrients,
  calculateAdequacyPercentage,
  calculateAllNutrientAdequacies,
  formatNutrientValue,
  formatPercentage,
  FoodComposition,
} from "../index";

describe("Nutrition Calculation Domain Engine", () => {
  // Test 1: 100g food with 100 kcal/100g -> result = 100 kcal
  it("Test 1: calculates 100g of food with 100 kcal/100g as exactly 100 kcal", () => {
    const food: FoodComposition = {
      id: "food-1",
      code: "F001",
      name: "Bahan Uji 1",
      bddPercent: 100,
      nutrients: {
        energy: 100,
        protein: 10,
        fat: 5,
        carbohydrate: 20,
      },
    };

    const result = calculateFoodNutrients(food, 100, "edible");
    expect(result.effectiveWeight).toBe(100);
    expect(result.nutrients.energy).toBe(100);
    expect(result.nutrients.protein).toBe(10);
    expect(result.nutrients.fat).toBe(5);
    expect(result.nutrients.carbohydrate).toBe(20);
  });

  // Test 2: 150g food with 180 kcal/100g -> result = 270 kcal
  it("Test 2: calculates 150g of food with 180 kcal/100g as 270 kcal", () => {
    const food: FoodComposition = {
      id: "food-2",
      code: "F002",
      name: "Bahan Uji 2",
      bddPercent: 100,
      nutrients: {
        energy: 180,
        protein: 4.5,
      },
    };

    const result = calculateFoodNutrients(food, 150, "edible");
    expect(result.effectiveWeight).toBe(150);
    expect(result.nutrients.energy).toBe(270);
    expect(result.nutrients.protein).toBe(6.75);
  });

  // Test 3: Gross weight + BDD: weight = 200g, BDD = 80% -> effective weight = 160g
  it("Test 3: converts gross weight (200g) with BDD 80% into effective edible weight 160g", () => {
    const weightResult = calculateEffectiveWeight(200, "gross", 80);
    expect(weightResult.effectiveWeight).toBe(160);
    expect(weightResult.weightMode).toBe("gross");
    expect(weightResult.bddPercent).toBe(80);
    expect(weightResult.warning).toBeNull();

    const food: FoodComposition = {
      id: "food-3",
      code: "F003",
      name: "Ayam dengan tulang",
      bddPercent: 80,
      nutrients: {
        energy: 200, // 200 kcal / 100g edible
      },
    };

    const foodResult = calculateFoodNutrients(food, 200, "gross");
    expect(foodResult.effectiveWeight).toBe(160);
    // 200 kcal/100g * 160g / 100 = 320 kcal
    expect(foodResult.nutrients.energy).toBe(320);
  });

  // Test 4: Meal subtotal (aggregates multiple foods correctly)
  it("Test 4: aggregates multiple foods correctly in a meal section", () => {
    const foodA: FoodComposition = {
      id: "food-a",
      code: "FA",
      name: "Nasi",
      bddPercent: 100,
      nutrients: {
        energy: 180,
        protein: 3.0,
        fat: 0.3,
        carbohydrate: 39.8,
      },
    };

    const foodB: FoodComposition = {
      id: "food-b",
      code: "FB",
      name: "Telur Ayam",
      bddPercent: 90,
      nutrients: {
        energy: 155,
        protein: 13.0,
        fat: 11.0,
        carbohydrate: 1.1,
      },
    };

    const item1 = calculateFoodNutrients(foodA, 100, "edible"); // 180 kcal, 3g P, 0.3g F, 39.8g C
    const item2 = calculateFoodNutrients(foodB, 100, "edible"); // 155 kcal, 13g P, 11g F, 1.1g C

    const meal = calculateMealNutrients("breakfast", [item1, item2]);
    expect(meal.foodCount).toBe(2);
    expect(meal.totals.energy).toBeCloseTo(335, 4);
    expect(meal.totals.protein).toBeCloseTo(16.0, 4);
    expect(meal.totals.fat).toBeCloseTo(11.3, 4);
    expect(meal.totals.carbohydrate).toBeCloseTo(40.9, 4);
  });

  // Test 5: Daily subtotal (aggregates multiple meals correctly)
  it("Test 5: aggregates multiple meals into daily total correctly", () => {
    const foodA: FoodComposition = {
      id: "fa",
      code: "FA",
      name: "Food A",
      nutrients: { energy: 400, protein: 20 },
    };
    const foodB: FoodComposition = {
      id: "fb",
      code: "FB",
      name: "Food B",
      nutrients: { energy: 600, protein: 30 },
    };

    const meal1 = calculateMealNutrients("breakfast", [calculateFoodNutrients(foodA, 100)]);
    const meal2 = calculateMealNutrients("lunch", [calculateFoodNutrients(foodB, 100)]);

    const daily = calculateDailyNutrients([meal1, meal2]);
    expect(daily.mealCount).toBe(2);
    expect(daily.foodCount).toBe(2);
    expect(daily.totals.energy).toBe(1000);
    expect(daily.totals.protein).toBe(50);
  });

  // Test 6: Adequacy calculation: 1800 / 2000 * 100 = 90%
  it("Test 6: calculates adequacy percentage correctly (1800 / 2000 * 100 = 90%)", () => {
    const adequacy = calculateAdequacyPercentage(1800, 2000);
    expect(adequacy).toBe(90);
  });

  // Test 7: Zero target / null target must return null, not Infinity or NaN
  it("Test 7: handles zero, negative, and null targets safely without producing Infinity or NaN", () => {
    expect(calculateAdequacyPercentage(1800, 0)).toBeNull();
    expect(calculateAdequacyPercentage(1800, -500)).toBeNull();
    expect(calculateAdequacyPercentage(1800, null)).toBeNull();
    expect(calculateAdequacyPercentage(1800, undefined)).toBeNull();
    expect(calculateAdequacyPercentage(null, 2000)).toBeNull();
    expect(calculateAdequacyPercentage(undefined, 2000)).toBeNull();
    expect(calculateAdequacyPercentage(NaN, 2000)).toBeNull();
    expect(calculateAdequacyPercentage(1800, NaN)).toBeNull();
  });

  // Test 8: Missing nutrient data must remain null and not become arbitrary fake data
  it("Test 8: preserves missing / unknown nutrient values as null", () => {
    const food: FoodComposition = {
      id: "food-unknown",
      code: "FU01",
      name: "Makanan Tanpa Data Vitamin",
      nutrients: {
        energy: 100,
        vitamin_c: null, // unknown in TKPI
      },
    };

    const calculated = calculateFoodNutrients(food, 100);
    expect(calculated.nutrients.energy).toBe(100);
    expect(calculated.nutrients.vitamin_c).toBeNull();

    const meal = calculateMealNutrients("breakfast", [calculated]);
    expect(meal.totals.vitamin_c).toBeNull();
  });

  // Test 9: BDD unavailable in gross weight mode produces controlled warning and safe result
  it("Test 9: gross weight mode with missing BDD generates a controlled warning", () => {
    const food: FoodComposition = {
      id: "food-no-bdd",
      code: "FNB",
      name: "Makanan Tanpa BDD",
      bddPercent: null,
      nutrients: { energy: 100 },
    };

    const result = calculateFoodNutrients(food, 200, "gross");
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("BDD tidak tersedia");
    expect(result.effectiveWeight).toBe(200);
  });

  // Additional tests: presentation formatting
  describe("Presentation Formatting", () => {
    it("formats energy with thousands separator and integer/decimal rules", () => {
      expect(formatNutrientValue(1850, "energy")).toBe("1.850");
      expect(formatNutrientValue(1850.5, "energy")).toBe("1.850,5");
      expect(formatNutrientValue(null, "energy")).toBe("—");
    });

    it("formats macronutrients and micronutrients with max 2 decimals", () => {
      expect(formatNutrientValue(68.456, "protein")).toBe("68,46");
      expect(formatNutrientValue(68, "protein")).toBe("68");
      expect(formatNutrientValue(null, "protein")).toBe("—");
    });

    it("formats adequacy percentage with max 1 decimal and % sign", () => {
      expect(formatPercentage(90)).toBe("90%");
      expect(formatPercentage(88.125)).toBe("88,1%");
      expect(formatPercentage(null)).toBe("—");
    });
  });

  // Additional tests: full adequacy matrix computation
  describe("calculateAllNutrientAdequacies", () => {
    it("computes complete adequacy structure for all nutrients", () => {
      const dailyTotals = {
        energy: 1850,
        protein: 68,
        fat: 55,
        carbohydrate: 270,
      };
      const targets = {
        energy: 2000,
        protein: 75,
      };

      const result = calculateAllNutrientAdequacies(dailyTotals, targets);
      expect(result.energy.intake).toBe(1850);
      expect(result.energy.target).toBe(2000);
      expect(result.energy.percentage).toBe(92.5);

      expect(result.protein.intake).toBe(68);
      expect(result.protein.target).toBe(75);
      expect(result.protein.percentage).toBeCloseTo(90.67, 1);

      // Fat has intake but no target
      expect(result.fat.intake).toBe(55);
      expect(result.fat.target).toBeNull();
      expect(result.fat.percentage).toBeNull();
    });
  });
});
