// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Nav from "./Component/Nav";
import Footer from "./Component/Footer";
import { auth } from "@/auth";

// 1. Import the Toaster from react-hot-toast
import { Toaster } from "react-hot-toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zengy.Co",
  description: "a essential clothing brand for everyone",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider session={session}>
          <Nav />
          {children}
          <Footer />
        </SessionProvider>
        
        {/* 2. Add the Toaster component right here */}
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333333',
              color: '#fff',
            },
          }} 
        />
      </body>
    </html>
  );
}