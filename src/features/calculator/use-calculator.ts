"use client";

import { useState, useMemo, useCallback } from "react";
import {
  MealTypeId,
  WeightMode,
  MEAL_TYPES,
  TKPI_NUTRIENTS,
} from "@/domain/nutrition/nutrition.constants";
import {
  calculateFoodNutrients,
  calculateMealNutrients,
  calculateDailyNutrients,
  calculateAllNutrientAdequacies,
  DailyNutrientCalculation,
  MealNutrientCalculation,
  FoodNutrientCalculation,
  NutrientAdequacy,
} from "@/domain/nutrition";
import { FoodWithNutrients } from "../foods/food.types";
import { CalculatorFoodEntry } from "./calculator.types";
import { SavedMealPlanDetail } from "../meal-plans/meal-plan.types";

function createInitialSections(): Record<MealTypeId, CalculatorFoodEntry[]> {
  return {
    breakfast: [],
    morning_snack: [],
    lunch: [],
    afternoon_snack: [],
    dinner: [],
  };
}

function createInitialTargets(): Record<string, number | null> {
  const initial: Record<string, number | null> = {};
  for (const n of TKPI_NUTRIENTS) {
    initial[n.code] = null;
  }
  // Standard recommended daily default targets for quick nutritionist convenience
  initial["energy"] = 2000;
  initial["protein"] = 65;
  initial["fat"] = 60;
  initial["carbohydrate"] = 300;
  return initial;
}

