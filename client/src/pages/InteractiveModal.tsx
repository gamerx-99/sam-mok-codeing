import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { InteractiveTool } from "./toolData";
import {
  colorFormats,
  tailwindShades,
  colorHarmony,
  contrastRatio,
  simulateColorBlind,
  extractPalette,
  cropToRatio,
  makeMatte,
  splitCarousel,
  generateFavicons,
  convertImage,
  trimTransparent,
  pxRem,
  lineHeightCalc,
  typeScale,
  TYPE_RATIO_OPTIONS,
  countText,
  paperSizes,
  UNIT_CATEGORIES,
  convertUnit,
  convertTemperature,
  convertBase,
  convertTime,
  encodeText,
  metaTagGenny,
  type CropPosition,
  type HarmonyMode,
  type ImageFormat,
} from "./toolInteractive";

/* ---------- small shared bits ---------- */

const CopyRow = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="toolhub-copy-row"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success(`คัดลอก ${label} แล้ว`);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          toast.error("คัดลอกไม่สำเร็จ");
        }
      }}
    >
      <span className="toolhub-copy-label">{label}</span>
      <span className="toolhub-copy-value">{value}</span>
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
};

const Swatches = ({
  colours,
  onPick,
}: {
  colours: Array<{ hex: string; label?: string }>;
  onPick?: (hex: string) => void;
}) => (
  <div className="toolhub-swatch-row">
    {colours.map(colour => (
      <button
        key={colour.hex + (colour.label ?? "")}
        className="toolhub-swatch"
        style={{ background: colour.hex }}
        onClick={() => onPick?.(colour.hex)}
        title={colour.label ? `${colour.label} ${colour.hex}` : colour.hex}
      >
        {colour.label && <span>{colour.label}</span>}
      </button>
    ))}
  </div>
);

const ColourInput = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => (
  <div className="toolhub-colour-input">
    <input
      type="color"
      value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#2050e0"}
      onChange={event => onChange(event.target.value.toUpperCase())}
      disabled={disabled}
      aria-label="เลือกสี"
    />
    <input
      type="text"
      value={value}
      disabled={disabled}
      onChange={event => onChange(event.target.value)}
      placeholder="#2050E0 / rgb(...) / hsl(...)"
    />
  </div>
);

const FilePickButton = ({
  accept,
  multiple,
  busy,
  onFiles,
  children,
}: {
  accept: string;
  multiple?: boolean;
  busy?: boolean;
  onFiles: (files: File[]) => void;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        className="admin-secondary"
        onClick={() => ref.current?.click()}
        disabled={busy}
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
        {children}
      </button>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: "none" }}
        onChange={event => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) onFiles(files);
          event.target.value = "";
        }}
      />
    </>
  );
};

