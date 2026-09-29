import { newResume, sampleResume } from './resume-model';

// Shared by the template gallery previews and the builder's template links.
export function createTemplateResume(template: string, blank = false) {
  const design = newResume(template);
  if (blank) return design;
  const data = sampleResume();
  data.metadata.template = design.metadata.template;
  data.metadata.design.colors.primary = design.metadata.design.colors.primary;
  return data;
}
