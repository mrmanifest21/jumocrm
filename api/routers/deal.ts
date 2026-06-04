import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { deals } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const dealRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        stage: z.string().optional(),
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
      if (input?.stage) {
        conditions.push(eq(deals.stage, input.stage as any));
      }
      if (input?.search) {
        conditions.push(
          sql`(${deals.title} LIKE ${`%${input.search}%`} OR ${deals.company} LIKE ${`%${input.search}%`})`
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select()
        .from(deals)
        .where(where)
        .orderBy(desc(deals.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(deals)
        .where(where);

      return { deals: items, total: countResult[0]?.count ?? 0 };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(deals).where(eq(deals.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        title: z.string().min(1),
        contactId: z.number().optional(),
        company: z.string().optional(),
        value: z.number().min(0),
        currency: z.string().default("ZAR"),
        stage: z.enum(["new", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
        probability: z.number().min(0).max(100).optional(),
        expectedCloseDate: z.string().optional(),
        description: z.string().optional(),
        assignedTo: z.number().optional(),
        source: z.string().optional(),
        competitor: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const insertData: any = {
        title: input.title,
        contactId: input.contactId,
        company: input.company,
        value: input.value.toFixed(2),
        currency: input.currency,
        stage: input.stage ?? "new",
        probability: input.probability ?? (input.stage === "won" ? 100 : input.stage === "lost" ? 0 : 20),
        description: input.description,
        assignedTo: input.assignedTo,
        source: input.source,
        competitor: input.competitor,
      };
      if (input.expectedCloseDate) {
        insertData.expectedCloseDate = new Date(input.expectedCloseDate);
      }
      const result = await db.insert(deals).values(insertData);
      return { id: Number(result[0].insertId), ...input };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        contactId: z.number().optional(),
        company: z.string().optional(),
        value: z.number().optional(),
        stage: z.enum(["new", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
        probability: z.number().min(0).max(100).optional(),
        expectedCloseDate: z.string().optional(),
        actualCloseDate: z.string().optional(),
        description: z.string().optional(),
        assignedTo: z.number().optional(),
        competitor: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.value) updateData.value = data.value.toFixed(2);
      if (data.stage === "won" && !data.actualCloseDate) {
        updateData.actualCloseDate = new Date().toISOString().split("T")[0];
        updateData.probability = 100;
      }
      await db.update(deals).set(updateData).where(eq(deals.id, id));
      const updated = await db.select().from(deals).where(eq(deals.id, id)).limit(1);
      return updated[0];
    }),

  updateStage: publicQuery
    .input(z.object({ id: z.number(), stage: z.enum(["new", "qualified", "proposal", "negotiation", "won", "lost"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const updateData: any = { stage: input.stage };
      if (input.stage === "won") {
        updateData.probability = 100;
        updateData.actualCloseDate = new Date().toISOString().split("T")[0];
      } else if (input.stage === "lost") {
        updateData.probability = 0;
      }
      await db.update(deals).set(updateData).where(eq(deals.id, input.id));
      const updated = await db.select().from(deals).where(eq(deals.id, input.id)).limit(1);
      return updated[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(deals).where(eq(deals.id, input.id));
      return { success: true };
    }),

  getPipeline: publicQuery.query(async () => {
    const db = getDb();
    const allDeals = await db.select().from(deals);

    const stages = ["new", "qualified", "proposal", "negotiation", "won", "lost"];
    const pipeline = stages.map((stage) => ({
      stage,
      count: allDeals.filter((d) => d.stage === stage).length,
      value: allDeals
        .filter((d) => d.stage === stage)
        .reduce((sum, d) => sum + Number(d.value), 0),
    }));

    const totalValue = allDeals.reduce((sum, d) => sum + Number(d.value), 0);

    return { stages: pipeline, totalValue };
  }),

  getStats: publicQuery.query(async () => {
    const db = getDb();
    const allDeals = await db.select().from(deals);

    const wonDeals = allDeals.filter((d) => d.stage === "won");
    const lostDeals = allDeals.filter((d) => d.stage === "lost");
    const totalWon = wonDeals.reduce((sum, d) => sum + Number(d.value), 0);

    return {
      totalDeals: allDeals.length,
      totalValue: allDeals.reduce((sum, d) => sum + Number(d.value), 0),
      avgDealSize: allDeals.length > 0 ? allDeals.reduce((sum, d) => sum + Number(d.value), 0) / allDeals.length : 0,
      winRate: allDeals.length > 0 ? (wonDeals.length / (wonDeals.length + lostDeals.length || 1)) * 100 : 0,
      dealsByStage: allDeals.reduce((acc, d) => {
        acc[d.stage] = (acc[d.stage] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      revenueWon: totalWon,
    };
  }),
});
