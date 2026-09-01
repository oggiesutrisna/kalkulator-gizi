import { pgTable, uuid, doublePrecision, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { foods } from "./foods";
import { nutrients } from "./nutrients";

export const foodNutrients = pgTable(
  "food_nutrients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    foodId: uuid("food_id")
      .notNull()
      .references(() => foods.id, { onDelete: "cascade" }),
    nutrientId: uuid("nutrient_id")
      .notNull()
      .references(() => nutrients.id, { onDelete: "cascade" }),
    valuePer100g: doublePrecision("value_per_100g"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("food_nutrients_food_nutrient_idx").on(table.foodId, table.nutrientId),
    index("food_nutrients_food_id_idx").on(table.foodId),
    index("food_nutrients_nutrient_id_idx").on(table.nutrientId),
  ]
);

export type FoodNutrient = typeof foodNutrients.$inferSelect;
export type NewFoodNutrient = typeof foodNutrients.$inferInsert;
