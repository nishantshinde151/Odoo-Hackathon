import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, tripsTable, stopsTable, stopActivitiesTable, citiesTable } from "@workspace/db";
import { GetTripBudgetParams } from "@workspace/api-zod";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

router.get("/trips/:tripId/budget", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = GetTripBudgetParams.safeParse(req.params);
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

  const stops = await db
    .select({ stop: stopsTable, city: citiesTable })
    .from(stopsTable)
    .leftJoin(citiesTable, eq(stopsTable.cityId, citiesTable.id))
    .where(eq(stopsTable.tripId, params.data.tripId))
    .orderBy(stopsTable.order);

  const categoryTotals: Record<string, number> = {};
  let totalEstimated = 0;

  const stopBudgets = await Promise.all(stops.map(async ({ stop, city }) => {
    const activities = await db
      .select()
      .from(stopActivitiesTable)
      .where(eq(stopActivitiesTable.stopId, stop.id));

    let activityCost = 0;
    for (const a of activities) {
      const cost = a.cost ? Number(a.cost) : 0;
      activityCost += cost;
      totalEstimated += cost;
      const cat = a.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + cost;
    }

    // Calculate days
    const start = new Date(stop.startDate);
    const end = new Date(stop.endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      stopId: stop.id,
      cityName: city?.name ?? "Unknown",
      startDate: stop.startDate,
      endDate: stop.endDate,
      activityCost,
      days,
    };
  }));

  const totalDays = stopBudgets.reduce((sum, s) => sum + s.days, 0) || 1;
  const perDayAverage = totalEstimated / totalDays;
  const totalBudget = trip.totalBudget ? Number(trip.totalBudget) : null;
  const remainingBudget = totalBudget !== null ? totalBudget - totalEstimated : null;

  res.json({
    tripId: trip.id,
    totalBudget,
    totalEstimated,
    perDayAverage,
    remainingBudget,
    isOverBudget: totalBudget !== null ? totalEstimated > totalBudget : false,
    byCategory: Object.entries(categoryTotals).map(([category, amount]) => ({ category, amount })),
    stops: stopBudgets,
  });
});

export default router;
