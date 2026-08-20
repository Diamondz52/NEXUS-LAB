export type CodeLanguage="html"|"css"|"javascript"|"typescript"|"json";
export type CodeFile={id:string;name:string;language:CodeLanguage;content:string;folder?:string};
export type DesignTokens={background:string;surface:string;text:string;muted:string;primary:string;secondary:string;border:string;radius:number;spacing:number};
export type ProjectTodo={id:string;text:string;done:boolean};
export type ProjectSnapshot={id:string;createdAt:number;label:string;files:CodeFile[];tokens:DesignTokens};
export type CodeSettings={live:boolean;device:string;width:number;height:number;zoom:number;frame:boolean;screen:"black"|"white"|"checker";fontSize:number;wordWrap:boolean;lineNumbers:boolean;minimap:boolean;tabSize:number;previewDelay:number;autosaveDelay:number;clearConsole:boolean;previewQuality:"performance"|"standard";animations:boolean;density:"compact"|"comfortable";sidebarWidth:number;consoleHeight:number};
export type CodeProject={id:string;name:string;description:string;author:string;type:string;stack:string;style:string;createdAt:number;updatedAt:number;favorite:boolean;files:CodeFile[];folders?:string[];notes:string;todos:ProjectTodo[];history:ProjectSnapshot[];tokens:DesignTokens;settings:CodeSettings};
export type ProjectStore={version:3;activeProjectId:string|null;projects:CodeProject[];snippets:CustomSnippet[]};
export type CustomSnippet={id:string;name:string;language:CodeLanguage;content:string;createdAt:number};

export const CODE_STORAGE_KEY="nexus-code-projects-v3";
export const DEFAULT_CODE_SETTINGS:CodeSettings={live:true,device:"DESKTOP",width:1440,height:900,zoom:0,frame:false,screen:"black",fontSize:14,wordWrap:true,lineNumbers:true,minimap:false,tabSize:2,previewDelay:550,autosaveDelay:1100,clearConsole:true,previewQuality:"standard",animations:false,density:"comfortable",sidebarWidth:220,consoleHeight:170};
const id=(prefix:string)=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
export const languageForFile=(name:string):CodeLanguage=>name.endsWith(".css")?"css":name.endsWith(".js")?"javascript":name.endsWith(".ts")?"typescript":name.endsWith(".json")?"json":"html";

const styleTokens:Record<string,DesignTokens>={
  MINIMAL:{background:"#f6f7fb",surface:"#ffffff",text:"#111118",muted:"#6d7280",primary:"#335cff",secondary:"#7b61ff",border:"rgba(17,17,24,.13)",radius:16,spacing:16},
  NEON:{background:"#030307",surface:"#0b0d15",text:"#f4fbff",muted:"#8993a3",primary:"#65eaff",secondary:"#8a5cff",border:"rgba(101,234,255,.22)",radius:18,spacing:18},
  GLASS:{background:"#090b18",surface:"rgba(255,255,255,.08)",text:"#f5f8ff",muted:"#a2aabd",primary:"#7deeff",secondary:"#b175ff",border:"rgba(255,255,255,.18)",radius:26,spacing:20},
  DARK:{background:"#090a0f",surface:"#151720",text:"#f5f5f7",muted:"#858b98",primary:"#d6e2ff",secondary:"#8b7cff",border:"rgba(255,255,255,.12)",radius:12,spacing:16},
  LIGHT:{background:"#f5f2ea",surface:"#ffffff",text:"#171713",muted:"#73736d",primary:"#2266dd",secondary:"#d34d88",border:"rgba(23,23,19,.14)",radius:14,spacing:18},
  BRUTALIST:{background:"#f5ff00",surface:"#ffffff",text:"#050505",muted:"#333333",primary:"#ff3d00",secondary:"#0047ff",border:"#050505",radius:0,spacing:16},
  FUTURISTIC:{background:"#050811",surface:"#0c1322",text:"#edf8ff",muted:"#8495aa",primary:"#38d9ff",secondary:"#725cff",border:"rgba(56,217,255,.2)",radius:10,spacing:16},
  EDITORIAL:{background:"#f0ede6",surface:"#faf8f3",text:"#191815",muted:"#736e65",primary:"#cf3f2e",secondary:"#2e4563",border:"rgba(25,24,21,.2)",radius:4,spacing:20}
};
export const getStyleTokens=(style:string):DesignTokens=>structuredClone(styleTokens[style]||styleTokens.NEON);

