import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { services } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const serviceRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.category) conditions.push(eq(services.category, input.category as any));
      if (input?.search) {
        conditions.push(
          sql`(${services.name} LIKE ${`%${input.search}%`} OR ${services.description} LIKE ${`%${input.search}%`})`
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const items = await db.select().from(services).where(where).orderBy(desc(services.createdAt));
      return items;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(services).where(eq(services.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        category: z.enum([
          "web_dev", "graphic_design", "business_doc", "tech_services",
          "creative", "admin", "consultation", "ai_automation", "crm",
          "data_analytics", "marketing",
        ]),
        description: z.string().optional(),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        pricingUnit: z.enum(["per_hour", "per_project", "per_month", "fixed"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(services).values({
        ...input,
        pricingUnit: input.pricingUnit ?? "per_project",
        priceMin: input.priceMin?.toFixed(2),
        priceMax: input.priceMax?.toFixed(2),
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z.enum([
          "web_dev", "graphic_design", "business_doc", "tech_services",
          "creative", "admin", "consultation", "ai_automation", "crm",
          "data_analytics", "marketing",
        ]).optional(),
        description: z.string().optional(),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        pricingUnit: z.enum(["per_hour", "per_project", "per_month", "fixed"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.priceMin !== undefined) updateData.priceMin = data.priceMin.toFixed(2);
      if (data.priceMax !== undefined) updateData.priceMax = data.priceMax.toFixed(2);

      await db.update(services).set(updateData).where(eq(services.id, id));
      const updated = await db.select().from(services).where(eq(services.id, id)).limit(1);
      return updated[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(services).where(eq(services.id, input.id));
      return { success: true };
    }),
});
