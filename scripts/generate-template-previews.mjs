// Run with Bun; PDFTOPPM must point to a Poppler pdftoppm executable.
import { plugin } from 'bun';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync, mkdtempSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { JSDOM } from 'jsdom';
const require = createRequire(import.meta.url);
plugin({name:'local-pdf-assets',setup(build){
 build.onResolve({filter:/\?(url|raw)$/},args=>({path:args.path,namespace:'pdf-assets'}));
 build.onLoad({filter:/.*/,namespace:'pdf-assets'},args=>{
  const name=args.path.replace(/\?(url|raw)$/,'');
  const path=require.resolve(name);
  return {contents:`export default ${JSON.stringify(args.path.endsWith('?raw')?readFileSync(path,'utf8'):path)}`,loader:'js'};
 });
}});
const dom=new JSDOM('');
Object.assign(globalThis,{window:dom.window,document:dom.window.document,DOMParser:dom.window.DOMParser});
const {createResumePdfBlob}=await import('../src/vendor/reactive-resume/pdf/browser');
const {createTemplateResume}=await import('../src/lib/template-resume');
const {createRoleResume}=await import('../src/lib/role-resume');
const {reactiveTemplates}=await import('../src/data/templates');
const {examples}=await import('../src/data/content');
const output=resolve('public/templates');
mkdirSync(join(output,'roles'),{recursive:true});
const temp=mkdtempSync(join(tmpdir(),'resumv-previews-'));
const jobs=[...reactiveTemplates.map(t=>({path:t.id,data:createTemplateResume(t.id)})),...examples.map(r=>({path:`roles/${r.slug}`,data:createRoleResume(r.slug)}))];
for(const job of jobs){
 const pdfPath=join(temp,job.path.replaceAll('/','-')+'.pdf');
 const blob=await createResumePdfBlob({data:job.data});
 writeFileSync(pdfPath,new Uint8Array(await blob.arrayBuffer()));
 execFileSync(process.env.PDFTOPPM||'pdftoppm',['-f','1','-singlefile','-scale-to','1000','-jpeg','-jpegopt','quality=90',pdfPath,join(output,job.path)]);
 console.log(`Generated ${job.path}`);
}
writeFileSync(join(output,'preview-manifest.json'),JSON.stringify({generator:'scripts/generate-template-previews.mjs',items:jobs.map(j=>({path:`/templates/${j.path}.jpg`,template:j.data.metadata.template,name:j.data.basics.name,headline:j.data.basics.headline}))},null,2)+'\n');


