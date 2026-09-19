import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileImage,
  Inbox,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatBytes } from "./useToolUsageLogger";
import {
  cropPresets,
  estimateBase64Bytes,
  isSupportedImageUpload,
} from "@shared/imageCrop";
import type { CropSlot } from "@shared/imageCrop";

const leadStatuses = ["new", "contacted", "qualified", "closed"] as const;
const projectStatuses = [
  "idea",
  "active",
  "review",
  "completed",
  "archived",
] as const;
/** Thai labels for every workflow status shown in selects and pills. */
const STATUS_LABELS: Record<string, string> = {
  // Lead
  new: "ใหม่",
  contacted: "ติดต่อแล้ว",
  qualified: "ผ่านการคัดกรอง",
  closed: "ปิดแล้ว",
  // Project
  idea: "ไอเดีย",
  active: "กำลังทำ",
  review: "รอตรวจ",
  completed: "เสร็จแล้ว",
  archived: "เก็บถาวร",
  // Quote
  draft: "ร่าง",
  sent: "ส่งแล้ว",
  accepted: "ยอมรับ",
  declined: "ปฏิเสธ",
  // Appointment
  requested: "ขอนัด",
  confirmed: "นัดแล้ว",
  cancelled: "ยกเลิก",
};

type ContentKey =
  | "heroTitle"
  | "heroAccent"
  | "heroBody"
  | "serviceTitle"
  | "portfolioTitle"
  | "processTitle"
  | "aboutTitle"
  | "aboutBody"
  | "formTitle"
  | "formBody"
  | "footerTag";
type ContentRow = {
  id: number;
  contentKey: ContentKey;
  language: "th" | "en";
  value: string;
};
type MediaRow = {
  id: number;
  slot: string;
  fileName: string;
  url: string;
  mimeType: string;
  fileSize: number;
  altText: string | null;
};
type UploadInput = {
  slot: string;
  fileName: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  fileSize: number;
  dataBase64: string;
  altText?: string;
};
const starterContent: ContentRow[] = [
  {
    id: 0,
    contentKey: "heroTitle",
    language: "th",
    value: "โค้ดดิ้ง\\nเมืองสามหมอก",
  },
  {
    id: 0,
    contentKey: "heroTitle",
    language: "en",
    value: "Sam Mok\\nCoding",
  },
  {
    id: 0,
    contentKey: "heroAccent",
    language: "th",
    value: "ข้อความ Hero จะถูกเพิ่มจากข้อมูลจริง",
  },
  {
    id: 0,
    contentKey: "heroAccent",
    language: "en",
    value: "Hero copy will be added from verified content.",
  },
  {
    id: 0,
    contentKey: "heroBody",
    language: "th",
    value: "รายละเอียดแบรนด์กำลังรอการกรอกข้อมูลจริง",
  },
  {
    id: 0,
    contentKey: "heroBody",
    language: "en",
    value: "Brand details are ready for real content.",
  },
  {
    id: 0,
    contentKey: "formTitle",
    language: "th",
    value: "เล่าโปรเจกต์ให้เราฟัง",
  },
  {
    id: 0,
    contentKey: "formTitle",
    language: "en",
    value: "Tell us about your project",
  },
];

