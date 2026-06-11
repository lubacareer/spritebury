import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { BackgroundMusic } from "@/components/background-music";
import "./globals.css";

const originalSurfer = localFont({
  src: "../../Original_Surfer/OriginalSurfer-Regular.ttf",
  variable: "--font-original-surfer",
  weight: "400",
  style: "normal",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spritebury",
  description: "A nostalgic virtual city life game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${originalSurfer.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <BackgroundMusic />
      </body>
    </html>
  );
}
