import { sqliteTable, text, real, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { mealPlans } from "./meal-plans";
import { nutrients } from "./nutrients";

export const nutritionTargets = sqliteTable(
  "nutrition_targets",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    mealPlanId: text("meal_plan_id")
      .notNull()
      .references(() => mealPlans.id, { onDelete: "cascade" }),
    nutrientId: text("nutrient_id")
      .notNull()
      .references(() => nutrients.id, { onDelete: "cascade" }),
    targetValue: real("target_value").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("nutrition_targets_plan_nutrient_idx").on(table.mealPlanId, table.nutrientId),
    index("nutrition_targets_meal_plan_id_idx").on(table.mealPlanId),
  ]
);

export type NutritionTarget = typeof nutritionTargets.$inferSelect;
export type NewNutritionTarget = typeof nutritionTargets.$inferInsert;
