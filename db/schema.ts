import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  decimal,
  json,
  boolean,
  date,
} from "drizzle-orm/mysql-core";

// ============================================================
// USERS - Managed by auth system, extended for CRM roles
// ============================================================
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["admin", "manager", "sales", "support"]).default("sales").notNull(),
  phone: varchar("phone", { length: 50 }),
  department: varchar("department", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

// Local auth users (username/password)
export const localUsers = mysqlTable("local_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["admin", "manager", "sales", "support"]).default("sales").notNull(),
  phone: varchar("phone", { length: 50 }),
  department: varchar("department", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ============================================================
// CONTACTS
// ============================================================
export const contacts = mysqlTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 200 }),
  jobTitle: varchar("jobTitle", { length: 200 }),
  status: mysqlEnum("status", ["lead", "prospect", "customer", "churned"]).default("lead").notNull(),
  source: mysqlEnum("source", ["website", "referral", "social", "cold_call", "event", "other"]).default("other").notNull(),
  score: int("score").default(0).notNull(),
  assignedTo: bigint("assignedTo", { mode: "number", unsigned: true }),
  lastActivityAt: timestamp("lastActivityAt"),
  notes: text("notes"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("South Africa"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ============================================================
// DEALS
// ============================================================
export const deals = mysqlTable("deals", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  contactId: bigint("contactId", { mode: "number", unsigned: true }),
  company: varchar("company", { length: 200 }),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("ZAR").notNull(),
  stage: mysqlEnum("stage", ["new", "qualified", "proposal", "negotiation", "won", "lost"]).default("new").notNull(),
  probability: int("probability").default(0).notNull(),
  expectedCloseDate: date("expectedCloseDate"),
  actualCloseDate: date("actualCloseDate"),
  description: text("description"),
  assignedTo: bigint("assignedTo", { mode: "number", unsigned: true }),
  source: varchar("source", { length: 100 }),
  competitor: varchar("competitor", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ============================================================
// ACTIVITIES
// ============================================================
export const activities = mysqlTable("activities", {
  id: serial("id").primaryKey(),
  type: mysqlEnum("type", ["call", "email", "meeting", "note", "task", "sms"]).notNull(),
  contactId: bigint("contactId", { mode: "number", unsigned: true }),
  dealId: bigint("dealId", { mode: "number", unsigned: true }),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  status: mysqlEnum("status", ["pending", "completed", "overdue", "cancelled"]).default("pending").notNull(),
  duration: int("duration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================
// PROJECTS
// ============================================================
export const projects = mysqlTable("projects", {
  id: serial("id").primaryKey(),
  projectCode: varchar("projectCode", { length: 20 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  clientId: bigint("clientId", { mode: "number", unsigned: true }),
  description: text("description"),
  services: json("services").$type<string[]>(),
  status: mysqlEnum("status", ["planning", "in_progress", "on_hold", "completed", "cancelled"]).default("planning").notNull(),
  startDate: date("startDate"),
  endDate: date("endDate"),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  actualCost: decimal("actualCost", { precision: 12, scale: 2 }).default("0").notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }),
  received: decimal("received", { precision: 12, scale: 2 }).default("0").notNull(),
  outstanding: decimal("outstanding", { precision: 12, scale: 2 }).default("0").notNull(),
  assignedTo: bigint("assignedTo", { mode: "number", unsigned: true }),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ============================================================
// TASKS
// ============================================================
export const tasks = mysqlTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["todo", "in_progress", "review", "done"]).default("todo").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  assignedTo: bigint("assignedTo", { mode: "number", unsigned: true }),
  contactId: bigint("contactId", { mode: "number", unsigned: true }),
  dealId: bigint("dealId", { mode: "number", unsigned: true }),
  projectId: bigint("projectId", { mode: "number", unsigned: true }),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ============================================================
// SERVICES (OmegaElz Service Catalog)
// ============================================================
export const services = mysqlTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", [
    "web_dev",
    "graphic_design",
    "business_doc",
    "tech_services",
    "creative",
    "admin",
    "consultation",
    "ai_automation",
    "crm",
    "data_analytics",
    "marketing",
  ]).notNull(),
  description: text("description"),
  priceMin: decimal("priceMin", { precision: 10, scale: 2 }),
  priceMax: decimal("priceMax", { precision: 10, scale: 2 }),
  pricingUnit: mysqlEnum("pricingUnit", ["per_hour", "per_project", "per_month", "fixed"]).default("per_project").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================
// AI CONVERSATIONS
// ============================================================
export const aiConversations = mysqlTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  messages: json("messages").$type<{ role: string; content: string; timestamp: string }[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ============================================================
// EMAIL TEMPLATES
// ============================================================
export const emailTemplates = mysqlTable("email_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  category: mysqlEnum("category", ["welcome", "follow_up", "proposal", "invoice", "reminder", "custom"]).default("custom").notNull(),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================
// MESSAGES (Internal messaging between admins)
// ============================================================
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  senderId: bigint("senderId", { mode: "number", unsigned: true }).notNull(),
  senderName: varchar("senderName", { length: 255 }).notNull(),
  recipientId: bigint("recipientId", { mode: "number", unsigned: true }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  parentId: bigint("parentId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================
// AUDIT LOG
// ============================================================
export const auditLogs = mysqlTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: bigint("entityId", { mode: "number", unsigned: true }),
  oldValues: json("oldValues"),
  newValues: json("newValues"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================
// TYPE EXPORTS
// ============================================================
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;
export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = typeof aiConversations.$inferInsert;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
