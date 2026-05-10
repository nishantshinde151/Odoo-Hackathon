import { Router, type IRouter } from "express";
import { eq, and, ilike, lte, sql } from "drizzle-orm";
import { db, stopActivitiesTable, activityCatalogTable, citiesTable, stopsTable } from "@workspace/db";
import {
  ListStopActivitiesParams,
  AddStopActivityParams,
  AddStopActivityBody,
  RemoveStopActivityParams,
  SearchActivityCatalogQueryParams,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/stops/:stopId/activities", requireAuth, async (req, res): Promise<void> => {
  const params = ListStopActivitiesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const activities = await db
    .select()
    .from(stopActivitiesTable)
    .where(eq(stopActivitiesTable.stopId, params.data.stopId));

  res.json(activities.map((a) => ({
    id: a.id,
    stopId: a.stopId,
    activityCatalogId: a.activityCatalogId,
    name: a.name,
    category: a.category,
    description: a.description,
    cost: a.cost ? Number(a.cost) : null,
    duration: a.duration ? Number(a.duration) : null,
    scheduledTime: a.scheduledTime,
    imageUrl: a.imageUrl,
  })));
});

router.post("/stops/:stopId/activities", requireAuth, async (req, res): Promise<void> => {
  const params = AddStopActivityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AddStopActivityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  // verify stop exists
  const [stop] = await db.select().from(stopsTable).where(eq(stopsTable.id, params.data.stopId));
  if (!stop) {
    res.status(404).json({ error: "Stop not found" });
    return;
  }
  const [activity] = await db.insert(stopActivitiesTable).values({
    stopId: params.data.stopId,
    activityCatalogId: parsed.data.activityCatalogId,
    name: parsed.data.name,
    category: parsed.data.category,
    description: parsed.data.description,
    cost: parsed.data.cost?.toString(),
    duration: parsed.data.duration?.toString(),
    scheduledTime: parsed.data.scheduledTime,
    imageUrl: parsed.data.imageUrl,
  }).returning();

  res.status(201).json({
    id: activity.id,
    stopId: activity.stopId,
    activityCatalogId: activity.activityCatalogId,
    name: activity.name,
    category: activity.category,
    description: activity.description,
    cost: activity.cost ? Number(activity.cost) : null,
    duration: activity.duration ? Number(activity.duration) : null,
    scheduledTime: activity.scheduledTime,
    imageUrl: activity.imageUrl,
  });
});

router.delete("/stops/:stopId/activities/:activityId", requireAuth, async (req, res): Promise<void> => {
  const params = RemoveStopActivityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [activity] = await db.delete(stopActivitiesTable)
    .where(and(eq(stopActivitiesTable.id, params.data.activityId), eq(stopActivitiesTable.stopId, params.data.stopId)))
    .returning();
  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.json({ message: "Activity removed" });
});

router.get("/activity-catalog", async (req, res): Promise<void> => {
  const params = SearchActivityCatalogQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  let query = db
    .select({ activity: activityCatalogTable, city: citiesTable })
    .from(activityCatalogTable)
    .leftJoin(citiesTable, eq(activityCatalogTable.cityId, citiesTable.id))
    .$dynamic();

  const conditions = [];
  if (params.data.q) {
    conditions.push(ilike(activityCatalogTable.name, `%${params.data.q}%`));
  }
  if (params.data.category) {
    conditions.push(eq(activityCatalogTable.category, params.data.category));
  }
  if (params.data.cityId) {
    conditions.push(eq(activityCatalogTable.cityId, params.data.cityId));
  }
  if (params.data.maxCost) {
    conditions.push(lte(activityCatalogTable.cost, params.data.maxCost.toString()));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const results = await query.limit(50);
  res.json(results.map(({ activity, city }) => ({
    id: activity.id,
    name: activity.name,
    category: activity.category,
    description: activity.description,
    cost: activity.cost ? Number(activity.cost) : null,
    duration: activity.duration ? Number(activity.duration) : null,
    cityId: activity.cityId,
    cityName: city?.name ?? null,
    imageUrl: activity.imageUrl,
  })));
});

export default router;
