export function setupCheckerImport() {
 const input=document.querySelector<HTMLInputElement>('#check-file')!;
 const text=document.querySelector<HTMLTextAreaElement>('#check-text')!;
 const status=document.querySelector<HTMLElement>('#check-import-status')!;
 const choose=document.querySelector<HTMLButtonElement>('#check-choose')!;
 const run=document.querySelector<HTMLButtonElement>('#run-check')!;
 const saved=document.querySelector<HTMLButtonElement>('#check-saved')!;
 const zone=document.querySelector<HTMLElement>('#check-dropzone')!;
 const result=document.querySelector<HTMLElement>('#check-result')!;
 const initial=result.innerHTML;
 let busy=false;
 text.addEventListener('input',()=>{result.innerHTML=initial;});
 document.querySelector('#check-job')!.addEventListener('input',()=>{result.innerHTML=initial;});
 choose.addEventListener('click',()=>input.click());
 const load=async(file:File)=>{
   if(busy)return;
   busy=true; text.readOnly=true;choose.disabled=run.disabled=saved.disabled=true;
   zone.setAttribute('aria-busy','true');status.dataset.state='loading';status.textContent=`Reading ${file.name}…`;
   try {
     const {importResumeFile}=await import('../lib/resume-import');
     const parsed=await importResumeFile(file,message=>status.textContent=message);
     text.value=parsed.text;result.innerHTML=initial;
     status.dataset.state='success';
     status.textContent=`Imported ${file.name} · ${parsed.text.split(/\s+/).length} words. Review the text below before checking. ${parsed.warnings.join(' ')}`;
   }catch(e){status.dataset.state='error';status.textContent=e instanceof Error?e.message:'Could not read this file. Try another file.';}
   finally{busy=false;text.readOnly=false;choose.disabled=run.disabled=saved.disabled=false;zone.setAttribute('aria-busy','false');input.value='';}
 };
 input.addEventListener('change',()=>{if(input.files?.[0])void load(input.files[0]);});
 for(const event of ['dragenter','dragover'])zone.addEventListener(event,e=>{e.preventDefault();zone.classList.add('dragging');});
 zone.addEventListener('dragleave',()=>zone.classList.remove('dragging'));
 zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('dragging');if(busy)return;
   if(e.dataTransfer?.files.length!==1){status.dataset.state='error';status.textContent='Import one resume at a time.';return;}
   void load(e.dataTransfer.files[0]);
 });
 saved.addEventListener('click',()=>{result.innerHTML=initial;status.textContent='';});
}
