"use client";
/* eslint-disable @next/next/no-html-link-for-pages */
import NexusShell from "./components/NexusShell";
import { useNexus } from "./components/NexusProvider";

export default function NotFound(){const {t}=useNexus();return <NexusShell><main className="not-found"><div className="lost-orbit"><i/><i/><b>404</b></div><span>ERROR / UNKNOWN FREQUENCY</span><h1>{t("notFound.title")}</h1><p>The requested coordinate does not exist in this version of the system.</p><a className="primary-btn" href="/">{t("notFound.action")} ↗</a></main></NexusShell>}
