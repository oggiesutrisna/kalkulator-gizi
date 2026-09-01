import { pgTable, uuid, varchar, integer, doublePrecision, timestamp, index } from "drizzle-orm/pg-core";
import { mealPlans } from "./meal-plans";
import { foods } from "./foods";

export const mealEntries = pgTable(
  "meal_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    mealPlanId: uuid("meal_plan_id")
      .notNull()
      .references(() => mealPlans.id, { onDelete: "cascade" }),
    mealType: varchar("meal_type", { length: 50 }).notNull(), // 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner'
    foodId: uuid("food_id")
      .notNull()
      .references(() => foods.id, { onDelete: "cascade" }),
    weightGrams: doublePrecision("weight_grams").notNull(),
    weightMode: varchar("weight_mode", { length: 20 }).notNull().default("edible"), // 'edible' | 'gross'
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("meal_entries_meal_plan_id_idx").on(table.mealPlanId),
  ]
);

export type MealEntry = typeof mealEntries.$inferSelect;
export type NewMealEntry = typeof mealEntries.$inferInsert;
