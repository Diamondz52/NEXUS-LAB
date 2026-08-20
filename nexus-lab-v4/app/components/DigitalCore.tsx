"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function DigitalCore({ compact = false }: { compact?: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mount.current) return;
    const host = mount.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
    camera.position.z = 5;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      host.classList.add("core-fallback");
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.2 : 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const group = new THREE.Group(); scene.add(group);
    const geometry = new THREE.IcosahedronGeometry(1.25, compact ? 2 : 4);
    const solid = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({ color: 0x10152b, emissive: 0x15113d, roughness:.25, metalness:.55, transparent:true, opacity:.82 }));
    const wire = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color:0x68eaff, wireframe:true, transparent:true, opacity:.36, blending:THREE.AdditiveBlending }));
    wire.scale.setScalar(1.035); group.add(solid, wire);
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.72,.012,8,160),new THREE.MeshBasicMaterial({color:0x77ecff,transparent:true,opacity:.62}));
    const ringB = ringA.clone(); ringA.rotation.x=1.05; ringA.rotation.y=.3; ringB.rotation.x=.45; ringB.rotation.y=1.2; ringB.scale.setScalar(1.2); group.add(ringA,ringB);
    const count = compact ? 90 : 220;
    const positions = new Float32Array(count*3);
    for(let i=0;i<count;i++){ const r=2+Math.random()*2.6,a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1); positions[i*3]=r*Math.sin(b)*Math.cos(a);positions[i*3+1]=r*Math.sin(b)*Math.sin(a);positions[i*3+2]=r*Math.cos(b); }
    const particlesGeo=new THREE.BufferGeometry();particlesGeo.setAttribute("position",new THREE.BufferAttribute(positions,3));
    const particles=new THREE.Points(particlesGeo,new THREE.PointsMaterial({color:0x8a6cff,size:.025,transparent:true,opacity:.7,blending:THREE.AdditiveBlending}));scene.add(particles);
    scene.add(new THREE.AmbientLight(0x5577ff,1.1));const point=new THREE.PointLight(0x7deeff,12,12);point.position.set(2,2,3);scene.add(point);

    let px=0,py=0,frame=0,pulse=0,visible=true;
    const pointer=(e:PointerEvent)=>{const r=host.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5};
    host.addEventListener("pointermove",pointer);
    const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};
    const ro=new ResizeObserver(resize);ro.observe(host);resize();
    const visibility=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true},{rootMargin:"160px"});visibility.observe(host);
    const signal=()=>{pulse=1};window.addEventListener("nexus-core-copy",signal);window.addEventListener("nexus-core-save",signal);
    const animate=(t:number)=>{const reduced=document.documentElement.dataset.motion==="reduced"||matchMedia("(prefers-reduced-motion: reduce)").matches;if(visible){group.rotation.y=(reduced?0:t*.00018)+px*.35;group.rotation.x=(reduced?0:Math.sin(t*.00035)*.09)+py*.22;particles.rotation.y=reduced?0:t*.000025;pulse*=.93;const s=1+(reduced?0:Math.sin(t*.0013)*.018)+pulse*.12;solid.scale.setScalar(s);wire.scale.setScalar(1.035/s);renderer.render(scene,camera)}frame=requestAnimationFrame(animate)};frame=requestAnimationFrame(animate);
    return()=>{cancelAnimationFrame(frame);ro.disconnect();visibility.disconnect();window.removeEventListener("nexus-core-copy",signal);window.removeEventListener("nexus-core-save",signal);host.removeEventListener("pointermove",pointer);geometry.dispose();particlesGeo.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Points){const m=o.material as THREE.Material;m.dispose()}});renderer.dispose();if(renderer.domElement.parentNode===host)host.removeChild(renderer.domElement)};
  },[compact]);
  return <div className="three-core" ref={mount} aria-label="Interactive digital core" />;
}
