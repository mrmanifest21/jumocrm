import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { messages } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const messageRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        recipientId: z.number(),
        folder: z.enum(["inbox", "sent"]).default("inbox"),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (!input) return { messages: [], unreadCount: 0 };

      const condition =
        input.folder === "inbox"
          ? eq(messages.recipientId, input.recipientId)
          : eq(messages.senderId, input.recipientId);

      const items = await db
        .select()
        .from(messages)
        .where(condition)
        .orderBy(desc(messages.createdAt))
        .limit(100);

      const unreadResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(and(eq(messages.recipientId, input.recipientId), eq(messages.isRead, false)));

      return { messages: items, unreadCount: unreadResult[0]?.count ?? 0 };
    }),

  getConversation: publicQuery
    .input(z.object({
      user1Id: z.number(),
      user2Id: z.number(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const items = await db
        .select()
        .from(messages)
        .where(
          sql`(${messages.senderId} = ${input.user1Id} AND ${messages.recipientId} = ${input.user2Id})
           OR (${messages.senderId} = ${input.user2Id} AND ${messages.recipientId} = ${input.user1Id})`
        )
        .orderBy(messages.createdAt);
      return items;
    }),

  send: publicQuery
    .input(
      z.object({
        senderId: z.number(),
        senderName: z.string(),
        recipientId: z.number(),
        subject: z.string(),
        body: z.string(),
        parentId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(messages).values({
        senderId: input.senderId,
        senderName: input.senderName,
        recipientId: input.recipientId,
        subject: input.subject,
        body: input.body,
        parentId: input.parentId,
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  markRead: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(messages).set({ isRead: true }).where(eq(messages.id, input.id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(messages).where(eq(messages.id, input.id));
      return { success: true };
    }),

  getUnreadCount: publicQuery
    .input(z.object({ recipientId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(and(eq(messages.recipientId, input.recipientId), eq(messages.isRead, false)));
      return result[0]?.count ?? 0;
    }),
});
