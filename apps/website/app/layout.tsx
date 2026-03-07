import type { Metadata } from "next";
import { Sora, Noto_Sans } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display"
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "NextWave Platform | Enterprise Delivery Engine",
  description:
    "A globally adaptable enterprise platform for healthcare, operations, and AI delivery across industries and countries."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${notoSans.variable}`}>{children}</body>
    </html>
  );
}