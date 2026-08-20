"use client";

import {ComponentType,useEffect,useState} from "react";

export default function CodeLabRouteClient(){
  const [Workspace,setWorkspace]=useState<ComponentType|null>(null);
  useEffect(()=>{let active=true;import("./CodeLabClient").then(module=>{if(active)setWorkspace(()=>module.default)});return()=>{active=false}},[]);
  return Workspace?<Workspace/>:<div className="code-loading">INITIALIZING CODE LAB / LOADING EDITOR RUNTIME…</div>;
}
