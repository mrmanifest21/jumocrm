import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { contacts } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const contactRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        source: z.string().optional(),
        sort: z.string().optional(),
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
      if (input?.search) {
        conditions.push(
          sql`(${contacts.firstName} LIKE ${`%${input.search}%`} OR ${contacts.lastName} LIKE ${`%${input.search}%`} OR ${contacts.email} LIKE ${`%${input.search}%`} OR ${contacts.company} LIKE ${`%${input.search}%`})`
        );
      }
      if (input?.status) {
        conditions.push(eq(contacts.status, input.status as any));
      }
      if (input?.source) {
        conditions.push(eq(contacts.source, input.source as any));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select()
        .from(contacts)
        .where(where)
        .orderBy(desc(contacts.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(contacts)
        .where(where);

      return { contacts: items, total: countResult[0]?.count ?? 0 };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(contacts)
        .where(eq(contacts.id, input.id))
        .limit(1);
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        company: z.string().optional(),
        jobTitle: z.string().optional(),
        status: z.enum(["lead", "prospect", "customer", "churned"]).optional(),
        source: z.enum(["website", "referral", "social", "cold_call", "event", "other"]).optional(),
        notes: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(contacts).values({
        ...input,
        score: 0,
        status: input.status ?? "lead",
        source: input.source ?? "other",
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        jobTitle: z.string().optional(),
        status: z.enum(["lead", "prospect", "customer", "churned"]).optional(),
        source: z.enum(["website", "referral", "social", "cold_call", "event", "other"]).optional(),
        score: z.number().optional(),
        notes: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(contacts).set(data).where(eq(contacts.id, id));
      const updated = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
      return updated[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(contacts).where(eq(contacts.id, input.id));
      return { success: true };
    }),

  getStats: publicQuery.query(async () => {
    const db = getDb();
    const allContacts = await db.select().from(contacts);

    const stats = {
      total: allContacts.length,
      leads: allContacts.filter((c) => c.status === "lead").length,
      prospects: allContacts.filter((c) => c.status === "prospect").length,
      customers: allContacts.filter((c) => c.status === "customer").length,
      churned: allContacts.filter((c) => c.status === "churned").length,
      bySource: allContacts.reduce((acc, c) => {
        acc[c.source] = (acc[c.source] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
  }),
});