const starterCopy:Record<string,{eyebrow:string;title:string;body:string;action:string}>={
  "LANDING PAGE":{eyebrow:"NEXUS / CREATIVE SYSTEM",title:"Build beyond the obvious.",body:"A focused starting point for a memorable digital product.",action:"Explore the signal"},
  PORTFOLIO:{eyebrow:"SELECTED WORK / 2026",title:"Ideas shaped into interfaces.",body:"A personal space for experiments, products and thoughtful frontend work.",action:"View projects"},
  DASHBOARD:{eyebrow:"SYSTEM STATUS / ONLINE",title:"Everything in one field.",body:"Track the signals that matter and act with clarity.",action:"Open overview"},
  BLOG:{eyebrow:"NOTES FROM THE LAB",title:"Thinking in systems.",body:"Writing about design, code, motion and the space between them.",action:"Read latest"},
  "STORE UI":{eyebrow:"NEW OBJECT / 001",title:"Designed to be kept.",body:"A precise product experience with intentional details.",action:"Discover collection"},
  "WEB APP":{eyebrow:"WORKSPACE / READY",title:"Start where the work happens.",body:"A clear application shell prepared for your next workflow.",action:"Initialize"},
  COMPONENT:{eyebrow:"COMPONENT / LIVE",title:"A reusable digital object.",body:"Edit the system, test every size and ship the code.",action:"Interact"},
  EXPERIMENT:{eyebrow:"EXPERIMENT / UNSTABLE",title:"Break the expected pattern.",body:"Use this canvas to test an interaction without production constraints.",action:"Run experiment"},
  BLANK:{eyebrow:"BLANK SYSTEM",title:"Your idea starts here.",body:"A minimal document with the right foundations.",action:"Begin"}
};

const cssFor=(tokens:DesignTokens,style:string)=>`:root {
  --background: ${tokens.background};
  --surface: ${tokens.surface};
  --text: ${tokens.text};
  --muted: ${tokens.muted};
  --primary: ${tokens.primary};
  --secondary: ${tokens.secondary};
  --border: ${tokens.border};
  --radius: ${tokens.radius}px;
  --spacing: ${tokens.spacing}px;
}

* { box-sizing: border-box; }
html { color-scheme: ${["MINIMAL","LIGHT","EDITORIAL","BRUTALIST"].includes(style)?"light":"dark"}; }
body {
  margin: 0;
  min-height: 100vh;
  background: var(--background);
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
.page { min-height: 100vh; padding: clamp(24px, 6vw, 96px); display: grid; align-content: center; position: relative; overflow: hidden; }
.page::before { content: ""; position: absolute; width: 55vw; height: 55vw; right: -18vw; top: -22vw; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--primary) 32%, transparent), transparent 66%); pointer-events: none; }
.nav { position: absolute; top: 0; left: 0; right: 0; min-height: 72px; padding: 0 clamp(24px, 6vw, 96px); display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
.logo { font-weight: 800; letter-spacing: -.06em; }
.nav span { color: var(--muted); font-size: 12px; letter-spacing: .12em; }
.hero { position: relative; max-width: 940px; }
.eyebrow { color: var(--primary); font: 11px ui-monospace, monospace; letter-spacing: .16em; }
h1 { max-width: 900px; margin: 28px 0; font-size: clamp(56px, 10vw, 150px); line-height: .84; letter-spacing: -.075em; }
.lead { max-width: 560px; color: var(--muted); font-size: clamp(16px, 2vw, 22px); line-height: 1.6; }
.cta { display: inline-flex; margin-top: 28px; min-height: 48px; align-items: center; gap: 22px; padding: 0 20px; border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); text-decoration: none; background: var(--surface); transition: .25s; }
.cta:hover { border-color: var(--primary); transform: translateY(-3px); box-shadow: 0 12px 36px color-mix(in srgb, var(--primary) 18%, transparent); }
@media (max-width: 600px) { .nav { min-height: 62px; } .nav span { display: none; } h1 { font-size: clamp(48px, 16vw, 76px); } .page { padding-top: 100px; } }
`;

