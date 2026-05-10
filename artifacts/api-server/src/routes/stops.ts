import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, stopsTable, citiesTable, stopActivitiesTable } from "@workspace/db";
import {
  ListStopsParams,
  CreateStopParams,
  CreateStopBody,
  UpdateStopParams,
  UpdateStopBody,
  DeleteStopParams,
  ReorderStopsParams,
  ReorderStopsBody,
} from "@workspace/api-zod";
import { requireAuth, getUserId } from "../lib/auth";
import { db as dbDb, tripsTable } from "@workspace/db";

const router: IRouter = Router();

async function formatStop(stop: typeof stopsTable.$inferSelect, city: typeof citiesTable.$inferSelect | null) {
  const activities = await dbDb
    .select()
    .from(stopActivitiesTable)
    .where(eq(stopActivitiesTable.stopId, stop.id));

  return {
    id: stop.id,
    tripId: stop.tripId,
    cityId: stop.cityId,
    cityName: city?.name ?? "",
    country: city?.country ?? "",
    cityImageUrl: city?.imageUrl ?? null,
    startDate: stop.startDate,
    endDate: stop.endDate,
    order: stop.order,
    activities: activities.map((a) => ({
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
    })),
  };
}

router.get("/trips/:tripId/stops", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = ListStopsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  // verify ownership
  const [trip] = await dbDb.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const stops = await db
    .select({ stop: stopsTable, city: citiesTable })
    .from(stopsTable)
    .leftJoin(citiesTable, eq(stopsTable.cityId, citiesTable.id))
    .where(eq(stopsTable.tripId, params.data.tripId))
    .orderBy(stopsTable.order);

  const result = await Promise.all(stops.map(({ stop, city }) => formatStop(stop, city)));
  res.json(result);
});

router.post("/trips/:tripId/stops", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = CreateStopParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateStopBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [trip] = await dbDb.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const existing = await db.select().from(stopsTable).where(eq(stopsTable.tripId, params.data.tripId));
  const [stop] = await db.insert(stopsTable).values({
    tripId: params.data.tripId,
    cityId: parsed.data.cityId,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    order: existing.length,
  }).returning();

  const [city] = await db.select().from(citiesTable).where(eq(citiesTable.id, stop.cityId));
  res.status(201).json(await formatStop(stop, city ?? null));
});

router.put("/trips/:tripId/stops/reorder", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = ReorderStopsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = ReorderStopsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [trip] = await dbDb.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  for (let i = 0; i < parsed.data.order.length; i++) {
    await db.update(stopsTable)
      .set({ order: i })
      .where(and(eq(stopsTable.id, parsed.data.order[i]), eq(stopsTable.tripId, params.data.tripId)));
  }
  res.json({ message: "Stops reordered" });
});

router.patch("/trips/:tripId/stops/:stopId", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = UpdateStopParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateStopBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [trip] = await dbDb.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.cityId !== undefined) updates.cityId = parsed.data.cityId;
  if (parsed.data.startDate !== undefined) updates.startDate = parsed.data.startDate;
  if (parsed.data.endDate !== undefined) updates.endDate = parsed.data.endDate;

  const [stop] = await db.update(stopsTable)
    .set(updates)
    .where(and(eq(stopsTable.id, params.data.stopId), eq(stopsTable.tripId, params.data.tripId)))
    .returning();
  if (!stop) {
    res.status(404).json({ error: "Stop not found" });
    return;
  }
  const [city] = await db.select().from(citiesTable).where(eq(citiesTable.id, stop.cityId));
  res.json(await formatStop(stop, city ?? null));
});

router.delete("/trips/:tripId/stops/:stopId", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = DeleteStopParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [trip] = await dbDb.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const [stop] = await db.delete(stopsTable)
    .where(and(eq(stopsTable.id, params.data.stopId), eq(stopsTable.tripId, params.data.tripId)))
    .returning();
  if (!stop) {
    res.status(404).json({ error: "Stop not found" });
    return;
  }
  res.json({ message: "Stop deleted" });
});

export default router;
