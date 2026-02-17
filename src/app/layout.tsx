import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppWalletProvider } from "@/components/WalletProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deriscope | Analytics",
  description: "Advanced analytics for Deriverse",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0b0d] text-white`}>
        <AppWalletProvider>{children}</AppWalletProvider>
      </body>
    </html>
  );
}