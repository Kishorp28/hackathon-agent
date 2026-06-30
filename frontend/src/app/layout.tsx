import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HackathonProvider } from "@/context/HackathonContext";
import { Navbar } from "@/components/Navbar";
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
  title: "Hackathon Partner | Multi-Agent AI System",
  description:
    "AI team of specialists that collaborates to produce complete hackathon solutions—from idea to architecture to pitch deck.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="gradient-mesh min-h-full flex flex-col bg-slate-950 text-slate-100">
        <HackathonProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
            Multi-Agent Hackathon Partner — Flowise + FastAPI + Next.js
          </footer>
        </HackathonProvider>
      </body>
    </html>
  );
}
