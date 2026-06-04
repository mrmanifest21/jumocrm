import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { activities } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const activityRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        contactId: z.number().optional(),
        dealId: z.number().optional(),
        type: z.string().optional(),
        status: z.string().optional(),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.contactId) conditions.push(eq(activities.contactId, input.contactId));
      if (input?.dealId) conditions.push(eq(activities.dealId, input.dealId));
      if (input?.type) conditions.push(eq(activities.type, input.type as any));
      if (input?.status) conditions.push(eq(activities.status, input.status as any));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select()
        .from(activities)
        .where(where)
        .orderBy(desc(activities.createdAt))
        .limit(input?.limit ?? 50);

      return items;
    }),

  create: publicQuery
    .input(
      z.object({
        type: z.enum(["call", "email", "meeting", "note", "task", "sms"]),
        contactId: z.number().optional(),
        dealId: z.number().optional(),
        userId: z.number().default(1),
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(activities).values({
        ...input,
        status: "pending",
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  complete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(activities)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(activities.id, input.id));
      const updated = await db.select().from(activities).where(eq(activities.id, input.id)).limit(1);
      return updated[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(activities).where(eq(activities.id, input.id));
      return { success: true };
    }),
});
