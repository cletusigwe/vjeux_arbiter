import type { Metadata } from "next";
import "./globals.css";
import SideBar from "../components/SideBar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Arbiter",
  description: "Judge AA Faster",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen w-screen text-white">
        <SideBar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
