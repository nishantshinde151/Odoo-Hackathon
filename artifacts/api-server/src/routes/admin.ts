import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, usersTable, tripsTable, stopsTable, citiesTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/admin/stats", requireAuth, async (_req, res): Promise<void> => {
  const [userResult] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(usersTable);
  const [tripResult] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(tripsTable);
  const [stopResult] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(stopsTable);
  const [publicResult] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(tripsTable).where(sql`is_public = true`);

  // Top cities by usage
  const topCities = await db
    .select({
      cityName: citiesTable.name,
      count: sql<number>`cast(count(${stopsTable.id}) as int)`,
    })
    .from(stopsTable)
    .leftJoin(citiesTable, sql`${stopsTable.cityId} = ${citiesTable.id}`)
    .groupBy(citiesTable.name)
    .orderBy(sql`count(${stopsTable.id}) DESC`)
    .limit(10);

  // Recent activity
  const recentTrips = await db.select().from(tripsTable).orderBy(sql`${tripsTable.createdAt} DESC`).limit(5);
  const recentActivity = recentTrips.map((t) => ({
    description: `New trip created: "${t.name}"`,
    createdAt: t.createdAt.toISOString(),
  }));

  res.json({
    totalUsers: userResult?.count ?? 0,
    totalTrips: tripResult?.count ?? 0,
    totalStops: stopResult?.count ?? 0,
    publicTrips: publicResult?.count ?? 0,
    topCities: topCities.map((r) => ({ cityName: r.cityName ?? "Unknown", count: r.count })),
    recentActivity,
  });
});

export default router;
