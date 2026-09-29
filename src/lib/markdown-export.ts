import { cleanHtml, sectionNames, type ResumeData } from './resume-model';

const escape = (text: string) => text.replace(/([\\`*_{}\[\]<>#!|~])/g, '\\$1');
const link = (label: string, url: string) => /^(https?:\/\/|mailto:|tel:)/i.test(url)
  ? `[${escape(label || url)}](<${url.replace(/[<>\s]/g, c => encodeURIComponent(c))}>)`
  : escape(label || url);

function richMarkdown(html: string): string {
  const root = document.createElement('div');
  root.innerHTML = cleanHtml(html);
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return escape(node.textContent || '');
    if (!(node instanceof Element)) return '';
    const content = () => [...node.childNodes].map(walk).join('');
    switch (node.tagName) {
      case 'BR': return '  \n';
      case 'P': return `${content()}\n\n`;
      case 'STRONG': case 'B': return `**${content()}**`;
      case 'EM': case 'I': return `*${content()}*`;
      case 'S': return `~~${content()}~~`;
      case 'A': return link(node.textContent || '', node.getAttribute('href') || '');
      case 'UL': case 'OL': return '\n' + [...node.children].map((li, index) => {
        const prefix = node.tagName === 'OL' ? `${index + 1}. ` : '- ';
        return prefix + walk(li).trim().replace(/\n/g, '\n' + ' '.repeat(prefix.length));
      }).join('\n') + '\n\n';
      default: return content();
    }
  };
  return [...root.childNodes].map(walk).join('').trim();
}

export function exportMarkdown(data: ResumeData): string {
  const blocks = [
    data.basics.name ? `# ${escape(data.basics.name)}` : '',
    escape(data.basics.headline),
    [data.basics.email, data.basics.phone, data.basics.location].filter(Boolean).map(escape).join(' · '),
    data.basics.website.url ? link(data.basics.website.label, data.basics.website.url) : '',
  ];
  const ids = new Set(data.metadata.layout.pages.flatMap(page => [...page.main, ...page.sidebar]));
  for (const id of ids) {
    if (id === 'summary') {
      if (!data.summary.hidden && data.summary.content) {
        if (data.summary.showHeading !== false) blocks.push(`## ${escape(data.summary.title || 'Summary')}`);
        blocks.push(richMarkdown(data.summary.content));
      }
      continue;
    }
    const section = id in data.sections
      ? data.sections[id as keyof ResumeData['sections']]
      : data.customSections.find(s => s.id === id);
    if (!section || section.hidden) continue;
    const items = section.items.filter(item => !item.hidden);
    if (!items.length) continue;
    if (section.showHeading !== false) blocks.push(`## ${escape(section.title || sectionNames[id] || 'Additional information')}`);
    for (const item of items) {
      const fields = item as unknown as Record<string, unknown>;
      const titleKey = ['company', 'school', 'name', 'title', 'language', 'network', 'organization'].find(key => fields[key]);
      if (titleKey) blocks.push(`### ${escape(String(fields[titleKey]))}`);
      for (const [key, value] of Object.entries(fields)) {
        if (['id', 'hidden', 'icon', 'iconColor', 'level', 'website', 'roles', titleKey].includes(key)) continue;
        if (['description', 'content'].includes(key) && typeof value === 'string') blocks.push(richMarkdown(value));
        else if (typeof value === 'string' && value) blocks.push(escape(value));
        else if (Array.isArray(value) && value.length) blocks.push(value.map(v => escape(String(v))).join(', '));
      }
      const website = fields.website as {url?: string; label?: string} | undefined;
      if (website?.url) blocks.push(link(website.label || '', website.url));
      if (Array.isArray(fields.roles)) for (const role of fields.roles) {
        if (role.hidden) continue;
        if (role.position) blocks.push(`#### ${escape(role.position)}`);
        if (role.period) blocks.push(escape(role.period));
        if (role.description) blocks.push(richMarkdown(role.description));
      }
    }
  }
  return blocks.filter(Boolean).join('\n\n') + '\n';
}