export const createProject=(name="NEXUS STARTER",type="LANDING PAGE",style="NEON"):CodeProject=>{
  const tokens=getStyleTokens(style);const copy=starterCopy[type]||starterCopy["LANDING PAGE"];const now=Date.now();
  const html=`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${copy.body}" />
  <meta name="theme-color" content="${tokens.background}" />
  <title>${name}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="page">
    <nav class="nav"><strong class="logo">${name.toUpperCase()}°</strong><span>CREATIVE DEVELOPMENT SPACE</span></nav>
    <section class="hero">
      <p class="eyebrow">${copy.eyebrow}</p>
      <h1>${copy.title}</h1>
      <p class="lead">${copy.body}</p>
      <a class="cta" href="#signal">${copy.action} <span>↗</span></a>
    </section>
  </main>
  <script src="script.js"></script>
</body>
</html>`;
  return{id:id("project"),name,description:copy.body,author:"ARSENII PIANKOV",type,stack:"HTML + CSS + JS",style,createdAt:now,updatedAt:now,favorite:false,files:[{id:id("file"),name:"index.html",language:"html",content:html},{id:id("file"),name:"styles.css",language:"css",content:cssFor(tokens,style)},{id:id("file"),name:"script.js",language:"javascript",content:`const cta = document.querySelector('.cta');\ncta?.addEventListener('click', () => console.log('NEXUS signal initialized'));`}],notes:"",todos:[],history:[],tokens,settings:{...DEFAULT_CODE_SETTINGS}};
};

