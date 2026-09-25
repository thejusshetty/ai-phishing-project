import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "PhishGuard AI — Advanced Threat Simulation & Human Risk Scoring",
  description: "Real-time multi-vector phishing simulation, Levenshtein typosquatting scanner, and SOC cybersecurity telemetry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#08090e] text-white antialiased font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
