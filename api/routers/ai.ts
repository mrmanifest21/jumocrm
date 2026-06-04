import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { aiConversations, contacts, deals, tasks, projects } from "@db/schema";
import { eq, desc } from "drizzle-orm";

// Simulated AI responses for OmegaAI
function generateAIResponse(message: string, context: any): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("pipeline") || lowerMsg.includes("deals")) {
    const totalDeals = context.deals?.length ?? 0;
    const totalValue = context.deals?.reduce((s: number, d: any) => s + Number(d.value), 0) ?? 0;
    const wonValue = context.deals?.filter((d: any) => d.stage === "won").reduce((s: number, d: any) => s + Number(d.value), 0) ?? 0;
    return `Based on your current pipeline data:\n\n- Total deals: ${totalDeals}\n- Pipeline value: R${totalValue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}\n- Revenue won: R${wonValue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}\n\nYour top deals are SABSA (R4,050, 85% probability) and Du Preez Legal IT Migration (R18,000, 70% probability).`;
  }

  if (lowerMsg.includes("contact") || lowerMsg.includes("lead")) {
    const total = context.contacts?.length ?? 0;
    const customers = context.contacts?.filter((c: any) => c.status === "customer").length ?? 0;
    const leads = context.contacts?.filter((c: any) => c.status === "lead").length ?? 0;
    return `Here's your contact summary:\n\n- Total contacts: ${total}\n- Customers: ${customers}\n- Leads: ${leads}\n- Prospects: ${context.contacts?.filter((c: any) => c.status === "prospect").length ?? 0}\n\nYour customer conversion rate is ${total > 0 ? ((customers / total) * 100).toFixed(1) : 0}%.`;
  }

  if (lowerMsg.includes("revenue") || lowerMsg.includes("money") || lowerMsg.includes("income")) {
    const rev = context.projects?.reduce((s: number, p: any) => s + Number(p.revenue ?? 0), 0) ?? 0;
    const rec = context.projects?.reduce((s: number, p: any) => s + Number(p.received ?? 0), 0) ?? 0;
    const out = context.projects?.reduce((s: number, p: any) => s + Number(p.outstanding ?? 0), 0) ?? 0;
    return `Your revenue overview:\n\n- Total project value: R${rev.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}\n- Revenue collected: R${rec.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}\n- Outstanding: R${out.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}\n\nCollection rate: ${rev > 0 ? ((rec / rev) * 100).toFixed(1) : 0}%`;
  }

  if (lowerMsg.includes("task") || lowerMsg.includes("todo")) {
    const total = context.tasks?.length ?? 0;
    const done = context.tasks?.filter((t: any) => t.status === "done").length ?? 0;
    const pending = context.tasks?.filter((t: any) => t.status === "todo" || t.status === "in_progress").length ?? 0;
    return `Task status:\n\n- Total tasks: ${total}\n- Completed: ${done}\n- Pending: ${pending}\n\nYou have ${context.tasks?.filter((t: any) => t.status === "todo" && t.priority === "high").length ?? 0} high-priority tasks waiting.`;
  }

  if (lowerMsg.includes("project")) {
    const total = context.projects?.length ?? 0;
    const completed = context.projects?.filter((p: any) => p.status === "completed").length ?? 0;
    const inProgress = context.projects?.filter((p: any) => p.status === "in_progress").length ?? 0;
    return `Project summary:\n\n- Total projects: ${total}\n- Completed: ${completed}\n- In progress: ${inProgress}\n- Planning: ${context.projects?.filter((p: any) => p.status === "planning").length ?? 0}\n\nActive projects: SABSA Digital Presence and Lizorah Brand Launch.`;
  }

  if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
    return "Hello! I'm OmegaAI, your intelligent CRM assistant. I can help you with:\n\n- Pipeline analysis and forecasting\n- Contact and lead management\n- Revenue tracking and reporting\n- Task and project updates\n- Sales insights and recommendations\n\nWhat would you like to know about your CRM data?";
  }

  // Generic response with context
  return `I understand you're asking about "${message}". Based on your CRM data, you currently have ${context.contacts?.length ?? 0} contacts, ${context.deals?.length ?? 0} deals in your pipeline, and ${context.tasks?.length ?? 0} tasks.\n\nFor more specific information, try asking about:\n- "What's my pipeline value?"\n- "Show me my contacts"\n- "What tasks are due?"\n- "What's my revenue this month?"`;
}

export const aiRouter = createRouter({
  chat: publicQuery
    .input(z.object({
      message: z.string().min(1),
      conversationId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get CRM context
      const allContacts = await db.select().from(contacts).limit(100);
      const allDeals = await db.select().from(deals).limit(100);
      const allTasks = await db.select().from(tasks).limit(100);
      const allProjects = await db.select().from(projects).limit(100);

      const context = {
        contacts: allContacts,
        deals: allDeals,
        tasks: allTasks,
        projects: allProjects,
      };

      const reply = generateAIResponse(input.message, context);

      let conversation;
      if (input.conversationId) {
        // Update existing conversation
        const existing = await db.select().from(aiConversations).where(eq(aiConversations.id, input.conversationId)).limit(1);
        if (existing[0]) {
          const messages = existing[0].messages ?? [];
          messages.push({ role: "user", content: input.message, timestamp: new Date().toISOString() });
          messages.push({ role: "assistant", content: reply, timestamp: new Date().toISOString() });
          await db.update(aiConversations).set({ messages, updatedAt: new Date() }).where(eq(aiConversations.id, input.conversationId));
          conversation = { ...existing[0], messages };
        }
      }

      if (!conversation) {
        // Create new conversation
        const messages = [
          { role: "user", content: input.message, timestamp: new Date().toISOString() },
          { role: "assistant", content: reply, timestamp: new Date().toISOString() },
        ];
        const title = input.message.length > 40 ? input.message.substring(0, 40) + "..." : input.message;
        const result = await db.insert(aiConversations).values({
          userId: 1,
          title,
          messages,
        });
        conversation = { id: Number(result[0].insertId), userId: 1, title, messages };
      }

      return { reply, conversationId: conversation.id };
    }),

  getConversations: publicQuery.query(async () => {
    const db = getDb();
    const items = await db.select().from(aiConversations).orderBy(desc(aiConversations.updatedAt)).limit(50);
    return items;
  }),

  getConversation: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(aiConversations).where(eq(aiConversations.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  deleteConversation: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(aiConversations).where(eq(aiConversations.id, input.id));
      return { success: true };
    }),
});
