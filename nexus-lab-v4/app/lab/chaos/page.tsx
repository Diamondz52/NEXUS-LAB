import type { Metadata } from "next";
import LabClient from "../../components/LabClient";
export const metadata: Metadata={title:"Chaos Lab — NEXUS LAB",description:"Generate complete visual systems from controlled chaos."};
export default function Page(){return <LabClient/>}
