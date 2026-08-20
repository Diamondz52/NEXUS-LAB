"use client";

import { useEffect, useMemo, useState } from "react";
import NexusShell from "./NexusShell";
import { useNexus } from "./NexusProvider";
import {LibraryType,saveLibraryItem} from "../lib/library";

type Signal = {
  slug: string;
  name: string;
  kind: "Colors" | "Gradients" | "Prompts" | "Motion" | "Neon";
  css: string;
  colors: string[];
  views: number;
  likes: number;
  tool: string;
  prompt: string;
};

const names = ["NEON TOKYO","PURPLE VOID","CYBER OCEAN","LIQUID CHROME","DIGITAL BLOOM","ACID NIGHT","AURORA DUST","SIGNAL RED","ICE PROTOCOL","ORBITAL INK","PRISMATIC FIELD","SYNTHETIC DAWN","GHOST GLASS","ELECTRIC MOSS","VOID CANDY","QUANTUM BLUE","SOFT MACHINE","AFTERGLOW","POLAR SIGNAL","MAGENTA SHIFT","DARK BLOOM","CHROME NOISE","SOLAR FLARE","LUNAR UI"];
const palettes = [
  ["#050509","#ff45c8","#47dfff"],["#200044","#9a5cff","#020205"],["#001b2b","#00a9bd","#74f6ff"],["#e9f8ff","#647081","#9b6cff"],
  ["#07111c","#8148ff","#ff67d8"],["#050509","#b6ff35","#00d9ff"],["#081329","#65eaff","#755bff"],["#160208","#ff354f","#ff7a00"]
];
const kinds: Signal["kind"][] = ["Neon","Gradients","Colors","Motion","Prompts"];
const signals: Signal[] = names.map((name,index)=>{
  const colors=palettes[index%palettes.length];
  const kind=kinds[index%kinds.length];
  const angle=(index*37+108)%360;
  const css=index%4===0
    ?`radial-gradient(circle at ${25+index%60}% ${25+(index*3)%55}%,${colors[2]},${colors[1]} 28%,${colors[0]} 72%)`
    :index%4===1
      ?`conic-gradient(from ${angle}deg,${colors[0]},${colors[1]},${colors[2]},${colors[0]})`
      :`linear-gradient(${angle}deg,${colors.join(",")})`;
  const tool=kind==="Colors"?"color":kind==="Motion"?"motion":kind==="Prompts"?"prompt":kind==="Neon"?"neon":"gradient";
  return {slug:name.toLowerCase().replaceAll(" ","-"),name,kind,css,colors,views:840+index*137,likes:54+(index*29)%390,tool,prompt:`A premium ${name.toLowerCase()} visual system with ${kind.toLowerCase()} direction, controlled contrast and cinematic digital atmosphere.`};
});

