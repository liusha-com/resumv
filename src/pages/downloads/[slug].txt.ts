import { examples } from '../../data/content';
import type { APIRoute } from 'astro';
export function getStaticPaths(){return examples.map(role=>({params:{slug:`${role.slug}-template`},props:{role}}));}
export const GET: APIRoute = ({props}) => {
 const {role:r}=props;
 const text=`${r.title.toUpperCase()} RESUME TEMPLATE\n\n[Your name]\n[Email] | [Phone] | [Location]\n\nSUMMARY\n[Your relevant strengths and evidence]\n\nSKILLS\n[Skills you can demonstrate]\n\nEXPERIENCE\n[Title] - [Organization] - [Dates]\n- [Action, context, and supported result]\n- [Relevant responsibility and scope]\n\nPROJECTS\n[Project name and your contribution]\n\nEDUCATION\n[Qualification, institution, completion status]\n\nCREDENTIALS (if relevant)\n[Exact credential, issuer, date/status]\n\nFILLING NOTES - REMOVE BEFORE APPLYING\n${r.focus}\nAvoid: ${r.avoid}\nDelete every bracketed prompt and unused section before submitting.`;
 return new Response(text+'\n',{headers:{'Content-Type':'text/plain; charset=utf-8','X-Robots-Tag':'noindex'}});
};
