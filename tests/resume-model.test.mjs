import { beforeEach, expect, test } from "bun:test";
import { JSDOM } from "jsdom";
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost:4321",
});
for (const key of [
  "window",
  "document",
  "Node",
  "Element",
  "HTMLElement",
  "localStorage",
  "DOMParser",
])
  globalThis[key] = dom.window[key];
const {
  newResume,
  sampleResume,
  sanitizeResume,
  writeResume,
  readStorage,
  saveEnvelope,
  exportText,
  cleanHtml,
} = await import("../src/lib/resume-model.ts");
const { createDocx } = await import("../src/lib/docx-export.ts");
beforeEach(() => localStorage.clear());
test("ignores old resume records instead of migrating them", () => {
  localStorage.setItem(
    "resumv.documents.v1",
    JSON.stringify([
      { version: 1, id: "old", kind: "resume", name: "Old resume" },
    ]),
  );
  expect(readStorage()).toEqual([]);
  expect(newResume("creative").metadata.template).toBe("onyx");
});
test("keeps cover letter records and saved template settings during resume writes", () => {
  localStorage.setItem(
    "resumv.documents.v1",
    JSON.stringify([
      { id: "letter-1", kind: "letter", body: "Keep this letter" },
    ]),
  );
  const d = sampleResume();
  d.metadata.template = "gengar";
  writeResume(d, "resume-1", "My resume", "resume");
  const docs = readStorage();
  expect(docs.length).toBe(2);
  expect(docs.find((x) => x.id === "letter-1").body).toBe("Keep this letter");
  expect(sanitizeResume(docs[0].reactive).metadata.template).toBe("gengar");
});
test("refuses to overwrite malformed local storage", () => {
  localStorage.setItem("resumv.documents.v1", "broken");
  expect(() => writeResume(newResume(), "one", "New", "resume")).toThrow();
  expect(localStorage.getItem("resumv.documents.v1")).toBe("broken");
});
test("sanitizes imported rich text, image URLs, links and styles", () => {
  const d = sampleResume();
  d.summary.content =
    '<p onclick="alert(1)">Safe <strong>bold</strong><img src="https://tracker.example/a"><script>alert(1)</script><a href="javascript:alert(1)">link</a></p>';
  d.picture.url = "https://tracker.example/photo.png";
  d.basics.website.url = "javascript:alert(1)";
  const safe = sanitizeResume(d);
  expect(safe.summary.content).toContain("<strong>bold</strong>");
  expect(safe.summary.content).not.toMatch(/onclick|<script|<img|javascript:/);
  expect(safe.picture.url).toBe("");
  expect(safe.basics.website.url).toBe("");
  expect(cleanHtml('<svg onload="alert(1)"></svg>')).toBe("");
});
test("repairs duplicate and missing layout sections and keeps full-width content", () => {
  const d = sampleResume();
  d.metadata.layout.pages = [
    {
      fullWidth: true,
      main: ["summary", "summary", "unknown"],
      sidebar: ["skills"],
    },
  ];
  const fixed = sanitizeResume(d);
  const all = fixed.metadata.layout.pages.flatMap((p) => [
    ...p.main,
    ...p.sidebar,
  ]);
  expect(new Set(all).size).toBe(all.length);
  expect(all).toContain("experience");
  expect(all).toContain("skills");
  expect(all).not.toContain("unknown");
  expect(fixed.metadata.layout.pages[0].sidebar).toEqual([]);
});
test("allows blank draft entries to survive a round trip", () => {
  const d = newResume();
  d.sections.experience.items.push({
    id: "draft",
    hidden: false,
    company: "",
    position: "",
    location: "",
    period: "",
    website: { url: "", label: "", inlineLink: false },
    description: "",
    roles: [],
  });
  expect(sanitizeResume(d).sections.experience.items).toHaveLength(1);
});
test("text export omits hidden sections and empty headings", () => {
  const d = sampleResume();
  d.sections.experience.items[0].company = "Hidden employer sentinel";
  d.sections.experience.hidden = true;
  d.sections.interests.items = [];
  const text = exportText(d);
  expect(text).not.toContain("Hidden employer sentinel");
  expect(text).not.toContain("Interests");
  expect(text).toContain("Volunteering");
  expect(text).toContain("David Kowalski");
  expect(text).toContain("Unity Certified Expert: Programmer");
});

test("official sample retains all upstream content and survives saving with its portrait", async () => {
  const {sampleResumeData}=await import('../src/vendor/reactive-resume/schema/resume/sample.ts');
  const {parseResumeData}=await import('../src/vendor/reactive-resume/schema/resume/data.ts');
  const source=parseResumeData(sampleResumeData);
  const sample=sampleResume();
  expect(sample.basics).toEqual(source.basics);
  expect(sample.summary).toEqual(source.summary);
  expect(sample.sections).toEqual(source.sections);
  expect(sample.customSections).toEqual(source.customSections);
  const sections = d => d.metadata.layout.pages.flatMap(p => [...p.main, ...p.sidebar]).sort();
  expect(sections(sample)).toEqual(sections(source));
  expect(sample.metadata.layout.pages).toHaveLength(1);
  const restored=sanitizeResume(sample);
  expect(restored.picture.url).toStartWith('data:image/jpeg;base64,');
  expect(restored.customSections).toHaveLength(source.customSections.length);
  sample.basics.name='Edited locally';
  expect(sampleResume().basics.name).toBe('David Kowalski');
});
test("stores only the current resume schema without legacy fields", () => {
  const doc = saveEnvelope(sampleResume(), "id-1", "Resume", "resume");
  expect(Object.keys(doc).sort()).toEqual([
    "id",
    "kind",
    "reactive",
    "title",
    "updated",
    "version",
  ]);
  expect(doc.reactive.metadata.template).toBe("onyx");
});
test("creates a real DOCX ZIP document", async () => {
  const blob = await createDocx(sampleResume());
  const bytes = new Uint8Array(await blob.arrayBuffer());
  expect(bytes[0]).toBe(0x50);
  expect(bytes[1]).toBe(0x4b);
  expect(bytes.length).toBeGreaterThan(5000);
});

test("continuous flow removes all forced breaks and keeps cover letters in the same flow", async () => {
  const {flowResumeSections}=await import('../src/lib/resume-flow.ts');
  const {sampleResumeData}=await import('../src/vendor/reactive-resume/schema/resume/sample.ts');
  const d=structuredClone(sampleResumeData);
  d.sections.skills.startOnNewPage=true;
  d.sections.skills.keepTogether=true;
  const before=d.metadata.layout.pages.flatMap(p=>[...p.main,...p.sidebar]).sort();
  flowResumeSections(d);
  expect(d.metadata.layout.pages.flatMap(p=>[...p.main,...p.sidebar]).sort()).toEqual(before);
  expect(d.metadata.layout.pages[0].sidebar).toContain('skills');
  expect(d.metadata.layout.pages[0].main).toContain('projects');
  expect(d.sections.skills.startOnNewPage).toBe(false);
  expect(d.sections.skills.keepTogether).toBe(false);
  expect(d.metadata.layout.pages).toHaveLength(1);
  expect(d.metadata.layout.pages[0].main).toContain(d.customSections.find(s=>s.type==='cover-letter').id);
  const layout=structuredClone(d.metadata.layout);
  flowResumeSections(d);
  expect(d.metadata.layout).toEqual(layout);
});

