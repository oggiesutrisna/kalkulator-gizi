import { pgTable, uuid, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";

export const nutrients = pgTable("nutrients", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Nutrient = typeof nutrients.$inferSelect;
export type NewNutrient = typeof nutrients.$inferInsert;
