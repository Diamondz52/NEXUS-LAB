"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect,useRef,useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { useNexus } from "./NexusProvider";

const navItems=[
  {key:"tools",href:"/tools",fallback:"TOOLS"},
  {key:"code",href:"/code",fallback:"CODE LAB"},
  {key:"explore",href:"/explore",fallback:"EXPLORE"},
  {key:"library",href:"/library",fallback:"LIBRARY"},
  {key:"about",href:"/about",fallback:"ABOUT"},
  {key:"contact",href:"/contact",fallback:"CONTACT"}
] as const;
const megaGroups=[
  {title:"CREATE",links:[["PROMPT LAB","/tools?tool=prompt","prompt"],["COLOR LAB","/tools?tool=color","color"],["GRADIENT LAB","/tools?tool=gradient","gradient"]]},
  {title:"STYLE",links:[["NEON LAB","/tools?tool=neon","neon"],["GLASS LAB","/tools?tool=glass","glass"],["MOTION LAB","/tools?tool=motion","motion"]]},
  {title:"BUILD",links:[["CODE LAB","/code","code"],["DESIGN SYSTEM","/tools?tool=color","system"]]},
  {title:"DISCOVER",links:[["EXPLORE","/explore","explore"],["CHAOS","/lab/chaos","chaos"],["LIBRARY","/library","library"]]}
] as const;

function NavItem({href,label,active,onClick,tools=false}:{href:string;label:string;active:boolean;onClick?:(event:React.MouseEvent<HTMLAnchorElement>)=>void;tools?:boolean}){
  return <a href={href} className={`nav-item ${active?"active":""}`} aria-current={active?"page":undefined} onClick={onClick}><span className="nav-label" aria-hidden="true">{Array.from(label).map((letter,index)=><i key={`${letter}-${index}`} style={{"--char-index":index} as React.CSSProperties}>{letter===" "?"\u00a0":letter}</i>)}</span><span className="sr-only">{label}</span>{tools&&<b aria-hidden="true">⌄</b>}</a>;
}