export default function ExploreClient(){
  const {t,copy,toast}=useNexus();
  const [view,setView]=useState<Signal|null>(null);
  const [query,setQuery]=useState("");
  const [filter,setFilter]=useState("All");
  const [sort,setSort]=useState<"Trending"|"New">("Trending");
  const [liked,setLiked]=useState<string[]>([]);
  useEffect(()=>{const timer=setTimeout(()=>{try{setLiked(JSON.parse(localStorage.getItem("nexus-explore-likes")||"[]"))}catch{return}},0);return()=>clearTimeout(timer)},[]);
  useEffect(()=>{document.body.classList.toggle("modal-open",Boolean(view));const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setView(null)};addEventListener("keydown",close);return()=>{document.body.classList.remove("modal-open");removeEventListener("keydown",close)}},[view]);
  const filtered=useMemo(()=>signals.filter(item=>(filter==="All"||item.kind===filter)&&`${item.name} ${item.kind}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==="Trending"?b.likes-a.likes:names.indexOf(b.name)-names.indexOf(a.name)),[filter,query,sort]);
  const toggleLike=(slug:string)=>setLiked(current=>{const next=current.includes(slug)?current.filter(x=>x!==slug):[...current,slug];localStorage.setItem("nexus-explore-likes",JSON.stringify(next));toast(current.includes(slug)?"REMOVED FROM FAVORITES":"ADDED TO FAVORITES");return next});
  const saveSignal=(item:Signal)=>{const types:Record<Signal["kind"],LibraryType>={Colors:"palette",Gradients:"gradient",Prompts:"prompt",Motion:"motion",Neon:"neon"};saveLibraryItem(types[item.kind],item.name,{slug:item.slug,css:item.css,colors:item.colors,prompt:item.prompt});toast(t("common.saved"))};
  const labels:Record<string,Parameters<typeof t>[0]>={Colors:"explore.colors",Gradients:"explore.gradients",Prompts:"explore.prompts",Motion:"explore.motion",Neon:"explore.neon"};
  return <NexusShell><main className="explore-page v2-explore">
    <section className="subpage-hero explore-hero"><span>02 / CURATED SYSTEMS</span><h1>{t("explore.title").split(" ").slice(0,-1).join(" ")}<br/><em>{t("explore.title").split(" ").at(-1)}</em></h1><p>{t("explore.subtitle")}</p></section>
    <section className="explore-toolbar" aria-label="Explore filters"><label><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`${t("common.search")}...`}/></label><div>{["All","Colors","Gradients","Prompts","Motion","Neon"].map(item=><button className={filter===item?"active":""} key={item} onClick={()=>setFilter(item)}>{item==="All"?t("common.all"):t(labels[item])}</button>)}</div><div className="explore-sort"><button className={sort==="Trending"?"active":""} onClick={()=>setSort("Trending")}>{t("explore.trending")}</button><button className={sort==="New"?"active":""} onClick={()=>setSort("New")}>{t("explore.new")}</button></div></section>
    {filtered.length?<section className="explore-grid">{filtered.map((item,index)=><article className="explore-card" key={item.slug}><button className="explore-visual" style={{background:item.css}} onClick={()=>setView(item)} data-cursor="VIEW"><span>{String(index+1).padStart(2,"0")}</span><div className={`demo-geometry variant-${index%4}`}><i/><i/><b/></div><small>{item.views.toLocaleString()} VIEWS</small></button><div className="explore-meta"><div><small>{item.kind.toUpperCase()} / SYSTEM</small><strong>{item.name}</strong><span>{item.colors.map(color=><i key={color} style={{background:color}}/>)}</span></div><div><button onClick={()=>toggleLike(item.slug)} aria-label="Like">{liked.includes(item.slug)?"♥":"♡"} {item.likes+(liked.includes(item.slug)?1:0)}</button><button onClick={()=>setView(item)}>{t("common.open")}</button><button onClick={()=>saveSignal(item)}>{t("common.save")}</button><a href={`/tools?tool=${item.tool}&remix=${item.slug}`}>{t("common.remix")}</a></div></div></article>)}</section>:<div className="explore-empty"><span>404 / FILTER</span><h2>{t("explore.noResults")}</h2><button onClick={()=>{setQuery("");setFilter("All")}}>RESET FILTERS</button></div>}
    <div className={`explore-modal ${view?"open":""}`} role="dialog" aria-modal="true" aria-label="System preview">{view&&<><button className="explore-modal-backdrop" aria-label={t("common.close")} onClick={()=>setView(null)}/><button className="modal-close" onClick={()=>setView(null)}>{t("common.close").toUpperCase()} ×</button><div className="modal-visual" style={{background:view.css}}><div className="demo-geometry large"><i/><i/><b/></div></div><div className="modal-info"><span>{view.kind.toUpperCase()} / DESIGN SYSTEM</span><h2>{view.name}</h2><p>{view.prompt}</p><div className="modal-colors">{view.colors.map(color=><button key={color} style={{background:color}} onClick={()=>copy(color)}>{color}</button>)}</div><div className="modal-actions"><button onClick={()=>copy(view.colors.join(", "))}>{t("common.copy")} DNA</button><button onClick={()=>saveSignal(view)}>{t("common.save").toUpperCase()}</button><a className="primary-btn" href={`/tools?tool=${view.tool}&remix=${view.slug}`}>{t("common.remix")} ↗</a></div></div></>}</div>
  </main></NexusShell>;
}
