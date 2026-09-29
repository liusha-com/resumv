// Adapted from Reactive Resume (MIT). Local-only font registration for resumv.
import type { ResumeData, Typography } from '@reactive-resume/schema/resume/data';
import { Font } from '#react-pdf-renderer';
import regular from '@fontsource/lato/files/lato-latin-400-normal.woff?url';
import bold from '@fontsource/lato/files/lato-latin-700-normal.woff?url';
import italic from '@fontsource/lato/files/lato-latin-400-italic.woff?url';
import boldItalic from '@fontsource/lato/files/lato-latin-700-italic.woff?url';
let registered = false;
export const resumeContentContainsCJK = (_data: ResumeData) => false;
export const resumeContentScripts = (_data: ResumeData) => new Set<never>();
export const registerFonts = (typography: Typography, ..._args: unknown[]): Typography => {
  if (!registered) {
    Font.register({family:'Lato', fonts:[{src:regular,fontWeight:400},{src:bold,fontWeight:700},{src:italic,fontWeight:400,fontStyle:'italic'},{src:boldItalic,fontWeight:700,fontStyle:'italic'}]});
    registered = true;
  }
  const safeFamily=(family:string)=>['Lato','Helvetica','Times-Roman','Courier'].includes(family)?family:'Lato';
  return {...typography,body:{...typography.body,fontFamily:safeFamily(typography.body.fontFamily)},heading:{...typography.heading,fontFamily:safeFamily(typography.heading.fontFamily)}};
};
