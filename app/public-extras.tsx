"use client";
import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";
type Article={id:string;title:string;body:string|null;link_url:string|null;published_at:string|null};
export function NewsDetail({id,fallback=[]}:{id:string;fallback?:Article[]}){
  const [article,setArticle]=useState<Article|null>(null);
  const [state,setState]=useState("loading");
  useEffect(()=>{let active=true;
    const sample=fallback.find(item=>item.id===id);
    if(id.startsWith("fallback-")){setArticle(sample||null);setState(sample?"ready":"missing");return;}
    supabase.from("news").select("id,title,body,link_url,published_at").eq("status","published").eq("id",id).limit(1).then(({data,error})=>{
      if(!active)return;
      if(error){setState("error");return;}
      setArticle(data?.[0]||null);setState(data?.[0]?"ready":"missing");
    });return()=>{active=false};
  },[id]);
  return <article className="news-detail"><a href="/news">← NEWS一覧へ</a><p className="eyebrow">FROM BIRD / NEWS</p>
    {state==="loading"?<p role="status">記事を読み込み中…</p>:state==="error"?<><h1>記事を読み込めませんでした</h1><p>時間をおいて再度お試しください。</p></>:!article?<h1>記事が見つかりませんでした</h1>:<>
    <time>{article.published_at?new Date(article.published_at).toLocaleDateString("ja-JP"):""}</time><h1>{article.title}</h1>
    <div className="news-body">{article.body||"詳しい内容は近日掲載予定です。"}</div>
    {article.link_url&&/^https?:\/\//i.test(article.link_url)&&<a href={article.link_url} target="_blank" rel="noreferrer">関連ページを見る ↗</a>}</>}
  </article>;
}
export function ContactComplete(){
  const [receipt,setReceipt]=useState<string|null>(null);
  useEffect(()=>setReceipt(sessionStorage.getItem("frombird-contact-receipt")),[]);
  return <section className="contact-complete"><p>FROM BIRD / CONTACT</p><h1>{receipt?"お問い合わせを送信しました。":"お問い合わせ"}</h1>
    <p>{receipt?"ご連絡ありがとうございます。内容を確認のうえ、ご入力のメールアドレスへお返事します。":"送信完了の記録がありません。お問い合わせフォームからご連絡ください。"}</p>
    {receipt&&<small>受付番号：{receipt}</small>}<nav><a href="/">サイトTOPへ →</a><a href="/contact">お問い合わせへ →</a></nav>
  </section>;
}
