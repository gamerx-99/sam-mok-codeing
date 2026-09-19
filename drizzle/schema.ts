import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role").$type<"user" | "admin">().default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  contact: varchar("contact", { length: 320 }).notNull(),
  businessType: varchar("businessType", { length: 100 }),
  serviceType: varchar("serviceType", { length: 100 }),
  budget: varchar("budget", { length: 100 }),
  details: text("details"),
  status: text("status")
    .$type<"new" | "contacted" | "qualified" | "closed">()
    .default("new")
    .notNull(),
  source: varchar("source", { length: 60 }).default("website").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  leadId: integer("leadId"),
  serviceType: varchar("serviceType", { length: 100 }).notNull(),
  scope: text("scope"),
  estimatedMin: integer("estimatedMin").notNull(),
  estimatedMax: integer("estimatedMax").notNull(),
  status: text("status")
    .$type<"draft" | "sent" | "accepted" | "declined">()
    .default("draft")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  leadId: integer("leadId"),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  contact: varchar("contact", { length: 320 }).notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  durationMinutes: integer("durationMinutes").default(60).notNull(),
  status: text("status")
    .$type<"requested" | "confirmed" | "completed" | "cancelled">()
    .default("requested")
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const contentSettings = pgTable("contentSettings", {
  id: serial("id").primaryKey(),
  contentKey: varchar("contentKey", { length: 120 }).notNull(),
  language: text("language").$type<"th" | "en">().default("th").notNull(),
  value: text("value").notNull(),
  updatedBy: integer("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const mediaAssets = pgTable("mediaAssets", {
  id: serial("id").primaryKey(),
  slot: varchar("slot", { length: 120 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  url: varchar("url", { length: 700 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: integer("fileSize").notNull(),
  altText: varchar("altText", { length: 255 }),
  uploadedBy: integer("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const auditLogs = pgTable("auditLogs", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  action: varchar("action", { length: 80 }).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const toolUsageLogs = pgTable("toolUsageLogs", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  toolId: varchar("toolId", { length: 80 }).notNull(),
  toolName: varchar("toolName", { length: 160 }).notNull(),
  toolKind: varchar("toolKind", { length: 40 }).notNull(),
  fileCount: integer("fileCount").default(0).notNull(),
  fileBytes: integer("fileBytes").default(0).notNull(),
  status: text("status")
    .$type<"success" | "error" | "cancelled">()
    .default("success")
    .notNull(),
  detail: text("detail"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  clientName: varchar("clientName", { length: 180 }),
  serviceType: varchar("serviceType", { length: 100 }),
  status: text("status")
    .$type<"idea" | "active" | "review" | "completed" | "archived">()
    .default("idea")
    .notNull(),
  progress: integer("progress").default(0).notNull(),
  dueAt: timestamp("dueAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const canvaAccounts = pgTable("canvaAccounts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  canvaUserId: varchar("canvaUserId", { length: 120 }),
  displayName: varchar("displayName", { length: 160 }),
  email: varchar("email", { length: 320 }),
  accessTokenEnc: text("accessTokenEnc").notNull(),
  refreshTokenEnc: text("refreshTokenEnc"),
  scopes: text("scopes"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export type ContentSetting = typeof contentSettings.$inferSelect;
export type InsertContentSetting = typeof contentSettings.$inferInsert;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = typeof mediaAssets.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type ToolUsageLog = typeof toolUsageLogs.$inferSelect;
export type CanvaAccount = typeof canvaAccounts.$inferSelect;
