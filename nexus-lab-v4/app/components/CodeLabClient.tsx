"use client";
/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable react-hooks/exhaustive-deps,react-hooks/refs,react-hooks/preserve-manual-memoization,react-hooks/set-state-in-effect,jsx-a11y/no-autofocus,jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/no-noninteractive-tabindex */

import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import Editor,{loader} from "@monaco-editor/react";
import * as monaco from "monaco-editor/editor/editor.api.js";
import "monaco-editor/languages/definitions/css/register.js";
import "monaco-editor/languages/definitions/html/register.js";
import "monaco-editor/languages/definitions/javascript/register.js";
import "monaco-editor/languages/definitions/typescript/register.js";
import NexusShell from "./NexusShell";
import {useNexus} from "./NexusProvider";
import {Braces,ChevronDown,Code2,Download,ExternalLink,FileCode2,FolderOpen,Import,Maximize2,Menu,Monitor,PanelBottomClose,PanelLeftClose,Play,Plus,RefreshCw,RotateCcw,Save,Search,Settings,Smartphone,Tablet,Trash2,X,Zap} from "./NexusIcons";
import {analyzeProject,buildPreview,cloneProject,CodeFile,CodeProject,CodeSettings,createProject,emptyStore,languageForFile,ProjectStore,safeName} from "../lib/codeLab";
import {clearProjectStorage,loadProjectStoreAsync,saveProjectStoreAsync} from "../lib/codeStorage";

if(!monaco.languages.getLanguages().some(item=>item.id==="json")){monaco.languages.register({id:"json",extensions:[".json"]});monaco.languages.setMonarchTokensProvider("json",{tokenizer:{root:[[/"(?:[^"\\]|\\.)*"(?=\s*:)/,"key"],[/"(?:[^"\\]|\\.)*"/,"string"],[/\b(?:true|false|null)\b/,"keyword"],[/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/i,"number"],[/[{}[\],:]/,"delimiter"]]}})}
loader.config({monaco});

type LogLevel="log"|"info"|"warn"|"error";
type LogItem={id:string;level:LogLevel;text:string;time:string};
type Modal="projects"|"settings"|"commands"|"files"|"new"|null;
type LayoutMode="split"|"code"|"preview"|"full";
type MobilePanel="files"|"editor"|"preview"|"console";
type DeletedFile={projectId:string;file:CodeFile;index:number}|null;
type PreviewMessage={source?:string;runId?:number;type?:string;level?:LogLevel;args?:string[];overflow?:boolean;smallText?:number;smallTargets?:number};

const devices={DESKTOP:[1440,900],LAPTOP:[1366,768],TABLET:[768,1024],MOBILE:[390,844]} as const;
const projectTypes=["LANDING PAGE","PORTFOLIO","DASHBOARD","BLOG","STORE UI","WEB APP","COMPONENT","EXPERIMENT","BLANK"];
const projectStyles=["NEON","MINIMAL","GLASS","DARK","LIGHT","BRUTALIST","FUTURISTIC","EDITORIAL"];
const uid=(prefix:string)=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
const fileIcon=(file:CodeFile)=>file.language==="html"?"<>":file.language==="css"?"#":file.language==="json"?"{}":"JS";
const editorLanguage=(file:CodeFile)=>file.language==="javascript"?"javascript":file.language;

function downloadBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function fallbackFormat(language:string,source:string){if(language==="json"){try{return JSON.stringify(JSON.parse(source),null,2)}catch{return source}}if(language==="html"){let depth=0;return source.replace(/>\s*</g,">\n<").split("\n").map(line=>line.trim()).filter(Boolean).map(line=>{if(/^<\//.test(line))depth=Math.max(0,depth-1);const output=`${"  ".repeat(depth)}${line}`;if(/^<(?!\/|!|\?)(?![^>]+\/$)[^>]+>$/.test(line)&&!/^<(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i.test(line)&&!/<\/[^>]+>$/.test(line))depth+=1;return output}).join("\n")}let output="",depth=0,quote="",escaped=false;const newline=()=>{output=output.trimEnd()+"\n"+"  ".repeat(depth)};for(const char of source){if(quote){output+=char;if(escaped)escaped=false;else if(char==="\\")escaped=true;else if(char===quote)quote="";continue}if(char==='"'||char==="'"||char==='`'){quote=char;output+=char}else if(char==="{"){output=output.trimEnd()+" {";depth+=1;newline()}else if(char==="}"){depth=Math.max(0,depth-1);output=output.trimEnd()+"\n"+"  ".repeat(depth)+"}"}else if(char===";"){output+=";";newline()}else if(/\s/.test(char)){if(!output.endsWith(" ")&&!output.endsWith("\n"))output+=" "}else output+=char}return output.trim()+"\n"}

export default function CodeLabClient(){
  const {language,theme,setTheme,setLanguage,toast}=useNexus();
  const word=(en:string,ru:string)=>language==="ru"?ru:en;
  const rootRef=useRef<HTMLElement>(null);
  const previewStageRef=useRef<HTMLDivElement>(null);
  const editorRef=useRef<monaco.editor.IStandaloneCodeEditor|null>(null);
  const storeRef=useRef<ProjectStore>(emptyStore());
  const draftRef=useRef(new Map<string,string>());
  const revisionRef=useRef(0);
  const saveTimerRef=useRef<number|undefined>(undefined);
  const previewTimerRef=useRef<number|undefined>(undefined);
  const previewRunRef=useRef(0);
  const resizeFrameRef=useRef<number|undefined>(undefined);
  const importRef=useRef<HTMLInputElement>(null);
  const onlineRef=useRef(true);
  const [loading,setLoading]=useState(true);
  const [store,setStore]=useState<ProjectStore>(emptyStore());
  const [activeFileId,setActiveFileId]=useState<string|null>(null);
  const [openTabs,setOpenTabs]=useState<string[]>([]);
  const [dirty,setDirty]=useState(false);
  const [saveState,setSaveState]=useState<"saved"|"saving"|"unsaved"|"error">("saved");
  const [srcDoc,setSrcDoc]=useState("");
  const [previewStopped,setPreviewStopped]=useState(false);
  const [logs,setLogs]=useState<LogItem[]>([]);
  const [metrics,setMetrics]=useState({overflow:false,smallText:0,smallTargets:0});
  const [bottomTab,setBottomTab]=useState<"console"|"problems">("console");
  const [modal,setModal]=useState<Modal>(null);
  const [query,setQuery]=useState("");
  const [layout,setLayout]=useState<LayoutMode>("split");
  const [mobilePanel,setMobilePanel]=useState<MobilePanel>("editor");
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [consoleOpen,setConsoleOpen]=useState(true);
  const [zen,setZen]=useState(false);
  const [online,setOnline]=useState(true);
  const [exportState,setExportState]=useState<"idle"|"packing"|"done"|"error">("idle");
  const [fitScale,setFitScale]=useState(1);
  const [dragWidth,setDragWidth]=useState<number|null>(null);
  const [deletedFile,setDeletedFile]=useState<DeletedFile>(null);
  const [wizard,setWizard]=useState({name:"UNTITLED SIGNAL",type:"LANDING PAGE",style:"NEON"});

  const project=useMemo(()=>store.projects.find(item=>item.id===store.activeProjectId)||store.projects[0]||null,[store]);
  const activeFile=useMemo(()=>project?.files.find(file=>file.id===activeFileId)||project?.files[0]||null,[activeFileId,project]);
  const problems=useMemo(()=>project?analyzeProject({...project,files:project.files.map(file=>({...file,content:draftRef.current.get(`${project.id}:${file.id}`)??file.content}))}):[],[project,saveState]);

  const composeProject=useCallback((source:CodeProject)=>({...source,files:source.files.map(file=>({...file,content:draftRef.current.get(`${source.id}:${file.id}`)??file.content}))}),[]);
  const composeStore=useCallback(()=>{const current=storeRef.current;return{...current,projects:current.projects.map(composeProject)} as ProjectStore},[composeProject]);

  const persist=useCallback(async(force=false)=>{
    if(saveTimerRef.current)window.clearTimeout(saveTimerRef.current);
    const revision=revisionRef.current;
    const next=composeStore();
    next.projects=next.projects.map(item=>item.id===next.activeProjectId?{...item,updatedAt:Date.now()}:item);
    storeRef.current=next;
    setStore(next);
    setSaveState("saving");
    try{
      await saveProjectStoreAsync(next);
      if(revision===revisionRef.current){draftRef.current.clear();setDirty(false);setSaveState("saved")}else setSaveState("unsaved");
      if(force)toast(word("Project saved locally","Проект сохранён локально"));
    }catch{setSaveState("error");toast(word("Could not save this project","Не удалось сохранить проект"),"error")}
  },[composeStore,toast,word]);

  const runPreview=useCallback(()=>{
    const current=storeRef.current.projects.find(item=>item.id===storeRef.current.activeProjectId)||storeRef.current.projects[0];
    if(!current)return;
    const composed=composeProject(current);
    const runId=++previewRunRef.current;
    if(composed.settings.clearConsole)setLogs([]);
    setSrcDoc(buildPreview(composed,runId));
    setPreviewStopped(false);
  },[composeProject]);

  const scheduleWork=useCallback(()=>{
    const current=storeRef.current.projects.find(item=>item.id===storeRef.current.activeProjectId);
    if(!current)return;
    if(saveTimerRef.current)window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current=window.setTimeout(()=>void persist(),clamp(current.settings.autosaveDelay,800,1500));
    if(previewTimerRef.current)window.clearTimeout(previewTimerRef.current);
    if(current.settings.live&&!previewStopped)previewTimerRef.current=window.setTimeout(runPreview,clamp(current.settings.previewDelay,400,700));
  },[persist,previewStopped,runPreview]);

  const markChanged=useCallback(()=>{revisionRef.current+=1;setDirty(true);setSaveState("unsaved");scheduleWork()},[scheduleWork]);

  const updateProject=useCallback((mutator:(current:CodeProject)=>CodeProject,run=true)=>{
    const currentStore=composeStore();
    const active=currentStore.projects.find(item=>item.id===currentStore.activeProjectId);
    if(!active)return;
    const next={...currentStore,projects:currentStore.projects.map(item=>item.id===active.id?mutator(active):item)};
    storeRef.current=next;setStore(next);revisionRef.current+=1;setDirty(true);setSaveState("unsaved");
    if(run)scheduleWork();else{if(saveTimerRef.current)window.clearTimeout(saveTimerRef.current);saveTimerRef.current=window.setTimeout(()=>void persist(),900)}
  },[composeStore,persist,scheduleWork]);

  const updateSettings=useCallback((patch:Partial<CodeSettings>)=>updateProject(current=>({...current,settings:{...current.settings,...patch}})),[updateProject]);

  useEffect(()=>{let cancelled=false;(async()=>{let initial=await loadProjectStoreAsync();if(!initial.projects.length){const starter=createProject();initial={version:3,activeProjectId:starter.id,projects:[starter],snippets:[]};await saveProjectStoreAsync(initial)}if(cancelled)return;storeRef.current=initial;setStore(initial);const current=initial.projects.find(item=>item.id===initial.activeProjectId)||initial.projects[0];setActiveFileId(current.files[0]?.id||null);setOpenTabs(current.files.slice(0,3).map(file=>file.id));setSrcDoc(buildPreview(current,++previewRunRef.current));setLoading(false)})();return()=>{cancelled=true}},[]);
  useEffect(()=>{onlineRef.current=online},[online]);
  useEffect(()=>{const handleOnline=()=>setOnline(true);const handleOffline=()=>setOnline(false);setOnline(navigator.onLine);addEventListener("online",handleOnline);addEventListener("offline",handleOffline);return()=>{removeEventListener("online",handleOnline);removeEventListener("offline",handleOffline)}},[]);
  useEffect(()=>{const receive=(event:MessageEvent<PreviewMessage>)=>{const data=event.data;if(data?.source!=="nexus-preview"||data.runId!==previewRunRef.current)return;if(data.type==="console"&&data.level){setLogs(current=>[...current.slice(-199),{id:uid("log"),level:data.level!,text:(data.args||[]).join(" "),time:new Date().toLocaleTimeString()}])}if(data.type==="metrics")setMetrics({overflow:Boolean(data.overflow),smallText:Number(data.smallText||0),smallTargets:Number(data.smallTargets||0)})};addEventListener("message",receive);return()=>removeEventListener("message",receive)},[]);
  useEffect(()=>()=>{if(saveTimerRef.current)window.clearTimeout(saveTimerRef.current);if(previewTimerRef.current)window.clearTimeout(previewTimerRef.current);if(resizeFrameRef.current)cancelAnimationFrame(resizeFrameRef.current);const snapshot=composeStore();if(snapshot.projects.length)void saveProjectStoreAsync(snapshot);editorRef.current=null},[composeStore]);
  useEffect(()=>{setTimeout(()=>editorRef.current?.layout(),20)},[consoleOpen,layout,sidebarOpen,zen]);
  useEffect(()=>{if(project?.settings.zoom!==0||!previewStageRef.current)return;const stage=previewStageRef.current;const fit=()=>setFitScale(Math.min(1,(stage.clientWidth-28)/project.settings.width,(stage.clientHeight-28)/project.settings.height));fit();const observer=new ResizeObserver(fit);observer.observe(stage);return()=>observer.disconnect()},[project?.settings.height,project?.settings.width,project?.settings.zoom]);

  const openFile=(id:string)=>{setActiveFileId(id);setOpenTabs(current=>current.includes(id)?current:[...current,id]);setMobilePanel("editor")};
  const closeTab=(id:string)=>{setOpenTabs(current=>{const next=current.filter(item=>item!==id);if(id===activeFileId)setActiveFileId(next.at(-1)||project?.files[0]?.id||null);return next})};
  const changeFile=(value:string|undefined)=>{if(!project||!activeFile)return;draftRef.current.set(`${project.id}:${activeFile.id}`,value||"");markChanged()};

  const createFile=()=>{if(!project)return;const raw=prompt(word("New file name (for example section.html)","Имя нового файла (например section.html)"),"component.html");const name=raw?.trim();if(!name)return;if(project.files.some(file=>file.name.toLowerCase()===name.toLowerCase())){toast(word("A file with this name already exists","Файл с таким именем уже есть"),"error");return}const file:CodeFile={id:uid("file"),name,language:languageForFile(name),content:""};updateProject(current=>({...current,files:[...current.files,file]}));setActiveFileId(file.id);setOpenTabs(current=>[...current,file.id])};
  const createFolder=()=>{if(!project)return;const name=prompt(word("Folder name","Имя папки"),"components")?.trim().replace(/^\/+|\/+$/g,"");if(!name)return;if((project.folders||[]).some(folder=>folder.toLowerCase()===name.toLowerCase())){toast(word("This folder already exists","Такая папка уже есть"),"error");return}updateProject(current=>({...current,folders:[...(current.folders||[]),name]}),false)};
  const renameFile=(file:CodeFile)=>{if(!project)return;const name=prompt(word("Rename file","Переименовать файл"),file.name)?.trim();if(!name||name===file.name)return;if(project.files.some(item=>item.id!==file.id&&item.name.toLowerCase()===name.toLowerCase())){toast(word("A file with this name already exists","Файл с таким именем уже есть"),"error");return}updateProject(current=>({...current,files:current.files.map(item=>item.id===file.id?{...item,name,language:languageForFile(name)}:item)}))};
  const duplicateFile=(file:CodeFile)=>{if(!project)return;const dot=file.name.lastIndexOf(".");const base=dot>0?file.name.slice(0,dot):file.name;const ext=dot>0?file.name.slice(dot):"";let index=2;let name=`${base}-copy${ext}`;while(project.files.some(item=>item.name.toLowerCase()===name.toLowerCase()))name=`${base}-copy-${index++}${ext}`;const copy={...file,id:uid("file"),name};updateProject(current=>({...current,files:[...current.files,copy]}));setActiveFileId(copy.id);setOpenTabs(current=>[...current,copy.id]);toast(word("File duplicated","Файл продублирован"))};
  const deleteFile=(file:CodeFile)=>{if(!project||project.files.length===1){toast(word("A project needs at least one file","В проекте должен остаться хотя бы один файл"),"error");return}if(!confirm(word(`Delete ${file.name}? You can undo this action.`,`Удалить ${file.name}? Действие можно отменить.`)))return;const index=project.files.findIndex(item=>item.id===file.id);setDeletedFile({projectId:project.id,file,index});updateProject(current=>({...current,files:current.files.filter(item=>item.id!==file.id)}));draftRef.current.delete(`${project.id}:${file.id}`);setOpenTabs(current=>current.filter(id=>id!==file.id));if(activeFileId===file.id)setActiveFileId(project.files.find(item=>item.id!==file.id)?.id||null)};
  const undoDelete=()=>{if(!deletedFile)return;const {projectId,file,index}=deletedFile;const next=composeStore();next.projects=next.projects.map(item=>item.id===projectId?{...item,files:[...item.files.slice(0,index),file,...item.files.slice(index)]}:item);storeRef.current=next;setStore(next);setDeletedFile(null);setActiveFileId(file.id);setOpenTabs(current=>[...current,file.id]);revisionRef.current+=1;scheduleWork();toast(word("File restored","Файл восстановлен"))};

  const selectProject=async(id:string)=>{if(id===project?.id){setModal(null);return}await persist();const next={...storeRef.current,activeProjectId:id};storeRef.current=next;setStore(next);const target=next.projects.find(item=>item.id===id);setActiveFileId(target?.files[0]?.id||null);setOpenTabs(target?.files.slice(0,3).map(file=>file.id)||[]);setModal(null);setTimeout(runPreview,0)};
  const createNewProject=()=>{const created=createProject(wizard.name.trim(),wizard.type,wizard.style);const next={...composeStore(),activeProjectId:created.id,projects:[...composeStore().projects,created]};storeRef.current=next;setStore(next);setActiveFileId(created.files[0].id);setOpenTabs(created.files.map(file=>file.id));setModal(null);setWizard({name:"UNTITLED SIGNAL",type:"LANDING PAGE",style:"NEON"});revisionRef.current+=1;void persist(true);setTimeout(runPreview,0)};
  const renameProject=(item:CodeProject)=>{const name=prompt(word("Project name","Название проекта"),item.name)?.trim();if(!name)return;const next={...composeStore(),projects:composeStore().projects.map(projectItem=>projectItem.id===item.id?{...projectItem,name}:projectItem)};storeRef.current=next;setStore(next);revisionRef.current+=1;void persist()};
  const duplicateProject=(item:CodeProject)=>{const copy=cloneProject(composeProject(item));const next={...composeStore(),activeProjectId:copy.id,projects:[...composeStore().projects,copy]};storeRef.current=next;setStore(next);setActiveFileId(copy.files[0]?.id||null);setOpenTabs(copy.files.map(file=>file.id));revisionRef.current+=1;void persist(true);setModal(null);setTimeout(runPreview,0)};
  const deleteProject=(item:CodeProject)=>{if(!confirm(word(`Delete project ${item.name}?`,`Удалить проект ${item.name}?`)))return;let projects=composeStore().projects.filter(projectItem=>projectItem.id!==item.id);if(!projects.length)projects=[createProject(word("NEW PROJECT","НОВЫЙ ПРОЕКТ"))];const active=projects[0];const next={...composeStore(),activeProjectId:active.id,projects};storeRef.current=next;setStore(next);setActiveFileId(active.files[0]?.id||null);setOpenTabs(active.files.map(file=>file.id));revisionRef.current+=1;void persist();setTimeout(runPreview,0)};

  const setDevice=(name:keyof typeof devices)=>{const [width,height]=devices[name];updateSettings({device:name,width,height})};
  const rotate=()=>{if(!project)return;updateSettings({width:project.settings.height,height:project.settings.width})};
  const stopPreview=()=>{if(previewTimerRef.current)window.clearTimeout(previewTimerRef.current);previewRunRef.current+=1;setPreviewStopped(true);setSrcDoc("<!doctype html><html><body style='margin:0;background:#0b0e14;color:#8793a5;font:13px ui-monospace,monospace;display:grid;place-items:center;min-height:100vh'>PREVIEW STOPPED — RESET OR RUN TO CONTINUE</body></html>");setLogs(current=>[...current,{id:uid("log"),level:"warn",text:"Preview stopped by user",time:new Date().toLocaleTimeString()}])};
  const resetPreview=()=>{setLogs([]);setMetrics({overflow:false,smallText:0,smallTargets:0});runPreview()};
  const openPreviewWindow=()=>{const blob=new Blob([srcDoc],{type:"text/html"});const url=URL.createObjectURL(blob);open(url,"_blank","noopener,noreferrer");setTimeout(()=>URL.revokeObjectURL(url),10000)};

  const formatCurrent=async()=>{const editor=editorRef.current;if(!editor||!activeFile)return;const before=editor.getValue();await editor.getAction("editor.action.formatDocument")?.run();if(editor.getValue()===before){const formatted=fallbackFormat(activeFile.language,before);if(formatted!==before)editor.executeEdits("nexus-format",[{range:editor.getModel()!.getFullModelRange(),text:formatted}])}toast(word("Current file formatted","Текущий файл отформатирован"))};
  const exportProject=async()=>{if(!project||exportState==="packing")return;setExportState("packing");try{const {default:JSZip}=await import("jszip");const current=composeProject(project);const zip=new JSZip();current.files.forEach(file=>zip.file(file.folder?`${file.folder}/${file.name}`:file.name,file.content));zip.file("README.md",`# ${current.name}\n\nExported from NEXUS LAB.\n\nOpen index.html in a browser or serve this folder with any static web server.\n`);const blob=await zip.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}});downloadBlob(blob,`${safeName(current.name)}.zip`);setExportState("done");toast(word("Verified ZIP exported","ZIP-архив экспортирован"));setTimeout(()=>setExportState("idle"),1600)}catch{setExportState("error");toast(word("ZIP export failed","Не удалось экспортировать ZIP"),"error")}};
  const downloadCurrent=()=>{if(!activeFile||!project)return;downloadBlob(new Blob([draftRef.current.get(`${project.id}:${activeFile.id}`)??activeFile.content],{type:"text/plain;charset=utf-8"}),activeFile.name)};
  const importFiles=async(files:FileList|null)=>{if(!files||!project)return;const supported=[".html",".css",".js",".ts",".json"];const incoming:CodeFile[]=[];for(const file of Array.from(files)){const ext=file.name.slice(file.name.lastIndexOf(".")).toLowerCase();if(!supported.includes(ext))continue;if(project.files.some(item=>item.name.toLowerCase()===file.name.toLowerCase())||incoming.some(item=>item.name.toLowerCase()===file.name.toLowerCase())){toast(word(`Skipped duplicate ${file.name}`,`Дубликат ${file.name} пропущен`),"error");continue}incoming.push({id:uid("file"),name:file.name,language:languageForFile(file.name),content:await file.text()})}if(!incoming.length)return;updateProject(current=>({...current,files:[...current.files,...incoming]}));setOpenTabs(current=>[...current,...incoming.map(file=>file.id)]);setActiveFileId(incoming[0].id);toast(word(`${incoming.length} file(s) imported`, `Импортировано файлов: ${incoming.length}`))};

  const startResize=(kind:"side"|"bottom",event:React.PointerEvent)=>{if(!project)return;event.preventDefault();const root=rootRef.current;if(!root)return;const start=kind==="side"?event.clientX:event.clientY;const initial=kind==="side"?project.settings.sidebarWidth:project.settings.consoleHeight;let latest=initial;const move=(pointer:PointerEvent)=>{latest=kind==="side"?clamp(initial+pointer.clientX-start,180,420):clamp(initial-(pointer.clientY-start),90,420);if(resizeFrameRef.current)cancelAnimationFrame(resizeFrameRef.current);resizeFrameRef.current=requestAnimationFrame(()=>{root.style.setProperty(kind==="side"?"--code-sidebar":"--code-console",`${latest}px`);editorRef.current?.layout()})};const up=()=>{removeEventListener("pointermove",move);removeEventListener("pointerup",up);updateSettings(kind==="side"?{sidebarWidth:latest}:{consoleHeight:latest})};addEventListener("pointermove",move);addEventListener("pointerup",up,{once:true})};
  const resetPanels=()=>{rootRef.current?.style.setProperty("--code-sidebar","220px");rootRef.current?.style.setProperty("--code-console","170px");updateSettings({sidebarWidth:220,consoleHeight:170})};
  const startPreviewWidth=(event:React.PointerEvent)=>{if(!project)return;event.preventDefault();const start=event.clientX;const initial=project.settings.width;let latest=initial;const frame=event.currentTarget.parentElement as HTMLElement;const move=(pointer:PointerEvent)=>{latest=clamp(initial+(pointer.clientX-start)/Math.max(project.settings.zoom/100,.5),240,2560);if(resizeFrameRef.current)cancelAnimationFrame(resizeFrameRef.current);resizeFrameRef.current=requestAnimationFrame(()=>{frame.style.width=`${latest}px`;setDragWidth(Math.round(latest))})};const finish=()=>{removeEventListener("pointermove",move);removeEventListener("pointerup",finish);removeEventListener("pointercancel",finish);updateSettings({device:"CUSTOM",width:Math.round(latest)});setDragWidth(null)};setDragWidth(initial);addEventListener("pointermove",move);addEventListener("pointerup",finish,{once:true});addEventListener("pointercancel",finish,{once:true})};

  const commands=useMemo(()=>[
    {label:word("Run preview","Запустить превью"),keys:"Ctrl ↵",run:runPreview},
    {label:word("Save project","Сохранить проект"),keys:"Ctrl S",run:()=>void persist(true)},
    {label:word("Quick open file","Быстро открыть файл"),keys:"Ctrl P",run:()=>setModal("files")},
    {label:word("Format current file","Форматировать файл"),keys:"Shift Alt F",run:()=>void formatCurrent()},
    {label:word("Toggle files","Показать/скрыть файлы"),keys:"Ctrl B",run:()=>setSidebarOpen(value=>!value)},
    {label:word("Toggle console","Показать/скрыть консоль"),keys:"Ctrl J",run:()=>setConsoleOpen(value=>!value)},
    {label:word("Focus workspace","Фокус-режим"),keys:"",run:()=>setZen(value=>!value)},
    {label:word("Export ZIP","Экспорт ZIP"),keys:"",run:()=>void exportProject()}
  ],[exportProject,formatCurrent,persist,runPreview,word]);
  const filteredCommands=commands.filter(item=>item.label.toLowerCase().includes(query.toLowerCase()));
  const filteredFiles=(project?.files||[]).filter(file=>file.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(()=>{const key=(event:KeyboardEvent)=>{const modifier=event.ctrlKey||event.metaKey;const code=event.key.toLowerCase();if(event.key==="Escape"){setModal(null);if(zen)setZen(false);return}if(modifier&&code==="s"){event.preventDefault();void persist(true)}else if(modifier&&code==="p"){event.preventDefault();setQuery("");setModal("files")}else if(modifier&&code==="k"){event.preventDefault();setQuery("");setModal("commands")}else if(modifier&&event.key==="Enter"){event.preventDefault();runPreview()}else if(modifier&&code==="b"){event.preventDefault();setSidebarOpen(value=>!value)}else if(modifier&&code==="j"){event.preventDefault();setConsoleOpen(value=>!value)}};addEventListener("keydown",key,true);return()=>removeEventListener("keydown",key,true)},[persist,runPreview,zen]);

  if(loading||!project||!activeFile)return <NexusShell workspace><div className="code-loading"><Braces/> INITIALIZING CODE LAB / RECOVERING LOCAL WORKSPACE…</div></NexusShell>;
  const zoom=project.settings.zoom;
  const zoomScale=zoom===0?fitScale:zoom/100;
  const openFiles=openTabs.map(id=>project.files.find(file=>file.id===id)).filter(Boolean) as CodeFile[];
  const statusProblems=problems.filter(item=>item.tone!=="success").length;

  return <NexusShell workspace><main ref={rootRef} style={{"--code-sidebar":`${sidebarOpen?project.settings.sidebarWidth:0}px`,"--code-console":`${consoleOpen?project.settings.consoleHeight:0}px`} as React.CSSProperties} className={`code-lab code-lab-stable layout-${layout} ${zen?"zen":""} ${!sidebarOpen?"side-closed":""} ${!consoleOpen?"console-closed":""}`}>
    <header className="code-header">
      <a href="/" className="code-brand">NEXUS° <span>CODE LAB</span></a>
      <button className="project-switch" onClick={()=>setModal("projects")} title={word("Switch project","Сменить проект")}><FolderOpen size={15}/><b>{project.name}{dirty&&<em> •</em>}</b><span>{project.type}</span><ChevronDown size={13}/></button>
      <div className="code-header-status"><span className={!online?"offline":saveState}><i/>{!online?"OFFLINE":saveState.toUpperCase()}</span><span>HTML / CSS / JS</span></div>
      <nav>
        <button onClick={()=>setModal("commands")} title="Ctrl/Cmd + K"><Search/> COMMANDS</button>
        <button onClick={()=>setModal("settings")} title={word("Workspace settings","Настройки среды")}><Settings/> SETTINGS</button>
        <button onClick={()=>void persist(true)} title="Ctrl/Cmd + S"><Save/> SAVE</button>
        <button onClick={runPreview} className="code-accent" title="Ctrl/Cmd + Enter"><Play/> RUN</button>
        <button onClick={()=>setModal("commands")} className="code-mobile-menu" aria-label="Open Code Lab menu"><Menu/></button>
      </nav>
    </header>

    <aside className={`code-sidebar ${mobilePanel==="files"?"mobile-active":""}`}>
      <header><span>EXPLORER</span><div><button onClick={createFile} title={word("New file","Новый файл")}><FileCode2 size={13}/></button><button onClick={createFolder} title={word("New folder","Новая папка")}><FolderOpen size={13}/></button></div></header>
      <div className="file-tree"><b><ChevronDown size={12}/> {project.name.toUpperCase()}</b>{(project.folders||[]).map(folder=><span className="folder-row" key={folder}><FolderOpen size={12}/>{folder}</span>)}{project.files.map(file=><div role="button" tabIndex={0} className={`file-row ${file.id===activeFile.id?"active":""}`} onClick={()=>openFile(file.id)} onKeyDown={event=>{if(event.key==="Enter")openFile(file.id)}} key={file.id} title={file.folder?`${file.folder}/${file.name}`:file.name}><i>{fileIcon(file)}</i><span>{file.name}</span>{draftRef.current.has(`${project.id}:${file.id}`)&&<em>●</em>}<small><button onClick={event=>{event.stopPropagation();duplicateFile(file)}} title={word("Duplicate","Дублировать")}>＋</button><button onClick={event=>{event.stopPropagation();renameFile(file)}} title={word("Rename","Переименовать")}>✎</button><button onClick={event=>{event.stopPropagation();deleteFile(file)}} title={word("Delete","Удалить")}>×</button></small></div>)}</div>
      <footer><button onClick={()=>setModal("projects")}><FolderOpen/> PROJECTS <span>{store.projects.length}</span></button><button onClick={()=>setModal("settings")}><Settings/> SETTINGS</button><button onClick={()=>importRef.current?.click()}><Import/> IMPORT FILES</button></footer>
    </aside>
    <div className="side-resizer" role="separator" aria-label="Resize files panel" tabIndex={0} onDoubleClick={resetPanels} onPointerDown={event=>startResize("side",event)}/>

    <section className={`code-editor ${mobilePanel==="editor"?"mobile-active":""}`}>
      <div className="editor-tabs">{openFiles.map(file=><button className={file.id===activeFile.id?"active":""} onClick={()=>openFile(file.id)} key={file.id}><i>{fileIcon(file)}</i>{file.name}{draftRef.current.has(`${project.id}:${file.id}`)&&<em>●</em>}<X size={11} onClick={event=>{event.stopPropagation();closeTab(file.id)}}/></button>)}<button className="add-tab" onClick={createFile} title={word("New file","Новый файл")}><Plus size={13}/></button></div>
      <div className="editor-breadcrumb"><span>{project.name}</span><b>/</b>{activeFile.folder&&<><span>{activeFile.folder}</span><b>/</b></>}<strong>{activeFile.name}</strong><i>{dirty?"UNSAVED CHANGES":"LOCAL AUTOSAVE"}</i></div>
      <Editor
        key={`${project.id}:${activeFile.id}`}
        path={`nexus://${project.id}/${activeFile.id}/${activeFile.name}`}
        defaultLanguage={editorLanguage(activeFile)}
        value={draftRef.current.get(`${project.id}:${activeFile.id}`)??activeFile.content}
        theme={theme==="light"?"vs":"vs-dark"}
        loading={<div className="monaco-loading"><Braces/> INITIALIZING EDITOR…</div>}
        onMount={(editor)=>{editorRef.current=editor;editor.focus();requestAnimationFrame(()=>editor.layout());editor.onDidChangeCursorPosition(event=>{const node=rootRef.current?.querySelector(".status-position");if(node)node.textContent=`Ln ${event.position.lineNumber}, Col ${event.position.column}`})}}
        onChange={changeFile}
        options={{fontSize:project.settings.fontSize,wordWrap:project.settings.wordWrap?"on":"off",lineNumbers:project.settings.lineNumbers?"on":"off",minimap:{enabled:project.settings.minimap},tabSize:project.settings.tabSize,insertSpaces:true,automaticLayout:false,padding:{top:14,bottom:14},smoothScrolling:true,renderWhitespace:"selection",cursorSmoothCaretAnimation:"on",scrollBeyondLastLine:false,stickyScroll:{enabled:false},bracketPairColorization:{enabled:true}}}
      />
    </section>

    <section className={`code-preview ${mobilePanel==="preview"?"mobile-active":""}`}>
      <div className="preview-toolbar">
        <div>{(["DESKTOP","LAPTOP","TABLET","MOBILE"] as const).map(device=><button className={project.settings.device===device?"active":""} key={device} onClick={()=>setDevice(device)} title={`${device} ${devices[device][0]}px`}>{device==="MOBILE"?<Smartphone size={14}/>:device==="TABLET"?<Tablet size={14}/>:<Monitor size={14}/>}</button>)}<button className={`preview-custom ${project.settings.device==="CUSTOM"?"active":""}`} onClick={()=>updateSettings({device:"CUSTOM"})} title={word("Custom preview size","Произвольный размер")}>CUSTOM</button><button onClick={rotate} title={word("Rotate device","Повернуть устройство")}><RotateCcw size={13}/></button></div>
        <label><input aria-label="Preview width" type="number" min="240" max="2560" value={project.settings.width} onChange={event=>updateSettings({device:"CUSTOM",width:clamp(Number(event.target.value)||240,240,2560)})}/><span>×</span><input aria-label="Preview height" type="number" min="320" max="1600" value={project.settings.height} onChange={event=>updateSettings({device:"CUSTOM",height:clamp(Number(event.target.value)||320,320,1600)})}/></label>
        <div><select aria-label="Preview zoom" value={zoom} onChange={event=>updateSettings({zoom:Number(event.target.value)})}><option value="0">FIT</option>{[50,75,100,125].map(value=><option key={value} value={value}>{value}%</option>)}</select><button onClick={stopPreview} title={word("Stop preview","Остановить превью")}>■</button><button onClick={resetPreview} title={word("Reset preview","Сбросить превью")}><RefreshCw size={13}/></button><button onClick={openPreviewWindow} title={word("Open preview window","Открыть превью отдельно")}><ExternalLink size={13}/></button><button onClick={()=>setZen(true)} title={word("Focus mode","Фокус-режим")}><Maximize2 size={13}/></button></div>
      </div>
      <div ref={previewStageRef} className={`preview-stage screen-${project.settings.screen} ${zoom===0?"fit-preview":""}`}><div className={project.settings.frame?"device-frame":""} style={{width:project.settings.width,height:project.settings.height,transform:`scale(${zoomScale})`}}><iframe title="NEXUS project preview" sandbox="allow-scripts" srcDoc={srcDoc}/><button className="preview-width-handle" aria-label="Drag preview width" onPointerDown={startPreviewWidth}/></div></div>
      <div className="preview-status"><span>{previewStopped?"■ STOPPED":project.settings.live?"● LIVE":"○ MANUAL"}</span><button onClick={()=>updateSettings({live:!project.settings.live})}>{project.settings.live?word("PAUSE LIVE","ПАУЗА LIVE"):word("ENABLE LIVE","ВКЛ. LIVE")}</button><span>WIDTH: {dragWidth??project.settings.width}px</span><span>{dragWidth??project.settings.width} × {project.settings.height}</span><span>{metrics.overflow?"OVERFLOW":"RESPONSIVE OK"}</span></div>
    </section>

    <div className="bottom-resizer" role="separator" aria-label="Resize console" tabIndex={0} onDoubleClick={resetPanels} onPointerDown={event=>startResize("bottom",event)}/>
    <section className={`code-console ${mobilePanel==="console"?"mobile-active":""}`}>
      <header><div><button className={bottomTab==="console"?"active":""} onClick={()=>setBottomTab("console")}>CONSOLE <span>{logs.length}</span></button><button className={bottomTab==="problems"?"active":""} onClick={()=>setBottomTab("problems")}>PROBLEMS <span>{statusProblems}</span></button></div><div><span>{metrics.smallTargets?`${metrics.smallTargets} SMALL TARGETS`:"TARGETS OK"}</span><button onClick={()=>setLogs([])}>{word("CLEAR","ОЧИСТИТЬ")}</button><button onClick={()=>setConsoleOpen(false)}><PanelBottomClose size={13}/></button></div></header>
      <div className="console-content">{bottomTab==="console"?(logs.length?logs.map(log=><p className={log.level} key={log.id}><time>{log.time}</time><b>{log.level.toUpperCase()}</b><span>{log.text}</span></p>):<p className="console-empty">NEXUS CONSOLE / READY — Ctrl + Enter to run.</p>):problems.map((problem,index)=><button className={problem.tone} key={`${problem.message}-${index}`} onClick={()=>{const target=project.files.find(file=>file.name===problem.file);if(target)openFile(target.id)}}><i/><b>{problem.file||"PROJECT"}</b><span>{problem.message}</span></button>)}</div>
    </section>

    <footer className="code-statusbar"><span>{activeFile.language.toUpperCase()}</span><span className="status-position">Ln 1, Col 1</span><span>Spaces: {project.settings.tabSize}</span><span className={statusProblems?"status-error":""}>{statusProblems} problems</span><span>{dragWidth??project.settings.width}px</span><span className={online?"":"status-error"}>{online?"ONLINE":"OFFLINE — LOCAL WORK CONTINUES"}</span></footer>
    <nav className="code-mobile-nav"><button className={mobilePanel==="files"?"active":""} onClick={()=>setMobilePanel("files")}><FolderOpen/>FILES</button><button className={mobilePanel==="editor"?"active":""} onClick={()=>setMobilePanel("editor")}><Code2/>CODE</button><button className={mobilePanel==="preview"?"active":""} onClick={()=>setMobilePanel("preview")}><Monitor/>PREVIEW</button><button className={mobilePanel==="console"?"active":""} onClick={()=>setMobilePanel("console")}><PanelBottomClose/>CONSOLE</button></nav>
    {!sidebarOpen&&<button className="restore-side" onClick={()=>setSidebarOpen(true)}><PanelLeftClose/> FILES</button>}{!consoleOpen&&<button className="restore-console" onClick={()=>setConsoleOpen(true)}>⌃ CONSOLE</button>}{zen&&<button className="zen-exit" onClick={()=>setZen(false)}>ESC / EXIT FOCUS</button>}

    {modal&&<div className="code-backdrop"><button className="code-backdrop-close" onClick={()=>setModal(null)} aria-label="Close dialog"/>
      {modal==="commands"&&<section className="code-command"><header><Search/><input autoFocus value={query} onChange={event=>setQuery(event.target.value)} placeholder={word("Search commands…","Поиск команд…")} onKeyDown={event=>{if(event.key==="Enter"&&filteredCommands[0]){filteredCommands[0].run();setModal(null)}}}/><kbd>ESC</kbd></header>{filteredCommands.map(item=><button key={item.label} onClick={()=>{item.run();setModal(null)}}><Code2/><span>{item.label}</span><kbd>{item.keys}</kbd></button>)}</section>}
      {modal==="files"&&<section className="code-command"><header><Search/><input autoFocus value={query} onChange={event=>setQuery(event.target.value)} placeholder={word("Quick open file…","Быстро открыть файл…")} onKeyDown={event=>{if(event.key==="Enter"&&filteredFiles[0]){openFile(filteredFiles[0].id);setModal(null)}}}/><kbd>CTRL P</kbd></header>{filteredFiles.map(file=><button key={file.id} onClick={()=>{openFile(file.id);setModal(null)}}><FileCode2/><span>{file.folder?`${file.folder}/`:""}{file.name}</span><kbd>{file.language}</kbd></button>)}</section>}
      {modal==="new"&&<section className="new-project-modal"><header><span>NEW PROJECT / WIZARD</span><button onClick={()=>setModal(null)}><X/></button></header><h2>{word("Initialize a new signal.","Создай новый сигнал.")}</h2><label><span>{word("PROJECT NAME","НАЗВАНИЕ")}</span><input autoFocus value={wizard.name} onChange={event=>setWizard({...wizard,name:event.target.value})}/></label><div><span>{word("FORMAT","ФОРМАТ")}</span><section className="wizard-grid">{projectTypes.map(type=><button className={wizard.type===type?"active":""} onClick={()=>setWizard({...wizard,type})} key={type}><FileCode2/><b>{type}</b><small>HTML + CSS + JS</small></button>)}</section></div><div><span>{word("VISUAL DIRECTION","СТИЛЬ")}</span><section className="style-picker">{projectStyles.map(style=><button className={wizard.style===style?"active":""} onClick={()=>setWizard({...wizard,style})} key={style}><i className={`style-${style.toLowerCase()}`}/>{style}</button>)}</section></div><footer><button onClick={()=>setModal(null)}>{word("CANCEL","ОТМЕНА")}</button><button className="code-accent" onClick={createNewProject} disabled={!wizard.name.trim()}><Zap/> INITIALIZE PROJECT</button></footer></section>}
      {modal==="projects"&&<aside className="code-drawer"><header><span>PROJECTS</span><button onClick={()=>setModal(null)}><X/></button></header><div className="drawer-title"><h2>{word("Local projects","Локальные проекты")}</h2><button className="code-accent" onClick={()=>setModal("new")}><Plus/> NEW</button></div><div className="project-list">{store.projects.map(item=><article className={item.id===project.id?"active":""} key={item.id} onClick={()=>void selectProject(item.id)}><span>{item.type}</span><h3>{item.name}</h3><p>{item.files.length} FILES · {new Date(item.updatedAt).toLocaleDateString()}</p><div><button onClick={event=>{event.stopPropagation();renameProject(item)}}>RENAME</button><button onClick={event=>{event.stopPropagation();duplicateProject(item)}}>DUPLICATE</button><button onClick={event=>{event.stopPropagation();deleteProject(item)}} aria-label={`Delete ${item.name}`}><Trash2/></button></div></article>)}</div></aside>}
      {modal==="settings"&&<aside className="code-drawer"><header><span>WORKSPACE SETTINGS</span><button onClick={()=>setModal(null)}><X/></button></header><div className="drawer-title"><h2>{word("Code Lab controls","Настройки Code Lab")}</h2></div><div className="settings-groups">
        <section><h3>EDITOR</h3><label><span>FONT SIZE</span><input type="range" min="11" max="22" value={project.settings.fontSize} onChange={event=>updateSettings({fontSize:Number(event.target.value)})}/><b>{project.settings.fontSize}px</b></label><label><span>TAB SIZE</span><select value={project.settings.tabSize} onChange={event=>updateSettings({tabSize:Number(event.target.value)})}><option value="2">2 SPACES</option><option value="4">4 SPACES</option></select></label><label><span>WORD WRAP</span><input type="checkbox" checked={project.settings.wordWrap} onChange={event=>updateSettings({wordWrap:event.target.checked})}/></label><label><span>LINE NUMBERS</span><input type="checkbox" checked={project.settings.lineNumbers} onChange={event=>updateSettings({lineNumbers:event.target.checked})}/></label><label><span>MINIMAP</span><input type="checkbox" checked={project.settings.minimap} onChange={event=>updateSettings({minimap:event.target.checked})}/></label><button onClick={()=>void formatCurrent()}>FORMAT CURRENT FILE</button></section>
        <section><h3>PREVIEW</h3><label><span>LIVE PREVIEW</span><input type="checkbox" checked={project.settings.live} onChange={event=>updateSettings({live:event.target.checked})}/></label><label><span>DEBOUNCE</span><input type="range" min="400" max="700" step="50" value={project.settings.previewDelay} onChange={event=>updateSettings({previewDelay:Number(event.target.value)})}/><b>{project.settings.previewDelay}ms</b></label><label><span>AUTO-CLEAR CONSOLE</span><input type="checkbox" checked={project.settings.clearConsole} onChange={event=>updateSettings({clearConsole:event.target.checked})}/></label><label><span>DEVICE FRAME</span><input type="checkbox" checked={project.settings.frame} onChange={event=>updateSettings({frame:event.target.checked})}/></label><label><span>BACKGROUND</span><select value={project.settings.screen} onChange={event=>updateSettings({screen:event.target.value as CodeSettings["screen"]})}><option value="black">BLACK</option><option value="white">WHITE</option><option value="checker">CHECKER</option></select></label></section>
        <section><h3>AUTOSAVE / PERFORMANCE</h3><label><span>AUTOSAVE</span><input type="range" min="800" max="1500" step="100" value={project.settings.autosaveDelay} onChange={event=>updateSettings({autosaveDelay:Number(event.target.value)})}/><b>{project.settings.autosaveDelay}ms</b></label><label><span>QUALITY</span><select value={project.settings.previewQuality} onChange={event=>updateSettings({previewQuality:event.target.value as CodeSettings["previewQuality"]})}><option value="performance">PERFORMANCE</option><option value="standard">STANDARD</option></select></label><label><span>PREVIEW ANIMATIONS</span><input type="checkbox" checked={project.settings.animations} onChange={event=>updateSettings({animations:event.target.checked})}/></label></section>
        <section><h3>APPEARANCE / LAYOUT</h3><label><span>THEME</span><select value={theme} onChange={event=>setTheme(event.target.value as "dark"|"light"|"system")}><option value="dark">DARK</option><option value="light">LIGHT</option><option value="system">SYSTEM</option></select></label><label><span>LANGUAGE</span><select value={language} onChange={event=>setLanguage(event.target.value as "en"|"ru")}><option value="en">ENGLISH</option><option value="ru">РУССКИЙ</option></select></label><div className="layout-presets">{(["split","code","preview","full"] as LayoutMode[]).map(mode=><button className={layout===mode?"active":""} onClick={()=>setLayout(mode)} key={mode}>{mode==="split"?"CODE + PREVIEW":mode.toUpperCase()}</button>)}</div></section>
      </div><div className="settings-actions"><button onClick={downloadCurrent}>DOWNLOAD CURRENT FILE</button><button onClick={()=>importRef.current?.click()}><Import/> IMPORT SUPPORTED FILES</button><button onClick={()=>void exportProject()}><Download/> {exportState==="packing"?"PACKING ZIP…":"EXPORT PROJECT ZIP"}</button><button className="danger" onClick={async()=>{if(confirm(word("Reset all Code Lab data?","Сбросить все данные Code Lab?"))){await clearProjectStorage();location.reload()}}}>RESET LOCAL DATA</button></div></aside>}
    </div>}
    {deletedFile&&<div className="code-undo"><span>{deletedFile.file.name} {word("deleted","удалён")}</span><button onClick={undoDelete}>UNDO</button><button onClick={()=>setDeletedFile(null)} aria-label="Dismiss"><X/></button></div>}
    <input ref={importRef} type="file" multiple hidden accept=".html,.css,.js,.ts,.json" onChange={event=>void importFiles(event.target.files)}/>
  </main></NexusShell>;
}
