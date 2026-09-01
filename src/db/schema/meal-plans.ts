import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const mealPlans = pgTable("meal_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  notes: text("notes"),
  sourceVersion: varchar("source_version", { length: 50 }).notNull().default("2020"),
  formulaVersion: varchar("formula_version", { length: 50 }).notNull().default("1.0.0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type MealPlan = typeof mealPlans.$inferSelect;
export type NewMealPlan = typeof mealPlans.$inferInsert;
