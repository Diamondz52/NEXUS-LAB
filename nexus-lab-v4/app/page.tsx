import type { Metadata } from "next";
import HomeClient from "./components/HomeClient";
export const metadata: Metadata = { title:"NEXUS LAB — Your Digital Playground", description:"Create, experiment and break reality with local-first creative tools." };
export default function Page(){ return <HomeClient/>; }
