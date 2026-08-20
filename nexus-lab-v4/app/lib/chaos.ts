export type ChaosDNA={seed:string;name:string;tagline:string;palette:string[];angle:number;type:string;ui:string;card:string;button:string;motion:string;prompt:string};

const names=["VOID BLOOM","PRISM SHIFT","SIGNAL ZERO","AURORA NODE","CHROME DREAM","NEURAL TIDE","ECHO FORM","LUMEN PROTOCOL"];
const taglines=["Interfaces from another frequency.","Shape light. Move systems.","Built beyond the obvious.","Where signals become experiences.","A new layer of digital matter."];
const types=["MONUMENTAL SANS","LIQUID DISPLAY","MONO SYSTEM","ULTRA CONDENSED","OUTLINE GROTESK","GEOMETRIC BOLD"];
const motions=["FLOAT / SOFT","GLITCH / SHARP","PULSE / SLOW","REVEAL / CINEMATIC","ORBIT / CONTINUOUS","BLUR / ELASTIC"];
const hash=(text:string)=>{let value=2166136261;for(const character of text){value^=character.charCodeAt(0);value=Math.imul(value,16777619)}return value>>>0};
const rng=(seed:string)=>{let value=hash(seed);return()=>{value+=0x6D2B79F5;let next=value;next=Math.imul(next^next>>>15,next|1);next^=next+Math.imul(next^next>>>7,next|61);return((next^next>>>14)>>>0)/4294967296}};
const toHex=(random:()=>number)=>"#"+Math.floor(random()*16777215).toString(16).padStart(6,"0").toUpperCase();

export const createChaosSeed=()=>`NX-${Math.floor(100000+Math.random()*899999)}`;
export const generateChaosDNA=(seed:string):ChaosDNA=>{const random=rng(seed);const name=names[Math.floor(random()*names.length)];const palette=[toHex(random),toHex(random),toHex(random),toHex(random),toHex(random)];const type=types[Math.floor(random()*types.length)];const motion=motions[Math.floor(random()*motions.length)];return{seed,name,tagline:taglines[Math.floor(random()*taglines.length)],palette,angle:Math.floor(random()*360),type,ui:["GLASS / PRECISE","RAW / EDITORIAL","SOFT / FUTURE","DARK / TACTILE"][Math.floor(random()*4)],card:["TRANSLUCENT GRID","FLOATING MODULE","MONOLITH PANEL","BORDERLESS LAYER"][Math.floor(random()*4)],button:["MAGNETIC PILL","ORBITAL CIRCLE","MINIMAL LINE","SOLID SIGNAL"][Math.floor(random()*4)],motion,prompt:`Design a premium digital experience called ${name}, using a ${palette.join(", ")} palette, ${type.toLowerCase()} typography, controlled depth, ${motion.toLowerCase()} motion and purposeful interactive feedback.`}};
