import { expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import { unzipSync, strFromU8 } from 'fflate';
const dom = new JSDOM('');
for (const key of ['window', 'document', 'Node', 'Element', 'HTMLElement']) globalThis[key] = dom.window[key];
const { createTemplateResume } = await import('../src/lib/template-resume.ts');
const { createDocx } = await import('../src/lib/docx-export.ts');
const read = async data => {
  const bytes = new Uint8Array(await (await createDocx(data)).arrayBuffer());
  const files = unzipSync(bytes);
  const xml = strFromU8(files['word/document.xml']);
  const document = new dom.window.DOMParser().parseFromString(xml, 'text/xml');
  return { files, document, xml };
};
const nodes = (root, name) => [...root.getElementsByTagNameNS('*', name)];

test('Word preserves left sidebar content and portrait beside main content', async () => {
  const data = createTemplateResume('gengar');
  const { files, document, xml } = await read(data);
  const cells = nodes(document, 'tc');
  expect(cells).toHaveLength(2);
  expect(cells[0].textContent).toContain('David Kowalski');
  expect(cells[0].textContent).toContain('Unity Engine');
  expect(cells[0].textContent).toContain('Polish');
  expect(cells[0].textContent).toContain('Unity Certified Expert');
  expect(cells[1].textContent).toContain('Cascade Studios');
  expect(cells[1].textContent).not.toContain('Unity Certified Expert');
  expect(Object.keys(files).some(name => name.startsWith('word/media/'))).toBe(true);
  expect(xml).not.toContain('<w:cantSplit/>');
});

test('Word retains right sidebar and only outputs nested list paragraphs once', async () => {
  const data = createTemplateResume('chikorita');
  data.sections.experience.items[0].description = '<ul><li><p>Unique bullet sentence</p></li><li><p>Second bullet</p></li></ul>';
  data.sections.experience.items[0].roles = [{id:'promotion',position:'Principal Engineer',period:'2025',description:'<p>Promotion details</p>'}];
  data.sections.languages.hidden = true;
  const {document} = await read(data);
  const cells = nodes(document, 'tc');
  expect(cells[1].textContent).toContain('Unity Engine');
  expect(cells[1].textContent).not.toContain('Polish');
  expect(cells[0].textContent).toContain('Principal Engineer');
  const paragraphs = nodes(document, 'p');
  expect(paragraphs.filter(p => p.textContent === 'Unique bullet sentence')).toHaveLength(1);
  expect(paragraphs.find(p => p.textContent === 'Unique bullet sentence').getElementsByTagNameNS('*','numPr').length).toBe(1);
});

test('Word keeps full-width documents and single-column templates without dropping sidebar items', async () => {
  for (const template of ['gengar', 'lapras']) {
    const data = createTemplateResume(template);
    if (template === 'gengar') data.metadata.layout.pages[0].fullWidth = true;
    const {document} = await read(data);
    expect(nodes(document, 'tbl')).toHaveLength(0);
    expect(document.documentElement.textContent).toContain('Unity Engine');
    expect(document.documentElement.textContent).toContain('Cascade Studios');
  }
});

test('Onyx, Kakuna and Meowth export skills in the right column', async () => {
  for (const template of ['onyx', 'kakuna', 'meowth']) {
    const {document} = await read(createTemplateResume(template));
    const cells = nodes(document, 'tc');
    expect(cells).toHaveLength(2);
    expect(cells[0].textContent).toContain('Cascade Studios');
    expect(cells[1].textContent).toContain('Unity Engine');
    expect(cells[1].textContent).toContain('Polish');
  }
});
