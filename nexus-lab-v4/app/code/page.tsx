import type { Metadata } from "next";
import CodeLabRouteClient from "../components/CodeLabRouteClient";

export const metadata:Metadata={title:"Code Lab — NEXUS LAB",description:"A stable local-first HTML, CSS and JavaScript workspace with Monaco, sandboxed live preview, responsive testing and real ZIP export."};
export default function Page(){return <CodeLabRouteClient/>}
