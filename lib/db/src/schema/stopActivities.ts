import { pgTable, serial, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { stopsTable } from "./stops";
import { activityCatalogTable } from "./activityCatalog";

export const stopActivitiesTable = pgTable("stop_activities", {
  id: serial("id").primaryKey(),
  stopId: integer("stop_id").notNull().references(() => stopsTable.id, { onDelete: "cascade" }),
  activityCatalogId: integer("activity_catalog_id").references(() => activityCatalogTable.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  duration: numeric("duration", { precision: 5, scale: 1 }),
  scheduledTime: text("scheduled_time"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStopActivitySchema = createInsertSchema(stopActivitiesTable).omit({ id: true, createdAt: true });
export type InsertStopActivity = z.infer<typeof insertStopActivitySchema>;
export type StopActivity = typeof stopActivitiesTable.$inferSelect;
