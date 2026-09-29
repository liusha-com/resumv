import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import assert from 'node:assert/strict';
import { parse } from 'node-html-parser';
const root=resolve('dist');
const walk=p=>readdirSync(p).flatMap(n=>statSync(join(p,n)).isDirectory()?walk(join(p,n)):[join(p,n)]);
const pages=walk(root).filter(p=>p.endsWith('.html'));
const titles=new Set(),descriptions=new Set(),docs=new Map();
for(const file of pages){
 const path='/'+relative(root,file).replaceAll('\\','/').replace(/index\.html$/,'');
 const doc=parse(readFileSync(file,'utf8'));docs.set(path,doc);
 assert.equal(doc.querySelector('html').getAttribute('lang'),'en',path);
 assert.equal(doc.querySelectorAll('link[rel=canonical]').length,1,path);
 assert.equal(doc.querySelector('link[rel=canonical]').getAttribute('href'),'https://resumv.com'+(path==='/404.html'?'/404/':path==='/cv/'?'/builder/':path),path);
 for(const script of doc.querySelectorAll('script[type="application/ld+json"]')) JSON.parse(script.textContent);
 if(!doc.querySelector('meta[name=robots]')?.getAttribute('content').includes('noindex')){
  const title=doc.querySelector('title').textContent,desc=doc.querySelector('meta[name=description]').getAttribute('content');
  assert(title&&desc,path);assert(!titles.has(title),'Duplicate title: '+path);assert(!descriptions.has(desc),'Duplicate description: '+path);
  titles.add(title);descriptions.add(desc);
  assert.equal(doc.querySelectorAll('h1').length,1,path);
 }
 for(const node of doc.querySelectorAll('a[href],img[src],script[src],link[href]')){
  const raw=node.getAttribute('href')||node.getAttribute('src');
  if(!raw?.startsWith('/')||raw.startsWith('//'))continue;
  const url=new URL(raw,'https://resumv.com');
  const target=join(root,decodeURIComponent(url.pathname));
  assert(existsSync(target)||existsSync(join(target,'index.html')),`${path} -> ${raw}`);
 }
}
const mapped=JSON.parse(readFileSync('src/data/seo/keyword-map.json','utf8'));
for(const row of mapped){const url=new URL(row.target_url,'https://resumv.com');const doc=docs.get(url.pathname);assert(doc,row.target_url);if(url.hash)assert(doc.querySelector(url.hash),row.target_url);}
const sitemap=parse(readFileSync(join(root,'sitemap.xml'),'utf8'));
for(const loc of sitemap.querySelectorAll('loc')){
 const path=new URL(loc.textContent).pathname;assert(docs.has(path),path);
 assert(!docs.get(path).querySelector('meta[name=robots]').getAttribute('content').includes('noindex'),path);
}
for(const path of ['/builder/','/cv/','/documents/'])assert(docs.get(path).querySelector('meta[name=robots]').getAttribute('content').includes('noindex'),path);
const roles=JSON.parse(readFileSync('src/data/roles.json','utf8'));
for(const role of roles){
 assert(readFileSync(join(root,`downloads/${role.slug}-template.txt`),'utf8').length>300);
 assert(!existsSync(join(root,`downloads/${role.slug}-example.txt`)));
 assert(docs.get(`/templates/${role.slug}/`).querySelector(`a[href="/builder/?example=${role.slug}&preset=blank"]`),role.slug);
 assert(docs.get(`/templates/${role.slug}/`).querySelector(`a.button.primary[href="/builder/?example=${role.slug}"]`),role.slug);
 assert(docs.get(`/templates/${role.slug}/`).textContent.includes(role.bullets[2]),role.slug);
 assert(docs.get(`/templates/${role.slug}/`).querySelector(`img[src="/templates/roles/${role.slug}.jpg"]`),role.slug);
}
assert(![...docs.keys()].some(path=>path.startsWith('/examples/')));
console.log(`Passed: ${pages.length} HTML pages, ${sitemap.querySelectorAll('loc').length} sitemap URLs, ${mapped.length} keyword targets, ${roles.length} TXT downloads.`);

