import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { tasks } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const taskRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        status: z.string().optional(),
        priority: z.string().optional(),
        assignedTo: z.number().optional(),
        contactId: z.number().optional(),
        dealId: z.number().optional(),
        projectId: z.number().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (input?.status) conditions.push(eq(tasks.status, input.status as any));
      if (input?.priority) conditions.push(eq(tasks.priority, input.priority as any));
      if (input?.assignedTo) conditions.push(eq(tasks.assignedTo, input.assignedTo));
      if (input?.contactId) conditions.push(eq(tasks.contactId, input.contactId));
      if (input?.dealId) conditions.push(eq(tasks.dealId, input.dealId));
      if (input?.projectId) conditions.push(eq(tasks.projectId, input.projectId));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select()
        .from(tasks)
        .where(where)
        .orderBy(desc(tasks.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(where);

      return { tasks: items, total: countResult[0]?.count ?? 0 };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(tasks).where(eq(tasks.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        assignedTo: z.number().optional(),
        contactId: z.number().optional(),
        dealId: z.number().optional(),
        projectId: z.number().optional(),
        dueDate: z.string().optional(),
        createdBy: z.number().default(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(tasks).values({
        ...input,
        status: "todo",
        priority: input.priority ?? "medium",
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        assignedTo: z.number().optional(),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
      if (data.status === "done") updateData.completedAt = new Date();

      await db.update(tasks).set(updateData).where(eq(tasks.id, id));
      const updated = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
      return updated[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(tasks).where(eq(tasks.id, input.id));
      return { success: true };
    }),
});
