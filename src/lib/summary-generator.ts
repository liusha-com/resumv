export function draftSummary(role: string, skills: string, evidence: string, starting=false) {
 const clean=(s:string)=>s.trim().replace(/\s+/g,' ').replace(/[.!?]+$/,'');
 const r=clean(role), s=clean(skills), e=clean(evidence);
 if(!r||!s||!e) throw new Error('Add a role, relevant skills, and one factual contribution.');
 return `${starting?'Seeking a role as a ':''}${r}${starting?'': ' with experience in'}${starting?', bringing skills in':' '} ${s}. ${e}.`.replace(/ {2,}/g,' ');
}