export function useCalculator(initialDetail?: SavedMealPlanDetail | null) {
  const [planId, setPlanId] = useState<string | null>(initialDetail?.id || null);
  const [planName, setPlanName] = useState<string>(initialDetail?.name || "Rencana Menu Harian");
  const [notes, setNotes] = useState<string>(initialDetail?.notes || "");

  const [sections, setSections] = useState<Record<MealTypeId, CalculatorFoodEntry[]>>(() => {
    if (!initialDetail || !initialDetail.entries) {
      return createInitialSections();
    }
    const initial = createInitialSections();
    for (const entry of initialDetail.entries) {
      if (initial[entry.mealType]) {
        initial[entry.mealType].push({
          tempId: entry.id || `entry-${Math.random().toString(36).substring(2, 9)}`,
          foodId: entry.foodId,
          food: entry.food,
          weightGrams: entry.weightGrams,
          weightMode: entry.weightMode,
        });
      }
    }
    return initial;
  });

  const [targets, setTargets] = useState<Record<string, number | null>>(() => {
    const base = createInitialTargets();
    if (initialDetail?.targets) {
      return { ...base, ...initialDetail.targets };
    }
    return base;
  });

  // Add food to a meal section
  const addFood = useCallback(
    (
      mealType: MealTypeId,
      food: FoodWithNutrients,
      weightGrams: number = 100,
      weightMode: WeightMode = "edible"
    ) => {
      const newEntry: CalculatorFoodEntry = {
        tempId: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        foodId: food.id,
        food,
        weightGrams,
        weightMode,
      };

      setSections((prev) => ({
        ...prev,
        [mealType]: [...prev[mealType], newEntry],
      }));
    },
    []
  );

  // Update weight of an entry
  const updateFoodWeight = useCallback(
    (mealType: MealTypeId, tempId: string, weightGrams: number) => {
      const safeWeight = Math.max(0, Number.isFinite(weightGrams) ? weightGrams : 0);
      setSections((prev) => ({
        ...prev,
        [mealType]: prev[mealType].map((item) =>
          item.tempId === tempId ? { ...item, weightGrams: safeWeight } : item
        ),
      }));
    },
    []
  );

  // Update weight mode (edible vs gross)
  const updateFoodWeightMode = useCallback(
    (mealType: MealTypeId, tempId: string, weightMode: WeightMode) => {
      setSections((prev) => ({
        ...prev,
        [mealType]: prev[mealType].map((item) =>
          item.tempId === tempId ? { ...item, weightMode } : item
        ),
      }));
    },
    []
  );

  // Remove a food entry
  const removeFood = useCallback((mealType: MealTypeId, tempId: string) => {
    setSections((prev) => ({
      ...prev,
      [mealType]: prev[mealType].filter((item) => item.tempId !== tempId),
    }));
  }, []);

  // Clear an entire meal section
  const clearMealSection = useCallback((mealType: MealTypeId) => {
    setSections((prev) => ({
      ...prev,
      [mealType]: [],
    }));
  }, []);

  // Set target for a specific nutrient
  const setTarget = useCallback((nutrientCode: string, value: number | null) => {
    setTargets((prev) => ({
      ...prev,
      [nutrientCode]: value !== null && Number.isFinite(value) && value >= 0 ? value : null,
    }));
  }, []);

  // Set multiple targets
  const setAllTargets = useCallback((newTargets: Record<string, number | null>) => {
    setTargets(newTargets);
  }, []);

  // Reset calculator to clean state
  const resetCalculator = useCallback(() => {
    setPlanId(null);
    setPlanName("Rencana Menu Baru");
    setNotes("");
    setSections(createInitialSections());
    setTargets(createInitialTargets());
  }, []);

  // Load a saved plan
  const loadMealPlan = useCallback((detail: SavedMealPlanDetail) => {
    setPlanId(detail.id);
    setPlanName(detail.name);
    setNotes(detail.notes || "");

    const newSections = createInitialSections();
    for (const entry of detail.entries) {
      if (newSections[entry.mealType]) {
        newSections[entry.mealType].push({
          tempId: entry.id || `entry-${Math.random().toString(36).substring(2, 9)}`,
          foodId: entry.foodId,
          food: entry.food,
          weightGrams: entry.weightGrams,
          weightMode: entry.weightMode,
        });
      }
    }
    setSections(newSections);

    const base = createInitialTargets();
    setTargets({ ...base, ...detail.targets });
  }, []);

  // Live domain calculation for each food row, each meal, daily totals, and adequacy
  const calculations = useMemo(() => {
    const foodCalculationsByTempId: Record<string, FoodNutrientCalculation> = {};
    const mealCalculationsList: MealNutrientCalculation[] = [];
    const mealCalculationByType: Record<MealTypeId, MealNutrientCalculation> = {} as Record<
      MealTypeId,
      MealNutrientCalculation
    >;
    const allWarnings: string[] = [];

    for (const mealDef of MEAL_TYPES) {
      const mealType = mealDef.id;
      const entries = sections[mealType] || [];
      const itemCalculations: FoodNutrientCalculation[] = [];

      for (const entry of entries) {
        const calc = calculateFoodNutrients(entry.food, entry.weightGrams, entry.weightMode);
        foodCalculationsByTempId[entry.tempId] = calc;
        itemCalculations.push(calc);

        if (calc.warnings.length > 0) {
          allWarnings.push(...calc.warnings);
        }
      }

      const mealCalc = calculateMealNutrients(mealType, itemCalculations);
      mealCalculationsList.push(mealCalc);
      mealCalculationByType[mealType] = mealCalc;
    }

    const dailyCalc: DailyNutrientCalculation = calculateDailyNutrients(mealCalculationsList);
    const adequacies: Record<string, NutrientAdequacy> = calculateAllNutrientAdequacies(
      dailyCalc.totals,
      targets
    );

    return {
      foodCalculationsByTempId,
      mealCalculationsList,
      mealCalculationByType,
      dailyCalculation: dailyCalc,
      adequacies,
      warnings: [...new Set(allWarnings)],
    };
  }, [sections, targets]);

  const totalFoodCount = useMemo(() => {
    let count = 0;
    for (const mealDef of MEAL_TYPES) {
      count += sections[mealDef.id]?.length || 0;
    }
    return count;
  }, [sections]);

  return {
    planId,
    setPlanId,
    planName,
    setPlanName,
    notes,
    setNotes,
    sections,
    targets,
    addFood,
    updateFoodWeight,
    updateFoodWeightMode,
    removeFood,
    clearMealSection,
    setTarget,
    setAllTargets,
    resetCalculator,
    loadMealPlan,
    totalFoodCount,
    calculations,
  };
}
