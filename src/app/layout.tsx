import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import SystemMenu from "@/components/SystemMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "theg0d | Cyber-Vedic Astrologer",
  description: "Analyze your fate with the precision of a machine god.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0", // Prevents zoom on inputs
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <div className="noise-overlay"></div>
        <ErrorBoundary>
            <SystemMenu />
            {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
