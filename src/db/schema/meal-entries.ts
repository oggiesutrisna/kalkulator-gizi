import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { mealPlans } from "./meal-plans";
import { foods } from "./foods";

export const mealEntries = sqliteTable(
  "meal_entries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    mealPlanId: text("meal_plan_id")
      .notNull()
      .references(() => mealPlans.id, { onDelete: "cascade" }),
    mealType: text("meal_type").notNull(),
    foodId: text("food_id")
      .notNull()
      .references(() => foods.id, { onDelete: "cascade" }),
    weightGrams: real("weight_grams").notNull(),
    weightMode: text("weight_mode").notNull().default("edible"),
    position: integer("position").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("meal_entries_meal_plan_id_idx").on(table.mealPlanId),
  ]
);

export type MealEntry = typeof mealEntries.$inferSelect;
export type NewMealEntry = typeof mealEntries.$inferInsert;
