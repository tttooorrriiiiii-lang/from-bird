"use client";
import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { ContactComplete, NewsDetail } from "./public-extras";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { HistoryItem, ToolSlug, Work } from "@/lib/types";

const tools: Array<{ slug: ToolSlug; no: string; ja: string; en: string; text: string; prompt: string }> = [
  {slug:"words",no:"01",ja:"ことば",en:"WORDS",text:"言葉から考える。新しいつながりを見つける。",prompt:"離れているように見える、ふたつの言葉を選んでください。"},
  {slug:"color",no:"02",ja:"色",en:"COLOR",text:"色から考える。世界の見え方を変えてみる。",prompt:"今の気分を、色の名前を使わずに表してみてください。"},
  {slug:"shape",no:"03",ja:"かたち",en:"SHAPE",text:"かたちから考える。見えない構造を見つける。",prompt:"身近なものを、丸・三角・四角に分けて見てください。"},
  {slug:"story",no:"04",ja:"物語",en:"STORY",text:"物語から考える。まだ見ぬ世界をつくる。",prompt:"「まだ誰も知らない朝」から始まる物語を書いてください。"},
  {slug:"think",no:"05",ja:"問い",en:"THINK",text:"問いから考える。思考をひらく。",prompt:"今日、当たり前だと思っていたことを一つ疑ってみてください。"},
];
const avatars=[
  {id:"face-short",label:"好奇心家",src:"/avatars/face-1.png"},
  {id:"face-bob",label:"照れ屋",src:"/avatars/face-2.png"},
  {id:"face-wave",label:"ひらめき屋",src:"/avatars/face-3.png"},
  {id:"face-cap",label:"楽天家",src:"/avatars/face-4.png"},
  {id:"face-smile",label:"観察家",src:"/avatars/face-5.png"},
  {id:"face-cool",label:"夢想家",src:"/avatars/face-6.png"},
  {id:"face-curly",label:"思考家",src:"/avatars/face-7.png"},
  {id:"face-bird",label:"夜ふかし",src:"/avatars/face-8.png"},
] as const;
type AvatarId=(typeof avatars)[number]["id"];
const getPath=()=>typeof window==="undefined"?"/":window.location.pathname;
const go=(to:string)=>{window.history.pushState({},"",to);window.dispatchEvent(new PopStateEvent("popstate"))};
const getData=(u:User|null)=>({works:(u?.user_metadata?.frombird_works||[]) as Work[],history:(u?.user_metadata?.frombird_history||[]) as HistoryItem[]});
const nav=(to:string)=>(e:React.MouseEvent)=>{e.preventDefault();go(to)};
const viewpointByTool:Record<ToolSlug,string[]>={words:["連想する","結びつける"],color:["色で捉える","構成する"],shape:["抽象化する","構造を見る"],story:["物語にする","想像する"],think:["問い直す","比較する"]};

export default function MemberApp(){
  const [route,setRoute]=useState("/");const [user,setUser]=useState<User|null>(null);const [ready,setReady]=useState(false);
  useEffect(()=>{setRoute(getPath());const pop=()=>setRoute(getPath());addEventListener("popstate",pop);supabase.auth.getSession().then(({data})=>{setUser(data.session?.user||null);setReady(true)});const {data}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));return()=>{removeEventListener("popstate",pop);data.subscription.unsubscribe()}},[]);
  useEffect(()=>{if(ready&&!user&&["/mypage","/my-view","/tools","/my-works","/history"].some(x=>route.startsWith(x)))go("/login")},[ready,user,route]);
  if(!isSupabaseConfigured)return <main className="setup"><h1>FROM BIRD</h1><p>会員システムを準備中です。</p></main>;
  if(!ready)return <main className="setup"><span className="loader"/><p>読み込み中…</p></main>;
  if(["/login","/signup","/registration-complete","/forgot-password","/reset-password"].includes(route))return <Auth route={route} user={user}/>;
  if(route==="/")return <Home user={user}/>;
  if(["/projects","/news","/about","/contact","/contact/complete"].includes(route)||route.startsWith("/news/"))return <PublicPage route={route} user={user}/>;
  if(!user)return <Home user={null}/>;
  return <Shell route={route} user={user}><Protected route={route} user={user}/></Shell>;
}

function Logo(){return <a className="logo" href="/" onClick={nav("/")}><span>FROM BIRD</span><span className="logo-bird" aria-hidden="true">◆</span></a>}
function PublicHeader({user}:{user:User|null}){const [menuOpen,setMenuOpen]=useState(false);const move=(to:string)=>(e:React.MouseEvent)=>{e.preventDefault();setMenuOpen(false);go(to)};return <header className={`topbar public-topbar ${menuOpen?"menu-open":""}`}><Logo/><span className="tagline">考えることを、遊ぶ。</span><nav className="desktop-nav" aria-label="メインナビゲーション"><a href="/projects" onClick={nav("/projects")}>PROJECTS</a><a href="/news" onClick={nav("/news")}>NEWS</a><a href="/about" onClick={nav("/about")}>ABOUT</a><a href="/contact" onClick={nav("/contact")}>CONTACT</a></nav><a className="member-link" href={user?"/mypage":"/login"} onClick={nav(user?"/mypage":"/login")}><span className="member-link-full">{user?"MY PAGE":"ログイン / 新規登録"}</span><span className="member-link-short">{user?"MY PAGE":"ログイン"}</span></a><button className="menu-toggle" type="button" aria-label={menuOpen?"メニューを閉じる":"メニューを開く"} aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}><i/><i/><span>{menuOpen?"CLOSE":"MENU"}</span></button><nav className="mobile-menu" aria-label="スマートフォン用メニュー" aria-hidden={!menuOpen}><a href="/projects" onClick={move("/projects")}><b>01</b>PROJECTS<span>プロジェクト</span></a><a href="/news" onClick={move("/news")}><b>02</b>NEWS<span>ニュース</span></a><a href="/about" onClick={move("/about")}><b>03</b>ABOUT<span>FROM BIRDについて</span></a><a href="/contact" onClick={move("/contact")}><b>04</b>CONTACT<span>お問い合わせ</span></a><a className="mobile-member" href={user?"/mypage":"/login"} onClick={move(user?"/mypage":"/login")}><b>05</b>{user?"MY PAGE":"LOGIN / SIGN UP"}<span>{user?"マイページ":"ログイン・新規登録"}</span></a></nav></header>}
function PublicFooter(){return <footer><Logo/><nav><a href="/projects" onClick={nav("/projects")}>PROJECTS</a><a href="/news" onClick={nav("/news")}>NEWS</a><a href="/about" onClick={nav("/about")}>ABOUT</a><a href="/contact" onClick={nav("/contact")}>CONTACT</a></nav><div className="socials"><span>◎</span><span>𝕏</span><span>▶</span></div><small>© 2026 FROM BIRD</small></footer>}
type CmsContent = {
  id:string; title:string; slug:string; description:string|null; url:string|null;
  thumbnail_path:string|null; is_featured:boolean; sort_order:number;
};
type CmsNews = { id:string; title:string; body:string|null; link_url:string|null; published_at:string|null };
type CmsCategory = { id:string; name:string; slug:string; description:string|null; sort_order:number };

