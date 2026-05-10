import { Router, type IRouter } from "express";
import { ilike, or, and, eq } from "drizzle-orm";
import { db, citiesTable } from "@workspace/db";
import { SearchCitiesQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/cities", async (req, res): Promise<void> => {
  const params = SearchCitiesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.select().from(citiesTable).$dynamic();

  const conditions = [];
  if (params.data.q) {
    conditions.push(
      or(
        ilike(citiesTable.name, `%${params.data.q}%`),
        ilike(citiesTable.country, `%${params.data.q}%`)
      )
    );
  }
  if (params.data.country) {
    conditions.push(eq(citiesTable.country, params.data.country));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const cities = await query.limit(50);
  res.json(cities.map((c) => ({
    id: c.id,
    name: c.name,
    country: c.country,
    region: c.region,
    costIndex: c.costIndex ? Number(c.costIndex) : null,
    popularity: c.popularity,
    imageUrl: c.imageUrl,
    description: c.description,
  })));
});

export default router;