const DownloadList = ({
  outputs,
}: {
  outputs: Array<{ name: string; blob: Blob; note?: string }>;
}) => (
  <div className="toolhub-result-group">
    <div className="toolhub-result">
      <Download size={15} />
      <div>
        <strong>ได้ไฟล์ {outputs.length} ไฟล์</strong>
        <small>{outputs.map(output => output.name).join(", ")}</small>
      </div>
      <button
        className="toolhub-result-redownload"
        onClick={() =>
          outputs.forEach((output, index) =>
            setTimeout(() => {
              const url = URL.createObjectURL(output.blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = output.name;
              document.body.appendChild(anchor);
              anchor.click();
              anchor.remove();
              URL.revokeObjectURL(url);
            }, index * 250)
          )
        }
      >
        ดาวน์โหลดทั้งหมด
      </button>
    </div>
  </div>
);

/* ---------- the modal ---------- */

export function InteractiveModal({
  tool,
  onClose,
}: {
  tool: InteractiveTool;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const body = useMemo(() => {
    switch (tool.kind) {
      case "color-converter":
        return <ColourConverter />;
      case "tw-shades":
        return <TailwindShades />;
      case "harmony":
        return <HarmonyTool />;
      case "contrast":
        return <ContrastTool />;
      case "colorblind":
        return <ColourBlindTool />;
      case "palette":
        return <PaletteTool />;
      case "social-crop":
        return <SocialCropTool />;
      case "matte":
        return <MatteTool />;
      case "scroll":
        return <CarouselTool />;
      case "favicon":
        return <FaviconTool />;
      case "img-convert":
        return <ImageConvertTool />;
      case "img-clip":
        return <TrimTool />;
      case "px-rem":
        return <PxRemTool />;
      case "line-height":
        return <LineHeightTool />;
      case "type-scale":
        return <TypeScaleTool />;
      case "word-counter":
        return <WordCounterTool />;
      case "paper-sizes":
        return <PaperSizesTool />;
      case "unit-convert":
        return <UnitTool />;
      case "base-convert":
        return <BaseTool />;
      case "time-convert":
        return <TimeTool />;
      case "encoder":
        return <EncoderTool />;
      case "meta-tag":
        return <MetaTagTool />;
      default:
        return null;
    }
  }, [tool.kind]);

  return (
    <div
      className="toolhub-modal-overlay"
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="toolhub-modal" role="dialog" aria-modal="true" aria-label={tool.titleTh}>
        <button className="toolhub-modal-close" onClick={onClose} aria-label="ปิดหน้าต่าง">
          <X size={17} />
        </button>
        <span className="eyebrow">
          <i className="eyebrow-dot" /> {tool.category.toUpperCase()}
        </span>
        <h2>{tool.titleTh}</h2>
        <p className="toolhub-modal-desc">{tool.descTh}</p>
        {body}
      </div>
    </div>
  );
}

/* ---------- Colour tools ---------- */

function ColourConverter() {
  const [value, setValue] = useState("#2050E0");
  const formats = colorFormats(value);
  return (
    <div className="toolhub-tool-body">
      <ColourInput value={value} onChange={setValue} />
      {formats ? (
        <>
          <div
            className="toolhub-big-swatch"
            style={{ background: formats.swatch }}
          />
          <CopyRow label="HEX" value={formats.hex} />
          <CopyRow label="RGB" value={formats.rgb} />
          <CopyRow label="HSL" value={formats.hsl} />
        </>
      ) : (
        <p className="toolhub-hint">รูปแบบสีไม่ถูกต้อง — ลอง #2050E0, rgb(32,80,224) หรือ hsl(224,85%,50%)</p>
      )}
    </div>
  );
}

function TailwindShades() {
  const [value, setValue] = useState("#2050E0");
  const shades = tailwindShades(value);
  const [copiedAll, setCopiedAll] = useState(false);
  return (
    <div className="toolhub-tool-body">
      <ColourInput value={value} onChange={setValue} />
      {shades ? (
        <>
          <Swatches colours={shades.map(s => ({ hex: s.hex, label: s.name }))} />
          <button
            className="admin-secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(
                shades.map(s => `${s.name}: ${s.hex}`).join("\n")
              );
              setCopiedAll(true);
              toast.success("คัดลอกทุกเฉดแล้ว");
              setTimeout(() => setCopiedAll(false), 1200);
            }}
          >
            {copiedAll ? <Check size={14} /> : <Copy size={14} />} คัดลอกทุกเฉด
          </button>
        </>
      ) : (
        <p className="toolhub-hint">รูปแบบสีไม่ถูกต้อง</p>
      )}
    </div>
  );
}

function HarmonyTool() {
  const [value, setValue] = useState("#2050E0");
  const [mode, setMode] = useState<HarmonyMode>("complementary");
  const palette = colorHarmony(value, mode);
  return (
    <div className="toolhub-tool-body">
      <ColourInput value={value} onChange={setValue} />
      <label className="toolhub-option-field">
        <span>แบบฮาร์มอนี</span>
        <select
          value={mode}
          onChange={event => setMode(event.target.value as HarmonyMode)}
        >
          <option value="complementary">สีคู่ตรงข้าม</option>
          <option value="analogous">สีข้างเคียง</option>
          <option value="triadic">สามเหลี่ยม</option>
          <option value="tetradic">สี่เหลี่ยม</option>
          <option value="split">แยกคู่ตรงข้าม</option>
        </select>
      </label>
      {palette && (
        <Swatches
          colours={palette.map(p => ({ hex: p.hex }))}
          onPick={hex => {
            navigator.clipboard
              .writeText(hex)
              .then(() => toast.success(`คัดลอก ${hex} แล้ว`));
          }}
        />
      )}
      <p className="toolhub-hint">กดสีเพื่อคัดลอกค่า HEX</p>
    </div>
  );
}

function ContrastTool() {
  const [fg, setFg] = useState("#1D2B50");
  const [bg, setBg] = useState("#F4F0E8");
  const result = contrastRatio(fg, bg);
  return (
    <div className="toolhub-tool-body">
      <div className="toolhub-option-grid">
        <label className="toolhub-option-field">
          <span>สีตัวอักษร</span>
          <ColourInput value={fg} onChange={setFg} />
        </label>
        <label className="toolhub-option-field">
          <span>สีพื้นหลัง</span>
          <ColourInput value={bg} onChange={setBg} />
        </label>
      </div>
      {result ? (
        <>
          <div
            className="toolhub-contrast-preview"
            style={{ background: bg, color: fg }}
          >
            ตัวอักษรตัวอย่าง — The quick brown fox ก-๙
          </div>
          <div className="toolhub-metric-grid">
            <div className="toolhub-metric">
              <strong>{result.text}</strong>
              <span>อัตราส่วน</span>
            </div>
            <div className={`toolhub-metric ${result.aaa ? "pass" : "fail"}`}>
              <strong>{result.aaa ? "ผ่าน" : "ไม่ผ่าน"}</strong>
              <span>AAA (7:1)</span>
            </div>
            <div className={`toolhub-metric ${result.aa ? "pass" : "fail"}`}>
              <strong>{result.aa ? "ผ่าน" : "ไม่ผ่าน"}</strong>
              <span>AA (4.5:1)</span>
            </div>
            <div className={`toolhub-metric ${result.aaLarge ? "pass" : "fail"}`}>
              <strong>{result.aaLarge ? "ผ่าน" : "ไม่ผ่าน"}</strong>
              <span>AA ตัวใหญ่ (3:1)</span>
            </div>
          </div>
        </>
      ) : (
        <p className="toolhub-hint">รูปแบบสีไม่ถูกต้อง</p>
      )}
    </div>
  );
}

