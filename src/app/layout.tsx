import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KaushalSetu UP — कौशल सेतु | AI Skill Gap & Job Matchmaker",
  description:
    "AI-Driven Skill Gap & Hyper-Local Employment Matchmaker for Uttar Pradesh youth and industries. Built for AI Kaushal Hackathon 2026.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
