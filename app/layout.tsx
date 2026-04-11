import type { Metadata } from "next";
import localFont from "next/font/local";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Health Journal AI - Your AI-Powered Journaling Companion",
  description:
    "Transform your thoughts into health insights with AI-powered journaling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${dmSans.variable} antialiased bg-custom-gradient dark:bg-none dark:bg-zinc-950 min-h-screen`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
