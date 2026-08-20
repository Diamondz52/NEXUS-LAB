import type { Metadata } from "next";
import AboutClient from "../components/AboutClient";
export const metadata: Metadata={title:"About — NEXUS LAB",description:"The philosophy and system behind NEXUS LAB."};
export default function Page(){return <AboutClient/>}
