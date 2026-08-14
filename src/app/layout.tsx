import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-stack",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Contrary · Where the crowd might be wrong",
  description:
    "Prediction markets show consensus. Contrary finds the disagreement: a multi-agent forecasting system that explains where and why it differs from the crowd.",
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="bg-ambient relative flex min-h-full flex-col bg-[#08090b] font-sans text-[#e9ecf1]">
        <Navbar />
        <main className="relative z-10 flex-1">{children}</main>
        <footer className="relative z-10 border-t border-[#1e232c] py-8">
          <div className="mx-auto max-w-[1240px] px-5 text-[12px] text-[#646c7a] lg:px-8">
            Contrary is a forecasting research tool. Probabilities are
            estimates, not advice.
          </div>
        </footer>
      </body>
    </html>
  );
}
