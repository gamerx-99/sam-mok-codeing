import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  Cloud,
  Code2,
  Database,
  Globe2,
  LogIn,
  Menu,
  MessageCircle,
  Mountain,
  Settings2,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";

type Service = {
  icon: typeof Globe2;
  tone: "blue" | "cyan" | "gold" | "navy";
  title: string;
  body: string;
  tags: string[];
};

const services: Service[] = [
  {
    icon: Code2,
    tone: "blue",
    title: "รับทำเว็บไซต์",
    body: "เว็บไซต์ที่โหลดเร็ว ใช้งานง่าย และโปร่งใสกับลูกค้า เราออกแบบจากโจทย์ธุรกิจจริง ไม่ใช่แค่ความสวย",
    tags: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    icon: Settings2,
    tone: "cyan",
    title: "ระบบซอฟต์แวร์องค์กร",
    body: "ระบบภายในที่ลดงานซ้ำซ้อน ERP, CRM หรือระบบจัดการเฉพาะทาง วางขั้นตอนให้ตรงวิธีทำงานของทีมคุณ",
    tags: ["Node.js", "Python", "ERP / CRM"],
  },
  {
    icon: Cloud,
    tone: "gold",
    title: "Cloud Solutions",
    body: "วางโครงสร้างพื้นฐานบนคลาวด์ให้เสถียร ปลอดภัย และขยายตามการเติบโตได้โดยไม่ต้องรื้อใหม่",
    tags: ["AWS", "Docker", "Cloud"],
  },
  {
    icon: Database,
    tone: "blue",
    title: "Database Management",
    body: "ออกแบบฐานข้อมูลที่ทำงานได้จริง พร้อมแผนสำรองข้อมูลและแนวทางความปลอดภัยที่เล่าเข้าใจได้",
    tags: ["PostgreSQL", "MongoDB", "Redis"],
  },
  {
    icon: Wrench,
    tone: "cyan",
    title: "Custom Software & API",
    body: "พัฒนาซอฟต์แวร์ตามสั่ง เชื่อมต่อระบบด้วย API และวาง automation ให้งานมือทำน้อยลง",
    tags: ["REST API", "GraphQL", "Automation"],
  },
];

const projectIdeas = [
  {
    title: "เว็บธุรกิจและ Landing Page",
    src: "/media/mascot/mhs-pose-08.png",
    label: "WEBSITE",
  },
  {
    title: "ระบบหลังบ้านและข้อมูล",
    src: "/media/mascot/mhs-pose-13.png",
    label: "SOFTWARE",
  },
  {
    title: "ดูแลระบบต่อหลังเปิดใช้",
    src: "/media/mascot/mhs-pose-16.png",
    label: "SUPPORT",
  },
];

const processSteps = [
  "คุยโจทย์",
  "วางระบบ",
  "ออกแบบ",
  "พัฒนา",
  "ทดสอบ",
  "ส่งมอบ",
];

