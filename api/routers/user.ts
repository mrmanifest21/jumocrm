import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export const userRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const items = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      role: users.role,
      phone: users.phone,
      department: users.department,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastSignInAt: users.lastSignInAt,
    }).from(users);
    return items;
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(users).where(eq(users.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  updateRole: publicQuery
    .input(z.object({ id: z.number(), role: z.enum(["admin", "manager", "sales", "support"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.id));
      const updated = await db.select().from(users).where(eq(users.id, input.id)).limit(1);
      return updated[0];
    }),

  updateProfile: publicQuery
    .input(z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      department: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      if (!ctx.user) return null;
      await db.update(users).set(input).where(eq(users.id, ctx.user.id));
      const updated = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      return updated[0];
    }),
});
