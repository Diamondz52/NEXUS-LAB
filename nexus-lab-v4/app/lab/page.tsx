import type { Metadata } from "next";
import LabHubClient from "../components/LabHubClient";
export const metadata: Metadata={title:"Lab Hub — NEXUS LAB",description:"Choose a creative workspace and turn experiments into complete frontend projects."};
export default function Page(){return <LabHubClient/>}
