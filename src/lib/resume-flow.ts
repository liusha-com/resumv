import type { ResumeData } from '../vendor/reactive-resume/schema/resume/data';

/** Remove manual resume page groups; PDF overflow supplies physical page breaks. */
export function flowResumeSections(data: ResumeData) {
  const main: string[] = [], sidebar: string[] = [];
  const seen = new Set<string>();
  const fullWidth = data.metadata.layout.pages[0]?.fullWidth ?? false;
  for (const page of data.metadata.layout.pages) {
    for (const column of ['main', 'sidebar'] as const) {
      for (const id of page[column]) {
        if (seen.has(id)) continue;
        seen.add(id);
        (column === 'sidebar' && !fullWidth ? sidebar : main).push(id);
      }
    }
  }
  data.metadata.layout.pages = [{ fullWidth, main, sidebar }];
  for (const section of [data.summary, ...Object.values(data.sections), ...data.customSections]) {
    section.startOnNewPage = false;
    section.keepTogether = false;
  }
}
