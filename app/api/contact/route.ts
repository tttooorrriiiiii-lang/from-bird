export const runtime="nodejs";
const fail=(error:string,status:number)=>Response.json({error},{status});
export async function POST(req:Request){
  if(req.headers.get("origin")!==new URL(req.url).origin)return fail("このサイトのフォームから送信してください。",403);
  if(!req.headers.get("content-type")?.includes("application/json"))return fail("形式が不正です。",415);
  const raw=await req.text();
  if(raw.length>15000)return fail("入力内容が長すぎます。",413);
  let data:Record<string,unknown>;
  try{data=JSON.parse(raw);if(!data||Array.isArray(data)||typeof data!=="object")throw Error();}catch{return fail("入力内容を確認してください。",400)}
  const val=(key:string)=>typeof data[key]==="string"?(data[key] as string).trim():"";
  const name=val("name"),email=val("email"),subject=val("subject"),message=val("message"),requestId=val("requestId");
  if(val("website"))return fail("送信できませんでした。",400);
  if(!name||name.length>100||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!message||message.length>5000||!["サービスについて","作品・ツールについて","コラボレーションについて","その他"].includes(subject)||! /^[0-9a-f-]{36}$/i.test(requestId))return fail("入力内容を確認してください。",400);
  const key=process.env.RESEND_API_KEY,to=process.env.CONTACT_TO_EMAIL,from=process.env.CONTACT_FROM_EMAIL;
  if(!key||!to||!from)return fail("現在フォームの送信受付を準備中です。時間をおいてお試しください。",503);
  try{
    const res=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json","Idempotency-Key":`contact-${requestId}`},body:JSON.stringify({from,to:[to],reply_to:email,subject:`[FROM BIRD] ${subject}`,text:`お名前：${name}\nメール：${email}\n\n${message}`}),signal:AbortSignal.timeout(12000)});
    const result=await res.json();
    if(!res.ok||!result.id)return fail("送信できませんでした。時間をおいてお試しください。",502);
    return Response.json({id:result.id});
  }catch{return fail("通信に失敗しました。時間をおいてお試しください。",502)}
}
