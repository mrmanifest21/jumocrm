import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { contacts, deals, tasks, activities, projects } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const dashboardRouter = createRouter({
  getKPIs: publicQuery.query(async () => {
    const db = getDb();

    const [contactCount] = await db.select({ count: sql<number>`count(*)` }).from(contacts);
    const [dealCount] = await db.select({ count: sql<number>`count(*)` }).from(deals).where(sql`${deals.stage} != 'won' AND ${deals.stage} != 'lost'`);
    const [taskCount] = await db.select({ count: sql<number>`count(*)` }).from(tasks).where(sql`${tasks.status} != 'done'`);
    const [wonRevenue] = await db.select({ total: sql<number>`COALESCE(SUM(${deals.value}), 0)` }).from(deals).where(eq(deals.stage, "won"));

    return {
      revenue: Number(wonRevenue.total),
      activeDeals: dealCount.count,
      contacts: contactCount.count,
      tasksDue: taskCount.count,
      revenueChange: 14.2,
      dealsChange: 8.5,
      contactsChange: 23.1,
      tasksChange: -5.2,
    };
  }),

  getRevenueOverview: publicQuery.query(async () => {
    const db = getDb();
    const allProjects = await db.select().from(projects);

    const q1 = allProjects.filter((p) => {
      const d = p.startDate ? new Date(p.startDate) : null;
      return d && d.getMonth() >= 0 && d.getMonth() <= 2;
    }).reduce((s, p) => s + Number(p.revenue ?? 0), 0);

    const q2 = allProjects.filter((p) => {
      const d = p.startDate ? new Date(p.startDate) : null;
      return d && d.getMonth() >= 3 && d.getMonth() <= 5;
    }).reduce((s, p) => s + Number(p.revenue ?? 0), 0);

    const q3 = allProjects.filter((p) => {
      const d = p.startDate ? new Date(p.startDate) : null;
      return d && d.getMonth() >= 6 && d.getMonth() <= 8;
    }).reduce((s, p) => s + Number(p.revenue ?? 0), 0);

    const q4 = allProjects.filter((p) => {
      const d = p.startDate ? new Date(p.startDate) : null;
      return d && d.getMonth() >= 9 && d.getMonth() <= 11;
    }).reduce((s, p) => s + Number(p.revenue ?? 0), 0);

    return {
      labels: ["Q1", "Q2", "Q3", "Q4"],
      values: [q1, q2, q3, q4],
    };
  }),

  getRecentActivity: publicQuery.query(async () => {
    const db = getDb();
    const items = await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(10);
    return items;
  }),

  getTopDeals: publicQuery.query(async () => {
    const db = getDb();
    const items = await db
      .select()
      .from(deals)
      .where(sql`${deals.stage} != 'lost'`)
      .orderBy(desc(deals.value))
      .limit(5);
    return items;
  }),
});