export default function AdminDashboard() {
  const leads = trpc.leads.list.useQuery();
  const projects = trpc.projects.list.useQuery();
  const quotes = trpc.quotes.list.useQuery();
  const appointments = trpc.appointments.list.useQuery();
  const contentSettings = trpc.content.adminList.useQuery();
  const mediaAssets = trpc.media.list.useQuery();
  const adminUsers = trpc.admin.users.useQuery();
  const recentActivity = trpc.admin.recentActivity.useQuery();
  const usageStats = trpc.admin.usageStats.useQuery();
  const toolLogs = trpc.tools.list.useQuery();
  const { user: currentUser } = useAuth();
  const utils = trpc.useUtils();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<
    "leads" | "projects" | "quotes" | "appointments" | "content" | "toolLogs" | "settings"
  >(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    return tab === "projects" ||
      tab === "quotes" ||
      tab === "appointments" ||
      tab === "content" ||
      tab === "toolLogs"
      ? tab
      : "leads";
  });
  useEffect(() => {
    const tab = new URLSearchParams(location.split("?")[1] || "").get("tab");
    if (
      tab === "projects" ||
      tab === "quotes" ||
      tab === "appointments" ||
      tab === "content" ||
      tab === "toolLogs" ||
      tab === "leads"
    )
      setActiveTab(tab);
  }, [location]);
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");

  const updateLead = trpc.leads.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.leads.list.invalidate();
      toast.success("อัปเดตสถานะ Lead แล้ว");
    },
    onError: () => toast.error("อัปเดตสถานะไม่สำเร็จ"),
  });
  const updateQuote = trpc.quotes.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.quotes.list.invalidate();
      toast.success("อัปเดตใบประเมินแล้ว");
    },
    onError: () => toast.error("อัปเดตใบประเมินไม่สำเร็จ"),
  });
  const updateAppointment = trpc.appointments.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.appointments.list.invalidate();
      toast.success("อัปเดตนัดหมายแล้ว");
    },
    onError: () => toast.error("อัปเดตนัดหมายไม่สำเร็จ"),
  });
  const updateProject = trpc.projects.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.projects.list.invalidate();
      toast.success("อัปเดตโปรเจกต์แล้ว");
    },
    onError: () => toast.error("อัปเดตสถานะไม่สำเร็จ"),
  });
  const updateContent = trpc.content.upsert.useMutation({
    onSuccess: async () => {
      await contentSettings.refetch();
      toast.success("บันทึกข้อความแล้ว");
    },
    onError: () => toast.error("บันทึกข้อความไม่สำเร็จ"),
  });
  const uploadMedia = trpc.media.upload.useMutation({
    onSuccess: async () => {
      await mediaAssets.refetch();
      toast.success("อัปโหลดรูปภาพแล้ว");
    },
    onError: error => toast.error(error.message || "อัปโหลดรูปภาพไม่สำเร็จ"),
  });
  const createProject = trpc.projects.create.useMutation({
    onSuccess: async () => {
      await utils.projects.list.invalidate();
      setProjectOpen(false);
      setProjectName("");
      setClientName("");
      toast.success("สร้างโปรเจกต์แล้ว");
    },
    onError: () => toast.error("สร้างโปรเจกต์ไม่สำเร็จ"),
  });

  const leadRows = leads.data ?? [];
  const projectRows = projects.data ?? [];
  const newLeads = leadRows.filter(lead => lead.status === "new").length;
  const activeProjects = projectRows.filter(
    project => project.status === "active" || project.status === "review"
  ).length;
  const completedProjects = projectRows.filter(
    project => project.status === "completed"
  ).length;
  const quoteRows = quotes.data ?? [];
  const appointmentRows = appointments.data ?? [];

  return (
    <DashboardLayout>
      <div className="admin-shell">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">CODING MUEANG SAM MOK / BACK OFFICE</p>
            <h1>ภาพรวมงานหลังบ้าน</h1>
            <p className="admin-subtitle">
              จัดการ Lead, โปรเจกต์ และคำขอจากเว็บไซต์ในที่เดียว
            </p>
          </div>
          <button
            className="admin-refresh"
            onClick={() => {
              void leads.refetch();
              void projects.refetch();
              void quotes.refetch();
              void appointments.refetch();
            }}
          >
            <RefreshCw size={15} /> รีเฟรชข้อมูล
          </button>
        </header>

        <section className="admin-stat-grid">
          <Stat
            icon={Inbox}
            label="Lead ใหม่"
            value={newLeads}
            hint="รอติดต่อกลับ"
            tone="blue"
          />
          <Stat
            icon={BriefcaseBusiness}
            label="โปรเจกต์กำลังทำ"
            value={activeProjects}
            hint="กำลังเดินงาน"
            tone="purple"
          />
          <Stat
            icon={CheckCircle2}
            label="ส่งมอบแล้ว"
            value={completedProjects}
            hint="จากรายการที่บันทึก"
            tone="cyan"
          />
          <Stat
            icon={Activity}
            label="Lead ทั้งหมด"
            value={leadRows.length}
            hint="จากทุกช่องทาง"
            tone="orange"
          />
        </section>
        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr] mt-4">
          <div className="admin-table-card">
            <div className="admin-table-head">
              <div>
                <h2>สถิติการใช้งาน</h2>
                <p>ข้อมูลปัจจุบันจากระบบหลังบ้าน</p>
              </div>
              <BarChart3 size={18} className="admin-table-icon" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
              {usageStats.data ? (
                [
                  ["ผู้ใช้", usageStats.data.users],
                  ["Admin", usageStats.data.admins],
                  ["การเข้าสู่ระบบ", usageStats.data.logins],
                  [
                    "คอนเทนต์และสื่อ",
                    usageStats.data.content + usageStats.data.media,
                  ],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-xl border border-border/60 bg-background/50 p-3"
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <strong className="text-2xl">{value}</strong>
                  </div>
                ))
              ) : usageStats.isLoading ? (
                <div className="admin-loading-state col-span-full" role="status">
                  <Loader2 size={18} className="animate-spin" />
                  <div>
                    <strong>กำลังโหลดสถิติ</strong>
                    <span>กำลังดึงข้อมูลจากระบบหลังบ้าน</span>
                  </div>
                </div>
              ) : (
                <div className="admin-empty-state col-span-full">
                  <div className="admin-empty-icon"><BarChart3 size={17} /></div>
                  <div>
                    <strong>ยังไม่มีข้อมูลสถิติ</strong>
                    <span>ข้อมูลจะปรากฏเมื่อมีการใช้งานระบบ</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="admin-table-card">
            <div className="admin-table-head">
              <div>
                <h2>เข้าสู่ระบบล่าสุด</h2>
                <p>กิจกรรมจริงที่บันทึกไว้</p>
              </div>
              <Clock3 size={18} className="admin-table-icon" />
            </div>
            <div className="divide-y divide-border/50">
              {(recentActivity.data ?? []).slice(0, 4).map(item => (
                <div
                  key={item.id}
                  className="px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <strong className="text-sm">
                      {item.userName || item.userEmail || "ผู้ใช้ระบบ"}
                    </strong>
                    <p className="text-xs text-muted-foreground">
                      {item.action === "login"
                        ? "เข้าสู่ระบบ"
                        : "เปลี่ยนสิทธิ์"}
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleString("th-TH")}
                  </time>
                </div>
              ))}
              {recentActivity.isLoading && (
                <div className="admin-loading-state compact" role="status">
                  <Loader2 size={16} className="animate-spin" />
                  <span>กำลังโหลดกิจกรรมล่าสุด...</span>
                </div>
              )}
              {!recentActivity.isLoading && !recentActivity.data?.length && (
                <div className="admin-empty-state compact">
                  <div className="admin-empty-icon"><Clock3 size={15} /></div>
                  <div>
                    <strong>ยังไม่มีประวัติการเข้าสู่ระบบ</strong>
                    <span>กิจกรรมใหม่จะแสดงที่นี่เมื่อมีการใช้งาน</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="admin-workspace">
          <div className="admin-tabs">
            <button
              className={activeTab === "leads" ? "active" : ""}
              onClick={() => setActiveTab("leads")}
            >
              <Users size={16} /> Lead จากเว็บไซต์{" "}
              <span>{leadRows.length}</span>
            </button>
            <button
              className={activeTab === "projects" ? "active" : ""}
              onClick={() => setActiveTab("projects")}
            >
              <BriefcaseBusiness size={16} /> โปรเจกต์{" "}
              <span>{projectRows.length}</span>
            </button>
            <button
              className={activeTab === "quotes" ? "active" : ""}
              onClick={() => setActiveTab("quotes")}
            >
              <CircleDollarSign size={16} /> ใบประเมิน{" "}
              <span>{quoteRows.length}</span>
            </button>
            <button
              className={activeTab === "appointments" ? "active" : ""}
              onClick={() => setActiveTab("appointments")}
            >
              <Activity size={16} /> นัดหมาย{" "}
              <span>{appointmentRows.length}</span>
            </button>
            <button
              className={activeTab === "content" ? "active" : ""}
              onClick={() => setActiveTab("content")}
            >
              <FileImage size={16} /> คอนเทนต์{" "}
              <span>
                {(contentSettings.data?.length ?? 0) +
                  (mediaAssets.data?.length ?? 0)}
              </span>
            </button>
            <button
              className={activeTab === "toolLogs" ? "active" : ""}
              onClick={() => setActiveTab("toolLogs")}
            >
              <Wrench size={16} /> Tool Logs{" "}
              <span>{toolLogs.data?.length ?? 0}</span>
            </button>
            {activeTab === "projects" && (
              <button
                className="admin-primary"
                onClick={() => setProjectOpen(!projectOpen)}
              >
                <Plus size={15} /> สร้างโปรเจกต์
              </button>
            )}
          </div>
          {projectOpen && (
            <form
              className="admin-create-form"
              onSubmit={event => {
                event.preventDefault();
                if (!projectName.trim()) return;
                createProject.mutate({
                  name: projectName.trim(),
                  clientName: clientName.trim() || undefined,
                  serviceType: "Website",
                });
              }}
            >
              <label>
                ชื่อโปรเจกต์
                <input
                  value={projectName}
                  onChange={event => setProjectName(event.target.value)}
                  placeholder="กรอกชื่อโปรเจกต์จริง"
                  required
                />
              </label>
              <label>
                ชื่อลูกค้า
                <input
                  value={clientName}
                  onChange={event => setClientName(event.target.value)}
                  placeholder="กรอกเมื่อต้องการ"
                />
              </label>
              <button
                className="admin-primary"
                disabled={createProject.isPending}
              >
                {createProject.isPending ? (
                  <Loader2 className="animate-spin" size={15} />
                ) : (
                  <Plus size={15} />
                )}{" "}
                บันทึกโปรเจกต์
              </button>
            </form>
          )}
          {activeTab === "leads" ? (
            <LeadTable
              rows={leadRows}
              loading={leads.isLoading}
              onStatus={(id, status) => updateLead.mutate({ id, status })}
            />
          ) : activeTab === "projects" ? (
            <ProjectTable
              rows={projectRows}
              loading={projects.isLoading}
              onStatus={(id, status, progress) =>
                updateProject.mutate({ id, status, progress })
              }
            />
          ) : activeTab === "quotes" ? (
            <QuoteTable
              rows={quoteRows}
              loading={quotes.isLoading}
              onStatus={(id, status) => updateQuote.mutate({ id, status })}
            />
          ) : activeTab === "appointments" ? (
            <AppointmentTable
              rows={appointmentRows}
              loading={appointments.isLoading}
              onStatus={(id, status) =>
                updateAppointment.mutate({ id, status })
              }
            />
          ) : activeTab === "toolLogs" ? (
            <ToolLogsTable
              rows={(toolLogs.data ?? []) as ToolLogRow[]}
              loading={toolLogs.isLoading}
            />
          ) : (
            <ContentManager
              settings={(contentSettings.data ?? []) as ContentRow[]}
              media={(mediaAssets.data ?? []) as MediaRow[]}
              onSave={(
                contentKey: ContentKey,
                language: "th" | "en",
                value: string
              ) => updateContent.mutate({ contentKey, language, value })}
              onUpload={(input: UploadInput) => uploadMedia.mutate(input)}
              uploading={uploadMedia.isPending}
            />
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Inbox;
  label: string;
  value: number;
  hint: string;
  tone: string;
}) {
  return (
    <article className={`admin-stat ${tone}`}>
      <div className="admin-stat-icon">
        <Icon size={18} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
      <ArrowUpRight className="admin-stat-arrow" size={16} />
    </article>
  );
}

type ToolLogRow = import("../../../drizzle/schema").ToolUsageLog & {
  userName: string | null;
  userEmail: string | null;
};

const TOOL_KIND_LABELS: Record<string, string> = {
  pdf: "PDF",
  interactive: "โต้ตอบ",
  static: "หน้าเต็ม",
};

function ToolLogsTable({
  rows,
  loading,
}: {
  rows: ToolLogRow[];
  loading: boolean;
}) {
  const [kindFilter, setKindFilter] = useState<"all" | "pdf" | "interactive" | "static">("all");
  const filtered =
    kindFilter === "all" ? rows : rows.filter(row => row.toolKind === kindFilter);
  const totalBytes = rows.reduce((sum, row) => sum + row.fileBytes, 0);
  return (
    <div className="admin-table-card">
      <div className="admin-table-head">
        <div>
          <h2>บันทึกการใช้งานเครื่องมือ</h2>
          <p>
            รวม {rows.length} รายการล่าสุด · ประมวลผลไฟล์{" "}
            {rows.reduce((sum, row) => sum + row.fileCount, 0)} ไฟล์ ·{" "}
            {formatBytes(totalBytes)}
          </p>
        </div>
        <div className="admin-toollog-filters">
          {(["all", "pdf", "interactive", "static"] as const).map(kind => (
            <button
              key={kind}
              className={kindFilter === kind ? "active" : ""}
              onClick={() => setKindFilter(kind)}
            >
              {kind === "all" ? "ทั้งหมด" : TOOL_KIND_LABELS[kind]}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <LoadingRows />
      ) : filtered.length === 0 ? (
        <EmptyState text="ยังไม่มีการใช้งานเครื่องมือ — log จะปรากฏเมื่อมีการประมวลผลในหน้า /tool (เฉพาะผู้ใช้ที่ล็อกอิน)" />
      ) : (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>เครื่องมือ</th>
                <th>ประเภท</th>
                <th>ผู้ใช้</th>
                <th>ไฟล์</th>
                <th>ขนาดรวม</th>
                <th>สถานะ</th>
                <th>เมื่อ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.toolName}</strong>
                    {row.detail && <small>{row.detail}</small>}
                    <small className="admin-toollog-id">{row.toolId}</small>
                  </td>
                  <td>{TOOL_KIND_LABELS[row.toolKind] ?? row.toolKind}</td>
                  <td>
                    {row.userName ? (
                      <>
                        <strong>{row.userName}</strong>
                        {row.userEmail && <small>{row.userEmail}</small>}
                      </>
                    ) : (
                      <span>ไม่ระบุ</span>
                    )}
                  </td>
                  <td>{row.fileCount > 0 ? `${row.fileCount} ไฟล์` : "—"}</td>
                  <td>{row.fileBytes > 0 ? formatBytes(row.fileBytes) : "—"}</td>
                  <td>
                    <span
                      className={`admin-toollog-status ${row.status}`}
                    >
                      {row.status === "success"
                        ? "สำเร็จ"
                        : row.status === "error"
                          ? "ผิดพลาด"
                          : "ยกเลิก"}
                    </span>
                  </td>
                  <td>
                    <small>{new Date(row.createdAt).toLocaleString("th-TH")}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LeadTable({
  rows,
  loading,
  onStatus,
}: {
  rows: Array<{
    id: number;
    name: string;
    contact: string;
    businessType: string | null;
    serviceType: string | null;
    budget: string | null;
    status: "new" | "contacted" | "qualified" | "closed";
    createdAt: Date;
  }>;
  loading: boolean;
  onStatus: (
    id: number,
    status: "new" | "contacted" | "qualified" | "closed"
  ) => void;
}) {
  return (
    <div className="admin-table-card">
      <div className="admin-table-head">
        <div>
          <h2>คำขอเข้ามาล่าสุด</h2>
          <p>จัดลำดับการติดตามลูกค้าจากข้อมูลจริงในเว็บไซต์</p>
        </div>
        <span className="admin-live">
          <span /> LIVE
        </span>
      </div>
      {loading ? (
        <LoadingRows />
      ) : rows.length === 0 ? (
        <EmptyState text="ยังไม่มี Lead จากเว็บไซต์" />
      ) : (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>ลูกค้า</th>
                <th>บริการ</th>
                <th>ช่องทาง</th>
                <th>งบประมาณ</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <strong>{lead.name}</strong>
                    <small>
                      {new Date(lead.createdAt).toLocaleString("th-TH")}
                    </small>
                  </td>
                  <td>{lead.serviceType || lead.businessType || "—"}</td>
                  <td>{lead.contact}</td>
                  <td>{lead.budget || "—"}</td>
                  <td>
                    <select
                      className={`status-select ${lead.status}`}
                      value={lead.status}
                      onChange={event =>
                        onStatus(
                          lead.id,
                          event.target.value as typeof lead.status
                        )
                      }
                    >
                      {leadStatuses.map(status => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProjectTable({
  rows,
  loading,
  onStatus,
}: {
  rows: Array<{
    id: number;
    name: string;
    clientName: string | null;
    serviceType: string | null;
    status: "idea" | "active" | "review" | "completed" | "archived";
    progress: number;
  }>;
  loading: boolean;
  onStatus: (
    id: number,
    status: "idea" | "active" | "review" | "completed" | "archived",
    progress: number
  ) => void;
}) {
  return (
    <div className="admin-table-card">
      <div className="admin-table-head">
        <div>
          <h2>โปรเจกต์ทั้งหมด</h2>
          <p>ติดตามสถานะและความคืบหน้าของงานที่รับผิดชอบ</p>
        </div>
        <CircleDollarSign size={18} className="admin-table-icon" />
      </div>
      {loading ? (
        <LoadingRows />
      ) : rows.length === 0 ? (
        <EmptyState text="ยังไม่มีโปรเจกต์ที่บันทึก" />
      ) : (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>โปรเจกต์</th>
                <th>ลูกค้า</th>
                <th>บริการ</th>
                <th>ความคืบหน้า</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(project => (
                <tr key={project.id}>
                  <td>
                    <strong>{project.name}</strong>
                  </td>
                  <td>{project.clientName || "—"}</td>
                  <td>{project.serviceType || "—"}</td>
                  <td>
                    <div className="progress-cell">
                      <div>
                        <span style={{ width: `${project.progress}%` }} />
                      </div>
                      <small>{project.progress}%</small>
                    </div>
                  </td>
                  <td>
                    <select
                      className={`status-select ${project.status}`}
                      value={project.status}
                      onChange={event =>
                        onStatus(
                          project.id,
                          event.target.value as typeof project.status,
                          project.status === "completed"
                            ? 100
                            : project.progress
                        )
                      }
                    >
                      {projectStatuses.map(status => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QuoteTable({
  rows,
  loading,
  onStatus,
}: {
  rows: Array<{
    id: number;
    serviceType: string;
    scope: string | null;
    estimatedMin: number;
    estimatedMax: number;
    status: "draft" | "sent" | "accepted" | "declined";
    createdAt: Date;
  }>;
  loading: boolean;
  onStatus: (
    id: number,
    status: "draft" | "sent" | "accepted" | "declined"
  ) => void;
}) {
  return (
    <div className="admin-table-card">
      <div className="admin-table-head">
        <div>
          <h2>ใบประเมินราคา</h2>
          <p>ตรวจสอบช่วงราคาและสถานะใบประเมินของลูกค้า</p>
        </div>
        <CircleDollarSign className="admin-table-icon" size={18} />
      </div>
      {loading ? (
        <LoadingRows />
      ) : rows.length === 0 ? (
        <EmptyState text="ยังไม่มีใบประเมินราคา" />
      ) : (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>บริการ</th>
                <th>ขอบเขตงาน</th>
                <th>ช่วงราคา</th>
                <th>สถานะ</th>
                <th>สร้างเมื่อ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(quote => (
                <tr key={quote.id}>
                  <td>
                    <strong>{quote.serviceType}</strong>
                  </td>
                  <td>{quote.scope || "—"}</td>
                  <td>
                    ฿{quote.estimatedMin.toLocaleString()} – ฿
                    {quote.estimatedMax.toLocaleString()}
                  </td>
                  <td>
                    <select
                      className={`status-select ${quote.status}`}
                      value={quote.status}
                      onChange={event =>
                        onStatus(
                          quote.id,
                          event.target.value as typeof quote.status
                        )
                      }
                    >
                      {["draft", "sent", "accepted", "declined"].map(status => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {new Date(quote.createdAt).toLocaleDateString("th-TH")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AppointmentTable({
  rows,
  loading,
  onStatus,
}: {
  rows: Array<{
    id: number;
    customerName: string;
    contact: string;
    scheduledAt: Date;
    durationMinutes: number;
    status: "requested" | "confirmed" | "completed" | "cancelled";
  }>;
  loading: boolean;
  onStatus: (
    id: number,
    status: "requested" | "confirmed" | "completed" | "cancelled"
  ) => void;
}) {
  return (
    <div className="admin-table-card">
      <div className="admin-table-head">
        <div>
          <h2>นัดหมาย</h2>
          <p>ติดตามคำขอคุยโปรเจกต์และการนัดหมายลูกค้า</p>
        </div>
        <Activity className="admin-table-icon" size={18} />
      </div>
      {loading ? (
        <LoadingRows />
      ) : rows.length === 0 ? (
        <EmptyState text="ยังไม่มีนัดหมาย" />
      ) : (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>ลูกค้า</th>
                <th>ช่องทาง</th>
                <th>วันเวลา</th>
                <th>ระยะเวลา</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(appointment => (
                <tr key={appointment.id}>
                  <td>
                    <strong>{appointment.customerName}</strong>
                  </td>
                  <td>{appointment.contact}</td>
                  <td>
                    {new Date(appointment.scheduledAt).toLocaleString("th-TH")}
                  </td>
                  <td>{appointment.durationMinutes} นาที</td>
                  <td>
                    <select
                      className={`status-select ${appointment.status}`}
                      value={appointment.status}
                      onChange={event =>
                        onStatus(
                          appointment.id,
                          event.target.value as typeof appointment.status
                        )
                      }
                    >
                      {(
                        [
                          "requested",
                          "confirmed",
                          "completed",
                          "cancelled",
                        ] as const
                      ).map(status => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

async function cropAndResize(
  dataUrl: string,
  slot: CropSlot,
  focalX: number,
  focalY: number,
  zoom: number
) {
  const preset = cropPresets[slot] ?? cropPresets.hero;
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
  const aspect = preset.width / preset.height;
  const baseWidth = Math.min(image.naturalWidth, image.naturalHeight * aspect);
  const baseHeight = baseWidth / aspect;
  const cropWidth = baseWidth / zoom;
  const cropHeight = baseHeight / zoom;
  const maxX = Math.max(0, image.naturalWidth - cropWidth);
  const maxY = Math.max(0, image.naturalHeight - cropHeight);
  const sourceX = Math.min(
    maxX,
    Math.max(0, focalX * image.naturalWidth - cropWidth / 2)
  );
  const sourceY = Math.min(
    maxY,
    Math.max(0, focalY * image.naturalHeight - cropHeight / 2)
  );
  const canvas = document.createElement("canvas");
  canvas.width = preset.width;
  canvas.height = preset.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("ไม่สามารถประมวลผลภาพได้");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    0,
    0,
    preset.width,
    preset.height
  );
  return canvas.toDataURL("image/webp", 0.86);
}

function ContentManager({
  settings,
  media,
  onSave,
  onUpload,
  uploading,
}: {
  settings: ContentRow[];
  media: MediaRow[];
  onSave: (
    contentKey: ContentKey,
    language: "th" | "en",
    value: string
  ) => void;
  onUpload: (input: UploadInput) => void;
  uploading: boolean;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [slot, setSlot] = useState<CropSlot>("hero");
  const [altText, setAltText] = useState("");
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState("");
  const [focalX, setFocalX] = useState(0.5);
  const [focalY, setFocalY] = useState(0.5);
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [newKey, setNewKey] = useState<ContentKey>("heroTitle");
  const [newLanguage, setNewLanguage] = useState<"th" | "en">("th");
  const [newValue, setNewValue] = useState("");
  const preset = cropPresets[slot] ?? cropPresets.hero;
  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!isSupportedImageUpload(file.type, file.size)) {
      toast.error("รองรับ JPG, PNG, WebP หรือ GIF ไม่เกิน 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSourcePreview(String(reader.result));
      setLocalPreview(null);
      setPendingFileName(file.name);
      setFocalX(0.5);
      setFocalY(0.5);
      setZoom(1);
    };
    reader.onerror = () => toast.error("อ่านไฟล์รูปภาพไม่สำเร็จ");
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const applyCrop = async () => {
    if (!sourcePreview || !pendingFileName) return;
    setProcessing(true);
    try {
      setLocalPreview(
        await cropAndResize(sourcePreview, slot, focalX, focalY, zoom)
      );
    } catch {
      toast.error("ไม่สามารถครอปและปรับขนาดภาพได้");
    } finally {
      setProcessing(false);
    }
  };
  const uploadProcessed = () => {
    if (!localPreview || !pendingFileName) {
      toast.error("กรุณาครอปภาพและดูตัวอย่างก่อนบันทึก");
      return;
    }
    const payload = localPreview.split(",")[1] ?? "";
    onUpload({
      slot,
      fileName: pendingFileName.replace(/\\.[^.]+$/, "") + ".webp",
      mimeType: "image/webp",
      fileSize: estimateBase64Bytes(payload),
      dataBase64: localPreview,
      altText: altText.trim() || undefined,
    });
    setSourcePreview(null);
    setLocalPreview(null);
    setPendingFileName("");
  };
  const visibleSettings = settings.length ? settings : starterContent;
  const previewTitle =
    drafts["heroTitle:th"] ??
    visibleSettings.find(
      item => item.contentKey === "heroTitle" && item.language === "th"
    )?.value ??
    "ตัวอย่าง Hero";
  const previewAccent =
    drafts["heroAccent:th"] ??
    visibleSettings.find(
      item => item.contentKey === "heroAccent" && item.language === "th"
    )?.value ??
    "ข้อความตัวอย่างจะแสดงที่นี่";
  const previewImage =
    localPreview || media.find(item => item.slot === "hero")?.url;
  return (
    <div className="content-manager-grid">
      <div className="admin-table-card">
        <div className="admin-table-head">
          <div>
            <h2>ข้อความบนเว็บไซต์</h2>
            <p>แก้ไขข้อความตาม key และภาษาที่ต้องการแสดง</p>
          </div>
          <Save className="admin-table-icon" size={18} />
        </div>
        <form
          className="content-new-form"
          onSubmit={event => {
            event.preventDefault();
            if (!newValue.trim()) return;
            onSave(newKey, newLanguage, newValue.trim());
            setNewValue("");
          }}
        >
          <div>
            <label>
              Content key
              <select
                value={newKey}
                onChange={event => setNewKey(event.target.value as ContentKey)}
              >
                {[
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
                ].map(key => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </label>
            <label>
              ภาษา
              <select
                value={newLanguage}
                onChange={event =>
                  setNewLanguage(event.target.value as "th" | "en")
                }
              >
                <option value="th">TH</option>
                <option value="en">EN</option>
              </select>
            </label>
          </div>
          <label>
            ข้อความใหม่
            <textarea
              value={newValue}
              onChange={event => setNewValue(event.target.value)}
              rows={3}
              placeholder="พิมพ์ข้อความที่ต้องการแสดงบนเว็บไซต์"
              required
            />
          </label>
          <button className="admin-primary" type="submit">
            <Plus size={14} /> เพิ่มข้อความ
          </button>
        </form>
        <div className="content-preview">
          <span>LIVE PREVIEW</span>
          <h3>
            {previewTitle.split("\\n").map(line => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </h3>
          <p>{previewAccent}</p>
          {previewImage && <img src={previewImage} alt="ตัวอย่าง Hero" />}
        </div>
        <div className="content-list">
          {visibleSettings.map(item => {
            const key = `${item.contentKey}:${item.language}`;
            return (
              <label className="content-field" key={key}>
                <span>
                  <b>{item.contentKey}</b>
                  <small>{item.language.toUpperCase()}</small>
                </span>
                <textarea
                  value={drafts[key] ?? item.value}
                  onChange={event =>
                    setDrafts(current => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  rows={3}
                />
                <button
                  className="admin-primary"
                  onClick={() =>
                    onSave(
                      item.contentKey,
                      item.language,
                      drafts[key] ?? item.value
                    )
                  }
                >
                  <Save size={14} /> บันทึก
                </button>
              </label>
            );
          })}
        </div>
      </div>
      <div className="admin-table-card">
        <div className="admin-table-head">
          <div>
            <h2>รูปภาพเว็บไซต์</h2>
            <p>ครอปและปรับขนาดอัตโนมัติตาม slot ก่อนบันทึกไปยัง Storage</p>
          </div>
          <ImagePlus className="admin-table-icon" size={18} />
        </div>
        <div className="media-upload-form">
          <label>
            ตำแหน่งภาพ
            <select
              value={slot}
              onChange={event => {
                setSlot(event.target.value as CropSlot);
                setSourcePreview(null);
                setLocalPreview(null);
              }}
            >
              {Object.entries(cropPresets).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            คำอธิบายภาพ
            <input
              value={altText}
              onChange={event => setAltText(event.target.value)}
              placeholder="คำอธิบายสำหรับ accessibility"
            />
          </label>
          <label className="upload-dropzone">
            <ImagePlus size={22} />
            <span>
              {sourcePreview ? "เลือกภาพใหม่เพื่อแทนที่" : "เลือกไฟล์รูปภาพ"}
            </span>
            <small>JPG, PNG, WebP หรือ GIF ไม่เกิน 5MB</small>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFile}
              disabled={uploading || processing}
            />
          </label>
          {sourcePreview && (
            <div className="crop-panel">
              <div
                className="crop-preview-frame"
                style={{ aspectRatio: `${preset.width} / ${preset.height}` }}
              >
                <img
                  src={sourcePreview}
                  alt="ต้นฉบับสำหรับครอป"
                  style={{
                    objectPosition: `${focalX * 100}% ${focalY * 100}%`,
                    transform: `scale(${zoom})`,
                  }}
                />
              </div>
              <div className="crop-controls">
                <label>
                  จุดโฟกัสแนวนอน
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={focalX}
                    onChange={event => setFocalX(Number(event.target.value))}
                  />
                </label>
                <label>
                  จุดโฟกัสแนวตั้ง
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={focalY}
                    onChange={event => setFocalY(Number(event.target.value))}
                  />
                </label>
                <label>
                  ซูม <b>{zoom.toFixed(1)}×</b>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={event => setZoom(Number(event.target.value))}
                  />
                </label>
              </div>
              <div className="crop-actions">
                <button
                  className="admin-secondary"
                  type="button"
                  onClick={applyCrop}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <RefreshCw size={14} />
                  )}{" "}
                  ครอปและปรับขนาด {preset.width}×{preset.height}
                </button>
                {localPreview && (
                  <button
                    className="admin-primary"
                    type="button"
                    onClick={uploadProcessed}
                    disabled={uploading}
                  >
                    <Save size={14} /> บันทึกภาพที่ประมวลผลแล้ว
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="media-list">
          {media.length === 0 ? (
            <EmptyState text="ยังไม่มีรูปภาพที่อัปโหลด" />
          ) : (
            media.map(item => (
              <div className="media-row" key={item.id}>
                <img src={item.url} alt={item.altText || item.fileName} />
                <div>
                  <strong>{item.slot}</strong>
                  <small>
                    {item.fileName} · {Math.round(item.fileSize / 1024)} KB
                  </small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="admin-loading">
      <Loader2 className="animate-spin" size={20} /> กำลังโหลดข้อมูล...
    </div>
  );
}
function EmptyState({ text }: { text: string }) {
  return (
    <div className="admin-empty">
      <Inbox size={25} />
      <p>{text}</p>
      <small>ข้อมูลใหม่จะแสดงที่นี่เมื่อมีการส่งจากหน้าเว็บไซต์</small>
    </div>
  );
}
function statusLabel(status: string) {
  return (
    (
      {
        new: "ใหม่",
        contacted: "ติดต่อแล้ว",
        qualified: "ผ่านการคัดกรอง",
        closed: "ปิดแล้ว",
        idea: "ไอเดีย",
        active: "กำลังทำ",
        review: "รอตรวจ",
        completed: "เสร็จแล้ว",
        archived: "เก็บถาวร",
      } as Record<string, string>
    )[status] ?? status
  );
}
