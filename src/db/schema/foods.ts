import { pgTable, uuid, varchar, text, doublePrecision, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { foodSources } from "./food-sources";

export const foods = pgTable(
  "foods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => foodSources.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 50 }).notNull(),
    name: text("name").notNull(),
    sourceDescription: text("source_description"),
    bddPercent: doublePrecision("bdd_percent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("foods_source_code_idx").on(table.sourceId, table.code),
    index("foods_code_idx").on(table.code),
    index("foods_name_idx").on(table.name),
  ]
);

export type Food = typeof foods.$inferSelect;
export type NewFood = typeof foods.$inferInsert;
