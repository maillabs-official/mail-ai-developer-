const ORIGIN = 'https://appassets.androidplatform.net';
function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':ORIGIN,'Vary':'Origin','Cache-Control':'no-store'}})}
function safeEqual(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
export default {
 async fetch(request,env){
  const url=new URL(request.url),origin=request.headers.get('Origin');
  if(origin&&origin!==ORIGIN)return json({error:'Origin not allowed'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'86400'}});
  if(url.pathname==='/health'&&request.method==='GET')return json({status:'online',configured:!!(env.NVIDIA_API_KEY&&env.MAIL_ACCESS_TOKEN)});
  if(url.pathname!=='/chat'||request.method!=='POST')return json({error:'Not found'},404);
  if(!env.NVIDIA_API_KEY||!env.MAIL_ACCESS_TOKEN)return json({error:'Server not configured'},503);
  if(!safeEqual(request.headers.get('Authorization')||'','Bearer '+env.MAIL_ACCESS_TOKEN))return json({error:'Unauthorized'},401);
  const length=Number(request.headers.get('content-length')||0);if(length>16000)return json({error:'Request too large'},413);
  let data;try{const raw=await request.text();if(raw.length>16000)return json({error:'Request too large'},413);data=JSON.parse(raw)}catch{return json({error:'Invalid JSON'},400)}
  if(data.model!=='nemotron'||typeof data.message!=='string'||!data.message.trim()||data.message.length>6000)return json({error:'Invalid request'},400);
  try{
   const upstream=await fetch('https://integrate.api.nvidia.com/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+env.NVIDIA_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:env.NVIDIA_MODEL||'nvidia/nemotron-3-ultra-550b-a55b',messages:[{role:'user',content:data.message}],max_tokens:1024,stream:false}),signal:AbortSignal.timeout(45000)});
   if(!upstream.ok)return json({error:'AI provider unavailable ('+upstream.status+')'},502);
   const result=await upstream.json();return json({reply:result.choices?.[0]?.message?.content||'Tidak ada jawaban'});
  }catch{return json({error:'AI request failed'},502)}
 }
};