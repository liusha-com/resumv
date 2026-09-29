import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
  Table, TableRow, TableCell, WidthType, TableLayoutType, BorderStyle, VerticalAlign,
  ImageRun,
} from "docx";
import { cleanHtml, sectionNames, type ResumeData } from "./resume-model";
export async function createDocx(data: ResumeData): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];
  const paragraph = (
    text: string,
    heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel],
  ) => new Paragraph({ text, heading, spacing: { after: 120 } });
  const rich = (html: string) => {
    const el = document.createElement("div");
    el.innerHTML = cleanHtml(html);
    // A paragraph inside a list item is already included by that item.
    const blocks = [...el.querySelectorAll("p,li")].filter(block =>
      !block.parentElement?.closest("p,li"),
    );
    if (!blocks.length && el.textContent)
      blocks.push(el as HTMLParagraphElement);
    return blocks.map((block) => {
      const runs: (TextRun | ExternalHyperlink)[] = [];
      const walk = (node: Node, bold = false, italics = false) => {
        if (node.nodeType === Node.TEXT_NODE) {
          runs.push(
            new TextRun({ text: node.textContent || "", bold, italics }),
          );
          return;
        }
        if (!(node instanceof Element)) return;
        if (node.tagName === "BR") {
          runs.push(new TextRun({ break: 1 }));
          return;
        }
        if (
          node.tagName === "A" &&
          /^https?:\/\//i.test(node.getAttribute("href") || "")
        ) {
          runs.push(
            new ExternalHyperlink({
              link: node.getAttribute("href")!,
              children: [
                new TextRun({
                  text: node.textContent || "",
                  style: "Hyperlink",
                }),
              ],
            }),
          );
          return;
        }
        node.childNodes.forEach((child) =>
          walk(
            child,
            bold || ["B", "STRONG"].includes(node.tagName),
            italics || ["I", "EM"].includes(node.tagName),
          ),
        );
      };
      block.childNodes.forEach((n) => walk(n));
      return new Paragraph({
        children: runs,
        spacing: { after: 100 },
        ...(block.tagName === "LI" ? { bullet: { level: 0 } } : {}),
      });
    });
  };
  const header: Paragraph[] = [];
  if (!data.picture.hidden && data.picture.url) {
    try {
      const response = await fetch(data.picture.url);
      const mime = response.headers.get('content-type') || '';
      const type = mime.includes('png') ? 'png' : mime.includes('jpeg') ? 'jpg' : undefined;
      if (response.ok && type) header.push(new Paragraph({
        children: [new ImageRun({ type, data: new Uint8Array(await response.arrayBuffer()),
          transformation: { width: 88, height: 88 } })], spacing: { after: 140 },
      }));
    } catch { /* Keep the editable document available if an external photo fails. */ }
  }
  header.push(
    paragraph(data.basics.name, HeadingLevel.TITLE),
    paragraph(data.basics.headline),
    paragraph(
      [
        data.basics.email,
        data.basics.phone,
        data.basics.location,
        data.basics.website.url,
      ]
        .filter(Boolean)
        .join(" · "),
    ),
  );
  const seen = new Set<string>();
  const renderSections = (ids: string[]) => {
  const children: Paragraph[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    if (id === "summary") {
      if (!data.summary.hidden && data.summary.content) {
        if (data.summary.showHeading !== false)
          children.push(
            paragraph(data.summary.title || "Summary", HeadingLevel.HEADING_1),
          );
        children.push(...rich(data.summary.content));
      }
      continue;
    }
    const section =
      id in data.sections
        ? data.sections[id as keyof ResumeData["sections"]]
        : data.customSections.find((s) => s.id === id);
    if (!section || section.hidden) continue;
    const visible = section.items.filter((i) => !i.hidden) as Record<
      string,
      any
    >[];
    if (!visible.length) continue;
    if (section.showHeading !== false)
      children.push(
        paragraph(
          section.title || sectionNames[id] || "Additional information",
          HeadingLevel.HEADING_1,
        ),
      );
    for (const item of visible) {
      const title =
        item.company ||
        item.school ||
        item.name ||
        item.title ||
        item.language ||
        item.network ||
        item.organization;
      if (title) children.push(paragraph(title, HeadingLevel.HEADING_2));
      const meta = [
        item.position,
        item.degree,
        item.area,
        item.period,
        item.location,
        item.date,
        item.issuer,
        item.awarder,
        item.publisher,
        item.fluency,
        item.proficiency,
        item.username,
        item.phone,
        item.email,
        item.grade,
      ].filter(Boolean);
      if (meta.length) children.push(paragraph(meta.join(" · ")));
      if (item.keywords?.length)
        children.push(paragraph(item.keywords.join(", ")));
      if (item.description) children.push(...rich(item.description));
      if (item.content) children.push(...rich(item.content));
      if (item.website?.url)
        children.push(new Paragraph({ children: [new ExternalHyperlink({
          link: item.website.url,
          children: [new TextRun({ text: item.website.label || item.website.url, style: 'Hyperlink' })],
        })], spacing: { after: 100 } }));
      for (const role of item.roles || []) {
        if (role.hidden) continue;
        if (role.position) children.push(paragraph(role.position, HeadingLevel.HEADING_2));
        if (role.period) children.push(paragraph(role.period));
        if (role.description) children.push(...rich(role.description));
      }
    }
  }
  return children;
  };
  const primary = data.metadata.design.colors.primary.replace("#", "");
  const letter = data.metadata.page.format === "letter";
  const leftSidebar = ['azurill', 'ditto', 'ditgar', 'gengar', 'glalie', 'pikachu'].includes(data.metadata.template);
  const hasColumns = leftSidebar || ['chikorita', 'leafish', 'onyx', 'kakuna', 'meowth'].includes(data.metadata.template);
  const headerInSidebar = ['ditgar', 'gengar', 'glalie'].includes(data.metadata.template);
  const pageWidth = letter ? 12240 : 11906;
  const contentWidth = Math.max(3000, pageWidth - data.metadata.page.marginX * 40);
  const sidebarWidth = Math.round(contentWidth * Math.min(50, Math.max(20, data.metadata.layout.sidebarWidth)) / 100);
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  for (const [index, page] of data.metadata.layout.pages.entries()) {
    if (index) children.push(new Paragraph({ pageBreakBefore: true }));
    const main = renderSections(page.main);
    const sidebar = renderSections(page.sidebar);
    const columns = hasColumns && !page.fullWidth && sidebar.length > 0;
    if (index === 0) {
      if (columns && headerInSidebar) sidebar.unshift(...header);
      else children.push(...header);
    }
    if (!columns) { children.push(...main, ...sidebar); continue; }
    const cell = (paragraphs: Paragraph[], width: number, isSidebar: boolean) => new TableCell({
      children: paragraphs.length ? paragraphs : [new Paragraph('')],
      width: { size: width, type: WidthType.DXA },
      verticalAlign: VerticalAlign.TOP,
      margins: { top: 160, bottom: 160, left: 180, right: 180 },
      ...(isSidebar ? { shading: { fill: 'F1F3F5' } } : {}),
    });
    const mainCell = cell(main, contentWidth - sidebarWidth, false);
    const sidebarCell = cell(sidebar, sidebarWidth, true);
    children.push(new Table({
      width: { size: contentWidth, type: WidthType.DXA },
      columnWidths: leftSidebar ? [sidebarWidth, contentWidth - sidebarWidth] : [contentWidth - sidebarWidth, sidebarWidth],
      layout: TableLayoutType.FIXED,
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
      rows: [new TableRow({ cantSplit: false, children: leftSidebar ? [sidebarCell, mainCell] : [mainCell, sidebarCell] })],
    }));
  }
  return Packer.toBlob(
    new Document({
      creator: "resumv",
      title: data.basics.name,
      styles: {
        default: {
          document: {
            run: {
              font:
                data.metadata.typography.body.fontFamily === "Times-Roman"
                  ? "Times New Roman"
                  : "Calibri",
              size: data.metadata.typography.body.fontSize * 2,
            },
          },
          heading1: {
            run: {
              color: /^[\da-f]{6}$/i.test(primary) ? primary : "222222",
              size: data.metadata.typography.heading.fontSize * 2,
              bold: true,
            },
            paragraph: { spacing: { before: 220, after: 120 } },
          },
          heading2: { run: { size: 22, bold: true } },
        },
      },
      sections: [
        {
          properties: {
            page: {
              size: {
                width: letter ? 12240 : 11906,
                height: letter ? 15840 : 16838,
              },
              margin: {
                top: data.metadata.page.marginY * 20,
                bottom: data.metadata.page.marginY * 20,
                left: data.metadata.page.marginX * 20,
                right: data.metadata.page.marginX * 20,
              },
            },
          },
          children,
        },
      ],
    }),
  );
}
