# Design System: Sam Mok Coding (เมืองสามหมอกเดฟ)
**Project Identity:** `coding-mueang-sam-mok` / `sam-mok-codeing`
**System:** Editorial Ivory / Mountain Mist — ระบบเดียว ทุกหน้า

---

## 1. Visual Theme & Atmosphere

* **Atmosphere:** **"Editorial Ivory — Mountain Mist"** กระดาษงาช้างสไตล์นิตยสารผสมความเป็นสตูดิโอบนดอยแม่ฮ่องสอน
* **Mood & Vibe:** อบอุ่น เป็นระเบียบ มีฝีมือคน ตัดกันชัดด้วยหมึกน้ำเงินเข้มและปุ่ม cobalt — ต่างจาก dev studio ทั่วไปที่เป็น dark neon
* **Aesthetic Philosophy:** กระดาษ ivory เป็นพื้น หมึกน้ำเงินเป็นเนื้อหา cobalt เป็นการกระทำ coral เป็นจุดเน้น และเส้นวาดลวดลายสันเขา (mountain contour) เป็นลายเซ็นของแบรนด์ Mascot "เมืองสามหมอกเดฟ" (chibi เสื้อดำ แว่นดำ หูฟังน้ำเงิน) เป็นพระเอกบนพื้นครีม

## 2. Color Palette & Roles

| Token / Role | Natural Language Name | Hex / RGBA | Functional Role |
| :--- | :--- | :--- | :--- |
| **Canvas** | *Ivory Paper* | `#f4f0e8` | พื้นหลักทุกหน้า, `--background` |
| **Raised Surface** | *Warm Card* | `#fbf8f2` | การ์ด, popover, sidebar (`--card`) |
| **Primary Text / Ink** | *Deep Ink Blue* | `#1d2b50` | หัวเรื่อง และเนื้อความหลัก (`--foreground`) |
| **Secondary Text** | *Ink Muted* | `#5c6b8a` | คำอธิบาย, label รอง (`--muted-foreground`) |
| **Primary Action** | *Cobalt* | `#2050e0` (hover deep `#1438a8`) | ปุ่ม CTA, ลิงก์ active, focus ring (`--primary`) |
| **Punctuation** | *Coral* | `#ff6a4d` | eyebrow dot, ขีดเน้นใต้คำ, ตัวเลขขั้นตอน — ใช้เป็น *จุด* เท่านั้น ไม่ใช่พื้นปุ่ม |
| **Data / Calm** | *Mist Blue* | `#e7ecf5` | พื้น input, แถบ soft, ไอคอน (teal `#0f7f8b` สำหรับข้อมูล/สถานะกำลังดำเนิน) |
| **Warning** | *Dusky Amber* | `#b97a12` | สถานะ "รอตรวจ" |
| **Danger** | *Brick Red* | `#d03d2e` | ลบ, ยกเลิก, ปฏิเสธ (`--destructive`) |
| **Success** | *Forest* | `#1a7f4e` | เสร็จสมบูรณ์, LIVE indicator |
| **Border** | *Ink Line* | `rgba(29,43,80,0.14)` | เส้นขอบการ์ด ตาราง input |

**Status → color mapping (บังคับใช้ทั้งระบบ):** new/idea/draft = เทา, contacted/sent/requested = cobalt, qualified/active/confirmed = teal, completed/accepted = เขียว, review = amber, declined/cancelled = แดง, closed/archived = muted

## 3. Typography Rules

* **Display (ไทยเท่านั้น):** `"Chonburi"` — หัวเรื่อง hero, ชื่อหน้า, ตัวเลข KPI ใน stat card
  * **ห้ามใส่ letter-spacing ติดลบ** (ตัดสระบน-ล่างไทย) และใช้ `line-height ≥ 1.16` เสมอ
* **Body & UI:** `"IBM Plex Sans Thai"` — 400 เนื้อความ, 500 ปุ่ม/label, 600–700 หัวข้อรอง
* **Mono / Telemetry:** `"IBM Plex Mono"` — eyebrow, tag, timestamp, เลขขั้นตอน `01–06`, letter-spacing `0.12–0.18em` (ใช้กับข้อความละตินเท่านั้น)

## 4. Signature Element

**เส้นสันเขา (`.contour-line`)** — SVG polyline ทำซ้ำแนวนอน ปรากฏใต้ hero ของหน้าเว็บหลักและบนการ์ด 404 เป็นเส้นเดียวที่บอก "เขียนโค้ดบนดอย" ห้ามใช้ซ้ำหลายจุดในหน้าเดียว

## 5. Component Stylings

