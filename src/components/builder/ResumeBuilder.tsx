import GitHubLink from "../GitHubLink";
import ProjectFooter from "../ProjectFooter";
import { createRoleResume } from "../../lib/role-resume";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Plus,
  Download,
  FileText,
  Undo2,
  Redo2,
  Check,
  ChevronDown,
  ChevronRight,
  Settings2,
  LayoutTemplate,
  Type,
  Palette,
  Columns2,
  BookOpen,
  UserRound,
  BriefcaseBusiness,
  GraduationCap,
  Wrench,
  FolderKanban,
  Globe,
  Award,
  HeartHandshake,
  Languages,
  Quote,
  Sparkles,
  ImagePlus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  X,
  Upload,
  Minus,
  Maximize,
  GripVertical,
  LoaderCircle,
  PanelLeftClose,
  PanelRightClose,
} from "lucide-react";
import {
  newResume,
  sampleResume,
  sanitizeResume,
  readStorage,
  writeResume,
  emptyItem,
  sectionNames,
  downloadBlob,
  exportText,
  textToHtml,
  type ResumeData,
} from "../../lib/resume-model";
import { reactiveTemplates } from "../../data/templates";
import { examples } from "../../data/content";
import { createTemplateResume } from "../../lib/template-resume";
import { flowResumeSections } from "../../lib/resume-flow";
import { exportMarkdown } from "../../lib/markdown-export";
import ResumeCanvas from "./ResumeCanvas";
import RichText from "./RichText";
import "../../styles/builder.css";

type SectionKey = keyof ResumeData["sections"];
const icons: Record<string, typeof UserRound> = {
  basics: UserRound,
  summary: FileText,
  profiles: Globe,
  experience: BriefcaseBusiness,
  education: GraduationCap,
  skills: Wrench,
  projects: FolderKanban,
  languages: Languages,
  awards: Award,
  certifications: Award,
  publications: BookOpen,
  volunteer: HeartHandshake,
  interests: HeartHandshake,
  references: Quote,
};
const fields: Record<string, [string, string][]> = {
  experience: [
    ["company", "Company"],
    ["position", "Position"],
    ["location", "Location"],
    ["period", "Date range"],
  ],
  education: [
    ["school", "School"],
    ["degree", "Degree"],
    ["area", "Area of study"],
    ["grade", "Grade / GPA"],
    ["location", "Location"],
    ["period", "Date range"],
  ],
  projects: [
    ["name", "Project name"],
    ["period", "Date range"],
  ],
  skills: [
    ["name", "Skill group"],
    ["proficiency", "Proficiency"],
    ["keywords", "Keywords, separated by commas"],
  ],
  languages: [
    ["language", "Language"],
    ["fluency", "Fluency"],
  ],
  profiles: [
    ["network", "Network"],
    ["username", "Username"],
  ],
  interests: [
    ["name", "Interest"],
    ["keywords", "Keywords, separated by commas"],
  ],
  awards: [
    ["title", "Award title"],
    ["awarder", "Awarded by"],
    ["date", "Date"],
  ],
  certifications: [
    ["title", "Certification"],
    ["issuer", "Issuer"],
    ["date", "Date"],
  ],
  publications: [
    ["title", "Publication title"],
    ["publisher", "Publisher"],
    ["date", "Date"],
  ],
  volunteer: [
    ["organization", "Organization"],
    ["location", "Location"],
    ["period", "Date range"],
  ],
  references: [
    ["name", "Name"],
    ["position", "Position"],
    ["phone", "Phone"],
  ],
};
const hasDescription = new Set([
  "experience",
  "education",
  "projects",
  "awards",
  "certifications",
  "publications",
  "volunteer",
  "references",
]);
const makeId = () => crypto.randomUUID();
const safeFilename = (s: string) =>
  s.replace(/[^\p{L}\p{N}\s_-]/gu, "").trim() || "resume";
