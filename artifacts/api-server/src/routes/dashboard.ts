import { Router, type IRouter } from "express";
import { eq, sql, gte } from "drizzle-orm";
import { db, tripsTable, stopsTable, citiesTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

router.get("/dashboard", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const today = new Date().toISOString().split("T")[0];

  // Upcoming trips (start date >= today)
  const allTrips = await db.select().from(tripsTable).where(eq(tripsTable.userId, userId)).orderBy(sql`${tripsTable.createdAt} DESC`);
  const upcomingTrips = allTrips.filter((t) => t.startDate >= today).length;
  const totalTrips = allTrips.length;

  // Stop count
  const stopResult = allTrips.length > 0
    ? await db.select({ count: sql<number>`cast(count(*) as int)` }).from(stopsTable).where(
        sql`${stopsTable.tripId} IN (${allTrips.map((t) => t.id).join(",") || "NULL"})`
      )
    : [{ count: 0 }];
  const totalDestinations = stopResult[0]?.count ?? 0;

  const totalBudgetSpent = allTrips.reduce((sum, t) => sum + (t.totalBudget ? Number(t.totalBudget) : 0), 0);

  // Recent trips (last 5)
  const recentTrips = allTrips.slice(0, 5).map((t) => ({
    id: t.id,
    userId: t.userId,
    name: t.name,
    description: t.description,
    coverPhoto: t.coverPhoto,
    startDate: t.startDate,
    endDate: t.endDate,
    isPublic: t.isPublic,
    shareCode: t.shareCode,
    totalBudget: t.totalBudget ? Number(t.totalBudget) : null,
    stopCount: 0,
    createdAt: t.createdAt.toISOString(),
  }));

  // Popular cities (most used)
  const popularCities = await db
    .select({ city: citiesTable })
    .from(citiesTable)
    .orderBy(sql`${citiesTable.popularity} DESC NULLS LAST`)
    .limit(6);

  res.json({
    upcomingTrips,
    totalTrips,
    totalDestinations,
    totalBudgetSpent,
    recentTrips,
    popularCities: popularCities.map(({ city }) => ({
      id: city.id,
      name: city.name,
      country: city.country,
      region: city.region,
      costIndex: city.costIndex ? Number(city.costIndex) : null,
      popularity: city.popularity,
      imageUrl: city.imageUrl,
      description: city.description,
    })),
  });
});

export default router;