* **ปุ่มหลัก (`.button-cobalt` / `.code-primary-button` / `.admin-primary`):** พื้น gradient cobalt แนวตั้ง `#2c5cf0 → #2050e0` + border `#1438a8` + inset highlight บน 1px + เงาสีน้ำเงิน, hover `translateY(-1px)`
* **ปุ่มหมึก (`.button-ink` / `.auth-google`):** พื้นทึบ `#1d2b50` ตัวครีม — ใช้กับการกระทำหนักหน่วง (เข้าสู่ระบบ, สร้างใหม่)
* **ปุ่มเงียบ (`.ghost-button` / `.code-secondary-button` / `.admin-secondary`):** พื้นโปร่งขาวบนครีม + border — การกระทำรอง
* **การ์ด:** พื้น `#fbf8f2` radius `1.15rem` border ink-line เงานุ่มสองชั้น, hover ยก -2 ถึง -4px
* **Input:** พื้นขาว border ink 20%, focus = border cobalt + ring `0 0 0 3px rgba(32,80,224,0.16)`
* **Status pill (`.status-pill.*`):** พื้นสีอ่อนของสถานะ + border เข้ม + ตัวอักษรโทนเดียวกัน, `select.status-select` ใช้แผนเดียวกัน
* **Topbar สาธารณะ:** sticky, พื้นครีมโปร่ง `rgba(244,240,232,0.86)` + blur 16px

## 6. Layout Principles

* **Container:** `min(1180px, calc(100% - 3rem))` กึ่งกลางทุกหน้า (`@utility container`)
* **Hero:** 2 คอลัมน์ — ซ้ายคัดลอก+สถิติ+CTA / ขวาเวที mascot (halo + gridlines + floating badge) โหลดครั้งแรกมี rise animation ไล่ delay 70ms
* **Section spacing:** `4.8rem` desktop / ยุบเป็นคอลัมน์เดียวที่ ≤900px
* **Admin:** shell `min(1180px)` + sidebar ยืดหดได้ (200–480px, จำค่าใน localStorage) + contextbar จางบนเนื้อหา
* **Flow:** 3 คอลัมน์ `220px | canvas | 300px` canvas มีจุด dot-grid + node เรียงแนวตั้งมี connector

## 7. UX Rules (บังคับ)

1. ทุกสถานะใน UI ต้องเป็น **ภาษาไทย** (draft=ร่าง, sent=ส่งแล้ว, confirmed=นัดแล้ว ฯลฯ) — แหล่งเดียว: `STATUS_LABELS` ใน AdminDashboard
2. การกระทำที่มีผลถาวร (ลดสิทธิ์ Admin) ต้องผ่าน **AlertDialog** — ห้าม `window.confirm`
3. ปุ่มที่ทำไม่ได้ต้อง `disabled` พร้อม `title` อธิบายเหตุผล (เช่น ลดสิทธิ์ตัวเอง)
4. Empty state ต้องบอกทั้ง "ตอนนี้ว่าง" และ "อะไรจะมาแสดงที่นี่"
5. ไฮไลต์เมนู sidebar ต้องตรง tab ปัจจุบัน (ใช้ match predicate ต่อรายการ)
6. ทุกปุ่มต้องมี `:focus-visible` ring ชัด (cobalt, offset 2px) — WCAG AA

## 8. UI Audit — สิ่งที่แก้ไปแล้วในรอบนี้ (2026-08)

* **ลบระบบดีไซน์ซ้อน 4 ชั้น** ใน `index.css` (2,925 บรรทัด → token เดียว) — จุดตาย: utility ชุด ivory ของ Flow (`text-ink/60`, `bg-paper`, `button-cobalt`) เคยไม่มีนิยามเลยใน Tailwind v4
* **`--primary` ตรงกับธีมจริง** (เดิมเป็น cobalt แต่ shadcn vars ไม่ครบชุด → ตอนนี้ครบทุกตัว รวม sidebar/chart/radius)
* **Hero ใหม่:** copy เป็นข้อเสนอค่าจริง (14 วัน / 6 ขั้น / 100% คุยกับคนทำจริง) แทน eyebrow เฉย ๆ + เวที mascot มี halo/gridlines/badge ลอย
* **letter-spacing ติดลบบน Chonburi ถูกลบทั้งหมด** (SystemFlow หัวเรื่อง + brand lockup)
* **Sidebar admin ไฮไลต์ถูก tab** (เดิมคลิก "โปรเจกต์" แล้ว "ภาพรวม" ยังติดสว่าง)
* **Status quote/นัดหมายเป็นไทยทั้งหมด** + AdminInsights เลิกใช้ pill `qualified` กับกิจกรรม login
* **window.confirm → AlertDialog** ในหน้าตั้งค่าสิทธิ์
* **theme-color ตรงระบบ** (`#f4f0e8`) และโหลดฟอนต์ Chonburi แล้ว
