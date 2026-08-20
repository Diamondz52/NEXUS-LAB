import type { Metadata } from "next";
import ChangelogClient from "../components/ChangelogClient";

export const metadata:Metadata={title:"Changelog — NEXUS LAB",description:"NEXUS LAB version history and product evolution."};
export default function ChangelogPage(){return <ChangelogClient/>}
