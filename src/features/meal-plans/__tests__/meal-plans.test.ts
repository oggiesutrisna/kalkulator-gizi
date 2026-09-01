import { describe, it, expect } from "vitest";
import {
  saveMealPlanAction,
  getMealPlanByIdAction,
  duplicateMealPlanAction,
  deleteMealPlanAction,
} from "../meal-plan.actions";
import { searchFoodsAction } from "@/features/foods/food-search.actions";

describe("Meal Plan CRUD Integration", () => {
  it("saves, retrieves, duplicates, and deletes a meal plan", async () => {
    // 1. Find a food to use
    const foods = await searchFoodsAction("beras", 2);
    expect(foods.length).toBeGreaterThan(0);
    const testFood = foods[0];

    // 2. Save meal plan
    const saveResult = await saveMealPlanAction({
      name: "Menu Uji Integrasi",
      notes: "Catatan pengujian CRUD",
      entries: [
        {
          mealType: "breakfast",
          foodId: testFood.id,
          weightGrams: 150,
          weightMode: "edible",
          position: 0,
        },
      ],
      targets: {
        energy: 2100,
        protein: 70,
      },
    });

    expect(saveResult.success).toBe(true);
    expect(saveResult.planId).toBeDefined();
    const planId = saveResult.planId!;

    // 3. Retrieve plan detail
    const planDetail = await getMealPlanByIdAction(planId);
    expect(planDetail).toBeDefined();
    expect(planDetail?.name).toBe("Menu Uji Integrasi");
    expect(planDetail?.entries.length).toBe(1);
    expect(planDetail?.entries[0].weightGrams).toBe(150);
    expect(planDetail?.entries[0].food.code).toBe(testFood.code);
    expect(planDetail?.targets.energy).toBe(2100);

    // 4. Duplicate plan
    const dupResult = await duplicateMealPlanAction(planId);
    expect(dupResult.success).toBe(true);
    expect(dupResult.newPlanId).toBeDefined();
    const dupId = dupResult.newPlanId!;

    const dupDetail = await getMealPlanByIdAction(dupId);
    expect(dupDetail?.name).toContain("(Salinan)");
    expect(dupDetail?.entries.length).toBe(1);

    // 5. Clean up / Delete both
    const del1 = await deleteMealPlanAction(planId);
    const del2 = await deleteMealPlanAction(dupId);
    expect(del1.success).toBe(true);
    expect(del2.success).toBe(true);

    const checkDeleted = await getMealPlanByIdAction(planId);
    expect(checkDeleted).toBeNull();
  });
});
