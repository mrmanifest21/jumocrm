import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { projects } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const projectRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        status: z.string().optional(),
        search: z.string().optional(),
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
      if (input?.status) conditions.push(eq(projects.status, input.status as any));
      if (input?.search) {
        conditions.push(
          sql`(${projects.title} LIKE ${`%${input.search}%`} OR ${projects.projectCode} LIKE ${`%${input.search}%`})`
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select()
        .from(projects)
        .where(where)
        .orderBy(desc(projects.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(where);

      return { projects: items, total: countResult[0]?.count ?? 0 };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(projects).where(eq(projects.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        projectCode: z.string().min(1),
        title: z.string().min(1),
        clientId: z.number().optional(),
        description: z.string().optional(),
        services: z.array(z.string()).optional(),
        status: z.enum(["planning", "in_progress", "on_hold", "completed", "cancelled"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        budget: z.number().optional(),
        assignedTo: z.number().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const insertData: any = {
        projectCode: input.projectCode,
        title: input.title,
        clientId: input.clientId,
        description: input.description,
        services: input.services ?? [],
        status: input.status ?? "planning",
        priority: input.priority ?? "medium",
        budget: input.budget?.toFixed(2),
        assignedTo: input.assignedTo,
      };
      if (input.startDate) insertData.startDate = new Date(input.startDate);
      if (input.endDate) insertData.endDate = new Date(input.endDate);
      const result = await db.insert(projects).values(insertData);
      return { id: Number(result[0].insertId), ...input };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        services: z.array(z.string()).optional(),
        status: z.enum(["planning", "in_progress", "on_hold", "completed", "cancelled"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        budget: z.number().optional(),
        actualCost: z.number().optional(),
        revenue: z.number().optional(),
        received: z.number().optional(),
        outstanding: z.number().optional(),
        assignedTo: z.number().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.budget !== undefined) updateData.budget = data.budget.toFixed(2);
      if (data.actualCost !== undefined) updateData.actualCost = data.actualCost.toFixed(2);
      if (data.revenue !== undefined) updateData.revenue = data.revenue.toFixed(2);
      if (data.received !== undefined) updateData.received = data.received.toFixed(2);
      if (data.outstanding !== undefined) updateData.outstanding = data.outstanding.toFixed(2);
      if (data.services) updateData.services = data.services;

      await db.update(projects).set(updateData).where(eq(projects.id, id));
      const updated = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      return updated[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true };
    }),

  getStats: publicQuery.query(async () => {
    const db = getDb();
    const allProjects = await db.select().from(projects);

    return {
      total: allProjects.length,
      completed: allProjects.filter((p) => p.status === "completed").length,
      inProgress: allProjects.filter((p) => p.status === "in_progress").length,
      planning: allProjects.filter((p) => p.status === "planning").length,
      totalRevenue: allProjects.reduce((sum, p) => sum + Number(p.revenue ?? 0), 0),
      totalReceived: allProjects.reduce((sum, p) => sum + Number(p.received ?? 0), 0),
      totalOutstanding: allProjects.reduce((sum, p) => sum + Number(p.outstanding ?? 0), 0),
    };
  }),
});
