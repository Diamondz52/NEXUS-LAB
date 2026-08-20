"use client";

import NexusShell from "./NexusShell";
import { useNexus } from "./NexusProvider";

type Contact={name:string;handle:string;href?:string;tone:string;cursor:string};
const contacts:Contact[]=[
  {name:"EMAIL",handle:"pyankovad2606@gmail.com",href:"mailto:pyankovad2606@gmail.com",tone:"email",cursor:"MAIL"},
  {name:"TELEGRAM",handle:"@PlugOnPercs",href:"https://t.me/PlugOnPercs",tone:"telegram",cursor:"OPEN ↗"},
  {name:"GITHUB",handle:"Diamondz52",href:"https://github.com/Diamondz52",tone:"github",cursor:"OPEN ↗"},
  {name:"DISCORD",handle:"chieeefkeeef",tone:"discord",cursor:"COPY"},
  {name:"INSTAGRAM",handle:"@piankovarsenii",href:"https://www.instagram.com/piankovarsenii/",tone:"instagram",cursor:"OPEN ↗"},
  {name:"VK",handle:"arsenypyankov",href:"https://vk.ru/arsenypyankov",tone:"vk",cursor:"OPEN ↗"}
];

export default function ContactClient(){
  const {copy,t}=useNexus();
  return <NexusShell><main className="contact-page v2-contact">
    <section className="contact-hero"><span>05 / CONTACT</span><p className="contact-person">ARSENII PIANKOV<br/>{t("contact.role").toUpperCase()}</p><h1>LET&apos;S<br/><em>CREATE.</em></h1><p className="contact-note">{t("contact.label")}<br/>{t("contact.available")}</p></section>
    <section className="social-list">{contacts.map((contact,index)=>contact.href?<a className={`social-row ${contact.tone}`} key={contact.name} href={contact.href} target={contact.href.startsWith("http")?"_blank":undefined} rel={contact.href.startsWith("http")?"noopener noreferrer":undefined} data-cursor={contact.cursor}><span>0{index+1}</span><strong>{contact.name}</strong><b>{contact.handle}</b><i>↗</i></a>:<button className={`social-row ${contact.tone}`} key={contact.name} onClick={()=>copy(contact.handle,t("contact.discordCopied"))} data-cursor={contact.cursor}><span>0{index+1}</span><strong>{contact.name}</strong><b>{contact.handle}</b><i>COPY</i></button>)}</section>
    <section className="discord-note"><span>DISCORD / QUICK SIGNAL</span><h2>chieeefkeeef</h2><p>{t("contact.copyDiscord")}.<br/>{t("contact.available")}</p><button className="primary-btn" onClick={()=>copy("chieeefkeeef",t("contact.discordCopied"))}>{t("contact.copyDiscord").toUpperCase()}</button></section>
    <section className="contact-final"><span>ARSENII PIANKOV / FRONTEND DEVELOPER</span><h2>LET&apos;S BUILD<br/>SOMETHING<br/><em>DIFFERENT.</em></h2><a className="primary-btn" href="mailto:pyankovad2606@gmail.com">{t("contact.send").toUpperCase()} ↗</a></section>
  </main></NexusShell>;
}
