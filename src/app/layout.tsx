import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppWalletProvider } from "@/components/WalletProvider";
import DashboardLayout from "@/components/DashboardLayout"; // Import the new layout

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deriscope | Pro Analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#050505] text-white`}>
        <AppWalletProvider>
           <DashboardLayout>
              {children}
           </DashboardLayout>
        </AppWalletProvider>
      </body>
    </html>
  );
}