import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
const PORT=Number(process.env.PORT||8080);
const NVIDIA_KEY=process.env.NVIDIA_API_KEY;
const ACCESS_TOKEN=process.env.MAIL_ACCESS_TOKEN;
const MODEL=process.env.NVIDIA_MODEL||'nvidia/nemotron-3-ultra-550b-a55b';
const allowed=process.env.ALLOWED_ORIGIN||'https://appassets.androidplatform.net';
const equal=(a,b)=>{const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&timingSafeEqual(x,y)};
const send=(res,status,data,origin)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':origin,'Vary':'Origin','Cache-Control':'no-store'});res.end(JSON.stringify(data))};
export function makeServer({key=NVIDIA_KEY,token=ACCESS_TOKEN,fetcher=fetch}={}){
 return http.createServer(async(req,res)=>{
  const origin=req.headers.origin||'';
  if(origin && origin!==allowed){send(res,403,{error:'Origin not allowed'},allowed);return}
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Vary':'Origin'});res.end();return}
  if(req.url==='/health'&&req.method==='GET'){send(res,200,{status:'online',configured:Boolean(key&&token)},allowed);return}
  if(req.url!=='/chat'||req.method!=='POST'){send(res,404,{error:'Not found'},allowed);return}
  if(!key||!token){send(res,503,{error:'Server not configured'},allowed);return}
  if(!equal(req.headers.authorization?.replace(/^Bearer /i,''),token)){send(res,401,{error:'Unauthorized'},allowed);return}
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>16000){send(res,413,{error:'Request too large'},allowed);return}}
  let payload;try{payload=JSON.parse(raw)}catch{send(res,400,{error:'Invalid JSON'},allowed);return}
  if(payload.model!=='nemotron'||typeof payload.message!=='string'||!payload.message.trim()||payload.message.length>6000){send(res,400,{error:'Invalid request'},allowed);return}
  try{
   const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),45000);
   let upstream;try{upstream=await fetcher('https://integrate.api.nvidia.com/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,messages:[{role:'user',content:payload.message}],max_tokens:1024,stream:false}),signal:controller.signal})}finally{clearTimeout(timeout)}
   if(!upstream.ok){send(res,502,{error:'AI provider unavailable ('+upstream.status+')'},allowed);return}
   const result=await upstream.json();send(res,200,{reply:result.choices?.[0]?.message?.content||'Tidak ada jawaban'},allowed);
  }catch{send(res,502,{error:'AI request failed'},allowed)}
 });
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){makeServer().listen(PORT,'0.0.0.0',()=>console.log('MAIL AI backend listening on '+PORT))}
