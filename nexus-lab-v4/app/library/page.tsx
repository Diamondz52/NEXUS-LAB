import type { Metadata } from "next";
import LibraryClient from "../components/LibraryClient";
export const metadata:Metadata={title:"My Library — NEXUS LAB",description:"Your locally saved prompts, palettes, gradients and visual systems."};
export default function Page(){return <LibraryClient/>}