export const emptyStore=():ProjectStore=>({version:3,activeProjectId:null,projects:[],snippets:[]});
export const normalizeProject=(project:CodeProject):CodeProject=>({...project,folders:Array.isArray(project.folders)?project.folders:[],settings:{...DEFAULT_CODE_SETTINGS,...project.settings}});
export const normalizeStore=(parsed:Partial<ProjectStore>|null|undefined):ProjectStore=>{if(parsed?.version!==3||!Array.isArray(parsed.projects))return emptyStore();const projects=parsed.projects.filter(project=>project&&typeof project.id==="string"&&Array.isArray(project.files)).map(normalizeProject);const active=projects.some(project=>project.id===parsed.activeProjectId)?parsed.activeProjectId:projects[0]?.id||null;return{version:3,activeProjectId:typeof active==="string"?active:null,projects,snippets:Array.isArray(parsed.snippets)?parsed.snippets:[]}};
export const loadProjectStore=():ProjectStore=>{try{const raw=localStorage.getItem(CODE_STORAGE_KEY);return raw?normalizeStore(JSON.parse(raw) as Partial<ProjectStore>):emptyStore()}catch{return emptyStore()}};
export const saveProjectStore=(store:ProjectStore)=>localStorage.setItem(CODE_STORAGE_KEY,JSON.stringify(store));
export const cloneProject=(project:CodeProject):CodeProject=>{const copy=structuredClone(project);copy.id=id("project");copy.name=`${project.name} COPY`;copy.createdAt=Date.now();copy.updatedAt=copy.createdAt;copy.history=[];copy.files=copy.files.map(file=>({...file,id:id("file")}));return copy};
export const createSnapshot=(project:CodeProject,label="Manual save"):ProjectSnapshot=>({id:id("version"),createdAt:Date.now(),label,files:structuredClone(project.files),tokens:structuredClone(project.tokens)});
export const safeName=(value:string)=>value.trim().replace(/[\\/:*?"<>|]+/g,"-").replace(/\s+/g,"-").toLowerCase()||"nexus-project";

export const applyTokensToCss=(css:string,tokens:DesignTokens)=>{const root=`:root {\n  --background: ${tokens.background};\n  --surface: ${tokens.surface};\n  --text: ${tokens.text};\n  --muted: ${tokens.muted};\n  --primary: ${tokens.primary};\n  --secondary: ${tokens.secondary};\n  --border: ${tokens.border};\n  --radius: ${tokens.radius}px;\n  --spacing: ${tokens.spacing}px;\n}`;return/:root\s*\{[\s\S]*?\}/.test(css)?css.replace(/:root\s*\{[\s\S]*?\}/,root):`${root}\n\n${css}`};

const blocksMainThread=(value:string)=>/(?:while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\))/.test(value);
export const buildPreview=(project:CodeProject,runId=0)=>{const html=project.files.find(file=>file.name==="index.html")?.content||"<main><h1>No index.html</h1></main>";const css=project.files.filter(file=>file.language==="css").map(file=>file.content).join("\n\n");const rawJs=project.files.filter(file=>file.language==="javascript").map(file=>file.content).join("\n\n");const js=(blocksMainThread(rawJs)?`console.error("Preview stopped: a common infinite-loop pattern was detected. Change the loop or run manually.")`:rawJs).replaceAll("</script","<\\"+"/script");const bridge=`<script>(()=>{const runId=${runId};const send=(level,args)=>parent.postMessage({source:'nexus-preview',runId,type:'console',level,args:args.map(value=>{try{return typeof value==='string'?value:JSON.stringify(value)}catch{return String(value)}})},'*');['log','info','warn','error'].forEach(level=>{const original=console[level];console[level]=(...args)=>{send(level,args);original(...args)}});addEventListener('error',event=>send('error',[event.message]));addEventListener('unhandledrejection',event=>send('error',[String(event.reason)]));addEventListener('DOMContentLoaded',()=>setTimeout(()=>{const elements=[...document.querySelectorAll('body *')];parent.postMessage({source:'nexus-preview',runId,type:'metrics',overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,smallText:elements.filter(el=>parseFloat(getComputedStyle(el).fontSize)<11).length,smallTargets:elements.filter(el=>['A','BUTTON','INPUT'].includes(el.tagName)&&(el.getBoundingClientRect().width<40||el.getBoundingClientRect().height<40)).length},'*')},80));parent.postMessage({source:'nexus-preview',runId,type:'ready'},'*')})();</script>`;let output=html.replace(/<link[^>]+href=["']styles\.css["'][^>]*>/gi,"").replace(/<script[^>]+src=["']script\.js["'][^>]*><\/script>/gi,"");const styleTag=`<style>${css}</style>`;output=output.includes("</head>")?output.replace("</head>",`${styleTag}</head>`):`${styleTag}${output}`;const scriptTag=`${bridge}<script>${js}</script>`;return output.includes("</body>")?output.replace("</body>",`${scriptTag}</body>`):`${output}${scriptTag}`};

export type ProjectProblem={tone:"error"|"warning"|"success";message:string;file?:string};
export const analyzeProject=(project:CodeProject):ProjectProblem[]=>{const html=project.files.find(file=>file.name==="index.html")?.content||"";const css=project.files.filter(file=>file.language==="css").map(file=>file.content).join("\n");const js=project.files.filter(file=>file.language==="javascript").map(file=>file.content).join("\n");const problems:ProjectProblem[]=[];const required:[[RegExp,string],[RegExp,string],[RegExp,string],[RegExp,string],[RegExp,string],[RegExp,string]]=[[/<title>[^<]+<\/title>/i,"Missing page title"],[/<meta[^>]+name=["']description["']/i,"Missing meta description"],[/<html[^>]+lang=/i,"Missing document language"],[/<meta[^>]+name=["']viewport["']/i,"Missing viewport meta"],[/<h1[\s>]/i,"Missing H1 heading"],[/<(?:button|a)[^>]*(?:aria-label|>[^<])/i,"Check interactive labels"]];required.forEach(([pattern,message])=>{if(!pattern.test(html))problems.push({tone:"warning",message,file:"index.html"})});const balance=(value:string,char:string)=>[...value].filter(x=>x===char).length; if(balance(css,"{")!==balance(css,"}"))problems.push({tone:"error",message:"Unbalanced CSS braces",file:"styles.css"});try{new Function(js)}catch(error){problems.push({tone:"error",message:error instanceof Error?error.message:"JavaScript syntax error",file:"script.js"})}if(!problems.length)problems.push({tone:"success",message:"No local syntax or document issues detected"});return problems};

export const componentPresets=[
  {name:"NEON BUTTON",category:"BUTTONS",html:`<a class="nexus-button" href="#action">Initialize signal <span>↗</span></a>`,css:`.nexus-button{display:inline-flex;gap:24px;align-items:center;min-height:48px;padding:0 20px;border:1px solid var(--primary);border-radius:999px;color:var(--primary);text-decoration:none;box-shadow:0 0 24px color-mix(in srgb,var(--primary) 18%,transparent);transition:.25s}.nexus-button:hover{background:var(--primary);color:var(--background);transform:translateY(-2px)}`},
  {name:"GLASS CARD",category:"CARDS",html:`<article class="glass-card"><span>01 / MODULE</span><h2>Digital matter.</h2><p>A clear surface for layered content.</p></article>`,css:`.glass-card{max-width:460px;padding:28px;border:1px solid var(--border);border-radius:var(--radius);background:color-mix(in srgb,var(--surface) 78%,transparent);backdrop-filter:blur(20px);box-shadow:0 24px 70px rgba(0,0,0,.18)}.glass-card span{color:var(--primary);font:11px monospace}.glass-card h2{font-size:42px;letter-spacing:-.05em}`},
  {name:"SIGNAL NAV",category:"NAVIGATION",html:`<nav class="signal-nav"><strong>NEXUS°</strong><div><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></div></nav>`,css:`.signal-nav{display:flex;align-items:center;justify-content:space-between;min-height:68px;padding:0 5vw;border-bottom:1px solid var(--border)}.signal-nav div{display:flex;gap:24px}.signal-nav a{color:var(--muted);text-decoration:none}.signal-nav a:hover{color:var(--primary)}`},
  {name:"PRICING GRID",category:"PRICING",html:`<section class="price-grid"><article><span>START</span><h2>$19</h2><button>Choose plan</button></article><article><span>PRO</span><h2>$49</h2><button>Choose plan</button></article></section>`,css:`.price-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}.price-grid article{padding:28px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface)}.price-grid h2{font-size:54px}.price-grid button{min-height:44px;width:100%;border:0;border-radius:var(--radius);background:var(--primary);color:var(--background)}`},
  {name:"FAQ STACK",category:"FAQ",html:`<section class="faq"><details open><summary>What is the system?</summary><p>A focused environment for building digital interfaces.</p></details><details><summary>Can I customize it?</summary><p>Every token and component is editable.</p></details></section>`,css:`.faq{max-width:760px}.faq details{padding:20px 0;border-bottom:1px solid var(--border)}.faq summary{font-size:20px;cursor:pointer}.faq p{color:var(--muted);line-height:1.6}`},
  {name:"FULLSCREEN HERO",category:"HERO",html:`<section class="system-hero"><p>CREATIVE SYSTEM / ONLINE</p><h1>Think. Design. Ship.</h1></section>`,css:`.system-hero{min-height:100vh;padding:8vw;display:grid;align-content:center;background:radial-gradient(circle at 75% 30%,color-mix(in srgb,var(--primary) 20%,transparent),transparent 38%)}.system-hero p{color:var(--primary);font:11px monospace}.system-hero h1{font-size:clamp(60px,12vw,170px);line-height:.8;letter-spacing:-.08em}`}
];
export const snippetPresets=[
  {name:"CENTER WITH FLEX",language:"css" as const,content:"display: flex;\nalign-items: center;\njustify-content: center;"},{name:"GRID LAYOUT",language:"css" as const,content:"display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\ngap: 1rem;"},{name:"TEXT GRADIENT",language:"css" as const,content:"background: linear-gradient(90deg, var(--primary), var(--secondary));\n-webkit-background-clip: text;\ncolor: transparent;"},{name:"SMOOTH HOVER",language:"css" as const,content:"transition: transform .25s ease, border-color .25s ease;\n\n&:hover { transform: translateY(-3px); }"},{name:"SCROLL REVEAL",language:"javascript" as const,content:"const observer = new IntersectionObserver(entries => {\n  entries.forEach(entry => entry.target.classList.toggle('visible', entry.isIntersecting));\n});\ndocument.querySelectorAll('.reveal').forEach(node => observer.observe(node));"}
];
