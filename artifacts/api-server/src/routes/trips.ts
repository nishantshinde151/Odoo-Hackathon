import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, tripsTable, stopsTable, citiesTable } from "@workspace/db";
import {
  CreateTripBody,
  UpdateTripBody,
  UpdateTripParams,
  DeleteTripParams,
  GetTripParams,
  GetPublicTripParams,
  ToggleTripShareBody,
  ToggleTripShareParams,
} from "@workspace/api-zod";
import { requireAuth, getUserId } from "../lib/auth";
import { randomBytes } from "crypto";

const router: IRouter = Router();

function formatTrip(trip: typeof tripsTable.$inferSelect, stopCount = 0) {
  return {
    id: trip.id,
    userId: trip.userId,
    name: trip.name,
    description: trip.description,
    coverPhoto: trip.coverPhoto,
    startDate: trip.startDate,
    endDate: trip.endDate,
    isPublic: trip.isPublic,
    shareCode: trip.shareCode,
    totalBudget: trip.totalBudget ? Number(trip.totalBudget) : null,
    stopCount,
    createdAt: trip.createdAt.toISOString(),
  };
}

async function getStopsForTrip(tripId: number) {
  const stops = await db
    .select({
      stop: stopsTable,
      city: citiesTable,
    })
    .from(stopsTable)
    .leftJoin(citiesTable, eq(stopsTable.cityId, citiesTable.id))
    .where(eq(stopsTable.tripId, tripId))
    .orderBy(stopsTable.order);

  return stops.map(({ stop, city }) => ({
    id: stop.id,
    tripId: stop.tripId,
    cityId: stop.cityId,
    cityName: city?.name ?? "",
    country: city?.country ?? "",
    cityImageUrl: city?.imageUrl ?? null,
    startDate: stop.startDate,
    endDate: stop.endDate,
    order: stop.order,
    activities: [],
  }));
}

router.get("/trips", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const trips = await db
    .select()
    .from(tripsTable)
    .where(eq(tripsTable.userId, userId))
    .orderBy(sql`${tripsTable.createdAt} DESC`);

  const stopCounts = await db
    .select({
      tripId: stopsTable.tripId,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(stopsTable)
    .where(
      sql`${stopsTable.tripId} IN (${trips.map((t) => t.id).join(",") || "NULL"})`
    )
    .groupBy(stopsTable.tripId);

  const countMap = new Map(stopCounts.map((r) => [r.tripId, r.count]));
  res.json(trips.map((t) => formatTrip(t, countMap.get(t.id) ?? 0)));
});

router.post("/trips", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = CreateTripBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [trip] = await db.insert(tripsTable).values({
    userId,
    name: parsed.data.name,
    description: parsed.data.description,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    coverPhoto: parsed.data.coverPhoto,
    totalBudget: parsed.data.totalBudget?.toString(),
    isPublic: false,
  }).returning();
  res.status(201).json(formatTrip(trip, 0));
});

router.get("/trips/public/:shareCode", async (req, res): Promise<void> => {
  const params = GetPublicTripParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [trip] = await db.select().from(tripsTable).where(
    and(eq(tripsTable.shareCode, params.data.shareCode), eq(tripsTable.isPublic, true))
  );
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const stops = await getStopsForTrip(trip.id);
  res.json({
    ...formatTrip(trip, stops.length),
    stops,
  });
});

router.get("/trips/:tripId", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = GetTripParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [trip] = await db.select().from(tripsTable).where(
    and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId))
  );
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const stops = await getStopsForTrip(trip.id);
  res.json({
    ...formatTrip(trip, stops.length),
    stops,
  });
});

router.patch("/trips/:tripId", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = UpdateTripParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTripBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.startDate !== undefined) updates.startDate = parsed.data.startDate;
  if (parsed.data.endDate !== undefined) updates.endDate = parsed.data.endDate;
  if (parsed.data.coverPhoto !== undefined) updates.coverPhoto = parsed.data.coverPhoto;
  if (parsed.data.totalBudget !== undefined) updates.totalBudget = parsed.data.totalBudget?.toString();

  const [trip] = await db.update(tripsTable)
    .set(updates)
    .where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)))
    .returning();
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const stopCount = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(stopsTable).where(eq(stopsTable.tripId, trip.id));
  res.json(formatTrip(trip, stopCount[0]?.count ?? 0));
});

router.delete("/trips/:tripId", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = DeleteTripParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [trip] = await db.delete(tripsTable)
    .where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)))
    .returning();
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.json({ message: "Trip deleted" });
});

router.patch("/trips/:tripId/share", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = ToggleTripShareParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = ToggleTripShareBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const shareCode = parsed.data.isPublic ? randomBytes(6).toString("hex") : null;
  const [trip] = await db.update(tripsTable)
    .set({ isPublic: parsed.data.isPublic, shareCode })
    .where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)))
    .returning();
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const stopCount = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(stopsTable).where(eq(stopsTable.tripId, trip.id));
  res.json(formatTrip(trip, stopCount[0]?.count ?? 0));
});

export default router;
