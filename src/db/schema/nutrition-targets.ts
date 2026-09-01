import { pgTable, uuid, doublePrecision, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { mealPlans } from "./meal-plans";
import { nutrients } from "./nutrients";

export const nutritionTargets = pgTable(
  "nutrition_targets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    mealPlanId: uuid("meal_plan_id")
      .notNull()
      .references(() => mealPlans.id, { onDelete: "cascade" }),
    nutrientId: uuid("nutrient_id")
      .notNull()
      .references(() => nutrients.id, { onDelete: "cascade" }),
    targetValue: doublePrecision("target_value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("nutrition_targets_plan_nutrient_idx").on(table.mealPlanId, table.nutrientId),
    index("nutrition_targets_meal_plan_id_idx").on(table.mealPlanId),
  ]
);

export type NutritionTarget = typeof nutritionTargets.$inferSelect;
export type NewNutritionTarget = typeof nutritionTargets.$inferInsert;
