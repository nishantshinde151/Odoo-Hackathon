import { pgTable, serial, text, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { citiesTable } from "./cities";

export const activityCatalogTable = pgTable("activity_catalog", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  duration: numeric("duration", { precision: 5, scale: 1 }),
  cityId: integer("city_id").references(() => citiesTable.id),
  imageUrl: text("image_url"),
});

export const insertActivityCatalogSchema = createInsertSchema(activityCatalogTable).omit({ id: true });
export type InsertActivityCatalog = z.infer<typeof insertActivityCatalogSchema>;
export type ActivityCatalog = typeof activityCatalogTable.$inferSelect;