function ColourBlindTool() {
  const [value, setValue] = useState("#E14B3B");
  const sims = (["protanopia", "deuteranopia", "tritanopia"] as const).map(kind => ({
    kind,
    hex: simulateColorBlind(value, kind) ?? value,
  }));
  return (
    <div className="toolhub-tool-body">
      <ColourInput value={value} onChange={setValue} />
      <div className="toolhub-cb-grid">
        <div>
          <div className="toolhub-cb-swatch" style={{ background: value }} />
          <span>ปกติ</span>
        </div>
        {sims.map(sim => (
          <div key={sim.kind}>
            <div className="toolhub-cb-swatch" style={{ background: sim.hex }} />
            <span>
              {sim.kind === "protanopia"
                ? "ตาบอดแดง"
                : sim.kind === "deuteranopia"
                  ? "ตาบอดเขียว"
                  : "ตาบอดน้ำเงิน"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaletteTool() {
  const [palette, setPalette] = useState<Array<{ hex: string; share: number }> | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="toolhub-tool-body">
      <FilePickButton
        accept="image/*"
        busy={busy}
        onFiles={async files => {
          setBusy(true);
          try {
            setPalette(await extractPalette(files[0], 6));
          } catch {
            toast.error("อ่านรูปไม่สำเร็จ");
          } finally {
            setBusy(false);
          }
        }}
      >
        เลือกรูปเพื่อสกัดสี
      </FilePickButton>
      {palette && (
        <>
          <Swatches
            colours={palette.map(p => ({ hex: p.hex }))}
            onPick={hex =>
              navigator.clipboard
                .writeText(hex)
                .then(() => toast.success(`คัดลอก ${hex} แล้ว`))
            }
          />
          <ul className="toolhub-palette-list">
            {palette.map(p => (
              <li key={p.hex}>
                <span className="toolhub-palette-dot" style={{ background: p.hex }} />
                <b>{p.hex}</b>
                <small>{Math.round(p.share * 100)}%</small>
              </li>
            ))}
          </ul>
          <p className="toolhub-hint">กดสีเพื่อคัดลอกค่า HEX</p>
        </>
      )}
    </div>
  );
}

/* ---------- Image tools ---------- */

const RATIO_OPTIONS = [
  { label: "1:1 จัตุรัส (โพสต์ IG)", w: 1, h: 1 },
  { label: "4:5 แนวตั้ง (IG feed)", w: 4, h: 5 },
  { label: "9:16 Story/Reels", w: 9, h: 16 },
  { label: "16:9 แนวนอน", w: 16, h: 9 },
];

function SocialCropTool() {
  const [ratio, setRatio] = useState(RATIO_OPTIONS[1]);
  const [position, setPosition] = useState<CropPosition>("center");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <div className="toolhub-tool-body">
      <div className="toolhub-option-grid">
        <label className="toolhub-option-field">
          <span>สัดส่วน</span>
          <select
            value={ratio.label}
            onChange={event =>
              setRatio(RATIO_OPTIONS.find(r => r.label === event.target.value)!)
            }
          >
            {RATIO_OPTIONS.map(option => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="toolhub-option-field">
          <span>จุดตัด (เมื่อภาพกว้าง/สูงเกิน)</span>
          <select
            value={position}
            onChange={event => setPosition(event.target.value as CropPosition)}
          >
            <option value="center">กึ่งกลาง</option>
            <option value="top">บน</option>
            <option value="bottom">ล่าง</option>
            <option value="left">ซ้าย</option>
            <option value="right">ขวา</option>
          </select>
        </label>
      </div>
      <div className="toolhub-file-actions">
        <FilePickButton
          accept="image/*"
          busy={busy}
          onFiles={picked => {
            setFile(picked[0]);
            setPreview(null);
          }}
        >
          {file ? `เปลี่ยนรูป: ${file.name.slice(0, 22)}…` : "เลือกรูปภาพ"}
        </FilePickButton>
        <button
          className="admin-primary"
          disabled={!file || busy}
          onClick={async () => {
            if (!file) return;
            setBusy(true);
            try {
              const blob = await cropToRatio(file, ratio.w, ratio.h, position);
              setPreview(URL.createObjectURL(blob));
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = `cropped-${ratio.w}x${ratio.h}.png`;
              document.body.appendChild(anchor);
              anchor.click();
              anchor.remove();
              URL.revokeObjectURL(url);
              toast.success("ครอปเสร็จ — ดาวน์โหลดอัตโนมัติ");
            } catch {
              toast.error("ครอปไม่สำเร็จ");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : null} ครอปและดาวน์โหลด
        </button>
      </div>
      {preview && (
        <img className="toolhub-image-preview" src={preview} alt="ตัวอย่างหลังครอป" />
      )}
    </div>
  );
}

function MatteTool() {
  const [mode, setMode] = useState<"blur" | "solid" | "gradient">("blur");
  const [colour, setColour] = useState("#F4F0E8");
  const [ratio, setRatio] = useState(RATIO_OPTIONS[0]);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <div className="toolhub-tool-body">
      <div className="toolhub-option-grid">
        <label className="toolhub-option-field">
          <span>สัดส่วนพื้น</span>
          <select
            value={ratio.label}
            onChange={event =>
              setRatio(RATIO_OPTIONS.find(r => r.label === event.target.value)!)
            }
          >
            {RATIO_OPTIONS.map(option => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="toolhub-option-field">
          <span>สไตล์พื้น</span>
          <select
            value={mode}
            onChange={event => setMode(event.target.value as "blur" | "solid" | "gradient")}
          >
            <option value="blur">เบลอจากรูป</option>
            <option value="solid">สีทึบ</option>
            <option value="gradient">ไล่เฉดจากสีรูป</option>
          </select>
        </label>
        {mode === "solid" && (
          <label className="toolhub-option-field">
            <span>สีพื้น</span>
            <ColourInput value={colour} onChange={setColour} />
          </label>
        )}
      </div>
      <div className="toolhub-file-actions">
        <FilePickButton
          accept="image/*"
          busy={busy}
          onFiles={picked => {
            setFile(picked[0]);
            setPreview(null);
          }}
        >
          {file ? `เปลี่ยนรูป: ${file.name.slice(0, 22)}…` : "เลือกรูปภาพ"}
        </FilePickButton>
        <button
          className="admin-primary"
          disabled={!file || busy}
          onClick={async () => {
            if (!file) return;
            setBusy(true);
            try {
              const blob = await makeMatte(file, ratio.w, ratio.h, mode, colour);
              setPreview(URL.createObjectURL(blob));
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = "matted.png";
              document.body.appendChild(anchor);
              anchor.click();
              anchor.remove();
              URL.revokeObjectURL(url);
              toast.success("ทำพื้นหลังเสร็จ — ดาวน์โหลดอัตโนมัติ");
            } catch {
              toast.error("ทำพื้นหลังไม่สำเร็จ");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : null} สร้างและดาวน์โหลด
        </button>
      </div>
      {preview && (
        <img className="toolhub-image-preview" src={preview} alt="ตัวอย่างพื้นหลัง" />
      )}
    </div>
  );
}

function CarouselTool() {
  const [fill, setFill] = useState<"blur" | "solid">("blur");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [tiles, setTiles] = useState<string[] | null>(null);
  return (
    <div className="toolhub-tool-body">
      <div className="toolhub-option-grid">
        <label className="toolhub-option-field">
          <span>พื้นเติมส่วนเกิน</span>
          <select
            value={fill}
            onChange={event => setFill(event.target.value as "blur" | "solid")}
          >
            <option value="blur">เบลอ</option>
            <option value="solid">สีทึบ (คงสีเดิมของภาพ)</option>
          </select>
        </label>
      </div>
      <div className="toolhub-file-actions">
        <FilePickButton
          accept="image/*"
          busy={busy}
          onFiles={picked => {
            setFile(picked[0]);
            setTiles(null);
          }}
        >
          {file ? `เปลี่ยนรูป: ${file.name.slice(0, 22)}…` : "เลือกรูปภาพแนวยาว"}
        </FilePickButton>
        <button
          className="admin-primary"
          disabled={!file || busy}
          onClick={async () => {
            if (!file) return;
            setBusy(true);
            try {
              const blobs = await splitCarousel(file, 4, 5, fill);
              setTiles(blobs.map(blob => URL.createObjectURL(blob)));
              blobs.forEach((blob, index) =>
                setTimeout(() => {
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = `carousel-${index + 1}.png`;
                  document.body.appendChild(anchor);
                  anchor.click();
                  anchor.remove();
                  URL.revokeObjectURL(url);
                }, index * 250)
              );
              toast.success(`แตะได้ ${blobs.length} ไทล์ — ดาวน์โหลดอัตโนมัติ`);
            } catch {
              toast.error("แตะรูปไม่สำเร็จ");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : null} แตะเป็นคารูเซล 4:5
        </button>
      </div>
      {tiles && (
        <div className="toolhub-tile-row">
          {tiles.map((src, index) => (
            <img key={src} src={src} alt={`ไทล์ ${index + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function FaviconTool() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [previews, setPreviews] = useState<string[] | null>(null);
  return (
    <div className="toolhub-tool-body">
      <div className="toolhub-file-actions">
        <FilePickButton
          accept="image/*"
          busy={busy}
          onFiles={picked => {
            setFile(picked[0]);
            setPreviews(null);
          }}
        >
          {file ? `เปลี่ยนรูป: ${file.name.slice(0, 22)}…` : "เลือกโลโก้ (แนะนำจัตุรัส)"}
        </FilePickButton>
        <button
          className="admin-primary"
          disabled={!file || busy}
          onClick={async () => {
            if (!file) return;
            setBusy(true);
            try {
              const outputs = await generateFavicons(file);
              setPreviews(outputs.map(o => URL.createObjectURL(o.blob)));
              outputs.forEach((output, index) =>
                setTimeout(() => {
                  const url = URL.createObjectURL(output.blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = output.name;
                  document.body.appendChild(anchor);
                  anchor.click();
                  anchor.remove();
                  URL.revokeObjectURL(url);
                }, index * 250)
              );
              toast.success(`สร้าง favicon ${outputs.length} ขนาด — ดาวน์โหลดอัตโนมัติ`);
            } catch {
              toast.error("สร้าง favicon ไม่สำเร็จ");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : null} สร้างชุด favicon
        </button>
      </div>
      {previews && (
        <div className="toolhub-tile-row">
          {previews.map((src, index) => (
            <img key={src} src={src} alt={`ขนาด ${index}`} className="toolhub-favicon-preview" />
          ))}
        </div>
      )}
    </div>
  );
}

function ImageConvertTool() {
  const [format, setFormat] = useState<ImageFormat>("image/webp");
  const [quality, setQuality] = useState(0.9);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<{ size: number; originalSize: number } | null>(null);
  return (
    <div className="toolhub-tool-body">
      <div className="toolhub-option-grid">
        <label className="toolhub-option-field">
          <span>แปลงเป็น</span>
          <select
            value={format}
            onChange={event => setFormat(event.target.value as ImageFormat)}
          >
            <option value="image/webp">WebP (เล็กสุด)</option>
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
          </select>
        </label>
        {format !== "image/png" && (
          <label className="toolhub-option-field">
            <span>คุณภาพ {(quality * 100).toFixed(0)}%</span>
            <input
              type="range"
              min="0.4"
              max="1"
              step="0.02"
              value={quality}
              onChange={event => setQuality(Number(event.target.value))}
            />
          </label>
        )}
      </div>
      <div className="toolhub-file-actions">
        <FilePickButton
          accept="image/*"
          busy={busy}
          onFiles={picked => {
            setFile(picked[0]);
            setOutcome(null);
          }}
        >
          {file ? `เปลี่ยนรูป: ${file.name.slice(0, 22)}…` : "เลือกรูปภาพ"}
        </FilePickButton>
        <button
          className="admin-primary"
          disabled={!file || busy}
          onClick={async () => {
            if (!file) return;
            setBusy(true);
            try {
              const result = await convertImage(file, format, quality);
              setOutcome(result);
              const ext = format === "image/webp" ? "webp" : format === "image/jpeg" ? "jpg" : "png";
              const url = URL.createObjectURL(result.blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = file.name.replace(/\.[^.]+$/, "") + "." + ext;
              document.body.appendChild(anchor);
              anchor.click();
              anchor.remove();
              URL.revokeObjectURL(url);
              toast.success("แปลงรูปเสร็จ — ดาวน์โหลดอัตโนมัติ");
            } catch {
              toast.error("แปลงรูปไม่สำเร็จ");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : null} แปลงและดาวน์โหลด
        </button>
      </div>
      {outcome && (
        <p className="toolhub-hint">
          {formatSize(outcome.originalSize)} → {formatSize(outcome.size)}{" "}
          ({outcome.size <= outcome.originalSize ? "เล็กลง" : "ใหญ่ขึ้น"}{" "}
          {Math.abs(Math.round((1 - outcome.size / outcome.originalSize) * 100))}%)
        </p>
      )}
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function TrimTool() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<[number, number, number, number] | null>(null);
  return (
    <div className="toolhub-tool-body">
      <div className="toolhub-file-actions">
        <FilePickButton
          accept="image/png,image/webp"
          busy={busy}
          onFiles={picked => {
            setFile(picked[0]);
            setInfo(null);
          }}
        >
          {file ? `เปลี่ยนรูป: ${file.name.slice(0, 22)}…` : "เลือก PNG/WebP โปร่งใส"}
        </FilePickButton>
        <button
          className="admin-primary"
          disabled={!file || busy}
          onClick={async () => {
            if (!file) return;
            setBusy(true);
            try {
              const result = await trimTransparent(file);
              setInfo(result.trimmed);
              const url = URL.createObjectURL(result.blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = "trimmed.png";
              document.body.appendChild(anchor);
              anchor.click();
              anchor.remove();
              URL.revokeObjectURL(url);
              toast.success("ตัดขอบโปร่งใสเสร็จ — ดาวน์โหลดอัตโนมัติ");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "ตัดขอบไม่สำเร็จ");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : null} ตัดขอบและดาวน์โหลด
        </button>
      </div>
      {info && (
        <p className="toolhub-hint">
          ตัดออก ซ้าย {info[0]}px · บน {info[1]}px · ขวา {info[2]}px · ล่าง {info[3]}px
        </p>
      )}
    </div>
  );
}

/* ---------- Typography tools ---------- */

function PxRemTool() {
  const [root, setRoot] = useState(16);
  const [value, setValue] = useState(24);
  const rem = pxRem(value, root, "px2rem");
  return (
    <div className="toolhub-tool-body">
      <div className="toolhub-option-grid">
        <label className="toolhub-option-field">
          <span>Root font-size (px)</span>
          <input
            type="number"
            min={8}
            max={32}
            value={root}
            onChange={event => setRoot(Number(event.target.value) || 16)}
          />
        </label>
        <label className="toolhub-option-field">
          <span>ค่าที่ต้องการแปลง</span>
          <input
            type="number"
            min={0}
            value={value}
            onChange={event => setValue(Number(event.target.value) || 0)}
          />
        </label>
      </div>
      <CopyRow label={`${value}px`} value={`${rem}rem`} />
      <CopyRow label={`${rem}rem`} value={`${pxRem(rem, root, "rem2px")}px`} />
    </div>
  );
}

function LineHeightTool() {
  const [fontSize, setFontSize] = useState(16);
  const [ratio, setRatio] = useState(1.6);
  const result = lineHeightCalc(fontSize, ratio);
  return (
    <div className="toolhub-tool-body">
      <div className="toolhub-option-grid">
        <label className="toolhub-option-field">
          <span>ขนาดฟอนต์ (px)</span>
          <input
            type="number"
            min={6}
            value={fontSize}
            onChange={event => setFontSize(Number(event.target.value) || 0)}
          />
        </label>
        <label className="toolhub-option-field">
          <span>Line-height (ตัวคูณ)</span>
          <input
            type="number"
            min={0.8}
            max={3}
            step={0.05}
            value={ratio}
            onChange={event => setRatio(Number(event.target.value) || 1)}
          />
        </label>
      </div>
      <CopyRow label="ระยะบรรทัดจริง" value={`${result.px}px`} />
      <p className="toolhub-hint">{result.suggestion}</p>
    </div>
  );
}

function TypeScaleTool() {
  const [base, setBase] = useState(16);
  const [ratioIndex, setRatioIndex] = useState(3);
  const ratio = TYPE_RATIO_OPTIONS[ratioIndex][1];
  const scale = typeScale(base, ratio);
  return (
    <div className="toolhub-tool-body">
      <div className="toolhub-option-grid">
        <label className="toolhub-option-field">
          <span>ขนาดฐาน (px)</span>
          <input
            type="number"
            min={8}
            max={32}
            value={base}
            onChange={event => setBase(Number(event.target.value) || 16)}
          />
        </label>
        <label className="toolhub-option-field">
          <span>อัตราส่วน</span>
          <select
            value={String(ratioIndex)}
            onChange={event => setRatioIndex(Number(event.target.value))}
          >
            {TYPE_RATIO_OPTIONS.map(([label], index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="toolhub-scale-list">
        {scale.map(step => (
          <button
            key={step.step}
            className="toolhub-scale-row"
            style={{ fontSize: Math.min(step.px, 44) }}
            onClick={async () => {
              await navigator.clipboard.writeText(`${step.step}: ${step.px}px`);
              toast.success(`คัดลอก ${step.step} แล้ว`);
            }}
          >
            <b>{step.step}</b>
            <span>{step.px}px</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function WordCounterTool() {
  const [text, setText] = useState("");
  const stats = countText(text);
  return (
    <div className="toolhub-tool-body">
      <textarea
        className="toolhub-textarea"
        rows={7}
        value={text}
        onChange={event => setText(event.target.value)}
        placeholder="วางข้อความที่นี่ — ภาษาไทยหรือภาษาอื่นก็ได้"
      />
      <div className="toolhub-metric-grid">
        <div className="toolhub-metric pass">
          <strong>{stats.words.toLocaleString()}</strong>
          <span>คำ</span>
        </div>
        <div className="toolhub-metric pass">
          <strong>{stats.characters.toLocaleString()}</strong>
          <span>ตัวอักษร</span>
        </div>
        <div className="toolhub-metric pass">
          <strong>{stats.charactersNoSpaces.toLocaleString()}</strong>
          <span>ไม่นับช่องว่าง</span>
        </div>
        <div className="toolhub-metric pass">
          <strong>{stats.sentences}</strong>
          <span>ประโยค</span>
        </div>
        <div className="toolhub-metric pass">
          <strong>{stats.readingTime}</strong>
          <span>เวลาอ่าน</span>
        </div>
      </div>
    </div>
  );
}

function PaperSizesTool() {
  return (
    <div className="toolhub-tool-body">
      <table className="toolhub-table">
        <thead>
          <tr>
            <th>ขนาด</th>
            <th>กว้าง (มม.)</th>
            <th>ยาว (มม.)</th>
          </tr>
        </thead>
        <tbody>
          {paperSizes().map(size => (
            <tr key={size.name}>
              <td>
                <b>{size.name}</b>
              </td>
              <td>{size.w}</td>
              <td>{size.h}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Calculator tools ---------- */

function UnitTool() {
  const [category, setCategory] = useState<keyof typeof UNIT_CATEGORIES>("length");
  const [tempMode, setTempMode] = useState(false);
  const units = UNIT_CATEGORIES[category].units;
  const [from, setFrom] = useState(units[0]);
  const [to, setTo] = useState(units[1] ?? units[0]);
  const [value, setValue] = useState(1);
  const [tempFrom, setTempFrom] = useState<"c" | "f" | "k">("c");
  const [tempTo, setTempTo] = useState<"c" | "f" | "k">("f");
  const result = tempMode
    ? convertTemperature(value, tempFrom, tempTo)
    : convertUnit(value, from, to, category as "length" | "mass" | "data");
  return (
    <div className="toolhub-tool-body">
      <div className="toolhub-option-grid">
        <label className="toolhub-option-field">
          <span>ประเภท</span>
          <select
            value={tempMode ? "temp" : category}
            onChange={event => {
              const next = event.target.value;
              if (next === "temp") setTempMode(true);
              else {
                setTempMode(false);
                setCategory(next as keyof typeof UNIT_CATEGORIES);
                const nextUnits = UNIT_CATEGORIES[next as keyof typeof UNIT_CATEGORIES].units;
                setFrom(nextUnits[0]);
                setTo(nextUnits[1] ?? nextUnits[0]);
              }
            }}
          >
            {Object.entries(UNIT_CATEGORIES).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
            <option value="temp">อุณหภูมิ</option>
          </select>
        </label>
        <label className="toolhub-option-field">
          <span>ค่า</span>
          <input
            type="number"
            value={value}
            onChange={event => setValue(Number(event.target.value))}
          />
        </label>
      </div>
      {tempMode ? (
        <div className="toolhub-option-grid">
          <label className="toolhub-option-field">
            <span>จาก</span>
            <select value={tempFrom} onChange={event => setTempFrom(event.target.value as "c" | "f" | "k")}>
              <option value="c">°C</option>
              <option value="f">°F</option>
              <option value="k">K</option>
            </select>
          </label>
          <label className="toolhub-option-field">
            <span>เป็น</span>
            <select value={tempTo} onChange={event => setTempTo(event.target.value as "c" | "f" | "k")}>
              <option value="c">°C</option>
              <option value="f">°F</option>
              <option value="k">K</option>
            </select>
          </label>
        </div>
      ) : (
        <div className="toolhub-option-grid">
          <label className="toolhub-option-field">
            <span>จากหน่วย</span>
            <select value={from} onChange={event => setFrom(event.target.value)}>
              {units.map(unit => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
          <label className="toolhub-option-field">
            <span>เป็นหน่วย</span>
            <select value={to} onChange={event => setTo(event.target.value)}>
              {units.map(unit => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {result !== null && !Number.isNaN(result) && (
        <CopyRow
          label="ผลลัพธ์"
          value={`${Number(result.toPrecision(8)).toLocaleString()} ${
            tempMode ? { c: "°C", f: "°F", k: "K" }[tempTo] : to
          }`}
        />
      )}
    </div>
  );
}

function BaseTool() {
  const [value, setValue] = useState("255");
  const [from, setFrom] = useState<2 | 8 | 10 | 16>(10);
  const result = convertBase(value, from);
  return (
    <div className="toolhub-tool-body">
      <div className="toolhub-option-grid">
        <label className="toolhub-option-field">
          <span>ฐานต้นทาง</span>
          <select
            value={from}
            onChange={event => setFrom(Number(event.target.value) as 2 | 8 | 10 | 16)}
          >
            <option value={2}>ฐาน 2 (ไบนารี)</option>
            <option value={8}>ฐาน 8</option>
            <option value={10}>ฐาน 10</option>
            <option value={16}>ฐาน 16 (HEX)</option>
          </select>
        </label>
        <label className="toolhub-option-field">
          <span>ค่า</span>
          <input value={value} onChange={event => setValue(event.target.value)} />
        </label>
      </div>
      {result ? (
        <>
          <CopyRow label="ฐาน 10" value={result.dec} />
          <CopyRow label="ฐาน 16" value={result.hex} />
          <CopyRow label="ฐาน 2" value={result.bin} />
          <CopyRow label="ฐาน 8" value={result.oct} />
        </>
      ) : (
        <p className="toolhub-hint">ค่าไม่ตรงกับฐานที่เลือก</p>
      )}
    </div>
  );
}

function TimeTool() {
  const units: Array<[string, string]> = [
    ["s", "วินาที"],
    ["min", "นาที"],
    ["h", "ชั่วโมง"],
    ["d", "วัน"],
    ["wk", "สัปดาห์"],
    ["mo", "เดือน"],
    ["yr", "ปี"],
  ];
  const [value, setValue] = useState(1);
  const [from, setFrom] = useState("d");
  const [to, setTo] = useState("h");
  const result = convertTime(value, from, to);
  return (
    <div className="toolhub-tool-body">
      <div className="toolhub-option-grid">
        <label className="toolhub-option-field">
          <span>ค่า</span>
          <input
            type="number"
            value={value}
            onChange={event => setValue(Number(event.target.value))}
          />
        </label>
        <label className="toolhub-option-field">
          <span>จาก</span>
          <select value={from} onChange={event => setFrom(event.target.value)}>
            {units.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="toolhub-option-field">
          <span>เป็น</span>
          <select value={to} onChange={event => setTo(event.target.value)}>
            {units.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {result !== null && (
        <CopyRow
          label="ผลลัพธ์"
          value={`${Number(result.toPrecision(8)).toLocaleString()} ${units.find(u => u[0] === to)?.[1]}`}
        />
      )}
    </div>
  );
}

function EncoderTool() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"b64enc" | "b64dec" | "urlenc" | "urldec">("b64enc");
  const output = text ? encodeText(text, mode) : null;
  return (
    <div className="toolhub-tool-body">
      <label className="toolhub-option-field">
        <span>ข้อความ</span>
        <textarea
          className="toolhub-textarea"
          rows={3}
          value={text}
          onChange={event => setText(event.target.value)}
          placeholder="พิมพ์หรือวางข้อความ (ภาษาไทยได้)"
        />
      </label>
      <div className="toolhub-option-grid">
        <label className="toolhub-option-field">
          <span>การแปลง</span>
          <select
            value={mode}
            onChange={event => setMode(event.target.value as typeof mode)}
          >
            <option value="b64enc">Base64 เข้ารหัส</option>
            <option value="b64dec">Base64 ถอดรหัส</option>
            <option value="urlenc">URL Encode</option>
            <option value="urldec">URL Decode</option>
          </select>
        </label>
      </div>
      {output !== null ? (
        <CopyRow label="ผลลัพธ์" value={output || "(ว่าง)"} />
      ) : (
        text && <p className="toolhub-hint">ถอดรหัสไม่สำเร็จ — รูปแบบไม่ถูกต้อง</p>
      )}
    </div>
  );
}

function MetaTagTool() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    image: "",
    siteName: "",
  });
  const output = useMemo(() => metaTagGenny(form), [form]);
  const field = (key: keyof typeof form, label: string, placeholder: string) => (
    <label className="toolhub-option-field">
      <span>{label}</span>
      <input
        value={form[key]}
        placeholder={placeholder}
        onChange={event => setForm(current => ({ ...current, [key]: event.target.value }))}
      />
    </label>
  );
  return (
    <div className="toolhub-tool-body">
      <div className="toolhub-option-grid">
        {field("title", "ชื่อหน้า", "ชื่อเว็บ/หน้าของคุณ")}
        {field("siteName", "ชื่อเว็บไซต์", "Sam Mok Coding")}
      </div>
      <label className="toolhub-option-field">
        <span>คำอธิบาย</span>
        <textarea
          className="toolhub-textarea"
          rows={2}
          value={form.description}
          placeholder="คำอธิบายสั้น ๆ ที่จะโชว์ตอนแชร์ลงโซเชียล"
          onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
        />
      </label>
      <div className="toolhub-option-grid">
        {field("url", "URL หน้า", "https://example.com/page")}
        {field("image", "URL รูปแชร์", "https://example.com/og.png")}
      </div>
      {form.title && (
        <>
          <pre className="toolhub-code-output">{output}</pre>
          <button
            className="admin-secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(output);
              toast.success("คัดลอก meta tags แล้ว");
            }}
          >
            <Copy size={14} /> คัดลอกทั้งหมด
          </button>
        </>
      )}
    </div>
  );
}

/* ---------- end of file ---------- */