const categoryMeta:Record<string,{style:string;en:string}> = {
  kotoba:{style:"words",en:"WORDS"},words:{style:"words",en:"WORDS"},
  color:{style:"color",en:"COLOR"},shape:{style:"shape",en:"SHAPE"},
  story:{style:"story",en:"STORY"},think:{style:"think",en:"THINK"},
};
const fallbackCategories:CmsCategory[] = [
  {id:"fallback-words",name:"ことば",slug:"kotoba",description:"言葉から考える。新しいつながりを見つける。",sort_order:10},
  {id:"fallback-color",name:"色",slug:"color",description:"色から考える。世界の見え方を変えてみる。",sort_order:20},
  {id:"fallback-shape",name:"かたち",slug:"shape",description:"かたちから考える。見えない構造を見つける。",sort_order:30},
  {id:"fallback-story",name:"物語",slug:"story",description:"物語から考える。まだ見ぬ世界をつくる。",sort_order:40},
  {id:"fallback-think",name:"問い",slug:"think",description:"問いから考える。思考をひらく。",sort_order:50},
];
const fallbackProjects:CmsContent[] = [
  {id:"fallback-galaxy",title:"言葉銀河",slug:"kotoba-galaxy",description:"ふたつの言葉をつないで、物語をつくる。",url:"https://kotoba-galaxy.toriirena.chatgpt.site/",thumbnail_path:null,is_featured:true,sort_order:10},
  {id:"fallback-root",title:"言葉の根",slug:"kotoba-root",description:"ひとつの言葉を、分解してみる。",url:null,thumbnail_path:null,is_featured:true,sort_order:20},
  {id:"fallback-color",title:"色面構成ラボ",slug:"color-plane-lab",description:"色とかたちで、考える。",url:"https://iro-lab-tttooorrriiiiii-6991.vercel.app/",thumbnail_path:null,is_featured:true,sort_order:30},
  {id:"fallback-thought",title:"思考実験ゲーム",slug:"thought-experiment-game",description:"もしも、こうだったら？",url:null,thumbnail_path:null,is_featured:true,sort_order:40},
];
const fallbackNews:CmsNews[] = [
  {id:"fallback-news-1",title:"思考実験ゲームを公開しました",body:null,link_url:null,published_at:"2026-09-12T00:00:00+09:00"},
  {id:"fallback-news-2",title:"比較辞典をアップデート",body:null,link_url:null,published_at:"2026-09-08T00:00:00+09:00"},
  {id:"fallback-news-3",title:"FROM BIRDをはじめました",body:null,link_url:null,published_at:"2026-09-01T00:00:00+09:00"},
];

function projectKind(p:CmsContent){
  const key=(p.slug+" "+p.title).toLowerCase();
  if(key.includes("galaxy")||key.includes("銀河"))return "orbit";
  if(key.includes("root")||key.includes("言葉の根"))return "root";
  if(key.includes("color")||key.includes("色面"))return "blocks";
  if(key.includes("thought")||key.includes("思考実験"))return "stairs";
  return "cms-generic";
}
function projectThumb(path:string|null){
  if(!path)return "";
  if(/^https?:\/\//i.test(path)||path.startsWith("/"))return path;
  return `https://mqfrarevndipfspmmjas.supabase.co/storage/v1/object/public/frombird-cms/${path.replace(/^\/+/,"")}`;
}
function newsDate(value:string|null){
  if(!value)return "";
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return "";
  return new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"2-digit",day:"2-digit"}).format(d).replaceAll("/",".");
}

