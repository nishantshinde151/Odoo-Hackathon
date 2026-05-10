import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, tripNotesTable, tripsTable } from "@workspace/db";
import {
  ListTripNotesParams,
  CreateTripNoteParams,
  CreateTripNoteBody,
  UpdateTripNoteParams,
  UpdateTripNoteBody,
  DeleteTripNoteParams,
} from "@workspace/api-zod";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

function formatNote(note: typeof tripNotesTable.$inferSelect) {
  return {
    id: note.id,
    tripId: note.tripId,
    stopId: note.stopId,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

router.get("/trips/:tripId/notes", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = ListTripNotesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const notes = await db.select().from(tripNotesTable).where(eq(tripNotesTable.tripId, params.data.tripId)).orderBy(sql`${tripNotesTable.createdAt} DESC`);
  res.json(notes.map(formatNote));
});

router.post("/trips/:tripId/notes", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = CreateTripNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateTripNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const [note] = await db.insert(tripNotesTable).values({
    tripId: params.data.tripId,
    stopId: parsed.data.stopId,
    content: parsed.data.content,
  }).returning();
  res.status(201).json(formatNote(note));
});

router.patch("/trips/:tripId/notes/:noteId", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = UpdateTripNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTripNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const [note] = await db.update(tripNotesTable)
    .set({ content: parsed.data.content, updatedAt: new Date() })
    .where(and(eq(tripNotesTable.id, params.data.noteId), eq(tripNotesTable.tripId, params.data.tripId)))
    .returning();
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(formatNote(note));
});

router.delete("/trips/:tripId/notes/:noteId", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = DeleteTripNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const [note] = await db.delete(tripNotesTable)
    .where(and(eq(tripNotesTable.id, params.data.noteId), eq(tripNotesTable.tripId, params.data.tripId)))
    .returning();
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json({ message: "Note deleted" });
});

export default router;
