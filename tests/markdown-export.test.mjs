import { expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('');
for (const key of ['window', 'document', 'Node', 'Element', 'HTMLElement']) globalThis[key] = dom.window[key];
const { sampleResume } = await import('../src/lib/resume-model.ts');
const { exportMarkdown } = await import('../src/lib/markdown-export.ts');

test('Markdown preserves rich content, links, section order and custom sections without hidden data', () => {
  const data = sampleResume();
  data.basics.name = 'Ada [Example]';
  data.summary.content = '<p><strong>Built</strong> <em>useful</em> tools.</p><ul><li>One</li><li><a href="https://example.com">Project</a></li></ul>';
  data.sections.education.hidden = true;
  data.sections.experience.items[0].hidden = true;
  data.sections.experience.items[0].company = 'Hidden company sentinel';
  const markdown = exportMarkdown(data);
  expect(markdown).toStartWith('# Ada \\[Example\\]');
  expect(markdown).toContain('**Built** *useful* tools.');
  expect(markdown).toContain('- One\n- [Project](<https://example.com>)');
  expect(markdown).toContain('## Cover Letter');
  expect(markdown).not.toContain('University of Washington');
  expect(markdown).not.toContain('Hidden company sentinel');
  expect(markdown).not.toContain('<p>');
  expect(markdown.indexOf('## Summary')).toBeLessThan(markdown.indexOf('## Projects'));
});

test('Markdown skips empty sections and respects heading visibility', () => {
  const data = sampleResume();
  data.summary.showHeading = false;
  data.sections.projects.items = [];
  const markdown = exportMarkdown(data);
  expect(markdown).not.toContain('## Summary');
  expect(markdown).not.toContain('## Projects');
  expect(markdown).toContain('Passionate game developer');
});
