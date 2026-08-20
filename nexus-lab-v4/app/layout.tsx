import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NexusProvider from "./components/NexusProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nexus-void-2026.pyankovad2606.chatgpt.site"),
  title: { default: "NEXUS LAB — Your Digital Playground", template: "%s | NEXUS LAB" },
  description: "A local-first creative operating system with visual tools, project library and a complete frontend Code Lab.",
  openGraph: {
    title: "NEXUS LAB — Your Digital Playground",
    description: "Visual laboratories and a complete frontend Code Lab. Local-first, no account or API key required.",
    images: [{ url: "/og.png", width: 1792, height: 928, alt: "NEXUS LAB digital core" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXUS LAB — Your Digital Playground",
    description: "Build frontend projects with live preview, creative tools and local-first storage.",
    images: ["/og.png"],
  },
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#030307" },
    { media: "(prefers-color-scheme: light)", color: "#f5f6fa" },
  ],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{__html:`(()=>{try{const m=localStorage.getItem('nexus-theme')||'system';const d=m==='system'?(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):m;const l=localStorage.getItem('nexus-language')||(navigator.language.toLowerCase().startsWith('ru')?'ru':'en');document.documentElement.dataset.theme=d;document.documentElement.dataset.lang=l;document.documentElement.lang=l}catch{document.documentElement.dataset.theme='dark'}})()`}} /></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NexusProvider>{children}</NexusProvider>
      </body>
    </html>
  );
}
