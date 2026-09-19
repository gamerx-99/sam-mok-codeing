import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  Calculator,
  Check,
  Code2,
  Crop,
  Download,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  CATALOG_TOOLS,
  CATEGORY_LABELS,
  INTERACTIVE_BY_ID,
  INTERACTIVE_TOOLS,
  TOOL_SEARCH,
  type ToolCategory,
} from "./toolData";
import { InteractiveModal } from "./InteractiveModal";
import {
  MAX_FILES,
  MAX_FILE_SIZE,
  TOOL_HANDLERS,
  TOOL_OPTIONS,
  defaultOptionsFor,
  downloadOutputs,
  formatSize,
  getAcceptForTool,
  isWorkingTool,
  notifyError,
  type OutputFile,
  type ProcessResult,
  type ToolOptions,
} from "./toolProcess";

type WorkingTool = {
  id: string;
  title: string;
  desc: string;
  href: string;
  external?: boolean;
  icon: typeof Code2;
};

/** Static tools that live on their own page — linked from the hub. */
const STATIC_TOOLS: WorkingTool[] = [
  {
    id: "live-editor",
    title: "Live HTML Editor + Inspector",
    desc: "แก้ไข HTML สดพร้อม Inspector ชี้องค์ประกอบได้ทันที บันทึก/เปิดไฟล์จากเครื่องได้",
    href: "/tool/editor/",
    icon: Code2,
  },
  {
    id: "image-cropper",
    title: "Image Cropper & Sprite Extractor",
    desc: "ตัดรูป ครอปอัตโนมัติ และแยกตัวละคร/สไปรท์ออกจากภาพชุด",
    href: "/tool/image-cropper/index.html",
    icon: Crop,
    external: true,
  },
  {
    id: "khumkhai-calculator",
    title: "คำนวณค่าธรรมเนียมออนไลน์ 2569 (KhumKhai)",
    desc: "สรุปและเปรียบเทียบค่าธรรมเนียม Shopee, TikTok Shop, Lazada พร้อมเครื่องคิดเลขกำไรสุทธิ",
    href: "/tool/khumkhai/",
    icon: Calculator,
    external: true,
  },
];

const CATEGORY_OF_STATIC: Record<string, ToolCategory> = {
  "live-editor": "organize",
  "image-cropper": "organize",
  "khumkhai-calculator": "calculators",
};

type Filter = ToolCategory | "all";