function Home({user}:{user:User|null}){
  const [projects,setProjects]=useState<CmsContent[]>(fallbackProjects);
  const [newsItems,setNewsItems]=useState<CmsNews[]>(fallbackNews);
  const [homeCategories,setHomeCategories]=useState<CmsCategory[]>(fallbackCategories);

  useEffect(()=>{
    let alive=true;
    (async()=>{
      const [contentsResult,newsResult,categoriesResult]=await Promise.all([
        supabase.from("contents")
          .select("id,title,slug,description,url,thumbnail_path,is_featured,sort_order")
          .eq("status","published").eq("is_featured",true)
          .order("sort_order",{ascending:true}).limit(12),
        supabase.from("news")
          .select("id,title,body,link_url,published_at")
          .eq("status","published").order("published_at",{ascending:false}).limit(5),
        supabase.from("categories")
          .select("id,name,slug,description,sort_order")
          .eq("is_active",true).order("sort_order",{ascending:true}).limit(12),
      ]);
      if(!alive)return;
      if(!contentsResult.error&&contentsResult.data?.length)setProjects(contentsResult.data as CmsContent[]);
      if(!newsResult.error&&newsResult.data?.length)setNewsItems(newsResult.data as CmsNews[]);
      if(!categoriesResult.error&&categoriesResult.data?.length)setHomeCategories(categoriesResult.data as CmsCategory[]);
    })();
    return()=>{alive=false};
  },[]);

  return <main className="home-original" id="top">
    <PublicHeader user={user}/>
    <section className="intro"><div className="intro-copy"><h1>今日は、<br/>どこから考える？</h1><p className="intro-sub">いつもの見方を、すこしだけずらしてみる。</p><span className="short-rule"/><p className="intro-en">SMALL EXPERIMENTS<br/>FOR ANOTHER VIEW.</p></div><figure className="hero-photo"><Image src="/from-bird-hero-v2.jpg" alt="青空を飛ぶ鳥" fill priority sizes="(max-width: 580px) 100vw, 46vw"/></figure><aside className="intro-side"><strong>FROM<br/>BIRD</strong><span className="side-line"/><p>THINK<br/>PLAY<br/>EXPLORE</p></aside></section>

    <section className="category-grid" aria-label="考える入口">
      {homeCategories.map((c,i)=>{
        const meta=categoryMeta[c.slug]||{style:"generic",en:"VIEW"};
        const href=c.slug==="kotoba"||c.slug==="words"?"https://kotoba.frombird.com/":"/login";
        return <a href={href} onClick={href.startsWith("http")?undefined:nav("/login")} className={`category-card ${meta.style}`} key={c.id}>
          <span className="card-no">{String(i+1).padStart(2,"0")}</span>
          <span className={`category-visual ${meta.style}-visual`} aria-hidden="true">{meta.style==="think"?"?":meta.style==="generic"?c.name.slice(0,1):""}</span>
          <h2>{c.name}</h2><strong>{meta.en}</strong><p>{c.description||"ここから、いつもの見方を少しずらしてみる。"}</p><span className="circle-arrow">→</span>
        </a>
      })}
    </section>

    <section className="daily-question" id="question"><div className="question-label"><h2>今日の問い</h2><span>TODAY&apos;S QUESTION</span></div><div className="question-copy"><p>「コーヒーの反対って、なんだろう？」</p><small>一つの問いから、いろんな世界がひらける。</small></div><a className="think-button" href="/tools/think" onClick={nav("/tools/think")}>考えてみる <span>→</span></a><div className="coffee-crop" aria-hidden="true"><img src="/from-bird-reference.jpeg" alt=""/></div></section>

    <section className="pickup" id="projects">
      <div className="section-title"><div><h2>ピックアップ</h2><span>PICK UP PROJECTS</span></div><a href="/projects" onClick={nav("/projects")}>すべてのプロジェクトを見る　→</a></div>
      <div className="pickup-grid">{projects.map(p=><ProjectCard project={p} key={p.id}/>)}</div>
    </section>

    <section className="brand-row" id="about"><div className="news" id="news"><h2>NEWS</h2><span className="short-rule"/><dl>
      {newsItems.map(n=><div key={n.id}><dt>{newsDate(n.published_at)}</dt><dd><a href={`/news/${encodeURIComponent(n.id)}`} onClick={nav(`/news/${encodeURIComponent(n.id)}`)}>{n.title}</a></dd></div>)}
      </dl><a href="/news" onClick={nav("/news")}>すべてのニュースを見る　→</a></div><div className="shadow-message"><p>見えないものを、<br/>少しだけ見てみるために。</p><span>FOR<br/>ANOTHER<br/>VIEW.</span></div><div className="shadow-photo" aria-hidden="true"><svg viewBox="411 1084 432 201" preserveAspectRatio="xMidYMid slice"><image href="/from-bird-reference.jpeg" x="0" y="0" width="1145" height="1374"/></svg></div><div className="brand-copy"><strong>FROM<br/>BIRD</strong><p>考えることを、遊ぶ。</p><span className="short-rule"/></div></section>
    <PublicFooter/>
  </main>
}

function ProjectCard({project:p}:{project:CmsContent}){const kind=projectKind(p),thumb=projectThumb(p.thumbnail_path),href=p.url||"#";return <a className="project" href={href} target={href==="#"?undefined:"_blank"} rel={href==="#"?undefined:"noreferrer"}><div className={`project-visual ${kind}`} aria-hidden="true">{thumb?<img className="cms-project-thumb" src={thumb} alt=""/>:null}{!thumb&&kind==="root"&&<><span className="root-core">木</span><i className="r1">葉</i><i className="r2">幹</i><i className="r3">根</i><i className="r4">森</i><i className="r5">枝</i></>}{!thumb&&kind==="stairs"&&<><span/><span/><span/><i/></>}{!thumb&&kind==="cms-generic"&&<b className="cms-generic-mark">FROM BIRD</b>}</div><div className="project-copy"><h3>{p.title}</h3><p>{p.description||"小さな実験をひらく。"}</p><span>→</span></div></a>}

