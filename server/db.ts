import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  InsertLead,
  InsertProject,
  appointments,
  InsertAppointment,
  auditLogs,
  contentSettings,
  InsertContentSetting,
  leads,
  mediaAssets,
  InsertMediaAsset,
  projects,
  quotes,
  toolUsageLogs,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  const databaseUrl =
    process.env.DATABASE_POOLER_URL ??
    process.env.DATABASE_URL ??
    process.env.SUPABASE_DATABASE_URL ??
    process.env.SUPABASE_DATABESE_URL ??
    process.env.SUPABASE_DATABESE ??
    "";
  if (!_db && databaseUrl) {
    try {
      const client = postgres(databaseUrl, { prepare: false });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db
    .insert(users)
    .values(values)
    .onConflictDoUpdate({ target: users.openId, set: updateSet });
  try {
    const savedUser = await getUserByOpenId(user.openId);
    if (savedUser)
      await createAuditLog({
        userId: savedUser.id,
        action: "login",
        metadata: JSON.stringify({
          loginMethod: savedUser.loginMethod ?? "unknown",
        }),
      });
  } catch (error) {
    console.warn("[Audit] Failed to record login:", error);
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result[0];
}

export async function listAdminUsers() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      email: users.email,
      loginMethod: users.loginMethod,
      role: users.role,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .orderBy(desc(users.lastSignedIn));
}

export function assertRoleChangeAllowed(
  targetUserId: number,
  targetCurrentRole: "user" | "admin",
  nextRole: "user" | "admin",
  actorUserId: number,
  adminCount: number
) {
  if (
    targetUserId === actorUserId &&
    targetCurrentRole === "admin" &&
    nextRole === "user"
  )
    throw new Error("You cannot remove your own admin access");
  if (targetCurrentRole === "admin" && nextRole === "user" && adminCount <= 1)
    throw new Error("At least one admin must remain");
}

export async function updateUserRole(
  targetUserId: number,
  role: "user" | "admin",
  actorUserId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const target = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);
  if (!target[0]) throw new Error("User not found");
  const adminCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "admin"));
  assertRoleChangeAllowed(
    targetUserId,
    target[0].role,
    role,
    actorUserId,
    Number(adminCount[0]?.count ?? 0)
  );
  await db.update(users).set({ role }).where(eq(users.id, targetUserId));
  await createAuditLog({
    userId: actorUserId,
    action: "role_change",
    metadata: JSON.stringify({ targetUserId, role }),
  });
}

export async function createAuditLog(input: {
  userId?: number;
  action: string;
  metadata?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(input);
}

export async function createToolUsageLog(input: {
  userId: number | null;
  toolId: string;
  toolName: string;
  toolKind: string;
  fileCount: number;
  fileBytes: number;
  status: "success" | "error" | "cancelled";
  detail?: string | null;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .insert(toolUsageLogs)
    .values({
      userId: input.userId,
      toolId: input.toolId.slice(0, 80),
      toolName: input.toolName.slice(0, 160),
      toolKind: input.toolKind.slice(0, 40),
      fileCount: input.fileCount,
      fileBytes: input.fileBytes,
      status: input.status,
      detail: input.detail ? input.detail.slice(0, 500) : null,
    })
    .returning({ id: toolUsageLogs.id });
  return result[0]?.id ?? null;
}

export async function listToolUsageLogs(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: toolUsageLogs.id,
      userId: toolUsageLogs.userId,
      toolId: toolUsageLogs.toolId,
      toolName: toolUsageLogs.toolName,
      toolKind: toolUsageLogs.toolKind,
      fileCount: toolUsageLogs.fileCount,
      fileBytes: toolUsageLogs.fileBytes,
      status: toolUsageLogs.status,
      detail: toolUsageLogs.detail,
      createdAt: toolUsageLogs.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(toolUsageLogs)
    .leftJoin(users, eq(toolUsageLogs.userId, users.id))
    .orderBy(desc(toolUsageLogs.createdAt))
    .limit(limit);
}

export async function listRecentAuditLogs(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      action: auditLogs.action,
      metadata: auditLogs.metadata,
      createdAt: auditLogs.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

export function buildUsageStats(counts: {
  users: number;
  admins: number;
  leads: number;
  projects: number;
  quotes: number;
  appointments: number;
  content: number;
  media: number;
  logins: number;
}) {
  return {
    users: Number(counts.users),
    admins: Number(counts.admins),
    leads: Number(counts.leads),
    projects: Number(counts.projects),
    quotes: Number(counts.quotes),
    appointments: Number(counts.appointments),
    content: Number(counts.content),
    media: Number(counts.media),
    logins: Number(counts.logins),
  };
}

export async function getUsageStats() {
  const db = await getDb();
  if (!db)
    return buildUsageStats({
      users: 0,
      admins: 0,
      leads: 0,
      projects: 0,
      quotes: 0,
      appointments: 0,
      content: 0,
      media: 0,
      logins: 0,
    });
  const [
    userCount,
    adminCount,
    leadCount,
    projectCount,
    quoteCount,
    appointmentCount,
    contentCount,
    mediaCount,
    loginCount,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "admin")),
    db.select({ count: sql<number>`count(*)` }).from(leads),
    db.select({ count: sql<number>`count(*)` }).from(projects),
    db.select({ count: sql<number>`count(*)` }).from(quotes),
    db.select({ count: sql<number>`count(*)` }).from(appointments),
    db.select({ count: sql<number>`count(*)` }).from(contentSettings),
    db.select({ count: sql<number>`count(*)` }).from(mediaAssets),
    db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(eq(auditLogs.action, "login")),
  ]);
  return buildUsageStats({
    users: Number(userCount[0]?.count ?? 0),
    admins: Number(adminCount[0]?.count ?? 0),
    leads: Number(leadCount[0]?.count ?? 0),
    projects: Number(projectCount[0]?.count ?? 0),
    quotes: Number(quoteCount[0]?.count ?? 0),
    appointments: Number(appointmentCount[0]?.count ?? 0),
    content: Number(contentCount[0]?.count ?? 0),
    media: Number(mediaCount[0]?.count ?? 0),
    logins: Number(loginCount[0]?.count ?? 0),
  });
}