function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="b-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
function Range({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="b-range">
      <span>
        {label}
        <output>
          {value}
          {suffix}
        </output>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
export default function ResumeBuilder({
  kind = "resume",
}: {
  kind?: "resume" | "cv";
}) {
  const [data, setData] = useState<ResumeData | null>(null);
  const [title, setTitle] = useState("Untitled resume");
  const [id, setId] = useState("");
  const [active, setActive] = useState("basics");
  const [settings, setSettings] = useState("templates");
  const [mobile, setMobile] = useState("content");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState("Local draft");
  const [message, setMessage] = useState("");
  const [previewStatus, setPreviewStatus] = useState("Preparing preview");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [zoom, setZoom] = useState(75);
  const [sample, setSample] = useState(false);
  const [ready, setReady] = useState(false);
  const [fatal, setFatal] = useState("");
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [historyCount, setHistoryCount] = useState(0);
  const [futureCount, setFutureCount] = useState(0);
  const past = useRef<ResumeData[]>([]);
  const future = useRef<ResumeData[]>([]);
  const dirty = useRef(false);
  const latest = useRef<{ data: ResumeData; title: string; id: string } | null>(
    null,
  );
  const canvas = useRef<HTMLDivElement>(null);
  const inputFile = useRef<HTMLInputElement>(null);
  const photoFile = useRef<HTMLInputElement>(null);
  const dragging = useRef<{
    page: number;
    column: "main" | "sidebar";
    id: string;
  } | null>(null);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotTime = useRef(0);
  const notify = useCallback((msg: string) => {
    setMessage(msg);
    if (msgTimer.current) clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMessage(""), 5000);
  }, []);
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const docs = readStorage();
      const existing =
        docs.find((d) => d.id === params.get("id") && d.kind !== 'letter') ||
        (!params.has("id") &&
        !params.has("new") &&
        !params.has("template") &&
        !params.has("example")
          ? docs
              .filter((d) => d.kind !== 'letter')
              .sort((a, b) =>
                String(b.updated).localeCompare(String(a.updated)),
              )[0]
          : null);
      let d: ResumeData;
      let name: string;
      let documentId: string;
      if (existing) {
        d = sanitizeResume(existing.reactive);
        const previousLayout = JSON.stringify(d);
        flowResumeSections(d);
        dirty.current = previousLayout !== JSON.stringify(d);
        name = existing.title;
        documentId = existing.id;
        setSaveStatus(dirty.current ? "Updating layout…" : "All changes saved");
      } else {
        const blank = params.has("new");
        d = blank ? newResume() : sampleResume();
        name = blank
          ? `Untitled ${kind === "cv" ? "CV" : "resume"}`
          : "Sample resume";
        documentId = makeId();
        setSample(!blank);
        const template = params.get("template");
        if (template) {
          d = createTemplateResume(template, blank);
          name = `${reactiveTemplates.find(t => t.id === d.metadata.template)!.name} resume`;
        }
        const example = examples.find((e) => e.slug === params.get("example"));
        if (example) {
          d = createRoleResume(example.slug, params.get("preset") === "blank");
          if (template) {
            const design = newResume(template);
            d.metadata.template = design.metadata.template;
            d.metadata.design.colors.primary = design.metadata.design.colors.primary;
          }
          name = `${example.title} resume`;
          setSample(params.get("preset") !== "blank");
        }
      }
      setData(d);
      setId(documentId);
      setTitle(name);
      setReady(true);
      if (params.has("id") && !existing)
        notify("Document not found. A new draft has been opened.");
    } catch (e) {
      setFatal(
        "Your saved document could not be opened. Your original browser data has been left untouched. Import a valid backup or return to My documents.",
      );
      console.error(e);
    }
  }, [kind, notify]);
  useEffect(() => {
    if (!data || !ready) return;
    latest.current = { data, title, id };
    if (!dirty.current) return;
    setSaveStatus("Saving…");
    const timer = setTimeout(() => {
      try {
        writeResume(data, id, title, kind);
        dirty.current = false;
        setSaveStatus("All changes saved");
        history.replaceState(
          null,
          "",
          `${location.pathname}?id=${encodeURIComponent(id)}`,
        );
      } catch {
        setSaveStatus("Not saved — export a backup");
        notify(
          "Browser storage is unavailable or full. Export JSON to keep your work.",
        );
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [data, title, id, ready, kind, notify]);
  useEffect(() => {
    const flush = () => {
      if (!dirty.current || !latest.current) return;
      const v = latest.current;
      try {
        writeResume(v.data, v.id, v.title, kind);
        dirty.current = false;
      } catch {}
    };
    const leave = (e: BeforeUnloadEvent) => {
      flush();
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", leave);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", leave);
    };
  }, [kind]);
  const update = (fn: (draft: ResumeData) => void, checkpoint = false) => {
    if (!data) return;
    const now = Date.now();
    if (checkpoint || now - snapshotTime.current > 650) {
      past.current.push(structuredClone(data));
      if (past.current.length > 50) past.current.shift();
      snapshotTime.current = now;
    }
    future.current = [];
    setHistoryCount(past.current.length);
    setFutureCount(0);
    const next = structuredClone(data);
    fn(next);
    dirty.current = true;
    setData(next);
  };
  const undo = () => {
    if (!data || !past.current.length) return;
    future.current.push(data);
    setData(past.current.pop()!);
    dirty.current = true;
    setHistoryCount(past.current.length);
    setFutureCount(future.current.length);
  };
  const redo = () => {
    if (!data || !future.current.length) return;
    past.current.push(data);
    setData(future.current.pop()!);
    dirty.current = true;
    setHistoryCount(past.current.length);
    setFutureCount(future.current.length);
  };
  const setTemplate = (template: string) => {
    update((d) => {
      // Use the same complete sample that generates the gallery thumbnail.
      Object.assign(d, createTemplateResume(template));
    }, true);
    setExpanded(null);
    setSample(true);
  };
  const onBlob = useCallback((v: Blob | null) => setBlob(v), []);
  const onStatus = useCallback((v: string) => setPreviewStatus(v), []);
  const fit = () => {
    if (canvas.current)
      setZoom(
        Math.max(
          25,
          Math.min(
            125,
            Math.round(((canvas.current.clientWidth - 72) / 794) * 100),
          ),
        ),
      );
  };
  useEffect(() => {
    if (ready) fit();
  }, [ready, leftOpen, rightOpen, mobile]);
  const saveFile = async (format: "pdf" | "json" | "txt" | "docx" | "md") => {
    if (!data) return;
    const filename = safeFilename(title);
    if (format === "docx") {
      try {
        const { createDocx } = await import("../../lib/docx-export");
        downloadBlob(await createDocx(data), filename + ".docx");
        notify("DOCX download started.");
      } catch {
        notify(
          "The Word export could not be generated. Try PDF or JSON instead.",
        );
      }
      return;
    }
    if (format === "pdf") {
      if (!blob) {
        notify("Wait for the latest preview before downloading.");
        return;
      }
      downloadBlob(blob, filename + ".pdf");
    } else if (format === "json")
      downloadBlob(
        new Blob(
          [
            JSON.stringify(
              { format: "resumv-reactive-v1", title, kind, data },
              null,
              2,
            ),
          ],
          { type: "application/json" },
        ),
        filename + ".json",
      );
    else if (format === "md")
      downloadBlob(
        new Blob([exportMarkdown(data)], { type: "text/markdown;charset=utf-8" }),
        filename + ".md",
      );
    else
      downloadBlob(
        new Blob([exportText(data)], { type: "text/plain;charset=utf-8" }),
        filename + ".txt",
      );
    notify(`${format.toUpperCase()} download started.`);
  };
  const importFile = async (file: File) => {
    try {
      if (file.size > 5_000_000)
        throw Error("Please choose a JSON file smaller than 5 MB.");
      const input = JSON.parse(await file.text());
      const imported = input.data?.basics
        ? sanitizeResume(input.data)
        : input.basics
          ? sanitizeResume(input)
          : null;
      if (!imported)
        throw Error(
          "Unsupported file. Choose a Reactive Resume or resumv JSON backup.",
        );
      const newId = makeId();
      const name = String(
        input.title || input.name || file.name.replace(/\.json$/i, ""),
      ).slice(0, 150);
      writeResume(imported, newId, name, kind);
      setId(newId);
      setTitle(name);
      setData(imported);
      setSample(false);
      past.current = [];
      future.current = [];
      setHistoryCount(0);
      setFutureCount(0);
      dirty.current = false;
      history.replaceState(null, "", `${location.pathname}?id=${newId}`);
      notify("Imported as a new document. Your previous resume is unchanged.");
    } catch (e) {
      notify(
        e instanceof Error ? e.message : "This file could not be imported.",
      );
    }
  };
  const photo = async (file: File) => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 5_000_000) {
      notify("Choose a PNG, JPG, or WebP image under 5 MB.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const c = document.createElement("canvas");
      const scale = Math.min(1, 600 / Math.max(bitmap.width, bitmap.height));
      c.width = bitmap.width * scale;
      c.height = bitmap.height * scale;
      c.getContext("2d")!.drawImage(bitmap, 0, 0, c.width, c.height);
      const url = c.toDataURL("image/jpeg", 0.85);
      bitmap.close();
      update((d) => {
        d.picture.url = url;
        d.picture.hidden = false;
      }, true);
    } catch {
      notify("This image could not be read.");
    }
  };
  if (fatal)
    return (
      <div className="builder-error">
        <h1>Let’s protect your work.</h1>
        <p>{fatal}</p>
        <a href="/documents/">Return to My documents</a>
      </div>
    );
  if (!data)
    return (
      <div className="builder-loading">
        <LoaderCircle className="spin" />
        <p>Opening your workspace…</p>
      </div>
    );
  const section =
    active === "summary"
      ? data.summary
      : active in data.sections
        ? data.sections[active as SectionKey]
        : data.customSections.find((s) => s.id === active);
  const custom =
    active !== "basics" && active !== "summary" && !(active in data.sections);
  const sectionTitle =
    active === "basics"
      ? "Personal details"
      : section?.title || sectionNames[active] || "Custom section";
  const changeSection = (d: ResumeData) =>
    active === "summary"
      ? d.summary
      : active in d.sections
        ? d.sections[active as SectionKey]
        : d.customSections.find((s) => s.id === active)!;
  const itemType = custom ? (section as any)?.type : active;
  const items =
    section && "items" in section
      ? (section.items as Record<string, any>[])
      : [];
  const editItem = (index: number, key: string, value: unknown) =>
    update((d) => {
      const s = changeSection(d) as any;
      s.items[index][key] = value;
    });
  const sectionLinks = [
    "basics",
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "profiles",
    "languages",
    "certifications",
    "awards",
    "publications",
    "volunteer",
    "interests",
    "references",
    ...data.customSections.map((s) => s.id),
  ];
  return (
    <div
      className={`builder-app ${leftOpen ? "" : "left-closed"} ${rightOpen ? "" : "right-closed"}`}
      data-mobile={mobile}
    >
      <header className="builder-topbar">
        <div className="builder-identity">
          <a
            className="back-docs"
            href="/documents/"
            aria-label="Back to documents"
          >
            <ArrowLeft size={19} />
          </a>
          <a className="builder-logo" href="/">
            resumv<span>.</span>
          </a>
          <span className="top-separator" />
          <input
            className="document-title-input"
            aria-label="Document name"
            value={title}
            onChange={(e) => {
              dirty.current = true;
              setTitle(e.target.value);
            }}
          />
          <span className="saved-label">
            <Check size={13} />
            {saveStatus}
          </span>
        </div>
        <div className="builder-top-actions">
          <GitHubLink />
          <button
            title="Undo"
            aria-label="Undo"
            disabled={!historyCount}
            onClick={undo}
          >
            <Undo2 size={17} />
          </button>
          <button
            title="Redo"
            aria-label="Redo"
            disabled={!futureCount}
            onClick={redo}
          >
            <Redo2 size={17} />
          </button>
          <span className="top-separator" />
          <a
            className="builder-new"
            href="/builder/?new=1"
          >
            <Plus size={16} />
            New
          </a>
          <div className="builder-download-group">
          <button
            className="builder-download"
            aria-label="Download PDF"
            disabled={!blob}
            onClick={() => saveFile("pdf")}
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>
          <button className="builder-download builder-download-toggle" popoverTarget="download-formats" aria-label="Download formats" title="More download formats">
            <ChevronDown size={16} />
          </button>
          <div id="download-formats" className="builder-download-menu" popover="auto">
            <p>Download as</p>
            {([
              ["pdf", "PDF", ".pdf", "Matches your preview"],
              ["docx", "Word", ".docx", "Editable document"],
              ["md", "Markdown", ".md", "Formatted text"],
              ["json", "JSON", ".json", "Content and design backup"],
            ] as const).map(([format, label, extension, description]) => (
              <button key={format} disabled={format === "pdf" && !blob} onClick={(event) => {
                event.currentTarget.closest<HTMLElement>("[popover]")?.hidePopover();
                void saveFile(format);
              }}>
                <FileText size={18} />
                <span><strong>{label} <small>{extension}</small></strong><small>{description}</small></span>
                {format === "pdf" && <span className="download-default">Default</span>}
              </button>
            ))}
          </div>
          </div>
        </div>
      </header>
      <div
        className="builder-mobile-tabs"
        role="tablist"
        aria-label="Workspace panels"
      >
        {[
          ["content", "Content"],
          ["preview", "Preview"],
          ["design", "Design"],
        ].map(([value, label]) => (
          <button
            role="tab"
            aria-selected={mobile === value}
            key={value}
            className={mobile === value ? "active" : ""}
            onClick={() => {
              setMobile(value);
              if (value === "content") setLeftOpen(true);
              if (value === "design") setRightOpen(true);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="builder-workspace">
        <aside
          id="resume-content-panel"
          className="builder-left"
          aria-label="Resume content"
        >
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">MAKE IT PERSONAL</span>
              <h2>Content</h2>
            </div>
            <button
              className="desktop-only"
              aria-label="Hide content panel"
              onClick={() => setLeftOpen(false)}
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
          <div className="content-panel-body">
            <div className="section-navigation">
              {sectionLinks.map((key) => {
                const s =
                  key === "summary"
                    ? data.summary
                    : key in data.sections
                      ? data.sections[key as SectionKey]
                      : data.customSections.find((s) => s.id === key);
                const I = icons[key] || FileText;
                const count = s && "items" in s ? s.items.length : 0;
                return (
                  <button
                    key={key}
                    className={`section-nav ${active === key ? "active" : ""}`}
                    onClick={() => {
                      setActive(key);
                      setExpanded(null);
                    }}
                  >
                    <I size={17} />
                    <span>
                      {key === "basics"
                        ? "Personal details"
                        : s?.title || sectionNames[key] || "Custom section"}
                    </span>
                    {s?.hidden ? (
                      <EyeOff size={13} />
                    ) : count > 0 ? (
                      <span className="section-count">{count}</span>
                    ) : null}
                    {active === key ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                );
              })}
              <button
                className="add-section-button"
                onClick={() => {
                  const sectionId = makeId();
                  update((d) => {
                    d.customSections.push({
                      id: sectionId,
                      type: "summary",
                      title: "Custom section",
                      icon: "",
                      columns: 1,
                      hidden: false,
                      showHeading: true,
                      keepTogether: false,
                      startOnNewPage: false,
                      items: [{ id: makeId(), hidden: false, content: "" }],
                    });
                    d.metadata.layout.pages[0].main.push(sectionId);
                  }, true);
                  setActive(sectionId);
                }}
              >
                <Plus size={16} />
                Add a custom section
              </button>
            </div>
            <div className="section-editor" key={active}>
              <div className="section-editor-heading">
                <h3>{sectionTitle}</h3>
                {active !== "basics" && (
                  <button
                    title={section?.hidden ? "Show section" : "Hide section"}
                    aria-label={
                      section?.hidden ? "Show section" : "Hide section"
                    }
                    onClick={() =>
                      update((d) => {
                        changeSection(d).hidden = !section?.hidden;
                      }, true)
                    }
                  >
                    {section?.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
              {active === "basics" ? (
                <>
                  <div className="photo-control">
                    <button
                      className="photo-upload"
                      aria-label="Upload profile photo"
                      onClick={() => photoFile.current?.click()}
                    >
                      {data.picture.url ? (
                        <img src={data.picture.url} alt="Profile" />
                      ) : (
                        <ImagePlus size={24} />
                      )}
                    </button>
                    <div>
                      <strong>Profile picture</strong>
                      <p>Optional · JPG, PNG or WebP</p>
                      <button onClick={() => photoFile.current?.click()}>
                        Upload photo
                      </button>
                      {data.picture.url && (
                        <button
                          onClick={() =>
                            update((d) => {
                              d.picture.url = "";
                            }, true)
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    ref={photoFile}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={(e) => {
                      if (e.target.files?.[0]) void photo(e.target.files[0]);
                      e.target.value = "";
                    }}
                  />
                  {[
                    ["name", "Full name", "Alex Morgan"],
                    ["headline", "Headline", "Senior Product Designer"],
                    ["email", "Email", "alex@example.com"],
                    ["phone", "Phone", "+1 (415) 555-0128"],
                    ["location", "Location", "San Francisco, CA"],
                  ].map(([key, label, placeholder]) => (
                    <Field
                      key={key}
                      label={label}
                      value={String(
                        data.basics[key as keyof typeof data.basics] || "",
                      )}
                      placeholder={placeholder}
                      type={key === "email" ? "email" : "text"}
                      onChange={(value) =>
                        update((d) => {
                          (d.basics as any)[key] = value;
                        })
                      }
                    />
                  ))}
                  <Field
                    label="Website"
                    value={data.basics.website.url}
                    placeholder="https://yourportfolio.com"
                    onChange={(v) =>
                      update((d) => {
                        d.basics.website.url = v;
                      })
                    }
                  />
                  <Field
                    label="Website label"
                    value={data.basics.website.label}
                    placeholder="yourportfolio.com"
                    onChange={(v) =>
                      update((d) => {
                        d.basics.website.label = v;
                      })
                    }
                  />
                  {data.picture.url && (
                    <>
                      <Range
                        label="Photo size"
                        value={data.picture.size}
                        min={32}
                        max={160}
                        suffix=" pt"
                        onChange={(v) =>
                          update((d) => {
                            d.picture.size = v;
                          })
                        }
                      />
                      <Range
                        label="Photo corners"
                        value={data.picture.borderRadius}
                        min={0}
                        max={100}
                        onChange={(v) =>
                          update((d) => {
                            d.picture.borderRadius = v;
                          })
                        }
                      />
                    </>
                  )}
                </>
              ) : (
                <>
                  <Field
                    label="Section heading"
                    value={section?.title || sectionNames[active] || ""}
                    onChange={(value) =>
                      update((d) => {
                        changeSection(d).title = value;
                      })
                    }
                  />
                  {active === "summary" ? (
                    <>
                      <p className="b-hint">
                        A short introduction to your experience and what you do
                        best.
                      </p>
                      <RichText
                        label="Professional summary"
                        value={data.summary.content}
                        onChange={(value) =>
                          update((d) => {
                            d.summary.content = value;
                          })
                        }
                      />
                    </>
                  ) : (
                    <>
                      <div className="entry-list">
                        {items.map((item, i) => (
                          <div
                            key={item.id}
                            className={`entry-card ${item.hidden ? "entry-hidden" : ""}`}
                          >
                            <button
                              className="entry-heading"
                              aria-expanded={expanded === item.id}
                              onClick={() =>
                                setExpanded(
                                  expanded === item.id ? null : item.id,
                                )
                              }
                            >
                              <span>
                                <strong>
                                  {item.company ||
                                    item.school ||
                                    item.name ||
                                    item.title ||
                                    item.language ||
                                    item.network ||
                                    item.organization ||
                                    `Entry ${i + 1}`}
                                </strong>
                                <small>
                                  {item.position ||
                                    item.degree ||
                                    item.period ||
                                    item.proficiency ||
                                    item.fluency ||
                                    ""}
                                </small>
                              </span>
                              {expanded === item.id ? (
                                <ChevronDown size={15} />
                              ) : (
                                <ChevronRight size={15} />
                              )}
                            </button>
                            {expanded === item.id && (
                              <div className="entry-fields">
                                {(fields[itemType] || []).map(
                                  ([key, label]) => (
                                    <Field
                                      key={key}
                                      label={label}
                                      value={
                                        Array.isArray(item[key])
                                          ? item[key].join(", ")
                                          : item[key] || ""
                                      }
                                      onChange={(v) =>
                                        editItem(
                                          i,
                                          key,
                                          key === "keywords"
                                            ? v.split(",").map((s) => s.trim())
                                            : v,
                                        )
                                      }
                                    />
                                  ),
                                )}
                                {itemType === "summary" ? (
                                  <RichText
                                    label="Section content"
                                    value={item.content || ""}
                                    onChange={(v) => editItem(i, "content", v)}
                                  />
                                ) : null}
                                {hasDescription.has(itemType) && (
                                  <>
                                    <span className="b-label">Description</span>
                                    <RichText
                                      label={`${sectionTitle} description`}
                                      value={item.description || ""}
                                      onChange={(v) =>
                                        editItem(i, "description", v)
                                      }
                                    />
                                  </>
                                )}
                                {item.website && (
                                  <Field
                                    label="Link"
                                    value={item.website.url}
                                    placeholder="https://"
                                    onChange={(v) =>
                                      editItem(i, "website", {
                                        ...item.website,
                                        url: v,
                                      })
                                    }
                                  />
                                )}
                                {["skills", "languages"].includes(itemType) && (
                                  <Range
                                    label="Proficiency level (0 hides indicator)"
                                    min={0}
                                    max={5}
                                    value={item.level || 0}
                                    onChange={(v) => editItem(i, "level", v)}
                                  />
                                )}
                                <div className="entry-actions">
                                  <button
                                    title="Move entry up"
                                    aria-label="Move entry up"
                                    disabled={i === 0}
                                    onClick={() =>
                                      update((d) => {
                                        const list = (changeSection(d) as any)
                                          .items;
                                        [list[i - 1], list[i]] = [
                                          list[i],
                                          list[i - 1],
                                        ];
                                      }, true)
                                    }
                                  >
                                    <ArrowUp size={14} />
                                  </button>
                                  <button
                                    title="Move entry down"
                                    aria-label="Move entry down"
                                    disabled={i === items.length - 1}
                                    onClick={() =>
                                      update((d) => {
                                        const list = (changeSection(d) as any)
                                          .items;
                                        [list[i], list[i + 1]] = [
                                          list[i + 1],
                                          list[i],
                                        ];
                                      }, true)
                                    }
                                  >
                                    <ArrowDown size={14} />
                                  </button>
                                  <button
                                    title="Duplicate entry"
                                    aria-label="Duplicate entry"
                                    onClick={() =>
                                      update((d) => {
                                        (changeSection(d) as any).items.splice(
                                          i + 1,
                                          0,
                                          {
                                            ...structuredClone(item),
                                            id: makeId(),
                                          },
                                        );
                                      }, true)
                                    }
                                  >
                                    <Copy size={14} />
                                  </button>
                                  <button
                                    title={
                                      item.hidden ? "Show entry" : "Hide entry"
                                    }
                                    aria-label={
                                      item.hidden ? "Show entry" : "Hide entry"
                                    }
                                    onClick={() =>
                                      editItem(i, "hidden", !item.hidden)
                                    }
                                  >
                                    {item.hidden ? (
                                      <EyeOff size={14} />
                                    ) : (
                                      <Eye size={14} />
                                    )}
                                  </button>
                                  <button
                                    className="delete-entry"
                                    title="Remove entry"
                                    aria-label="Remove entry"
                                    onClick={() => {
                                      update((d) => {
                                        (changeSection(d) as any).items.splice(
                                          i,
                                          1,
                                        );
                                      }, true);
                                      notify(
                                        "Entry removed. Use Undo to restore it.",
                                      );
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        className="b-add"
                        onClick={() => {
                          const item = emptyItem(itemType);
                          update((d) => {
                            (changeSection(d) as any).items.push(item);
                          }, true);
                          setExpanded(item.id);
                        }}
                      >
                        <Plus size={15} />
                        Add{" "}
                        {itemType === "summary"
                          ? "text block"
                          : sectionTitle.toLowerCase().replace(/s$/, "")}
                      </button>
                    </>
                  )}
                  {custom && (
                    <button
                      className="remove-section"
                      onClick={() => {
                        update((d) => {
                          d.customSections = d.customSections.filter(
                            (s) => s.id !== active,
                          );
                          for (const p of d.metadata.layout.pages) {
                            p.main = p.main.filter((s) => s !== active);
                            p.sidebar = p.sidebar.filter((s) => s !== active);
                          }
                        }, true);
                        setActive("basics");
                        notify("Section removed. Use Undo to restore it.");
                      }}
                    >
                      <Trash2 size={14} />
                      Remove section
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="panel-footer">
            <span className="privacy-dot" /> Your data stays in this browser.
          </div>
        </aside>
        <section
          className="builder-canvas"
          ref={canvas}
          aria-label="Resume preview workspace"
        >
          <div className="canvas-top">
            {!leftOpen && (
              <div className="canvas-panel-toggles">
                <button
                  aria-label="Show content panel"
                  aria-controls="resume-content-panel"
                  aria-expanded={leftOpen}
                  onClick={() => {
                    setLeftOpen(true);
                    setMobile("content");
                  }}
                >
                  <BookOpen size={17} />
                  <span>Show content</span>
                </button>
              </div>
            )}
            <div className="canvas-breadcrumb">
              <FileText size={14} />
              <span>{title}</span>
              <span>/</span>
              <strong>
                {
                  reactiveTemplates.find((t) => t.id === data.metadata.template)
                    ?.name
                }
              </strong>
            </div>
            <div className="canvas-panel-toggles">
              {!rightOpen && (
                <button
                  aria-label="Show design panel"
                  onClick={() => {
                    setRightOpen(true);
                    setMobile("design");
                  }}
                >
                  <Settings2 size={17} />
                  <span>Show design</span>
                </button>
              )}
            </div>
          </div>
          {sample && (
            <div className="sample-banner">
              <Sparkles size={14} />
              <span>Sample content — replace it with your own story.</span>
              <a href="/builder/?new=1">
                Start blank
              </a>
            </div>
          )}
          <div className="canvas-scroll">
            <div
              className="canvas-paper-width"
              style={{ width: `${(794 * zoom) / 100}px` }}
            >
              <ResumeCanvas data={data} onBlob={onBlob} onStatus={onStatus} />
            </div>
            <div className="canvas-end">
              Crafted by you. Ready for what’s next.
            </div>
          </div>
          <div className="canvas-dock">
            <span className="dock-status">
              <span />
              {previewStatus}
            </span>
            <span className="dock-divider" />
            <button
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Math.max(25, z - 10))}
            >
              <Minus size={16} />
            </button>
            <span className="zoom-label">{zoom}%</span>
            <button
              aria-label="Zoom in"
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
            >
              <Plus size={16} />
            </button>
            <span className="dock-divider" />
            <button
              aria-label="Fit to width"
              title="Fit to width"
              onClick={fit}
            >
              <Maximize size={16} />
            </button>
          </div>
        </section>
        <aside className="builder-right" aria-label="Resume design">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">MAKE IT YOURS</span>
              <h2>Design</h2>
            </div>
            <button
              className="desktop-only"
              aria-label="Hide design panel"
              onClick={() => setRightOpen(false)}
            >
              <PanelRightClose size={18} />
            </button>
          </div>
          <div
            className="design-tabs"
            role="tablist"
            aria-label="Design settings"
          >
            {[
              ["templates", LayoutTemplate, "Templates"],
              ["typography", Type, "Typography"],
              ["layout", Columns2, "Layout"],
              ["design", Palette, "Colors"],
              ["page", Settings2, "Page"],
              ["export", Download, "Export"],
            ].map(([key, Icon, label]) => {
              const I = Icon as typeof Type;
              return (
                <button
                  key={String(key)}
                  className={settings === key ? "active" : ""}
                  role="tab"
                  aria-selected={settings === key}
                  title={String(label)}
                  aria-label={String(label)}
                  onClick={() => setSettings(String(key))}
                >
                  <I size={17} />
                </button>
              );
            })}
          </div>
          <div className="design-panel-content">
            {settings === "templates" && (
              <>
                <div className="settings-title">
                  <h3>Templates</h3>
                  <span>15 layouts</span>
                </div>
                <p className="b-hint">Loads the sample content and photo shown. Undo restores your previous resume.</p>
                <div className="builder-template-grid">
                  {reactiveTemplates.map((t) => (
                    <button
                      key={t.id}
                      className={`builder-template ${data.metadata.template === t.id ? "selected" : ""}`}
                      aria-label={`Use ${t.name} template`}
                      aria-pressed={data.metadata.template === t.id}
                      onClick={() => setTemplate(t.id)}
                    >
                      <span className="template-thumb">
                        <img
                          src={`/templates/${t.id}.jpg`}
                          alt={`${t.name} template preview`}
                          loading="lazy"
                        />
                        {data.metadata.template === t.id && (
                          <span className="template-check">
                            <Check size={12} />
                          </span>
                        )}
                      </span>
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {settings === "typography" && (
              <>
                <h3>Typography</h3>
                <p className="b-hint">Find the right voice for your resume.</p>
                {(["body", "heading"] as const).map((part) => (
                  <div className="settings-group" key={part}>
                    <h4>{part === "body" ? "Body text" : "Headings"}</h4>
                    <label className="b-field">
                      <span>Font family</span>
                      <select
                        aria-label={`${part} font family`}
                        value={data.metadata.typography[part].fontFamily}
                        onChange={(e) =>
                          update((d) => {
                            d.metadata.typography[part].fontFamily =
                              e.target.value;
                          }, true)
                        }
                      >
                        {["Lato", "Helvetica", "Times-Roman", "Courier"].map(
                          (font) => (
                            <option key={font}>{font}</option>
                          ),
                        )}
                      </select>
                    </label>
                    <Range
                      label={`${part === "body" ? "Body" : "Heading"} font size`}
                      min={7}
                      max={part === "body" ? 16 : 24}
                      value={data.metadata.typography[part].fontSize}
                      suffix=" pt"
                      onChange={(v) =>
                        update((d) => {
                          d.metadata.typography[part].fontSize = v;
                        })
                      }
                    />
                    <Range
                      label={`${part === "body" ? "Body" : "Heading"} line height`}
                      min={1}
                      max={2}
                      step={0.1}
                      value={data.metadata.typography[part].lineHeight}
                      onChange={(v) =>
                        update((d) => {
                          d.metadata.typography[part].lineHeight = v;
                        })
                      }
                    />
                  </div>
                ))}
              </>
            )}
            {settings === "design" && (
              <>
                <h3>Colors</h3>
                <p className="b-hint">Small accents. A strong impression.</p>
                <div className="color-palette">
                  {[
                    "#111827",
                    "#2563eb",
                    "#0e7490",
                    "#15803d",
                    "#7c3aed",
                    "#be123c",
                    "#b45309",
                    "#475569",
                  ].map((c) => (
                    <button
                      key={c}
                      aria-label={`Set accent ${c}`}
                      aria-pressed={data.metadata.design.colors.primary === c}
                      style={{ background: c }}
                      onClick={() =>
                        update((d) => {
                          d.metadata.design.colors.primary = c;
                        }, true)
                      }
                    >
                      {data.metadata.design.colors.primary === c && (
                        <Check size={16} />
                      )}
                    </button>
                  ))}
                </div>
                {[
                  ["primary", "Accent"],
                  ["text", "Text"],
                  ["background", "Paper"],
                ].map(([key, label]) => (
                  <label className="b-color-field" key={key}>
                    <span>{label}</span>
                    <input
                      aria-label={`${label} color`}
                      type="color"
                      value={
                        /^#[\da-f]{6}$/i.test(
                          data.metadata.design.colors[key as "primary"],
                        )
                          ? data.metadata.design.colors[key as "primary"]
                          : key === "background"
                            ? "#ffffff"
                            : "#111827"
                      }
                      onChange={(e) =>
                        update((d) => {
                          d.metadata.design.colors[key as "primary"] =
                            e.target.value;
                        })
                      }
                    />
                  </label>
                ))}
                <h4>Skill indicators</h4>
                <label className="b-field">
                  <span>Indicator style</span>
                  <select
                    value={data.metadata.design.level.type}
                    onChange={(e) =>
                      update((d) => {
                        d.metadata.design.level.type = e.target.value as any;
                      }, true)
                    }
                  >
                    {[
                      "hidden",
                      "circle",
                      "square",
                      "rectangle",
                      "progress-bar",
                    ].map((s) => (
                      <option value={s} key={s}>
                        {s.replaceAll("-", " ")}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {settings === "page" && (
              <>
                <h3>Page</h3>
                <p className="b-hint">
                  The preview is your actual PDF, including page breaks.
                </p>
                <label className="b-field">
                  <span>Paper size</span>
                  <select
                    value={data.metadata.page.format}
                    onChange={(e) =>
                      update((d) => {
                        d.metadata.page.format = e.target.value as
                          | "a4"
                          | "letter";
                      }, true)
                    }
                  >
                    <option value="a4">A4 · 210 × 297 mm</option>
                    <option value="letter">US Letter · 8.5 × 11 in</option>
                  </select>
                </label>
                <Range
                  label="Horizontal margin"
                  value={data.metadata.page.marginX}
                  min={12}
                  max={60}
                  suffix=" pt"
                  onChange={(v) =>
                    update((d) => {
                      d.metadata.page.marginX = v;
                    })
                  }
                />
                <Range
                  label="Vertical margin"
                  value={data.metadata.page.marginY}
                  min={12}
                  max={60}
                  suffix=" pt"
                  onChange={(v) =>
                    update((d) => {
                      d.metadata.page.marginY = v;
                    })
                  }
                />
                <Range
                  label="Item spacing"
                  value={data.metadata.page.gapY}
                  min={0}
                  max={18}
                  suffix=" pt"
                  onChange={(v) =>
                    update((d) => {
                      d.metadata.page.gapY = v;
                    })
                  }
                />
                <label className="b-checkbox">
                  <input
                    type="checkbox"
                    checked={!data.metadata.page.hideSectionIcons}
                    onChange={(e) =>
                      update((d) => {
                        d.metadata.page.hideSectionIcons = !e.target.checked;
                      }, true)
                    }
                  />
                  Show section icons
                </label>
                <label className="b-checkbox">
                  <input
                    type="checkbox"
                    checked={!data.metadata.page.hideIcons}
                    onChange={(e) =>
                      update((d) => {
                        d.metadata.page.hideIcons = !e.target.checked;
                      }, true)
                    }
                  />
                  Show contact icons
                </label>
              </>
            )}
            {settings === "layout" && (
              <>
                <h3>Layout</h3>
                <button className="b-button" onClick={() => update(d => flowResumeSections(d), true)}>
                  Flow content continuously
                </button>
                <p className="b-hint">Let all sections, including cover letters, fill the available space. A new sheet starts only when the content reaches the bottom.</p>
                <p className="b-hint">
                  Drag sections to reorder or move between columns. Arrow
                  buttons work with a keyboard.
                </p>
                <Range
                  label="Sidebar width"
                  min={20}
                  max={45}
                  suffix="%"
                  value={data.metadata.layout.sidebarWidth}
                  onChange={(v) =>
                    update((d) => {
                      d.metadata.layout.sidebarWidth = v;
                    })
                  }
                />
                {data.metadata.layout.pages.map((page, pi) => (
                  <div className="layout-page" key={pi}>
                    <h4>Page layout {pi + 1}</h4>
                    <label className="b-checkbox">
                      <input
                        type="checkbox"
                        checked={page.fullWidth}
                        onChange={(e) =>
                          update((d) => {
                            const p = d.metadata.layout.pages[pi];
                            p.fullWidth = e.target.checked;
                            if (p.fullWidth) {
                              p.main.push(...p.sidebar);
                              p.sidebar = [];
                            }
                          }, true)
                        }
                      />
                      Single column
                    </label>
                    {(["main", "sidebar"] as const)
                      .filter((col) => !page.fullWidth || col === "main")
                      .map((col) => (
                        <div
                          className="layout-column"
                          key={col}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const source = dragging.current;
                            if (!source) return;
                            update((d) => {
                              const old =
                                d.metadata.layout.pages[source.page][
                                  source.column
                                ];
                              old.splice(old.indexOf(source.id), 1);
                              d.metadata.layout.pages[pi][col].push(source.id);
                            }, true);
                            dragging.current = null;
                          }}
                        >
                          <h5>{col === "main" ? "Main column" : "Sidebar"}</h5>
                          {page[col].map((sid, index) => {
                            const s =
                              sid === "summary"
                                ? data.summary
                                : sid in data.sections
                                  ? data.sections[sid as SectionKey]
                                  : data.customSections.find(
                                      (x) => x.id === sid,
                                    );
                            return (
                              <div
                                className="layout-row"
                                key={sid}
                                draggable
                                onDragStart={() => {
                                  dragging.current = {
                                    page: pi,
                                    column: col,
                                    id: sid,
                                  };
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  const source = dragging.current;
                                  if (!source || source.id === sid) return;
                                  update((d) => {
                                    const list =
                                      d.metadata.layout.pages[source.page][
                                        source.column
                                      ];
                                    list.splice(list.indexOf(source.id), 1);
                                    const dest =
                                      d.metadata.layout.pages[pi][col];
                                    dest.splice(
                                      dest.indexOf(sid),
                                      0,
                                      source.id,
                                    );
                                  }, true);
                                  dragging.current = null;
                                }}
                              >
                                <GripVertical size={13} />
                                <span>
                                  {s?.title ||
                                    sectionNames[sid] ||
                                    "Custom section"}
                                </span>
                                <button
                                  aria-label={`Move ${sectionNames[sid] || "section"} up`}
                                  disabled={index === 0}
                                  onClick={() =>
                                    update((d) => {
                                      const list =
                                        d.metadata.layout.pages[pi][col];
                                      [list[index - 1], list[index]] = [
                                        list[index],
                                        list[index - 1],
                                      ];
                                    }, true)
                                  }
                                >
                                  <ArrowUp size={12} />
                                </button>
                                {!page.fullWidth && (
                                  <button
                                    aria-label={`Move ${sectionNames[sid] || "section"} to ${col === "main" ? "sidebar" : "main column"}`}
                                    onClick={() =>
                                      update((d) => {
                                        const p = d.metadata.layout.pages[pi];
                                        p[col] = p[col].filter(
                                          (x) => x !== sid,
                                        );
                                        p[
                                          col === "main" ? "sidebar" : "main"
                                        ].push(sid);
                                      }, true)
                                    }
                                  >
                                    <Columns2 size={12} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                  </div>
                ))}
              </>
            )}
            {settings === "export" && (
              <>
                <h3>Export & import</h3>
                <p className="b-hint">Your document. Wherever you need it.</p>
                <button
                  className="export-option"
                  disabled={!blob}
                  onClick={() => saveFile("pdf")}
                >
                  <FileText size={21} />
                  <span>
                    <strong>Download PDF</strong>
                    <small>The exact layout shown in your preview.</small>
                  </span>
                  <Download size={16} />
                </button>
                <button
                  className="export-option"
                  onClick={() => saveFile("docx")}
                >
                  <FileText size={21} />
                  <span>
                    <strong>Download Word (.docx)</strong>
                    <small>
                      An editable document with your main and sidebar sections.
                    </small>
                  </span>
                  <Download size={16} />
                </button>
                <button
                  className="export-option"
                  onClick={() => saveFile("json")}
                >
                  <FileText size={21} />
                  <span>
                    <strong>Export JSON backup</strong>
                    <small>All content, layout, and design settings.</small>
                  </span>
                  <Download size={16} />
                </button>
                <button
                  className="export-option"
                  onClick={() => saveFile("md")}
                >
                  <FileText size={21} />
                  <span>
                    <strong>Download Markdown (.md)</strong>
                    <small>Headings, lists, and links in a portable text file.</small>
                  </span>
                  <Download size={16} />
                </button>
                <button
                  className="export-option"
                  onClick={() => inputFile.current?.click()}
                >
                  <Upload size={21} />
                  <span>
                    <strong>Import JSON</strong>
                    <small>Reactive Resume or resumv backup.</small>
                  </span>
                  <Plus size={16} />
                </button>
                <p className="b-hint">
                  Imports create a new document. PDF and Word imports are not
                  supported.
                </p>
              </>
            )}
          </div>
          <div className="template-attribution">
            <a href="/licenses/">Templates by Reactive Resume ↗</a>
            <span>Open source · MIT</span>
          </div>
        </aside>
      </div>
      <input
        ref={inputFile}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(e) => {
          if (e.target.files?.[0]) void importFile(e.target.files[0]);
          e.target.value = "";
        }}
      />
      <ProjectFooter />
      {message && (
        <div className="builder-toast" role="status">
          {message}
          <button
            aria-label="Dismiss notification"
            onClick={() => setMessage("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