function PublicPage({route,user}:{route:string;user:User|null}){return <main className={`public-page ${route==="/about"?"public-about":""}`}><PublicHeader user={user}/>{route==="/projects"&&<ProjectsPage/>}{route==="/news"&&<NewsPage/>}{route==="/about"&&<AboutPage/>}{route==="/contact"&&<ContactPage/>}{route==="/contact/complete"&&<ContactComplete/>}{route.startsWith("/news/")&&<NewsDetail key={route} id={route.slice(6)} fallback={fallbackNews}/>}<PublicFooter/></main>}
const connectionProject:CmsContent={id:"connection-project",title:"つながりの、かたち",slug:"connections",description:"人と人、視点と視点をつなぐ。企画・コラボレーションのご相談へ。",url:"/contact",thumbnail_path:null,is_featured:false,sort_order:50};
function ProjectsPage(){const [items,setItems]=useState<CmsContent[]>(fallbackProjects);useEffect(()=>{let alive=true;supabase.from("contents").select("id,title,slug,description,url,thumbnail_path,is_featured,sort_order").eq("status","published").order("sort_order",{ascending:true}).then(({data,error})=>{if(alive&&!error&&data?.length)setItems(data as CmsContent[])});return()=>{alive=false}},[]);return <div className="projects-editorial"><svg className="flight-line" viewBox="0 0 1200 150" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40 C210 5 350 30 500 85 S770 125 930 82 S1100 35 1200 70"/></svg><header><span>PROJECTS</span><h1>どこから、考える？</h1><p>ことば、色、かたち、そして問い。<br/>さまざまな視点から、<br/>社会や文化を見つめるプロジェクトです。</p><a href="#project-list">ALL PROJECTS　→</a></header><section id="project-list">{[...items.filter(p=>p.slug!=="connections"),items.find(p=>p.slug==="connections")||connectionProject].map((p,i)=><a href={p.url||"#"} target={p.url?"_blank":undefined} rel={p.url?"noreferrer":undefined} className={`project-tile tile-${p.slug==="connections"?5:(i%4)+1}`} key={p.id}><div className="tile-art"><i/><i/></div><span>{String(i+1).padStart(3,"0")}</span><h2>{p.title}</h2><p>{p.description||"新しい見方を探す。"}</p><b>→</b></a>)}</section></div>}
function NewsPage(){const [items,setItems]=useState<CmsNews[]>(fallbackNews);useEffect(()=>{let alive=true;supabase.from("news").select("id,title,body,link_url,published_at").eq("status","published").order("published_at",{ascending:false}).then(({data,error})=>{if(alive&&!error&&data?.length)setItems(data as CmsNews[])});return()=>{alive=false}},[]);return <div className="news-flight"><header><span>NEWS</span><h1>鳥の足あと。</h1><p>活動のお知らせ、イベント、<br/>掲載情報など、FROM BIRDの、<br/>いまをお届けします。</p><a href="#news-list">ALL NEWS　→</a><small>足あとは、<br/>つぎの景色へ<br/>つながっている。</small></header><section id="news-list">{items.map((item,i)=><a href={`/news/${encodeURIComponent(item.id)}`} onClick={nav(`/news/${encodeURIComponent(item.id)}`)} key={item.id}><svg className="news-stem" viewBox="0 0 50 120" preserveAspectRatio="none" aria-hidden="true"><path d="M25 0C5 30 45 90 25 120" fill="none" stroke="#8a8981" strokeWidth=".7"/><path d="M25 48Q8 56 25 72Q42 64 25 48Z" fill={["#173f69","#e7cd5d","#17633e","#e7a9b5","#15263a"][i%5]}/></svg><div><time>{newsDate(item.published_at)}</time><h2>{item.title}</h2></div><b>→</b></a>)}</section><aside><p>ことばは、<br/>どこかへ向かっていく。</p><i/><small>過去のお知らせも、<br/>どこかで、つながっている。</small></aside></div>}
function AboutPage(){return <div className="about-sky"><section className="about-copy"><span>ABOUT FROM BIRD</span><h1>考えることを、<br/>遊びに変える。</h1><p>FROM BIRDは、<br/>ことば・色・かたちを手がかりに、<br/>社会や文化を見つめ、問いを育てる、<br/>アート＆デザインの実験室です。</p><a href="/projects" onClick={nav("/projects")}>私たちの実験を見る　→</a><small>まだ見ぬ視点へ、<br/>ともに。</small></section><svg className="about-bird-svg" viewBox="240 40 390 365" role="img" aria-label="空を飛ぶ抽象的な鳥">
<path fill="#f6f4ec" d="M416 225C410 145 492 58 625 47C611 143 526 205 416 225Z"/>
<path fill="#173f69" d="M416 225C410 155 467 95 537 65C546 130 511 212 416 225Z"/>
<path fill="#f6f4ec" d="M416 225L416 292L372 291Z"/>
<path fill="#f6f4ec" d="M416 225C339 233 250 287 245 398C307 346 387 291 416 225Z"/>
<path fill="#173f69" d="M416 225C382 178 279 212 253 332C323 327 401 282 416 225Z"/>
<circle fill="#f6f4ec" cx="401.5" cy="314.5" r="41.5"/>
<path fill="#f6f4ec" d="M333 115C369 95 396 103 409 129C418 148 416 180 416 225L333 170Z"/>
<path fill="#efd05e" d="M333 115L279 134L333 170Z"/>
<circle fill="#111" cx="351.5" cy="127.5" r="11.5"/>
</svg><p className="about-bird-note">飛ぶのは、<br/>考えるためだ。</p><svg className="about-view-diagram" viewBox="0 0 300 290" role="img" aria-label="ことば、色、かたち、問い、物語の5つの入口"><g fill="none" stroke="#41657a" strokeWidth=".7"><circle cx="150" cy="58" r="51"/><circle cx="231" cy="117" r="51"/><circle cx="200" cy="212" r="51"/><circle cx="100" cy="212" r="51"/><circle cx="69" cy="117" r="51"/></g><g fill="#102b45" textAnchor="middle" dominantBaseline="middle" fontFamily="serif" fontSize="13"><a href="https://kotoba.frombird.com/"><text x="150" y="58">ことば</text></a><text x="231" y="117">色</text><text x="200" y="212">かたち</text><text x="100" y="212">問い</text><text x="69" y="117">物語</text><text x="150" y="135" fontSize="14">FROM</text><text x="150" y="151" fontSize="14">BIRD</text></g></svg><svg className="about-horizon" viewBox="0 0 1200 70" preserveAspectRatio="none" aria-hidden="true"><path d="M0 34 C310 70 640 48 1200 22"/></svg></div>}
function ContactPage(){const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [requestId]=useState(()=>crypto.randomUUID());async function send(e:FormEvent<HTMLFormElement>){e.preventDefault();if(busy)return;const form=e.currentTarget;setError("");setBusy(true);try{const payload=Object.fromEntries(new FormData(form));const res=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...payload,requestId})});const result=await res.json();if(!res.ok||!result.id)throw new Error(result.error||"送信できませんでした。時間をおいてお試しください。");sessionStorage.setItem("frombird-contact-receipt",result.id);go("/contact/complete")}catch(err){setError(err instanceof Error?err.message:"送信に失敗しました。")}finally{setBusy(false)}}return <div className="contact-night"><section><span>CONTACT</span><h1>まだ言葉に<br/>ならないことも。</h1><p>企画のご相談、取材のお申し込み、<br/>ご感想など、どんなことでもお気軽に<br/>お問い合わせください。</p><small>言葉を運ぶ、<br/>どこかのだれかへ。</small><svg viewBox="0 0 620 210" preserveAspectRatio="none" aria-hidden="true"><path d="M0 138C100 107 259 125 247 162C234 204 123 179 151 155C219 99 352 136 460 47"/><path d="M410 24L465 42L438 66L420 91L429 57L411 55L437 43Z"/></svg></section><form onSubmit={send}><i className="fold"/><label className="contact-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><label>お名前<input name="name" maxLength={100} required/></label><label>メールアドレス<input name="email" type="email" maxLength={254} required/></label><label>お問い合わせの種類<select name="subject" required><option value="">選択してください</option><option>サービスについて</option><option>作品・ツールについて</option><option>コラボレーションについて</option><option>その他</option></select></label><label>メッセージ<textarea name="message" rows={6} maxLength={5000} required/></label><p className="contact-error" role="alert">{error}</p><button disabled={busy}>{busy?"送信中…":"送信する　→"}</button></form><aside>ことばは、<br/>どこかへ届く。<b>FROM<br/>BIRD</b><small>WORDS<br/>COLORS<br/>FORMS<br/>QUESTIONS<br/>STORIES</small></aside></div>}