export async function createLead(input: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(leads).values(input).returning({ id: leads.id });
  return result[0].id;
}

export async function listLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(100);
}

export async function updateLeadStatus(
  id: number,
  status: "new" | "contacted" | "qualified" | "closed"
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(leads).set({ status }).where(eq(leads.id, id));
}

export async function listQuotes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quotes).orderBy(desc(quotes.createdAt)).limit(100);
}

export async function updateQuoteStatus(
  id: number,
  status: "draft" | "sent" | "accepted" | "declined"
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(quotes).set({ status }).where(eq(quotes.id, id));
}

export async function listAppointments() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(appointments)
    .orderBy(desc(appointments.scheduledAt))
    .limit(100);
}

export async function updateAppointmentStatus(
  id: number,
  status: "requested" | "confirmed" | "completed" | "cancelled"
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(appointments).set({ status }).where(eq(appointments.id, id));
}

export async function listProjects() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(projects)
    .orderBy(desc(projects.updatedAt))
    .limit(100);
}

export async function createProject(input: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(projects).values(input).returning({ id: projects.id });
  return result[0].id;
}

export async function updateProjectStatus(
  id: number,
  status: "idea" | "active" | "review" | "completed" | "archived",
  progress?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db
    .update(projects)
    .set({ status, ...(progress === undefined ? {} : { progress }) })
    .where(eq(projects.id, id));
}

export async function listContentSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentSettings).orderBy(contentSettings.contentKey);
}

export async function upsertContentSetting(input: InsertContentSetting) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const language: "th" | "en" = input.language ?? "th";
  const existing = await db
    .select()
    .from(contentSettings)
    .where(
      and(
        eq(contentSettings.contentKey, input.contentKey),
        eq(contentSettings.language, language)
      )
    )
    .limit(1);
  if (existing[0]) {
    await db
      .update(contentSettings)
      .set({
        value: input.value,
        language: input.language,
        updatedBy: input.updatedBy,
      })
      .where(eq(contentSettings.id, existing[0].id));
    return existing[0].id;
  }
  const result = await db
    .insert(contentSettings)
    .values({ ...input, language })
    .returning({ id: contentSettings.id });
  return result[0].id;
}

export async function listMediaAssets() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(mediaAssets)
    .orderBy(desc(mediaAssets.createdAt))
    .limit(100);
}

export async function createMediaAsset(input: InsertMediaAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(mediaAssets).values(input).returning({ id: mediaAssets.id });
  return result[0].id;
}
