"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LayoutDashboard, History, Settings, Zap, CandlestickChart } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 flex font-sans selection:bg-indigo-500/30">
      {/* SIDEBAR */}
      <aside className="w-16 md:w-64 border-r border-zinc-900 bg-[#0a0a0a] flex flex-col transition-all duration-300">
        <div className="p-4 md:p-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <Zap className="h-5 w-5 text-white" fill="currentColor" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-white tracking-tight">DERISCOPE</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-2 md:px-4 space-y-2 mt-6">
          <SidebarLink href="/" icon={<LayoutDashboard />} label="Overview" active={pathname === "/"} />
          <SidebarLink href="/trade" icon={<CandlestickChart />} label="Pro Terminal" active={pathname === "/trade"} />
          <SidebarLink href="/journal" icon={<History />} label="Deep Journal" active={pathname === "/journal"} />
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col max-w-[1920px] h-screen overflow-hidden">
        {/* GLOBAL HEADER */}
        <header className="h-14 border-b border-zinc-900 bg-[#0a0a0a]/80 backdrop-blur shrink-0 flex items-center justify-end px-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">Devnet Active</Badge>
            <WalletMultiButton style={{ height: '32px', fontSize: '12px', borderRadius: '6px', backgroundColor: '#4f46e5' }} />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ href, icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
    return (
        <Link href={href} className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all group ${active ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'}`}>
            <div className="shrink-0">{icon}</div>
            <span className="ml-3 hidden md:block">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 hidden md:block shadow-[0_0_8px_rgba(99,102,241,0.5)]" />}
        </Link>
    );
}

function Badge({ children, className }: any) {
  return <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}>{children}</span>;
}