export default function ToolHub() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const catalogTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG_TOOLS.filter(tool => {
      const inCategory = filter === "all" || tool.category === filter;
      if (!inCategory) return false;
      if (!q) return true;
      const haystack = `${tool.titleTh} ${tool.descTh} ${TOOL_SEARCH[tool.id] ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [filter, query]);

  const staticTools = useMemo(
    () =>
      STATIC_TOOLS.filter(tool => {
        const inCategory =
          filter === "all" || CATEGORY_OF_STATIC[tool.id] === filter;
        if (!inCategory) return false;
        if (!query.trim()) return true;
        const q = query.trim().toLowerCase();
        return `${tool.title} ${tool.desc}`.toLowerCase().includes(q);
      }),
    [filter, query]
  );

  const interactiveTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INTERACTIVE_TOOLS.filter(tool => {
      const inCategory = filter === "all" || tool.category === filter;
      if (!inCategory) return false;
      if (!q) return true;
      return `${tool.titleTh} ${tool.descTh} ${tool.id}`.toLowerCase().includes(q);
    });
  }, [filter, query]);

  return (
    <main className="toolhub-page">
      <header className="toolhub-topbar">
        <div className="code-container toolhub-topbar-inner">
          <Link href="/" className="code-brand">
            <span className="code-brand-mark">
              <Wrench size={18} />
            </span>
            <span>
              <strong>TOOLS WORKSPACE</strong>
              <small>Sam Mok Coding</small>
            </span>
          </Link>
          <nav className="toolhub-nav" aria-label="Tool navigation">
            <Link href="/" className="toolhub-nav-link">
              <ArrowLeft size={14} /> กลับหน้าหลัก
            </Link>
          </nav>
        </div>
      </header>

      <section className="toolhub-hero">
        <div className="code-container">
          <span className="eyebrow">
            <i className="eyebrow-dot" /> UTILITY WORKSPACE
          </span>
          <h1 className="toolhub-title">
            เครื่องมือช่วยงาน
            <br />
            <em>ใช้งานได้ทันทีในเบราว์เซอร์</em>
          </h1>
          <p className="toolhub-lead">
            ทุกเครื่องมือประมวลผลบนเครื่องของคุณ ไฟล์ไม่ถูกอัปโหลดไปไหน
            กดที่การ์ดเพื่อเริ่มใช้งานได้เลย
          </p>
          <div className="toolhub-search">
            <Search size={16} />
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="ค้นหาเครื่องมือ เช่น รวมไฟล์, แปลง, หมุนหน้า, ลายน้ำ..."
              aria-label="ค้นหาเครื่องมือ"
            />
          </div>
        </div>
      </section>

      <div className="code-container">
        {/* CanvaCard: ถอดออกชั่วคราวจนกว่า Canva API credentials พร้อม —
            เปิดกลับด้วย <CanvaCard /> (import จาก ./CanvaCard) */}
        <div className="toolhub-tabs" role="tablist" aria-label="หมวดเครื่องมือ">
          {CATEGORY_LABELS.map(category => (
            <button
              key={category.id}
              className={`toolhub-tab ${filter === category.id ? "active" : ""}`}
              onClick={() => setFilter(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Static tool pages */}
        {staticTools.length > 0 && (
          <section className="toolhub-section">
            <div className="code-section-head toolhub-section-head">
              <div>
                <span className="eyebrow">
                  <i className="eyebrow-dot" /> หน้าเครื่องมือเต็มรูปแบบ
                </span>
                <h2>เปิดใช้ได้เลย</h2>
              </div>
              <p>เครื่องมือแบบหน้าจอเต็ม กดแล้วเปิดหน้าเครื่องมือทันที</p>
            </div>
            <div className="toolhub-working-grid">
              {staticTools.map(tool => (
                <a
                  key={tool.id}
                  href={tool.href}
                  target={tool.external ? "_blank" : undefined}
                  rel={tool.external ? "noopener" : undefined}
                  className="toolhub-working-card"
                >
                  <span className="toolhub-working-icon">
                    <tool.icon size={22} />
                  </span>
                  <span className="toolhub-working-body">
                    <h3>{tool.title}</h3>
                    <p>{tool.desc}</p>
                  </span>
                  <ArrowUpRight size={18} />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Document tools — processed in the browser */}
        <section className="toolhub-section">
          <div className="code-section-head toolhub-section-head">
            <div>
              <span className="eyebrow">
                <i className="eyebrow-dot" /> จัดการเอกสาร
              </span>
              <h2>เครื่องมือ PDF &amp; เอกสาร ({catalogTools.length})</h2>
            </div>
            <p>
              กดที่การ์ดเพื่อเลือกไฟล์ — การ์ดที่พร้อมใช้จะเปิดหน้าต่างทำงานทันที
              ส่วนที่ยังไม่ถึงจะแจ้งสถานะให้ทราบ
            </p>
          </div>
          {catalogTools.length === 0 ? (
            <div className="toolhub-empty">
              <Search size={22} />
              <p>ไม่พบเครื่องมือที่ตรงกับ &ldquo;{query}&rdquo;</p>
              <small>ลองคำอื่น เช่น merge, convert, บีบอัด, ลายน้ำ, สี, ครอป</small>
            </div>
          ) : (
            <div className="toolhub-catalog-grid">
              {catalogTools.map(tool => (
                <CatalogCard key={tool.id} toolId={tool.id} />
              ))}
            </div>
          )}
        </section>

        {/* Interactive studio tools — live, no files needed */}
        {interactiveTools.length > 0 && (
          <section className="toolhub-section">
            <div className="code-section-head toolhub-section-head">
              <div>
                <span className="eyebrow">
                  <i className="eyebrow-dot" /> สตูดิโอเครื่องมือ
                </span>
                <h2>ใช้งานทันที ไม่ต้องอัปโหลด ({interactiveTools.length})</h2>
              </div>
              <p>
                เครื่องมือสี รูปภาพ ตัวอักษร และคำนวณ — กดการ์ดแล้วใช้ได้เลย
                ข้อมูลไม่ออกจากเครื่องคุณ
              </p>
            </div>
            <div className="toolhub-catalog-grid">
              {interactiveTools.map(tool => (
                <InteractiveCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="toolhub-footer">
        <div className="code-container toolhub-footer-inner">
          <span>© 2026 Sam Mok Coding</span>
          <span>
            เครื่องมือทั้งหมดประมวลผลในเบราว์เซอร์ของคุณ · Made in Mae Hong Son
          </span>
        </div>
      </footer>
    </main>
  );
}

/* ---------- Interactive card: opens the live studio modal ---------- */

function InteractiveCard({ tool }: { tool: (typeof INTERACTIVE_TOOLS)[number] }) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <button
        className="toolhub-catalog-card is-working"
        onClick={() => setModalOpen(true)}
        type="button"
        aria-label={`ใช้งาน ${tool.titleTh}`}
      >
        <span className="toolhub-badge-ready">ใช้งานได้</span>
        <span
          className="toolhub-catalog-icon"
          dangerouslySetInnerHTML={{ __html: tool.iconSvg }}
        />
        <h3>{tool.titleTh}</h3>
        <p>{tool.descTh}</p>
        <span className="toolhub-status">
          <Check size={12} /> กดเพื่อใช้งาน
        </span>
      </button>
      {modalOpen && <InteractiveModal tool={tool} onClose={() => setModalOpen(false)} />}
    </>
  );
}

/* ---------- Catalog card: opens the work modal when usable ---------- */

function CatalogCard({ toolId }: { toolId: string }) {
  const tool = CATALOG_TOOLS.find(item => item.id === toolId)!;
  const working = isWorkingTool(tool.id);
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    if (working) {
      setModalOpen(true);
    } else {
      toast.info(`"${tool.titleTh}" อยู่ระหว่างพัฒนา — ยังไม่เปิดใช้งาน`, {
        description: "เครื่องมือที่พร้อมใช้จะมีป้าย ใช้งานได้ บนการ์ด",
      });
    }
  };

  return (
    <>
      <button
        className={`toolhub-catalog-card ${working ? "is-working" : ""}`}
        onClick={handleClick}
        type="button"
        aria-label={working ? `ใช้งาน ${tool.titleTh}` : tool.titleTh}
      >
        {working && <span className="toolhub-badge-ready">ใช้งานได้</span>}
        {tool.isNew && !working && (
          <span className="toolhub-badge-new">ใหม่</span>
        )}
        <span
          className="toolhub-catalog-icon"
          dangerouslySetInnerHTML={{ __html: tool.iconSvg }}
        />
        <h3>{tool.titleTh}</h3>
        <p>{tool.descTh}</p>
        <span className="toolhub-status">
          {working ? (
            <>
              <Check size={12} /> กดเพื่อใช้งาน
            </>
          ) : (
            <>อยู่ระหว่างพัฒนา</>
          )}
        </span>
      </button>
      {modalOpen && (
        <ToolWorkModal tool={tool} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

/* ---------- Work modal: options → pick files → progress → download ---------- */

function ToolWorkModal({
  tool,
  onClose,
}: {
  tool: { id: string; titleTh: string; descTh: string };
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [options, setOptions] = useState<ToolOptions>(() =>
    defaultOptionsFor(tool.id)
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const accepts = getAcceptForTool(tool.id);
  const optionFields = TOOL_OPTIONS[tool.id] ?? [];

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    setFiles(current => {
      const next = [...current];
      let added = 0;
      let skippedSize = 0;
      let skippedType = 0;
      let atCapacity = false;
      Array.from(incoming).forEach(file => {
        if (next.length >= MAX_FILES) {
          atCapacity = true;
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          skippedSize += 1;
          return;
        }
        const extOk = accepts
          .split(",")
          .some(ext => file.name.toLowerCase().endsWith(ext.trim()));
        if (!extOk) {
          skippedType += 1;
          return;
        }
        const duplicate = next.some(
          existing =>
            existing.name === file.name && existing.size === file.size
        );
        if (duplicate) return;
        next.push(file);
        added += 1;
      });
      if (added > 1) {
        toast.success(`เพิ่ม ${added} ไฟล์พร้อมกันแล้ว (รวม ${next.length} ไฟล์)`);
      } else if (added === 1) {
        toast.success(`เพิ่ม ${incoming[0].name}`);
      }
      if (atCapacity) toast.error(`เพิ่มได้สูงสุด ${MAX_FILES} ไฟล์ต่อครั้ง`);
      if (skippedSize > 0) toast.error(`ข้ามไฟล์เกิน ${formatSize(MAX_FILE_SIZE)} จำนวน ${skippedSize} ไฟล์`);
      if (skippedType > 0)
        toast.error(`ข้ามไฟล์ชนิดที่ไม่รองรับ จำนวน ${skippedType} ไฟล์`);
      return next;
    });
    setResult(null);
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    setFiles(current => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  const start = async () => {
    const handler = TOOL_HANDLERS[tool.id];
    if (!handler || files.length === 0) return;
    setBusy(true);
    setProgress({ done: 0, total: files.length });
    try {
      const processed = await handler(files, options, (done, total) =>
        setProgress({ done, total })
      );
      setResult(processed);
      downloadOutputs(processed.outputs);
      toast.success(processed.summary, {
        description: `ดาวน์โหลดอัตโนมัติ ${processed.outputs.length} ไฟล์`,
      });
    } catch (error) {
      notifyError(error);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const progressPct =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.done / progress.total) * 100))
      : 0;

  return (
    <div
      className="toolhub-modal-overlay"
      onClick={event => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div className="toolhub-modal" role="dialog" aria-modal="true" aria-label={tool.titleTh}>
        <button
          className="toolhub-modal-close"
          onClick={onClose}
          disabled={busy}
          aria-label="ปิดหน้าต่าง"
        >
          <X size={17} />
        </button>
        <span className="eyebrow">
          <i className="eyebrow-dot" /> {tool.id.toUpperCase()}
        </span>
        <h2>{tool.titleTh}</h2>
        <p className="toolhub-modal-desc">{tool.descTh}</p>

        {optionFields.length > 0 && (
          <div className="toolhub-options">
            {optionFields.map(field => (
              <label key={field.key} className="toolhub-option-field">
                <span>{field.label}</span>
                {field.type === "select" ? (
                  <select
                    value={String(options[field.key] ?? field.default)}
                    disabled={busy}
                    onChange={event =>
                      setOptions(current => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                  >
                    {field.choices.map(choice => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "number" ? (
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={Number(options[field.key] ?? field.default)}
                    disabled={busy}
                    onChange={event =>
                      setOptions(current => ({
                        ...current,
                        [field.key]: Number(event.target.value),
                      }))
                    }
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={String(options[field.key] ?? "")}
                    disabled={busy}
                    onChange={event =>
                      setOptions(current => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                  />
                )}
              </label>
            ))}
          </div>
        )}

        <div
          className="toolhub-dropzone"
          onClick={() => !busy && inputRef.current?.click()}
          onDragOver={event => event.preventDefault()}
          onDrop={event => {
            event.preventDefault();
            if (!busy) addFiles(event.dataTransfer.files);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={event => {
            if (event.key === "Enter" && !busy) inputRef.current?.click();
          }}
        >
          <FileText size={22} />
          <strong>
            ลากไฟล์มาวางหลายไฟล์พร้อมกัน หรือคลิกเพื่อเลือก (กด Ctrl/⌘ คลิกเลือกหลายไฟล์)
          </strong>
          <small>
            สูงสุด {MAX_FILES} ไฟล์ · ไม่เกิน {formatSize(MAX_FILE_SIZE)} ต่อไฟล์ ·
            {tool.id === "merge-pdf"
              ? " ไฟล์จะถูกรวมตามลำดับในรายการ สลับลำดับได้ด้านล่าง"
              : " ประมวลผลบนเครื่องคุณทั้งหมด"}
          </small>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accepts}
            style={{ display: "none" }}
            onChange={event => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        {files.length > 0 && (
          <>
            <div className="toolhub-filelist-head">
              <span>
                รายการไฟล์ ({files.length}/{MAX_FILES}) · {formatSize(totalSize)}
              </span>
              {!busy && (
                <button onClick={() => setFiles([])}>ล้างทั้งหมด</button>
              )}
            </div>
            <ul className="toolhub-filelist">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`}>
                  <span className="toolhub-filelist-order">{index + 1}</span>
                  <span className="toolhub-filelist-name">{file.name}</span>
                  <small>{formatSize(file.size)}</small>
                  {!busy && (
                    <span className="toolhub-filelist-actions">
                      <button
                        aria-label={`เลื่อน ${file.name} ขึ้น`}
                        disabled={index === 0}
                        onClick={() => moveFile(index, -1)}
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        aria-label={`เลื่อน ${file.name} ลง`}
                        disabled={index === files.length - 1}
                        onClick={() => moveFile(index, 1)}
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        aria-label={`นำไฟล์ ${file.name} ออก`}
                        onClick={() =>
                          setFiles(current =>
                            current.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <Trash2 size={13} />
                      </button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        {busy && progress && (
          <div className="toolhub-progress">
            <div className="toolhub-progress-bar">
              <span style={{ width: `${progressPct}%` }} />
            </div>
            <small>
              กำลังประมวลผล {progress.done}/{progress.total} ({progressPct}%)
            </small>
          </div>
        )}

        <div className="toolhub-modal-actions">
          {files.length < MAX_FILES && !busy && (
            <button
              className="admin-secondary"
              onClick={() => inputRef.current?.click()}
            >
              <Plus size={15} /> เพิ่มไฟล์
            </button>
          )}
          <button
            className="admin-primary"
            onClick={start}
            disabled={busy || files.length === 0}
          >
            {busy ? (
              <>
                <Loader2 size={15} className="animate-spin" /> กำลังประมวลผล...
              </>
            ) : (
              <>
                <Wrench size={15} /> ประมวลผล {files.length} ไฟล์
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="toolhub-result-group">
            <div className="toolhub-result">
              <Download size={15} />
              <div>
                <strong>{result.summary}</strong>
                <small>
                  ดาวน์โหลดแล้ว {result.outputs.length} ไฟล์ —{" "}
                  {result.outputs.map(output => output.name).join(", ")}
                </small>
              </div>
              <button
                className="toolhub-result-redownload"
                onClick={() => downloadOutputs(result.outputs)}
              >
                ดาวน์โหลดอีกครั้ง
              </button>
            </div>
            {result.outputs.some(output => output.note) && (
              <ul className="toolhub-result-notes">
                {result.outputs
                  .filter(output => output.note)
                  .map(output => (
                    <li key={output.name}>
                      <b>{output.name}</b> — {output.note}
                    </li>
                  ))}
              </ul>
            )}
            {result.failed && result.failed.length > 0 && (
              <div className="toolhub-result-failed" role="alert">
                <AlertTriangle size={14} />
                <div>
                  <strong>ข้ามไฟล์ที่ประมวลผลไม่ได้ {result.failed.length} ไฟล์</strong>
                  <ul>
                    {result.failed.map(item => (
                      <li key={item.name}>
                        {item.name} — {item.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
