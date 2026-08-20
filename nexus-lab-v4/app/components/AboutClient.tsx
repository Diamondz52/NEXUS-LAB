"use client";

import NexusShell from "./NexusShell";
import DigitalCore from "./DigitalCore";
import { useNexus } from "./NexusProvider";

export default function AboutClient(){
  const {t}=useNexus();
  const services=["FRONTEND DEVELOPMENT","WEB DESIGN","CREATIVE DEVELOPMENT","INTERACTIVE EXPERIENCES"];
  const stack=["HTML","CSS","JAVASCRIPT","TYPESCRIPT","REACT","NEXT.JS","GIT","FIGMA","MOTION","THREE.JS"];
  return <NexusShell><main className="about-page v2-about">
    <section className="subpage-hero about-hero"><span>04 / {t("about.label")}</span><h1>THE PERSON<br/><em>BEHIND THE SYSTEM.</em></h1><p>{t("about.roles")}</p></section>
    <section className="about-profile"><div className="about-portrait"><DigitalCore compact/><span>ARSENII / NEXUS OPERATOR</span></div><div className="about-bio reveal"><span>{t("about.label")}</span><h2>{t("about.hello")}</h2><p>{t("about.body1")}</p><p>{t("about.body2")}</p><p>{t("about.body3")}</p><div className="profile-code"><b>ARSENII PIANKOV</b><span>FRONTEND DEVELOPMENT<br/>WEB DESIGN<br/>CREATIVE DEVELOPMENT</span><a href="https://github.com/Diamondz52" target="_blank" rel="noopener noreferrer">GITHUB / @Diamondz52 ↗</a></div></div></section>
    <section className="about-capabilities"><div className="section-heading"><span>01 / CAPABILITIES</span><h2>{t("about.what")}</h2></div><div>{services.map((service,index)=><article className="reveal" key={service}><span>0{index+1}</span><strong>{service}</strong><i>↗</i></article>)}</div></section>
    <section className="stack-section"><span>02 / TECHNOLOGY</span><h2>{t("about.stack")}</h2><div>{stack.map((item,index)=><span key={item} style={{animationDelay:`${index*.08}s`}}>{item}</span>)}</div></section>
    <section className="philosophy-section"><span>03 / PHILOSOPHY</span><blockquote>{t("about.philosophy")}</blockquote></section>
    <section className="github-call reveal"><span>FIND MY CODE</span><h2>GITHUB<br/><em>@DIAMONDZ52</em></h2><p>{t("about.github")}</p><a className="primary-btn" href="https://github.com/Diamondz52" target="_blank" rel="noopener noreferrer">{t("about.viewGithub").toUpperCase()} ↗</a></section>
    <section className="about-signoff"><p>HAVE AN IDEA?</p><h2>LET&apos;S TALK.</h2><a href="mailto:pyankovad2606@gmail.com">pyankovad2606@gmail.com ↗</a></section>
  </main></NexusShell>;
}
