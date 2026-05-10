import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { UpdateProfileBody } from "@workspace/api-zod";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    photo: user.photo,
    language: user.language,
    savedDestinations: user.savedDestinations,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get("/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

router.patch("/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.photo !== undefined) updates.photo = parsed.data.photo;
  if (parsed.data.language !== undefined) updates.language = parsed.data.language;
  if (parsed.data.savedDestinations !== undefined) updates.savedDestinations = parsed.data.savedDestinations;

  const [user] = await db.update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, userId))
    .returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

router.delete("/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  await db.delete(usersTable).where(eq(usersTable.id, userId));
  res.json({ message: "Account deleted" });
});

export default router;
