// Design philosophy: Editorial Ivory / Mountain Mist — ivory canvas, ink typography, cobalt actions, coral punctuation, and the mountain contour as the brand signature.
import { type CSSProperties, useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  CirclePlay,
  CircleStop,
  Copy,
  GitBranch,
  GripVertical,
  Languages,
  LayoutTemplate,
  MoreHorizontal,
  Plus,
  Save,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

type Language = "th" | "en";
type NodeType = "trigger" | "action" | "decision" | "end";

type FlowNode = {
  id: number;
  type: NodeType;
  title: string;
  detail: string;
};

const copy = {
  th: {
    label: "FLOW BUILDER / 001",
    title: "วาดระบบให้\nเห็นภาพก่อนลงมือทำ",
    intro:
      "เปลี่ยนไอเดียที่กระจัดกระจายให้กลายเป็นเส้นทางการทำงานที่ทุกคนเข้าใจตรงกัน",
    back: "กลับหน้าเว็บไซต์",
    newFlow: "สร้าง Flow ใหม่",
    save: "บันทึก Flow",
    saved: "บันทึก Flow แล้ว",
    overview: "ภาพรวม",
    steps: "ขั้นตอน",
    connections: "จุดเชื่อม",
    addStep: "เพิ่มขั้นตอน",
    inspector: "รายละเอียดขั้นตอน",
    selectHint: "เลือก node บน canvas เพื่อแก้ไขรายละเอียด",
    nodeTitle: "ชื่อขั้นตอน",
    nodeDetail: "คำอธิบาย",
    nodeType: "ประเภท",
    update: "อัปเดตขั้นตอน",
    delete: "ลบขั้นตอน",
    flowSummary: "สรุป Flow",
    start: "เริ่มต้น",
    end: "สิ้นสุด",
    decision: "เงื่อนไข",
    action: "การทำงาน",
    zoom: "ซูม",
    fit: "จัดมุมมอง",
    empty: "ยังไม่มีขั้นตอน",
    duplicate: "ทำสำเนา",
    savedNote: "แก้ไขได้ทุกเมื่อ · เวอร์ชันร่าง",
    backToSite: "กลับไปดูเว็บไซต์",
  },
  en: {
    label: "FLOW BUILDER / 001",
    title: "Map the system\nbefore building it",
    intro:
      "Turn scattered ideas into a working journey everyone can understand at a glance.",
    back: "Back to website",
    newFlow: "New flow",
    save: "Save flow",
    saved: "Flow saved",
    overview: "Overview",
    steps: "Steps",
    connections: "Connections",
    addStep: "Add step",
    inspector: "Step details",
    selectHint: "Select a node on the canvas to edit its details",
    nodeTitle: "Step name",
    nodeDetail: "Description",
    nodeType: "Type",
    update: "Update step",
    delete: "Delete step",
    flowSummary: "Flow summary",
    start: "Start",
    end: "End",
    decision: "Decision",
    action: "Action",
    zoom: "Zoom",
    fit: "Fit view",
    empty: "No steps yet",
    duplicate: "Duplicate",
    savedNote: "Editable anytime · Draft version",
    backToSite: "View main website",
  },
} as const;

const initialNodes: FlowNode[] = [
  {
    id: 1,
    type: "trigger",
    title: "ลูกค้าเริ่มประเมินราคา",
    detail: "กดปุ่มประเมินราคาเบื้องต้นจากหน้าเว็บไซต์",
  },
  {
    id: 2,
    type: "action",
    title: "เลือกประเภทเว็บไซต์",
    detail: "ธุรกิจ · ร้านค้าออนไลน์ · Landing Page",
  },
  {
    id: 3,
    type: "action",
    title: "ตอบคำถามความต้องการ",
    detail: "จำนวนหน้า ฟีเจอร์ และ timeline",
  },
  {
    id: 4,
    type: "decision",
    title: "อยู่ในขอบเขตที่ประเมินได้ไหม?",
    detail: "ตรวจสอบความซับซ้อนของโปรเจกต์",
  },
  {
    id: 5,
    type: "end",
    title: "แสดงช่วงราคาเบื้องต้น",
    detail: "ส่งต่อไปยังบรีฟหรือระบบจองคิว",
  },
];

const typeLabel = (language: Language, type: NodeType) => {
  const labels = {
    trigger: ["เริ่มต้น", "Start"],
    action: ["การทำงาน", "Action"],
    decision: ["เงื่อนไข", "Decision"],
    end: ["สิ้นสุด", "End"],
  } as const;
  return labels[type][language === "th" ? 0 : 1];
};

export default function SystemFlow() {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem("webcraft-language") as Language) || "th"
  );
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedId, setSelectedId] = useState(4);
  const [zoom, setZoom] = useState(100);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDetail, setEditingDetail] = useState("");
  const t = copy[language];
  const selected = nodes.find(node => node.id === selectedId);

  const stats = useMemo(
    () => ({ steps: nodes.length, connections: Math.max(nodes.length - 1, 0) }),
    [nodes.length]
  );

  const selectNode = (node: FlowNode) => {
    setSelectedId(node.id);
    setEditingTitle(node.title);
    setEditingDetail(node.detail);
  };

  const addNode = () => {
    const nextId = Math.max(...nodes.map(node => node.id), 0) + 1;
    const node: FlowNode = {
      id: nextId,
      type: "action",
      title: language === "th" ? "ขั้นตอนใหม่" : "New step",
      detail:
        language === "th"
          ? "เพิ่มรายละเอียดของขั้นตอนนี้"
          : "Add a description for this step",
    };
    setNodes(current => [...current.slice(0, -1), node, ...current.slice(-1)]);
    selectNode(node);
    toast.success(
      language === "th" ? "เพิ่มขั้นตอนใหม่แล้ว" : "New step added"
    );
  };

  const updateNode = () => {
    if (!selected) return;
    setNodes(current =>
      current.map(node =>
        node.id === selected.id
          ? {
              ...node,
              title: editingTitle || node.title,
              detail: editingDetail || node.detail,
            }
          : node
      )
    );
    toast.success(
      language === "th" ? "อัปเดตรายละเอียดแล้ว" : "Step details updated"
    );
  };

  const deleteNode = () => {
    if (!selected || nodes.length <= 2) return;
    setNodes(current => current.filter(node => node.id !== selected.id));
    setSelectedId(nodes[0].id);
    toast.success(language === "th" ? "ลบขั้นตอนแล้ว" : "Step deleted");
  };

  const saveFlow = () => toast.success(t.saved);
  const toggleLanguage = (next: Language) => {
    setLanguage(next);
    localStorage.setItem("webcraft-language", next);
    document.documentElement.lang = next;
  };

  return (
    <main className="flow-builder min-h-screen">
      <header className="flow-header border-b border-ink/10 bg-paper/90 backdrop-blur-md">
        <div className="container flex h-[72px] items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Link href="/" className="flow-back" aria-label={t.back}>
              <ArrowLeft size={17} />{" "}
              <span className="hidden sm:inline">{t.back}</span>
            </Link>
            <span className="hidden h-5 w-px bg-ink/15 sm:block" />
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg border border-ink/20 bg-white p-1">
                <img
                  src="/media/mhs-dev-mascot.png"
                  alt=""
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="font-display text-base leading-tight">
                {language === "th"
                  ? "โค้ดดิ้งเมืองสามหมอก"
                  : "Sam Mok Coding"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="language-switcher">
              <Languages size={14} />
              <button
                className={language === "th" ? "active" : ""}
                onClick={() => toggleLanguage("th")}
              >
                TH
              </button>
              <span>/</span>
              <button
                className={language === "en" ? "active" : ""}
                onClick={() => toggleLanguage("en")}
              >
                EN
              </button>
            </div>
            <button
              className="button-cobalt hidden px-4 py-2.5 sm:flex"
              onClick={saveFlow}
            >
              <Save size={15} /> {t.save}
            </button>
            <button
              className="icon-button sm:hidden"
              onClick={saveFlow}
              aria-label={t.save}
            >
              <Save size={17} />
            </button>
          </div>
        </div>
      </header>

      <section className="flow-intro border-b border-ink/10">
        <div className="container grid gap-8 py-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow mb-5">
              <span className="eyebrow-dot" /> {t.label}
            </p>
            <h1 className="max-w-3xl whitespace-pre-line font-display text-4xl leading-[1.18] sm:text-6xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-ink/60">
              {t.intro}
            </p>
            <div className="flow-mascot-callout"><img src="/media/mascot/mhs-pose-13.png" alt="เมืองสามหมอกเดฟกำลังเช็กลิสต์งาน" /><span>{language === "th" ? "คิดให้ชัด ก่อนเขียนโค้ด" : "Think clearly before writing code"}</span></div>
          </div>
          <div className="flex items-center gap-3 lg:pb-1">
            <button
              className="button-ink"
              onClick={() => {
                setNodes(initialNodes);
                setSelectedId(4);
                toast.success(t.newFlow);
              }}
            >
              <LayoutTemplate size={16} /> {t.newFlow}
            </button>
            <span className="font-mono text-[10px] tracking-[.12em] text-ink/40">
              {t.savedNote}
            </span>
          </div>
        </div>
      </section>

      <section className="container py-8">
        <div className="flow-workspace grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
          <aside className="flow-sidebar">
            <div className="mb-5 flex items-center justify-between">
              <p className="eyebrow">
                <span className="eyebrow-dot bg-coral" /> {t.overview}
              </p>
              <button className="icon-button" aria-label="More">
                <MoreHorizontal size={17} />
              </button>
            </div>
            <div className="flow-stat-grid">
              <div>
                <strong>{stats.steps}</strong>
                <span>{t.steps}</span>
              </div>
              <div>
                <strong>{stats.connections}</strong>
                <span>{t.connections}</span>
              </div>
            </div>
            <div className="mt-8">
              <p className="mb-3 font-mono text-[10px] font-bold tracking-[.14em] text-ink/40">
                FLOW MAP
              </p>
              <div className="flow-mini-map">
                {nodes.map((node, index) => (
                  <button
                    key={node.id}
                    onClick={() => selectNode(node)}
                    className={`flow-mini-node ${selectedId === node.id ? "selected" : ""}`}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <b>{node.title}</b>
                  </button>
                ))}
              </div>
            </div>
            <button
              className="button-cobalt mt-6 w-full justify-center py-3"
              onClick={addNode}
            >
              <Plus size={16} /> {t.addStep}
            </button>
          </aside>

          <div className="flow-canvas-wrap">
            <div className="flow-canvas-toolbar">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold tracking-[.14em] text-ink/40">
                  CUSTOMER JOURNEY / V1
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-coral" />
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="icon-button"
                  onClick={() => setZoom(value => Math.max(70, value - 10))}
                  aria-label={t.zoom}
                >
                  <ZoomOut size={16} />
                </button>
                <span className="min-w-12 text-center font-mono text-xs">
                  {zoom}%
                </span>
                <button
                  className="icon-button"
                  onClick={() => setZoom(value => Math.min(130, value + 10))}
                  aria-label={t.zoom}
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  className="icon-button ml-2"
                  onClick={() => setZoom(100)}
                  aria-label={t.fit}
                >
                  <Copy size={15} />
                </button>
              </div>
            </div>
            <div
              className="flow-canvas"
              style={{ "--flow-scale": `${zoom / 100}` } as CSSProperties}
            >
              <div className="flow-canvas-inner">
                {nodes.map((node, index) => (
                  <div className="flow-node-row" key={node.id}>
                    <button
                      onClick={() => selectNode(node)}
                      className={`flow-node flow-node-${node.type} ${selectedId === node.id ? "selected" : ""}`}
                    >
                      <div className="flow-node-top">
                        <span className="flow-node-type">
                          {typeLabel(language, node.type)}
                        </span>
                        <GripVertical size={14} className="text-ink/25" />
                      </div>
                      <div className="flow-node-title">{node.title}</div>
                      <p>{node.detail}</p>
                      <span className="flow-node-index">
                        /{String(index + 1).padStart(2, "0")}
                      </span>
                    </button>
                    {index < nodes.length - 1 && (
                      <div className="flow-connector">
                        <span />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="flow-inspector">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="eyebrow mb-3">
                  <span className="eyebrow-dot bg-coral" /> {t.inspector}
                </p>
                <h2 className="font-display text-2xl leading-[1.3]">
                  {selected ? typeLabel(language, selected.type) : t.empty}
                </h2>
              </div>
              <GitBranch className="text-cobalt" size={21} />
            </div>
            {selected ? (
              <div className="space-y-5">
                <label className="flow-field">
                  <span>{t.nodeType}</span>
                  <div className="flow-select">
                    <span>{typeLabel(language, selected.type)}</span>
                    <ChevronDown size={16} />
                  </div>
                </label>
                <label className="flow-field">
                  <span>{t.nodeTitle}</span>
                  <input
                    value={editingTitle}
                    onChange={event => setEditingTitle(event.target.value)}
                  />
                </label>
                <label className="flow-field">
                  <span>{t.nodeDetail}</span>
                  <textarea
                    rows={5}
                    value={editingDetail}
                    onChange={event => setEditingDetail(event.target.value)}
                  />
                </label>
                <button
                  className="button-cobalt w-full justify-center py-3"
                  onClick={updateNode}
                >
                  <Check size={16} /> {t.update}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="flow-secondary-button"
                    onClick={() => {
                      const clone = {
                        ...selected,
                        id: Math.max(...nodes.map(node => node.id)) + 1,
                        title: `${selected.title} · copy`,
                      };
                      setNodes(current => [...current, clone]);
                      selectNode(clone);
                    }}
                  >
                    {t.duplicate}
                  </button>
                  <button
                    className="flow-danger-button"
                    onClick={deleteNode}
                    disabled={nodes.length <= 2}
                  >
                    <Trash2 size={15} /> {t.delete}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-6 text-ink/55">{t.selectHint}</p>
            )}
            <div className="mt-10 border-t border-ink/10 pt-6">
              <p className="eyebrow mb-4">
                <span className="eyebrow-dot" /> {t.flowSummary}
              </p>
              <div className="space-y-3 text-sm">
                {nodes.slice(0, 4).map((node, index) => (
                  <div className="flex gap-3" key={node.id}>
                    <span className="font-mono text-xs text-cobalt">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-ink/65">{node.title}</span>
                  </div>
                ))}
                {nodes.length > 4 && (
                  <div className="text-xs text-ink/40">
                    + {nodes.length - 4} more
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <footer className="container flex flex-col justify-between gap-4 border-t border-ink/10 py-7 text-xs text-ink/45 sm:flex-row sm:items-center">
        <span className="font-mono tracking-[.12em]">
          FLOW BUILDER / MADE WITH INTENT
        </span>
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold hover:text-cobalt"
        >
          {t.backToSite} <ArrowUpRight size={15} />
        </Link>
      </footer>
    </main>
  );
}