function Auth({route,user}:{route:string;user:User|null}){
  const mode=route.slice(1);const [loading,setLoading]=useState(false);const [message,setMessage]=useState("");const [error,setError]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setMessage("");setError("");const fd=new FormData(e.currentTarget);const email=String(fd.get("email")||"");const password=String(fd.get("password")||"");let r:{error:{message:string}|null}|undefined;
    if(mode==="signup"){r=await supabase.auth.signUp({email,password,options:{emailRedirectTo:location.origin+"/registration-complete"}});if(!r.error)setMessage("確認メールを送りました。メール内のリンクを開くと登録完了です。")}
    if(mode==="login"){r=await supabase.auth.signInWithPassword({email,password});if(!r.error)go("/mypage")}
    if(mode==="forgot-password"){r=await supabase.auth.resetPasswordForEmail(email,{redirectTo:location.origin+"/reset-password"});if(!r.error)setMessage("パスワード再設定メールを送りました。")}
    if(mode==="reset-password"){r=await supabase.auth.updateUser({password});if(!r.error){setMessage("パスワードを変更しました。");setTimeout(()=>go("/mypage"),800)}}
    if(r?.error)setError(jpError(r.error.message));setLoading(false);
  }
  const labels:Record<string,[string,string,string]>= {login:["LOGIN","おかえりなさい。","つづきから考える。"],signup:["SIGN UP","はじめまして。","考えたものを残す場所。"],"forgot-password":["RESET","パスワード再設定","登録したメールへご案内します。"],"reset-password":["NEW PASSWORD","新しいパスワード","8文字以上で設定してください。"]};const label=labels[mode]||labels.login;
  if(mode==="registration-complete")return <main className="auth complete"><header><Logo/><a href="/" onClick={nav("/")}>サイトへ戻る</a></header><section><div className="auth-art complete-art"><span>WELCOME TO FROM BIRD</span><div className="complete-symbol"><i/><i/><b>◆</b></div><p>ここから、<br/>考えたものを残していく。</p></div><div className="auth-form complete-copy"><span>REGISTRATION COMPLETE</span><div className="complete-check">✓</div><h1>会員登録が<br/>完了しました。</h1><p>FROM BIRDへようこそ。<br/>あなたの考えたものを、自分の場所に残せます。</p><a className="complete-button" href={user?"/mypage":"/login"} onClick={nav(user?"/mypage":"/login")}>{user?"MY PAGEへ":"ログインする"} <i>→</i></a><small>確認メールの認証が完了しました。</small></div></section></main>;
  if(user&&mode!=="reset-password")return <main className="auth single"><div className="auth-form"><Logo/><h1>ログイン済みです。</h1><a className="black" href="/mypage" onClick={nav("/mypage")}>MY PAGEへ →</a></div></main>;
  return <main className="auth"><header><Logo/><a href="/" onClick={nav("/")}>サイトへ戻る</a></header><section><div className="auth-art"><span>FROM BIRD MEMBERS</span><div><i/><i/></div><p>考えたことを、<br/>自分の場所に残していく。</p></div><form className="auth-form" onSubmit={submit}><span>{label[0]}</span><h1>{label[1]}</h1><p>{label[2]}</p>{message&&<div className="success">{message}</div>}{error&&<div className="error">{error}</div>}{mode!=="reset-password"&&<label>メールアドレス<input name="email" type="email" required autoComplete="email" placeholder="mail@example.com"/></label>}{mode!=="forgot-password"&&<label>{mode==="reset-password"?"新しいパスワード":"パスワード"}<input name="password" type="password" required minLength={8} autoComplete={mode==="login"?"current-password":"new-password"} placeholder="8文字以上"/></label>}<button disabled={loading}>{loading?"送信中…":mode==="signup"?"新規登録":mode==="login"?"ログイン":mode==="forgot-password"?"再設定メールを送る":"パスワードを変更"} <i>→</i></button>{mode==="login"&&<><a href="/forgot-password" onClick={nav("/forgot-password")}>パスワードを忘れた方</a><p>アカウントをお持ちでない方 <a href="/signup" onClick={nav("/signup")}>新規登録</a></p></>}{mode==="signup"&&<p>すでに登録済みの方 <a href="/login" onClick={nav("/login")}>ログイン</a></p>}</form></section></main>
}

