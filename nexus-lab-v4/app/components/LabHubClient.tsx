"use client";
import { useEffect,useState } from "react";
import { ArrowUpRight,Braces,Code2,FlaskConical,MoveRight,Palette,Sparkles,WandSparkles } from "./NexusIcons";
import NexusShell from "./NexusShell";
import { CODE_STORAGE_KEY,ProjectStore } from "../lib/codeLab";
import { useNexus } from "./NexusProvider";

const labs=[
  {id:"01",name:"CODE LAB",copy:"Build complete frontend projects with files, live preview, console and export.",href:"/code",icon:Code2,tone:"cyan"},
  {id:"02",name:"TOOL SYSTEMS",copy:"Generate prompts, gradients, palettes, neon, glass and motion systems.",href:"/tools",icon:WandSparkles,tone:"violet"},
  {id:"03",name:"CHAOS LAB",copy:"Turn a seed into a controlled visual DNA system and save the result.",href:"/lab/chaos",icon:FlaskConical,tone:"pink"},
  {id:"04",name:"COMPONENT LIBRARY",copy:"Insert responsive interface patterns and remix saved experiments.",href:"/code?panel=components",icon:Braces,tone:"green"},
  {id:"05",name:"COLOR SYSTEM",copy:"Engineer accessible color frequencies and send them into your project.",href:"/tools?tool=color",icon:Palette,tone:"orange"},
  {id:"06",name:"EXPLORE",copy:"Browse curated visual signals and use them as a starting point.",href:"/explore",icon:Sparkles,tone:"blue"}
];

export default function LabHubClient(){
  const {language}=useNexus();const [recent,setRecent]=useState<{id:string;name:string;updatedAt:number}|null>(null);const ru=language==="ru";
  useEffect(()=>{const timer=setTimeout(()=>{try{const store=JSON.parse(localStorage.getItem(CODE_STORAGE_KEY)||"null") as ProjectStore|null;const active=store?.projects.find(project=>project.id===store.activeProjectId)||store?.projects?.[0];if(active)setRecent({id:active.id,name:active.name,updatedAt:active.updatedAt})}catch{/* local data is optional */}},0);return()=>clearTimeout(timer)},[]);
  return <NexusShell><main className="lab-hub"><section className="hub-hero"><div className="hub-grid"/><span>03 / CREATIVE OPERATING SYSTEM</span><h1>{ru?<>ТВОЯ<br/><em>ЛАБОРАТОРИЯ.</em></>:<>YOUR<br/><em>LABORATORY.</em></>}</h1><p>{ru?"Выбирай пространство, собирай системы и превращай эксперименты в работающий интерфейс.":"Choose a workspace, shape a system and turn experiments into a working interface."}</p><a className="primary-btn" href="/code">{ru?"ОТКРЫТЬ CODE LAB":"OPEN CODE LAB"} <i>↗</i></a></section>
    {recent&&<section className="continue-system"><div><span>CONTINUE BUILDING</span><h2>{recent.name}</h2><p>{ru?"Последний локальный проект · ":"Last local project · "}{new Date(recent.updatedAt).toLocaleString()}</p></div><a href="/code">{ru?"ПРОДОЛЖИТЬ":"CONTINUE"}<MoveRight/></a></section>}
    <section className="hub-labs"><header><span>AVAILABLE SPACES / 06</span><h2>{ru?"ОДНА СИСТЕМА. МНОГО РЕЖИМОВ.":"ONE SYSTEM. MANY MODES."}</h2></header><div>{labs.map(item=>{const Icon=item.icon;return <a href={item.href} key={item.name} className={`hub-card tone-${item.tone}`} data-cursor="OPEN"><span>{item.id}</span><Icon/><h3>{item.name}</h3><p>{item.copy}</p><ArrowUpRight/></a>})}</div></section>
    <section className="hub-flow"><span>HOW IT CONNECTS</span><div><article><b>01</b><h3>GENERATE</h3><p>{ru?"Создай визуальную систему в Tools или Chaos Lab.":"Create a visual system in Tools or Chaos Lab."}</p></article><i>→</i><article><b>02</b><h3>BUILD</h3><p>{ru?"Отправь результат в Code Lab и собери проект.":"Send the result to Code Lab and build the project."}</p></article><i>→</i><article><b>03</b><h3>SHIP</h3><p>{ru?"Проверь адаптивность и экспортируй готовый ZIP.":"Check responsive quality and export a production-ready ZIP."}</p></article></div></section>
  </main></NexusShell>;
}
