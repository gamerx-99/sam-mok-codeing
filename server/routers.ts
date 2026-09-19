import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createLead,
  createProject,
  createMediaAsset,
  createToolUsageLog,
  getUsageStats,
  listAdminUsers,
  listAppointments,
  listContentSettings,
  listLeads,
  listMediaAssets,
  listProjects,
  listQuotes,
  listRecentAuditLogs,
  listToolUsageLogs,
  updateAppointmentStatus,
  updateLeadStatus,
  updateProjectStatus,
  updateQuoteStatus,
  updateUserRole,
  upsertContentSetting,
} from "./db";
import { storagePut } from "./storage";

const leadStatus = z.enum(["new", "contacted", "qualified", "closed"]);
const projectStatus = z.enum([
  "idea",
  "active",
  "review",
  "completed",
  "archived",
]);
const editableContentKey = z.enum([
  "heroTitle",
  "heroAccent",
  "heroBody",
  "serviceTitle",
  "portfolioTitle",
  "processTitle",
  "aboutTitle",
  "aboutBody",
  "formTitle",
  "formBody",
  "footerTag",
]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  leads: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string().trim().min(1).max(160),
          contact: z.string().trim().min(1).max(320),
          businessType: z.string().max(100).optional(),
          serviceType: z.string().max(100).optional(),
          budget: z.string().max(100).optional(),
          details: z.string().max(10000).optional(),
          source: z.string().max(60).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await createLead({
          ...input,
          source: input.source ?? "website",
        });
        return { success: true, id };
      }),
    list: adminProcedure.query(() => listLeads()),
    updateStatus: adminProcedure
      .input(z.object({ id: z.number().int().positive(), status: leadStatus }))
      .mutation(async ({ input }) => {
        await updateLeadStatus(input.id, input.status);
        return { success: true } as const;
      }),
  }),
  quotes: router({
    list: adminProcedure.query(() => listQuotes()),
    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          status: z.enum(["draft", "sent", "accepted", "declined"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateQuoteStatus(input.id, input.status);
        return { success: true } as const;
      }),
  }),
  appointments: router({
    list: adminProcedure.query(() => listAppointments()),
    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          status: z.enum(["requested", "confirmed", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateAppointmentStatus(input.id, input.status);
        return { success: true } as const;
      }),
  }),
  content: router({
    publicList: publicProcedure.query(() => listContentSettings()),
    adminList: adminProcedure.query(() => listContentSettings()),
    upsert: adminProcedure
      .input(
        z.object({
          contentKey: editableContentKey,
          language: z.enum(["th", "en"]),
          value: z.string().trim().min(1).max(20000),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const id = await upsertContentSetting({
          ...input,
          updatedBy: ctx.user.id,
        });
        return { success: true, id } as const;
      }),
  }),
  admin: router({
    users: adminProcedure.query(() => listAdminUsers()),
    recentActivity: adminProcedure.query(() => listRecentAuditLogs()),
    usageStats: adminProcedure.query(() => getUsageStats()),
    setUserRole: adminProcedure
      .input(
        z.object({
          userId: z.number().int().positive(),
          role: z.enum(["user", "admin"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await updateUserRole(input.userId, input.role, ctx.user.id);
        return { success: true } as const;
      }),
  }),
  tools: router({
    /** Log a tool run — supports both logged-in and anonymous runs. */
    log: publicProcedure
      .input(
        z.object({
          toolId: z.string().trim().min(1).max(80),
          toolName: z.string().trim().min(1).max(160),
          toolKind: z.enum(["pdf", "interactive", "static"]),
          fileCount: z.number().int().min(0).max(200).default(0),
          fileBytes: z.number().int().min(0).max(2_000_000_000).default(0),
          status: z.enum(["success", "error", "cancelled"]),
          detail: z.string().max(500).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const id = await createToolUsageLog({
          userId: ctx.user?.id ?? null,
          ...input,
          detail: input.detail ?? null,
        });
        return { success: true, id } as const;
      }),
    /** Admin-only: recent tool usage for the dashboard tab. */
    list: adminProcedure.query(() => listToolUsageLogs(60)),
  }),
  media: router({
    publicList: publicProcedure.query(() => listMediaAssets()),
    list: adminProcedure.query(() => listMediaAssets()),
    upload: adminProcedure
      .input(
        z.object({
          slot: z.string().trim().min(1).max(120),
          fileName: z.string().trim().min(1).max(255),
          mimeType: z.enum([
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
          ]),
          fileSize: z.number().int().positive().max(5_000_000),
          dataBase64: z.string().min(1),
          altText: z.string().max(255).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const raw = input.dataBase64.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(raw, "base64");
        if (buffer.length !== input.fileSize)
          throw new Error("File size mismatch");
        const uploaded = await storagePut(
          `content/${ctx.user.id}/${input.slot}/${input.fileName}`,
          buffer,
          input.mimeType
        );
        const id = await createMediaAsset({
          slot: input.slot,
          fileName: input.fileName,
          storageKey: uploaded.key,
          url: uploaded.url,
          mimeType: input.mimeType,
          fileSize: buffer.length,
          altText: input.altText,
          uploadedBy: ctx.user.id,
        });
        return { success: true, id, url: uploaded.url } as const;
      }),
  }),
  projects: router({
    list: adminProcedure.query(() => listProjects()),
    create: adminProcedure
      .input(
        z.object({
          name: z.string().trim().min(1).max(180),
          clientName: z.string().max(180).optional(),
          serviceType: z.string().max(100).optional(),
          status: projectStatus.optional(),
          progress: z.number().int().min(0).max(100).optional(),
          notes: z.string().max(10000).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await createProject({
          ...input,
          status: input.status ?? "idea",
          progress: input.progress ?? 0,
        });
        return { success: true, id };
      }),
    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          status: projectStatus,
          progress: z.number().int().min(0).max(100).optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateProjectStatus(input.id, input.status, input.progress);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
