import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, packingItemsTable, tripsTable } from "@workspace/db";
import {
  ListPackingItemsParams,
  CreatePackingItemParams,
  CreatePackingItemBody,
  UpdatePackingItemParams,
  UpdatePackingItemBody,
  DeletePackingItemParams,
} from "@workspace/api-zod";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

function formatItem(item: typeof packingItemsTable.$inferSelect) {
  return {
    id: item.id,
    tripId: item.tripId,
    name: item.name,
    category: item.category,
    isPacked: item.isPacked,
    createdAt: item.createdAt.toISOString(),
  };
}

router.get("/trips/:tripId/packing", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = ListPackingItemsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const items = await db.select().from(packingItemsTable).where(eq(packingItemsTable.tripId, params.data.tripId)).orderBy(packingItemsTable.createdAt);
  res.json(items.map(formatItem));
});

router.post("/trips/:tripId/packing", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = CreatePackingItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreatePackingItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const [item] = await db.insert(packingItemsTable).values({
    tripId: params.data.tripId,
    name: parsed.data.name,
    category: parsed.data.category,
    isPacked: false,
  }).returning();
  res.status(201).json(formatItem(item));
});

router.patch("/trips/:tripId/packing/:itemId", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = UpdatePackingItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePackingItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.category !== undefined) updates.category = parsed.data.category;
  if (parsed.data.isPacked !== undefined) updates.isPacked = parsed.data.isPacked;

  const [item] = await db.update(packingItemsTable)
    .set(updates)
    .where(and(eq(packingItemsTable.id, params.data.itemId), eq(packingItemsTable.tripId, params.data.tripId)))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(formatItem(item));
});

router.delete("/trips/:tripId/packing/:itemId", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = DeletePackingItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const [item] = await db.delete(packingItemsTable)
    .where(and(eq(packingItemsTable.id, params.data.itemId), eq(packingItemsTable.tripId, params.data.tripId)))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json({ message: "Item deleted" });
});

export default router;
