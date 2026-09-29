import { unzipSync, strFromU8 } from 'fflate';

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TEXT = 250_000;
export function validateResumeFile(file: Pick<File, 'name' | 'size'>) {
  const type = file.name.split('.').pop()?.toLowerCase();
  if (!['pdf','docx','txt'].includes(type || '')) throw Error('Choose a PDF, DOCX, or TXT file. Older .doc files must be saved as .docx first.');
  if (!file.size) throw Error('This file is empty. Choose another file.');
  if (file.size > MAX_FILE_BYTES) throw Error('Choose a file smaller than 10 MB.');
  return type!;
}
export function cleanExtractedText(text: string) {
  if (text.length > MAX_TEXT) throw Error('This document contains too much text. Import a shorter resume.');
  return text.replace(/\u0000/g,'').replace(/\r\n?/g,'\n').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}
export function extractDocxText(bytes: Uint8Array) {
  let total = 0;
  const files = unzipSync(bytes, {filter: entry => {
    if (!/^word\/(document|header\d*|footer\d*)\.xml$/.test(entry.name)) return false;
    total += entry.originalSize;
    if (total > 8 * 1024 * 1024) throw Error('The expanded document is too large. Save a shorter copy.');
    return true;
  }});
  if (!files['word/document.xml']) throw Error('This is not a readable DOCX file. Save it again in Word or export a PDF.');
  const parts = Object.keys(files).sort((a,b) => {
    const order = (s:string) => s.includes('/header') ? 0 : s.includes('/document') ? 1 : 2;
    return order(a)-order(b) || a.localeCompare(b);
  });
  const paragraphs: string[] = [];
  for (const path of parts) {
    const xml = strFromU8(files[path]);
    if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw Error('This DOCX contains unsupported XML. Export a PDF or plain text instead.');
    const doc = new DOMParser().parseFromString(xml,'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw Error('This DOCX is damaged. Save a new copy and try again.');
    const ns = doc.documentElement.namespaceURI || 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    const read = (node:Node):string => {
      if (node.nodeType !== 1) return '';
      const el=node as Element;
      if (el.namespaceURI===ns) {
        if (el.localName==='del' || el.localName==='instrText') return '';
        if (el.localName==='t') return el.textContent || '';
        if (el.localName==='tab') return '\t';
        if (el.localName==='br' || el.localName==='cr') return '\n';
      }
      return Array.from(el.childNodes).map(read).join('');
    };
    for (const paragraph of Array.from(doc.getElementsByTagNameNS(ns,'p'))) {
      // Text boxes can nest paragraphs; read only the inner paragraph once.
      if (paragraph.getElementsByTagNameNS(ns,'p').length) continue;
      const text=read(paragraph).trim();
      if(text) paragraphs.push(text);
    }
  }
  return cleanExtractedText(paragraphs.join('\n'));
}

type PdfTextItem = {str:string; transform:number[]; width:number; height:number; hasEOL?:boolean};
export function pdfItemsToText(items: unknown[]) {
  let output='',previous:PdfTextItem|undefined;
  for(const item of items){
    if(!item || typeof item!=='object' || !('str' in item)) continue;
    const current=item as PdfTextItem;
    if(previous && output && !output.endsWith('\n')) {
      const dy=Math.abs(current.transform[5]-previous.transform[5]);
      const gap=current.transform[4]-(previous.transform[4]+previous.width);
      if(dy>Math.max(2,Math.min(current.height,previous.height)*.5)) output+='\n';
      else if(gap>Math.max(1,previous.height*.12) && !/\s$/.test(output)) output+=' ';
    }
    output+=current.str;
    if(current.hasEOL) output+='\n';
    previous=current;
  }
  return output.trim();
}

export async function importResumeFile(file: File, progress: (message:string)=>void = ()=>{}) {
  const type=validateResumeFile(file);
  const warnings:string[]=[];
  let text='';
  if(type==='txt') text=cleanExtractedText(await file.text());
  if(type==='docx') {
    try {text=extractDocxText(new Uint8Array(await file.arrayBuffer()));}
    catch(e) {throw Error(e instanceof Error && /DOCX|document|XML/.test(e.message) ? e.message : 'Could not read this DOCX. It may be damaged or password-protected. Save an unlocked copy and try again.');}
  }
  if(type==='pdf') {
    const pdfjs=await import('pdfjs-dist');
    const {default:worker}=await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc=worker;
    const task=pdfjs.getDocument({data:await file.arrayBuffer(),useSystemFonts:true});
    try {
      const pdf=await task.promise;
      if(pdf.numPages>50) throw Error('This PDF has more than 50 pages. Import only the resume pages.');
      const pages:string[]=[];let empty=0;
      for(let number=1;number<=pdf.numPages;number++) {
        progress(`Reading PDF page ${number} of ${pdf.numPages}…`);
        const page=await pdf.getPage(number);
        const content=await page.getTextContent();
        const value=pdfItemsToText(content.items);
        if(!value.trim()) empty++;
        pages.push(value);page.cleanup();
        if(pages.join('\n').length>MAX_TEXT) throw Error('This PDF contains too much text. Import a shorter resume.');
      }
      text=cleanExtractedText(pages.join('\n\n'));
      if(!text) throw Error('No selectable text found. This PDF may be scanned. OCR is not available here; use a text-based PDF, DOCX, or paste your resume text.');
      if(empty) warnings.push(`${empty} page(s) had no selectable text and may contain scanned content.`);
      warnings.push('Check the extracted reading order, especially for columns and tables.');
    } catch(e) {
      if(e instanceof Error && e.name==='PasswordException') throw Error('This PDF is password-protected. Import an unlocked copy.');
      if(e instanceof Error && e.name==='InvalidPDFException') throw Error('This PDF is damaged or invalid. Export a new PDF and try again.');
      if(e instanceof Error && /PDF|resume/.test(e.message)) throw e;
      throw Error('Could not read this PDF. It may be damaged. Export a new copy and try again.');
    } finally {await task.destroy();}
  }
  if(!text) throw Error('No readable text found. Use a text-based document or paste your resume.');
  return {text,warnings};
}