function Avatar({id,size="normal"}:{id?:string;size?:"small"|"normal"|"large"}){const avatar=avatars.find(a=>a.id===id)||avatars[0];const pixels=size==="large"?168:size==="normal"?116:68;return <span className={`avatar avatar-${size}`}><Image src={avatar.src} width={pixels} height={pixels} sizes={size==="large"?"84px":size==="normal"?"58px":"34px"} alt={`${avatar.label}の顔アイコン`}/></span>}
function Shell({route,user,children}:{route:string;user:User;children:React.ReactNode}){async function logout(){await supabase.auth.signOut();go("/")}const avatar=user.user_metadata?.frombird_avatar as string|undefined;return <main className="member"><header><Logo/><span>MEMBERS</span><nav>{[["MY PAGE","/mypage"],["MY VIEW","/my-view"],["TOOLS","/tools"],["MY WORKS","/my-works"],["HISTORY","/history"]].map(([n,p])=><a className={route.startsWith(p)?"active":""} key={p} href={p} onClick={nav(p)}>{n}</a>)}</nav><button onClick={logout}><Avatar id={avatar} size="small"/><span>{user.email}<small>ログアウト</small></span></button></header><div className="member-body">{children}</div><footer><b>FROM BIRD MEMBERS</b><a href="/" onClick={nav("/")}>公開サイトへ戻る →</a></footer></main>}
function Title({en,title,text}:{en:string;title:string;text:string}){return <div className="page-title"><span>{en}</span><h1>{title}</h1><p>{text}</p></div>}
function Protected({route,user}:{route:string;user:User}){
  const d=getData(user);
  if(route==="/my-view")return <MyView user={user} works={d.works}/>;
  if(route==="/my-works")return <Works works={d.works}/>;
  if(route==="/history")return <History items={d.history}/>;
  if(route.startsWith("/tools/"))return <Tool slug={route.split("/")[2] as ToolSlug} user={user}/>;
  if(route==="/tools")return <Tools/>;
  return <><div className="mypage-intro"><Avatar id={user.user_metadata?.frombird_avatar as string|undefined} size="large"/><Title en="MY PAGE" title={"こんにちは、"+(user.email?.split("@")[0]||"MEMBER")+"さん。"} text="今日は、どこから考えますか？"/></div><GrowthMap works={d.works}/><AvatarPicker user={user}/><a className="view-invite" href="/my-view" onClick={nav("/my-view")}><span>YOUR VIEW</span><div><b>あなたの見方を、眺めてみる。</b><small>{d.works.length?`${d.works.length}件の実験から傾向を表示しています。`:"実験を残すと、ここに少しずつ輪郭が現れます。"}</small></div><i>→</i></a><div className="stats"><a href="/my-works" onClick={nav("/my-works")}><strong>{d.works.length}</strong><span>MY WORKS<small>保存した作品</small></span></a><a href="/history" onClick={nav("/history")}><strong>{d.history.length}</strong><span>HISTORY<small>これまでの記録</small></span></a><a href="/tools" onClick={nav("/tools")}><strong>05</strong><span>TOOLS<small>考える入口</small></span></a></div><Tools compact/></>;
}
function GrowthMap({works}:{works:Work[]}){
  const counts=tools.map(t=>works.filter(w=>w.tool===t.slug).length);const max=Math.max(3,...counts);const center=130;const radius=86;
  const point=(i:number,value:number)=>{const angle=-Math.PI/2+i*Math.PI*2/5;const r=18+(radius-18)*(value/max);return `${center+Math.cos(angle)*r},${center+Math.sin(angle)*r}`};
  const nestRing=(scale:number,strand:number)=>tools.map((_,i)=>{const angle=-Math.PI/2+i*Math.PI*2/5;const variations=[[-.018,.012,-.009,.017,-.013],[.014,-.016,.012,-.01,.016],[-.01,.018,-.015,.011,-.006]];const r=radius*(scale+variations[strand][i]);return `${center+Math.cos(angle)*r},${center+Math.sin(angle)*r}`}).join(" ");
  const newest=[...works].sort((a,b)=>+new Date(b.createdAt)-+new Date(a.createdAt))[0];const newestTool=tools.find(t=>t.slug===newest?.tool);const active=counts.filter(Boolean).length;const stage=works.length===0?"まだ、輪郭の手前":active===1?"ひとつの入口を探索中":active<4?"見方が枝分かれ中":"見方がひろがっています";
  return <section className="growth-card"><div className="growth-copy"><span>YOUR GROWTH / 見方の育ち方</span><h2>{stage}</h2><p>{works.length?`${works.length}回の小さな実験から、今の広がりを描いています。`:"最初の実験を保存すると、ここにあなたの形が現れます。"}</p><div className="growth-note"><b>{String(active).padStart(2,"0")} / 05</b><span>育っている入口</span></div>{newestTool&&<small>最近は「{newestTool.ja}」から考えました。</small>}<a href="/my-view" onClick={nav("/my-view")}>くわしく見る →</a></div><div className="growth-chart"><svg viewBox="0 0 260 260" role="img" aria-label="5つの思考ツールの利用バランス">{[1,.66,.33].flatMap((scale,level)=>[0,1,2].map(strand=><polygon key={`${level}-${strand}`} points={nestRing(scale,strand)} className={`growth-ring nest-strand strand-${strand} ${level===0?"outer":""}`}/>))}{tools.map((_,i)=>{const angle=-Math.PI/2+i*Math.PI*2/5;return <line key={i} x1={center} y1={center} x2={center+Math.cos(angle)*radius} y2={center+Math.sin(angle)*radius}/>})}<polygon points={tools.map((_,i)=>point(i,counts[i])).join(" ")} className="growth-shape"/>{tools.map((t,i)=>{const [x,y]=point(i,counts[i]);return <circle key={t.slug} cx={x} cy={y} r="4"/>})}</svg>{tools.map((t,i)=><span key={t.slug} className={`growth-label label-${i}`}>{t.ja}<b>{counts[i]}</b></span>)}</div></section>
}
function AvatarPicker({user}:{user:User}){const initial=(user.user_metadata?.frombird_avatar||"bird") as AvatarId;const [selected,setSelected]=useState<AvatarId>(initial);const [open,setOpen]=useState(!user.user_metadata?.frombird_avatar);const [saving,setSaving]=useState(false);const [message,setMessage]=useState("");async function save(){setSaving(true);setMessage("");const {error}=await supabase.auth.updateUser({data:{frombird_avatar:selected}});setSaving(false);if(error){setMessage("保存できませんでした。もう一度お試しください。");return}setMessage("アイコンを保存しました。");setOpen(false)}return <section className={`avatar-settings ${open?"open":""}`}><button className="avatar-settings-toggle" type="button" onClick={()=>setOpen(v=>!v)}><span>YOUR ICON</span><b>{open?"閉じる":"アイコンを変更"} {open?"×":"→"}</b></button>{open&&<div className="avatar-settings-body"><div><h2>自分のアイコンを選ぶ。</h2><p>好きなかたちをひとつ選んでください。</p></div><div className="avatar-options" role="radiogroup" aria-label="アイコンを選択">{avatars.map(a=><button type="button" role="radio" aria-checked={selected===a.id} className={selected===a.id?"selected":""} onClick={()=>setSelected(a.id)} key={a.id}><Avatar id={a.id}/><span>{a.label}</span></button>)}</div><button className="avatar-save" type="button" onClick={save} disabled={saving}>{saving?"保存中…":"このアイコンにする →"}</button></div>}{message&&<p className="avatar-message" aria-live="polite">{message}</p>}</section>}
function Tools({compact=false}:{compact?:boolean}){return <section><Title en="TOOLS" title="どこから考える？" text="気になる入口をひとつ選んでください。"/><div className={compact?"mini-grid":"tool-grid"}>{tools.map(t=>{const href=t.slug==="words"?"https://kotoba.frombird.com/":"/tools/"+t.slug;return <a key={t.slug} className={t.slug} href={href} onClick={t.slug==="words"?undefined:nav(href)}><span>{t.no}</span>{!compact&&<div className="symbol">{t.slug==="think"?"?":""}</div>}<h2>{t.ja}</h2>{!compact&&<><b>{t.en}</b><p>{t.text}</p></>}<i>→</i></a>})}</div></section>}
function Tool({slug,user}:{slug:ToolSlug;user:User}){
  const t=tools.find(x=>x.slug===slug)||tools[4];const [saving,setSaving]=useState(false);
  async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setSaving(true);const fd=new FormData(e.currentTarget);const title=String(fd.get("title"));const content=String(fd.get("content"));const tags=String(fd.get("tags")||"").split(/[、,]/).map(x=>x.trim()).filter(Boolean).slice(0,6);const color=String(fd.get("color")||"");const old=getData(user);const w:Work={id:crypto.randomUUID(),tool:t.slug,title,content,tags,colors:color?[color]:[],createdAt:new Date().toISOString()};const h:HistoryItem={id:crypto.randomUUID(),action:"SAVE",label:t.ja+"で「"+title+"」を保存",createdAt:w.createdAt};const {error}=await supabase.auth.updateUser({data:{frombird_works:[w,...old.works].slice(0,50),frombird_history:[h,...old.history].slice(0,100)}});setSaving(false);if(error){alert(jpError(error.message));return}go("/my-works")}
  return <><a className="back" href="/tools" onClick={nav("/tools")}>← TOOLS</a><section className={"workspace "+slug}><div><span>{t.no} / {t.en}</span><h1>{t.ja}</h1><p>{t.prompt}</p><div className="viewpoint-preview"><small>この実験から残る視点</small>{viewpointByTool[t.slug].map(v=><b key={v}>{v}</b>)}</div></div><form onSubmit={save}><label>作品のタイトル<input name="title" required maxLength={80} placeholder="タイトルをつける"/></label><label>考えたこと<textarea name="content" required maxLength={2000} rows={9} placeholder="ここに書いてください。"/></label><label>今回のテーマ <small>自分で感じた言葉を、最大6個まで</small><input name="tags" maxLength={100} placeholder="例：境界、夜、人工物（読点で区切る）"/></label>{slug==="color"&&<label className="color-field">印象に残った色<input name="color" type="color" defaultValue="#6f8fb7"/></label>}<button disabled={saving}>{saving?"保存中…":"MY WORKSに保存 →"}</button></form></section></>;
}
function countTop(values:string[],limit=6){const counts=new Map<string,number>();values.forEach(value=>counts.set(value,(counts.get(value)||0)+1));return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,limit)}
function wordsFromWorks(works:Work[]){const stop=new Set(["こと","もの","ため","よう","これ","それ","ここ","そこ","する","した","して","です","ます","から","まで","ある","ない","いる","なる","思う","考える"]);const segmenter=new Intl.Segmenter("ja",{granularity:"word"});const words:string[]=[];for(const work of works){for(const item of segmenter.segment(`${work.title} ${work.content}`)){const word=item.segment.trim();if(item.isWordLike&&word.length>=2&&!stop.has(word)&&!/^[0-9]+$/.test(word))words.push(word)}}return words}
function analyzeWorks(works:Work[]){const words=countTop(wordsFromWorks(works));const themes=countTop(works.flatMap(w=>w.tags||[]));const colors=countTop(works.flatMap(w=>w.colors||[]),5);const viewpointValues=works.flatMap(w=>viewpointByTool[w.tool]||[]);const viewpointCounts=countTop(viewpointValues,10);const total=Math.max(1,viewpointValues.length);const viewpoints=viewpointCounts.map(([name,count])=>({name,count,percent:Math.round(count/total*100)}));const ordered=[...works].sort((a,b)=>+new Date(b.createdAt)-+new Date(a.createdAt));const half=Math.ceil(ordered.length/2);const recent=ordered.slice(0,half).flatMap(w=>viewpointByTool[w.tool]||[]);const older=ordered.slice(half).flatMap(w=>viewpointByTool[w.tool]||[]);const recentCounts=new Map(countTop(recent,20));const olderCounts=new Map(countTop(older,20));let growing="";let growth=-Infinity;for(const [name,count] of recentCounts){const diff=count-(olderCounts.get(name)||0);if(diff>growth){growth=diff;growing=name}}return {words,themes,colors,viewpoints,growing:growth>0&&older.length?growing:""}}
function MyView({user,works}:{user:User;works:Work[]}){
  const analysis=analyzeWorks(works);const [reflection,setReflection]=useState(String(user.user_metadata?.frombird_reflection||""));const [saving,setSaving]=useState(false);const [saved,setSaved]=useState(false);
  async function saveReflection(){setSaving(true);setSaved(false);const {error}=await supabase.auth.updateUser({data:{frombird_reflection:reflection}});setSaving(false);if(!error)setSaved(true)}
  return <><Title en="MY VIEW" title="あなたの見方。" text="小さな実験の痕跡から、繰り返し現れるものを眺めます。これは診断ではありません。"/>{works.length===0?<div className="view-empty"><span>まだ、輪郭の手前。</span><h2>ひとつ実験を残すと、<br/>あなたの見方が育ちはじめます。</h2><a href="/tools" onClick={nav("/tools")}>最初の入口を選ぶ →</a></div>:<div className="view-dashboard"><section className="view-words"><span>WORDS / 最近よく現れる言葉</span><div>{analysis.words.length?analysis.words.map(([word,count],i)=><b style={{fontSize:`${Math.max(1,2.1-i*.16)}rem`}} key={word}>{word}<small>{count}</small></b>):<p>作品が増えると、言葉が見えてきます。</p>}</div></section><section className="view-colors"><span>COLORS / よく残す色</span><div>{analysis.colors.length?analysis.colors.map(([color,count])=><i key={color} title={`${color}・${count}回`} style={{background:color}}/>):<p>色の実験を保存すると、ここに色が並びます。</p>}</div></section><section className="view-points"><span>VIEWPOINTS / よく使う視点</span>{analysis.viewpoints.map(v=><div key={v.name}><b>{v.name}</b><i><em style={{width:`${v.percent}%`}}/></i><strong>{v.percent}%</strong></div>)}</section><section className="view-themes"><span>THEMES / 自分で残したテーマ</span><div>{analysis.themes.length?analysis.themes.map(([tag,count])=><b key={tag}>{tag}<small>{count}</small></b>):<p>次の保存から、テーマを自分の言葉で添えられます。</p>}</div></section><section className="view-change"><span>CHANGE / 最近育っている視点</span><h2>{analysis.growing?`「${analysis.growing}」が増えています。`:"まだ比べる途中です。"}</h2><p>{analysis.growing?"以前の実験と比べた、小さな変化です。":"作品が4件ほどたまると、以前との違いが見えてきます。"}</p></section><section className="view-reflection"><span>REFLECTION / あなた自身はどう思いますか？</span><textarea value={reflection} onChange={e=>{setReflection(e.target.value);setSaved(false)}} maxLength={500} rows={5} placeholder="表示された傾向は、今の自分にしっくりきますか？　違うと思ったことも残せます。"/><button type="button" onClick={saveReflection} disabled={saving}>{saving?"保存中…":"自分の言葉を残す →"}</button>{saved&&<small>保存しました。</small>}</section></div>}<p className="view-note">集計は、保存した言葉・色・テーマ・利用したツールだけを使っています。AIによる性格診断はしていません。</p></>;
}
function Works({works}:{works:Work[]}){async function remove(w:Work){const current=(await supabase.auth.getUser()).data.user;const d=getData(current);const h:HistoryItem={id:crypto.randomUUID(),action:"DELETE",label:"「"+w.title+"」を削除",createdAt:new Date().toISOString()};await supabase.auth.updateUser({data:{frombird_works:d.works.filter(x=>x.id!==w.id),frombird_history:[h,...d.history].slice(0,100)}});location.reload()}return <><Title en="MY WORKS" title="考えたもの。" text="ツールで生まれた言葉やアイデアを、ここに残していきます。"/>{works.length?<div className="works">{works.map(w=><article className={w.tool} key={w.id}><span>{tools.find(t=>t.slug===w.tool)?.ja} / {new Date(w.createdAt).toLocaleDateString("ja-JP")}</span><h2>{w.title}</h2><p>{w.content}</p><button onClick={()=>remove(w)}>削除</button></article>)}</div>:<Empty text="まだ作品はありません。"/>}</>}
function History({items}:{items:HistoryItem[]}){return <><Title en="HISTORY" title="考えた時間の記録。" text="保存した日も、手放した日も、ここに残ります。"/>{items.length?<ol className="history">{items.map((h,i)=><li key={h.id}><b>{String(items.length-i).padStart(2,"0")}</b><time>{new Date(h.createdAt).toLocaleString("ja-JP")}</time><p>{h.label}</p><span>{h.action}</span></li>)}</ol>:<Empty text="記録はまだありません。"/>}</>}
function Empty({text}:{text:string}){return <div className="empty"><b>—</b><h2>{text}</h2><a href="/tools" onClick={nav("/tools")}>ツールを選ぶ →</a></div>}
function jpError(m:string){if(m.includes("Invalid login"))return "メールアドレスまたはパスワードが違います。";if(m.includes("already registered"))return "このメールアドレスは登録済みです。";if(m.includes("Password"))return "パスワードは8文字以上で設定してください。";if(m.includes("rate limit"))return "少し時間をおいて、もう一度お試しください。";return "うまく処理できませんでした。もう一度お試しください。"}
