import NavBar from "@/components/nav-bar";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Sean AI Chatbot",
  description: "Chat with Sean Xiao",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

const PAGES = [
  {
    title: "Home",
    link: "/",
  },
  {
    title: "Chat",
    link: "/chat",
  },
  {
    title: "About",
    link: "/about",
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <NavBar pages={PAGES} />
        {children}
      </body>
    </html>
  );
}
