import { sqliteTable, text, real, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { foods } from "./foods";
import { nutrients } from "./nutrients";

export const foodNutrients = sqliteTable(
  "food_nutrients",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    foodId: text("food_id")
      .notNull()
      .references(() => foods.id, { onDelete: "cascade" }),
    nutrientId: text("nutrient_id")
      .notNull()
      .references(() => nutrients.id, { onDelete: "cascade" }),
    valuePer100g: real("value_per_100g"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("food_nutrients_food_nutrient_idx").on(table.foodId, table.nutrientId),
    index("food_nutrients_food_id_idx").on(table.foodId),
    index("food_nutrients_nutrient_id_idx").on(table.nutrientId),
  ]
);

export type FoodNutrient = typeof foodNutrients.$inferSelect;
export type NewFoodNutrient = typeof foodNutrients.$inferInsert;
