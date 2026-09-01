import { relations } from "drizzle-orm";
import { foodSources } from "./food-sources";
import { foods } from "./foods";
import { nutrients } from "./nutrients";
import { foodNutrients } from "./food-nutrients";
import { mealPlans } from "./meal-plans";
import { mealEntries } from "./meal-entries";
import { nutritionTargets } from "./nutrition-targets";

export const foodSourcesRelations = relations(foodSources, ({ many }) => ({
  foods: many(foods),
}));

export const foodsRelations = relations(foods, ({ one, many }) => ({
  source: one(foodSources, {
    fields: [foods.sourceId],
    references: [foodSources.id],
  }),
  foodNutrients: many(foodNutrients),
  mealEntries: many(mealEntries),
}));

export const nutrientsRelations = relations(nutrients, ({ many }) => ({
  foodNutrients: many(foodNutrients),
  nutritionTargets: many(nutritionTargets),
}));

export const foodNutrientsRelations = relations(foodNutrients, ({ one }) => ({
  food: one(foods, {
    fields: [foodNutrients.foodId],
    references: [foods.id],
  }),
  nutrient: one(nutrients, {
    fields: [foodNutrients.nutrientId],
    references: [nutrients.id],
  }),
}));

export const mealPlansRelations = relations(mealPlans, ({ many }) => ({
  entries: many(mealEntries),
  targets: many(nutritionTargets),
}));

export const mealEntriesRelations = relations(mealEntries, ({ one }) => ({
  mealPlan: one(mealPlans, {
    fields: [mealEntries.mealPlanId],
    references: [mealPlans.id],
  }),
  food: one(foods, {
    fields: [mealEntries.foodId],
    references: [foods.id],
  }),
}));

export const nutritionTargetsRelations = relations(nutritionTargets, ({ one }) => ({
  mealPlan: one(mealPlans, {
    fields: [nutritionTargets.mealPlanId],
    references: [mealPlans.id],
  }),
  nutrient: one(nutrients, {
    fields: [nutritionTargets.nutrientId],
    references: [nutrients.id],
  }),
}));
