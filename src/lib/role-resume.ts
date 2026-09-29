import { examples } from '../data/content';
import { newResume, emptyItem, textToHtml, type ResumeData } from './resume-model';
import { createTemplateResume } from './template-resume';

export function createRoleResume(slug: string, blank = false): ResumeData {
  const role = examples.find(r => r.slug === slug);
  if (!role) throw new Error('Unknown role');
  const d = newResume(role.template);
  const entryLevel = role.category === 'Entry level' || role.slug === 'nursing-student';
  // Borrow the gallery's design, keeping only this role's own content.
  d.metadata = structuredClone(createTemplateResume(role.template).metadata);
  d.metadata.layout.pages = [{fullWidth:false, main: entryLevel
    ? ['summary','education','experience','projects']
    : ['summary','experience','projects'], sidebar: entryLevel
    ? ['skills','certifications','profiles','languages','awards','publications','volunteer','interests','references']
    : ['skills','education','certifications','profiles','languages','awards','publications','volunteer','interests','references']}];
  if (role.slug === 'actor') d.sections.experience.title = 'Selected performance experience';
  if (entryLevel) d.sections.experience.title = 'Projects & volunteer experience';
  d.basics.headline = role.title;
  d.basics.name = blank ? '' : 'Jordan Taylor';
  d.basics.email = blank ? '' : 'jordan.taylor@example.com';
  d.basics.phone = blank ? '' : '+1 (202) 555-0147';
  d.basics.location = blank ? '' : 'Austin, TX';
  d.summary.content = blank ? '' : textToHtml(role.summary);
  d.sections.experience.items = [{...emptyItem('experience'), position:blank?'':role.title,
    company:blank?'':role.company, period:blank?'':'2023 – Present', location:blank?'':'Austin, TX',
    description:blank?'':`<ul>${role.bullets.map(b=>`<li>${textToHtml(b)}</li>`).join('')}</ul>`}] as ResumeData['sections']['experience']['items'];
  d.sections.education.items = [{...emptyItem('education'), degree:blank?'':role.degree,
    school:blank?'':'Example School / Training Provider', period:blank?'':role.educationDate}] as ResumeData['sections']['education']['items'];
  d.sections.skills.items = [{...emptyItem('skills'), name:'Relevant skills',
    keywords:blank?[]:role.skills.split(', '),level:0}] as ResumeData['sections']['skills']['items'];
  d.sections.projects.items = [{...emptyItem('projects'),name:blank?'':role.project,
    description:blank?'':textToHtml(role.projectDescription),period:blank?'':'2023'}] as ResumeData['sections']['projects']['items'];
  return d;
}
