import {examples,articles} from '../data/content';
import type { APIRoute } from 'astro';
export const GET: APIRoute=()=>{
 const paths=['/','/resume-builder/','/templates/','/advice/','/checker/','/about/','/privacy/','/help/','/contact/','/editorial-policy/','/licenses/','/tools/resume-summary-generator/',...examples.map(r=>`/templates/${r.slug}/`),...articles.map(a=>`/advice/${a.slug}/`)];
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(path=>`<url><loc>https://resumv.com${path}</loc></url>`).join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
