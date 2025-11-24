import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/src/components/Providers";

import { ReviewNudge } from "../components/reviews/ReviewNudge";

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
  title: "Smart",

  description: "Sistema de administracion de recintos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-background text-foreground`}
      >
        <Providers>
          <ReviewNudge />
          {children}
        </Providers>
      </body>
    </html>
  );
}