export default function NexusShell({children,workspace=false}:{children:React.ReactNode;workspace?:boolean}){
  const {language,setLanguage,theme,setTheme,t,openCommands,openSettings,copy,motion}=useNexus();
  const [menu,setMenu]=useState(false);const [loaded,setLoaded]=useState(false);const [transitioning,setTransitioning]=useState(false);const [path,setPath]=useState("");const [scrolled,setScrolled]=useState(false);const [megaOpen,setMegaOpen]=useState(false);const [megaPreview,setMegaPreview]=useState("color");
  const ring=useRef<HTMLDivElement>(null);const dot=useRef<HTMLDivElement>(null);const megaCloseTimer=useRef<number|undefined>(undefined);

  useEffect(()=>{
    const first=!sessionStorage.getItem("nexus-lab-online");
    const timer=setTimeout(()=>{setLoaded(true);setPath(location.pathname.split("/")[1]||"home");sessionStorage.setItem("nexus-lab-online","1")},first?1150:20);
    gsap.fromTo(".loader-progress i",{scaleX:0},{scaleX:1,duration:first?1:.02,ease:"power3.inOut"});
    const lenis=workspace?null:new Lenis({duration:1.02,smoothWheel:true});let lenisRaf=0;
    const tick=(time:number)=>{lenis?.raf(time);lenisRaf=requestAnimationFrame(tick)};if(lenis)lenisRaf=requestAnimationFrame(tick);
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("visible")}),{threshold:.1});document.querySelectorAll(".reveal").forEach(node=>observer.observe(node));
    const fine=matchMedia("(pointer:fine)").matches&&motion==="full";document.documentElement.classList.toggle("custom-cursor-active",fine);document.documentElement.dataset.workspace=workspace?"code":"site";
    let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,cursorRaf=0;
    const move=(event:MouseEvent)=>{mx=event.clientX;my=event.clientY;if(dot.current)dot.current.style.transform=`translate3d(${mx}px,${my}px,0)`;document.documentElement.style.setProperty("--mouse-x",`${mx}px`);document.documentElement.style.setProperty("--mouse-y",`${my}px`)};
    const follow=()=>{rx+=(mx-rx)*.15;ry+=(my-ry)*.15;if(ring.current)ring.current.style.transform=`translate3d(${rx}px,${ry}px,0)`;cursorRaf=requestAnimationFrame(follow)};
    const pointer=(event:PointerEvent)=>{const target=event.target as HTMLElement|null;const editable=target?.closest("input,textarea,select,[contenteditable=true],.monaco-editor,.native-cursor");const label=target?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor;if(ring.current){ring.current.toggleAttribute("data-hidden",Boolean(editable));if(label&&!editable)ring.current.setAttribute("data-label",label);else ring.current.removeAttribute("data-label")}if(dot.current)dot.current.toggleAttribute("data-hidden",Boolean(editable))};
    const intercept=(event:MouseEvent)=>{if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const anchor=(event.target as HTMLElement).closest("a") as HTMLAnchorElement|null;if(!anchor||anchor.target==="_blank"||anchor.hasAttribute("download")||anchor.dataset.nativeNav!==undefined)return;const url=new URL(anchor.href,location.href);if(url.origin!==location.origin||(url.pathname===location.pathname&&url.search===location.search))return;event.preventDefault();setTransitioning(true);document.documentElement.dataset.transition=url.pathname.split("/")[1]||"home";setTimeout(()=>{location.href=url.href},workspace?150:480)};
    const scroll=()=>setScrolled(scrollY>24);
    window.addEventListener("mousemove",move);window.addEventListener("scroll",scroll,{passive:true});document.addEventListener("pointerover",pointer,true);document.addEventListener("pointerout",pointer,true);document.addEventListener("click",intercept);if(fine)cursorRaf=requestAnimationFrame(follow);
    return()=>{clearTimeout(timer);clearTimeout(megaCloseTimer.current);cancelAnimationFrame(lenisRaf);cancelAnimationFrame(cursorRaf);lenis?.destroy();observer.disconnect();window.removeEventListener("mousemove",move);window.removeEventListener("scroll",scroll);document.removeEventListener("pointerover",pointer,true);document.removeEventListener("pointerout",pointer,true);document.removeEventListener("click",intercept);document.documentElement.classList.remove("custom-cursor-active");delete document.documentElement.dataset.workspace};
  },[motion,workspace]);

  useEffect(()=>{document.body.classList.toggle("menu-open",menu);const escape=(event:KeyboardEvent)=>{if(event.key==="Escape")setMenu(false)};const resize=()=>{if(innerWidth>1120)setMenu(false)};addEventListener("keydown",escape);addEventListener("resize",resize);return()=>{document.body.classList.remove("menu-open");removeEventListener("keydown",escape);removeEventListener("resize",resize)}},[menu]);

  const cycleTheme=()=>setTheme(theme==="dark"?"light":theme==="light"?"system":"dark");
  const openMega=()=>{clearTimeout(megaCloseTimer.current);setMegaOpen(true)};
  const closeMega=()=>{clearTimeout(megaCloseTimer.current);megaCloseTimer.current=window.setTimeout(()=>setMegaOpen(false),180)};
  const labelFor=(key:typeof navItems[number]["key"],fallback:string)=>key==="code"?(language==="ru"?"КОД":"CODE LAB"):t(`nav.${key}` as Parameters<typeof t>[0])||fallback;
  return <>
    <div className={`nexus-loader cinematic-loader ${loaded?"loaded":""}`}><div className="loader-signal"><strong>NEXUS</strong><span>INITIALIZING CREATIVE SYSTEM</span></div><div className="loader-progress"><i/></div><div className="loader-online">{t("shell.online").toUpperCase()} <i/></div></div>
    <div className={`page-transition ${transitioning?"active":""}`}><i/></div><div className="grain"/><div className="cursor-dot" ref={dot}/><div className="cursor-ring" ref={ring}/>
    {!workspace&&<><header className={`lab-header ${scrolled?"scrolled":""} ${path==="home"?"on-home":""}`}>
      <div className="header-shell">
        <a className="lab-logo" href="/" aria-label="NEXUS LAB home"><span>NEXUS LAB</span><b>®</b></a>
        <nav className="primary-nav" aria-label="Primary navigation">
          {navItems.map(item=>item.key==="tools"?<div className={`nav-tools ${megaOpen?"open":""}`} key={item.key} onMouseEnter={openMega} onMouseLeave={closeMega} onFocus={openMega} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))closeMega()}}><NavItem href={item.href} label={labelFor(item.key,item.fallback)} active={path===item.key} tools onClick={event=>{if(!megaOpen){event.preventDefault();openMega()}}}/><section className="tools-mega" aria-label="Creative tools menu">
            <div className="mega-grid">{megaGroups.map(group=><div className="mega-group" key={group.title}><span>{group.title}</span>{group.links.map(([label,href,preview])=><a key={label} href={href} onMouseEnter={()=>setMegaPreview(preview)} onFocus={()=>setMegaPreview(preview)}><b>{label}</b><i>↗</i></a>)}</div>)}</div>
            <aside className={`mega-preview preview-${megaPreview}`}><header><span>LIVE PREVIEW</span><b>{megaPreview.toUpperCase()}</b></header><div className="mega-preview-visual"><i/><i/><i/><i/><pre><code><em>01</em> .signal {'{'}{"\n"}<em>02</em>   color: #65eaff;{"\n"}<em>03</em>   motion: smooth;{"\n"}<em>04</em> {'}'}</code></pre></div><footer><span>SELECT A LAB</span><b>NX / READY</b></footer></aside>
          </section></div>:<NavItem key={item.key} href={item.href} label={labelFor(item.key,item.fallback)} active={path===item.key}/>) }
        </nav>
        <div className="header-actions"><button className="header-search" onClick={openCommands} aria-label="Open command palette" title="Ctrl + K"><span>SEARCH</span><kbd>⌘K</kbd></button><button onClick={()=>setLanguage(language==="en"?"ru":"en")} aria-label="Change language">{language.toUpperCase()}</button><button onClick={cycleTheme} aria-label="Change theme">{theme==="dark"?"◑":theme==="light"?"◐":"◒"}</button><button className="header-settings" onClick={openSettings} aria-label={t("common.settings")}>⚙</button><a className="launch-link" href="/code">{language==="ru"?"ВОЙТИ В LAB":"ENTER LAB"} <span>↗</span></a></div>
        <button className={`burger ${menu?"open":""}`} onClick={()=>setMenu(!menu)} aria-label={menu?"Close menu":"Open menu"} aria-expanded={menu}><span>{menu?"CLOSE":"MENU"}</span><i/><i/></button>
      </div>
    </header>
    <div className={`fullscreen-menu ${menu?"open":""}`} aria-hidden={!menu}><div className="mobile-menu-head"><span>NEXUS / NAVIGATION</span><b>SYSTEM ONLINE</b></div>{[{key:"home",href:"/",label:"HOME"},...navItems.map(item=>({key:item.key,href:item.href,label:labelFor(item.key,item.fallback)}))].map((item,index)=><a key={item.key} href={item.href} onClick={()=>setMenu(false)}><span>{String(index+1).padStart(2,"0")}</span><strong>{item.label}</strong><i>↗</i></a>)}<footer><div><button onClick={()=>setLanguage(language==="en"?"ru":"en")}>LANGUAGE / {language.toUpperCase()}</button><button onClick={cycleTheme}>THEME / {theme.toUpperCase()}</button><button onClick={openSettings}>SETTINGS / ⚙</button></div><div><a href="https://t.me/PlugOnPercs" target="_blank" rel="noopener noreferrer">TELEGRAM</a><a href="https://github.com/Diamondz52" target="_blank" rel="noopener noreferrer">GITHUB</a></div></footer></div><div className="scroll-progress"/></>}
    <div>{children}</div>
    {!workspace&&<><nav className="mobile-dock" aria-label="Mobile navigation"><a href="/tools">⌘<span>{t("nav.tools")}</span></a><a href="/code">&lt;/&gt;<span>CODE</span></a><a href="/lab">●<span>{t("nav.lab")}</span></a><a href="/library">▣<span>{t("nav.library")}</span></a></nav>
    <footer className="lab-footer v3-footer"><div className="footer-cta"><span>CREATIVE OPERATING SYSTEM / V3</span><strong>BUILD THE<br/>NEXT SIGNAL.</strong><a className="primary-btn" href="/code">OPEN CODE LAB <i>↗</i></a></div><div className="footer-columns"><section><b>EXPLORE</b><a href="/tools">TOOLS</a><a href="/code">CODE LAB</a><a href="/lab">LAB HUB</a><a href="/library">LIBRARY</a></section><section><b>CONNECT</b><a href="mailto:pyankovad2606@gmail.com">EMAIL</a><a href="https://t.me/PlugOnPercs" target="_blank" rel="noopener noreferrer">TELEGRAM</a><a href="https://github.com/Diamondz52" target="_blank" rel="noopener noreferrer">GITHUB</a><button onClick={()=>copy("chieeefkeeef",t("contact.discordCopied"))}>DISCORD</button></section><section><b>SYSTEM</b><a href="/about">ABOUT</a><a href="/contact">CONTACT</a><a href="/changelog">CHANGELOG</a><button onClick={openSettings}>SETTINGS</button></section></div><div className="footer-base"><strong>NEXUS LAB®</strong><span className="online"><i/> {t("shell.online")}</span><span>ARSENII PIANKOV · © 2026</span></div></footer></>}
  </>;
}
