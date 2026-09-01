import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const mealPlans = sqliteTable("meal_plans", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  notes: text("notes"),
  sourceVersion: text("source_version").notNull().default("2020"),
  formulaVersion: text("formula_version").notNull().default("1.0.0"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export type MealPlan = typeof mealPlans.$inferSelect;
export type NewMealPlan = typeof mealPlans.$inferInsert;