const navSections = [
  { id: "top", label: "Home" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "about", label: "About Us" },
  { id: "process", label: "Process" },
  { id: "contact", label: "Contact" },
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <main className="code-home">
      <header className="code-topbar">
        <div className="code-container code-topbar-inner">
          <a href="#top" className="code-brand" aria-label="Sam Mok Coding home">
            <span className="code-brand-mark">
              <Mountain size={19} />
            </span>
            <span>
              <strong>SAM MOK CODING</strong>
              <small>Local Dev · Local Solution</small>
            </span>
          </a>

          <nav
            className={`code-nav ${mobileOpen ? "is-open" : ""}`}
            aria-label="Main navigation"
          >
            {navSections.map(section => (
              <button key={section.id} onClick={() => scrollTo(section.id)}>
                {section.label}
              </button>
            ))}
            <Link href="/tool" className="code-nav-tool" onClick={() => setMobileOpen(false)}>
              <Wrench size={14} /> Tool
            </Link>
            <Link href="/login" className="code-nav-login" onClick={() => setMobileOpen(false)}>
              <LogIn size={14} /> Login
            </Link>
          </nav>

          <div className="code-topbar-actions">
            <Link href="/login" className="code-login-pill">
              <LogIn size={14} /> Login
            </Link>
            <Link href="/tool" className="code-tool-pill">
              <Wrench size={14} /> Tool
            </Link>
            <button
              className="code-menu-button"
              onClick={() => setMobileOpen(value => !value)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero — the mascot is the thesis: local developer, real work */}
      <section id="top" className="code-hero">
        <div className="code-container code-hero-grid">
          <div className="code-hero-copy">
            <span className="code-hero-eyebrow">
              <i /> สตูดิโอดิจิทัลจากแม่ฮ่องสอน
            </span>
            <h1 className="code-hero-title">
              เขียนโค้ดบนดอย
              <br />
              <em>ให้ธุรกิจเดินหน้าได้จริง</em>
            </h1>
            <p className="code-hero-lead">
              โค้ดดิ้งเมืองสามหมอกช่วยวางเว็บไซต์และระบบหลังบ้านให้ธุรกิจท้องถิ่น
              คุยด้วยภาษาคน เห็นภาพก่อนเริ่ม และมีคนดูแลต่อเมื่อเปิดใช้งานแล้ว
            </p>
            <div className="code-hero-stats">
              <span>
                <b>14 วัน</b> เริ่มโปรเจกต์แรกได้
              </span>
              <span>
                <b>6 ขั้น</b> กระบวนการที่ชัดเจน
              </span>
              <span>
                <b>100%</b> คุยกับคนทำจริง
              </span>
            </div>
            <div className="code-hero-actions">
              <button className="code-primary-button" onClick={() => scrollTo("contact")}>
                <MessageCircle size={16} /> คุยโปรเจกต์กับเรา
              </button>
              <button className="code-secondary-button" onClick={() => scrollTo("services")}>
                ดูบริการทั้งหมด <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="code-hero-stage" aria-label="เมืองสามหมอกเดฟ mascot">
            <div className="code-stage-halo" />
            <div className="code-stage-gridlines" />
            <span className="code-stage-label">MHS DEV / READY TO BUILD</span>
            <img
              className="code-stage-mascot"
              src="/media/mhs-dev-mascot.png"
              alt="เมืองสามหมอกเดฟกำลังเขียนโค้ด"
            />
            <span className="code-stage-ground" />
            <span className="code-float-badge code-float-code">
              <Code2 size={15} /> CODE
            </span>
            <span className="code-float-badge code-float-cloud">
              <Cloud size={15} /> CLOUD
            </span>
            <span className="code-float-badge code-float-data">
              <Database size={15} /> DATABASE
            </span>
          </div>
        </div>
        <div className="code-container code-hero-contour">
          <div className="contour-line" />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="code-section">
        <div className="code-container">
          <div className="code-section-head">
            <div>
              <span className="eyebrow">
                <i className="eyebrow-dot" /> SERVICES
              </span>
              <h2>โซลูชันที่เริ่มจากโจทย์จริง</h2>
            </div>
            <p>
              เลือกเฉพาะสิ่งที่ธุรกิจต้องใช้ก่อน แล้วค่อยต่อยอดเมื่อพร้อม
              เราออกแบบให้ใช้งานได้จริงและดูแลต่อได้
            </p>
          </div>
          <div className="code-service-grid">
            {services.map(({ icon: Icon, tone, title, body, tags }) => (
              <article className={`code-service-card ${tone}`} key={title}>
                <div className="code-card-icon">
                  <Icon size={25} />
                </div>
                <div className="code-card-content">
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
                <div className="code-card-tags">
                  {tags.map(tag => (
                    <span className="tag-chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <button onClick={() => scrollTo("contact")} className="code-card-cta">
                  คุยบริการนี้ <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio directions */}
      <section id="portfolio" className="code-section">
        <div className="code-container">
          <div className="code-section-head">
            <div>
              <span className="eyebrow">
                <i className="eyebrow-dot" /> PROJECT DIRECTIONS
              </span>
              <h2>เริ่มต้นจากภาพที่คุณเห็น</h2>
            </div>
            <p>
              ไม่ต้องมีคำตอบครบตั้งแต่วันแรก แค่เล่าโจทย์
              แล้วเราจะช่วยแปลงให้เป็นระบบที่จับต้องได้
            </p>
          </div>
          <div className="code-project-grid">
            {projectIdeas.map(({ title, src, label }) => (
              <button className="code-project-card" key={label} onClick={() => scrollTo("contact")}>
                <img src={src} alt="" />
                <span>
                  <span>{label}</span>
                  <strong>{title}</strong>
                </span>
                <ArrowUpRight size={18} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="code-section">
        <div className="code-container code-about-grid">
          <div>
            <span className="eyebrow">
              <i className="eyebrow-dot" /> LOCAL DEV
            </span>
            <h2>
              เด็กผู้ชายขี้เล่น
              <br />
              <em>แต่ทำงานจริง</em>
            </h2>
            <p>
              สามหมอกโค้ดดิ้งคือทีมจากแม่ฮ่องสอนที่เชื่อว่าเทคโนโลยีไม่ควรทำให้คนรู้สึกไกลตัว
              เราคุยด้วยภาษาคน วางระบบเป็นขั้นตอน และอยู่ดูแลต่อเมื่อคุณต้องการ
            </p>
            <div className="code-about-points">
              <span>
                01 <b>คุยง่าย</b>
              </span>
              <span>
                02 <b>เห็นภาพก่อนเริ่ม</b>
              </span>
              <span>
                03 <b>ดูแลต่อได้</b>
              </span>
            </div>
          </div>
          <div className="code-about-visual">
            <img src="/media/mascot/mhs-pose-18.png" alt="เมืองสามหมอกเดฟพักกับกาแฟ MHS" />
            <span className="code-about-note">
              WRITE CODE
              <br />
              FROM THE MOUNTAINS
            </span>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="code-section">
        <div className="code-container">
          <div className="code-section-head">
            <div>
              <span className="eyebrow">
                <i className="eyebrow-dot" /> PROCESS
              </span>
              <h2>ชัดเจนตั้งแต่คุยจนส่งมอบ</h2>
            </div>
            <p>
              ทุกขั้นตอนมีจุดเช็กที่เข้าใจง่าย ลดความเสี่ยง
              และทำให้คุณเห็นความคืบหน้าตลอดทาง
            </p>
          </div>
          <div className="code-process-steps">
            {processSteps.map((step, index) => (
              <div className="code-process-step" key={step}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="code-contact">
        <div className="code-container code-contact-inner">
          <div>
            <span className="eyebrow">
              <i className="eyebrow-dot" /> START A PROJECT
            </span>
            <h2>
              มีไอเดียอยากทำเว็บ?
              <br />
              <em>เริ่มคุยกันได้เลย</em>
            </h2>
            <p>
              เปิด Tool เพื่อทดลองวาง Flow ของระบบที่อยากทำ
              หรือเข้าสู่ระบบเพื่อจัดการงานหลังบ้าน
            </p>
          </div>
          <div className="code-contact-actions">
            <Link href="/tool" className="code-primary-button">
              <Wrench size={16} /> เปิด Tool
            </Link>
            <Link href="/login" className="code-secondary-button">
              <LogIn size={16} /> เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </section>

      <footer className="code-footer">
        <div className="code-container code-footer-inner">
          <div>
            <a href="#top" className="code-brand">
              <span className="code-brand-mark">
                <Mountain size={19} />
              </span>
              <span>
                <strong>CODING MUEANG SAM MOK</strong>
                <small>Local Dev · Local Solution</small>
              </span>
            </a>
            <p>เขียนโค้ดบนดอย ไม่ต้องรอ Silicon Valley</p>
          </div>
          <div className="code-footer-links">
            <Link href="/tool">Tool</Link>
            <Link href="/login">Login</Link>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <div className="code-container code-footer-bottom">
          <span>© 2026 Sam Mok Coding</span>
          <span>
            <Sparkles size={11} /> Made with care in Mae Hong Son
          </span>
        </div>
      </footer>
    </main>
  );
}
