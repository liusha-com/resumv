import {expect,test} from 'bun:test';
import {JSDOM} from 'jsdom';
import {zipSync,strToU8} from 'fflate';
import {Document,Packer,Paragraph,TextRun,Header,Table,TableRow,TableCell} from 'docx';
const dom=new JSDOM('');globalThis.DOMParser=dom.window.DOMParser;
const {extractDocxText,validateResumeFile,pdfItemsToText,importResumeFile}=await import('../src/lib/resume-import.ts');
test('extracts real DOCX paragraphs, tables and contact header without merging text runs',async()=>{
 const document=new Document({sections:[{headers:{default:new Header({children:[new Paragraph('jordan@example.com')]})},children:[new Paragraph({children:[new TextRun('Jordan '),new TextRun({text:'Taylor',bold:true})]}),new Paragraph('Experience'),new Table({rows:[new TableRow({children:[new TableCell({children:[new Paragraph('Built 12 projects')]})]})]})]}]});
 const bytes=new Uint8Array(await (await Packer.toBlob(document)).arrayBuffer());
 const text=extractDocxText(bytes);
 expect(text).toContain('jordan@example.com');expect(text).toContain('Jordan Taylor\nExperience\nBuilt 12 projects');
});
test('imports TXT and rejects unsupported, empty and oversized files',async()=>{
 expect((await importResumeFile(new File(['Jordan Taylor\r\nSkills\r\nSQL'], 'RESUME.TXT'))).text).toBe('Jordan Taylor\nSkills\nSQL');
 expect(()=>validateResumeFile({name:'resume.doc',size:100})).toThrow('DOCX');
 expect(()=>validateResumeFile({name:'resume.pdf',size:0})).toThrow('empty');
 expect(()=>validateResumeFile({name:'resume.docx',size:11*1024*1024})).toThrow('10 MB');
});
test('rejects damaged and over-expanded DOCX data',()=>{
 expect(()=>extractDocxText(new Uint8Array([1,2,3]))).toThrow();
 const oversized=zipSync({'word/document.xml':strToU8('a'.repeat(9*1024*1024))});
 expect(()=>extractDocxText(oversized)).toThrow('too large');
 const malformed=zipSync({'word/document.xml':strToU8('<broken>')});
 expect(()=>extractDocxText(malformed)).toThrow('damaged');
});
test('keeps PDF words and lines readable, including split email runs',()=>{
 const item=(str,x,y,width,hasEOL=false)=>({str,transform:[10,0,0,10,x,y],width,height:10,hasEOL});
 const text=pdfItemsToText([item('jordan',0,100,30),item('@example.com',30,100,60,true),item('Experience',0,80,50,true),item('Built',0,60,20),item('12 projects',25,60,55)]);
 expect(text).toBe('jordan@example.com\nExperience\nBuilt 12 projects');
});
