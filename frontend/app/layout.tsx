import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Human Risk & Phishing Defense Platform",
  description: "AI-powered cybersecurity platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/30`}>
        <Navbar />
        <main className="flex-1 container mx-auto p-4 md:p-8 animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  );
}
