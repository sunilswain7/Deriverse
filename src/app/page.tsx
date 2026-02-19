"use client";

import { useState, useMemo } from 'react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useDeriverseData } from "@/hooks/useDeriverseData";
import { 
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  LayoutDashboard, History, Activity, Settings, Eye, EyeOff, ArrowUpRight, ArrowDownRight, Zap, Filter, ShoppingCart
} from 'lucide-react';

// Shadcn Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const { trades, stats, isLoading, balance, isDemo, toggleDemo } = useDeriverseData();
  
  // App Navigation State
  const [activeView, setActiveView] = useState<'overview' | 'journal' | 'execution'>('overview');

  // Filter State for Journal
  const [filterSymbol, setFilterSymbol] = useState('ALL');
  const [filterSide, setFilterSide] = useState('ALL');

  // Apply Filters
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
        if (filterSymbol !== 'ALL' && !t.symbol.includes(filterSymbol)) return false;
        if (filterSide !== 'ALL' && t.side !== filterSide) return false;
        return true;
    });
  }, [trades, filterSymbol, filterSide]);

  const allocationData = [
    { name: 'SOL-PERP', value: 400, color: '#8b5cf6' },
    { name: 'BTC-PERP', value: 300, color: '#3b82f6' },
    { name: 'USDC', value: 300, color: '#10b981' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 flex font-sans selection:bg-indigo-500/30">
      
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="w-16 md:w-64 border-r border-zinc-900 bg-[#0a0a0a] flex flex-col transition-all duration-300">
        <div className="p-4 md:p-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <Zap className="h-5 w-5 text-white" fill="currentColor" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-white tracking-tight">DERIVERSE</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Pro Analytics</p>
          </div>
        </div>
        
        <nav className="flex-1 px-2 md:px-4 space-y-2 mt-6">
          <SidebarButton icon={<LayoutDashboard />} label="Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
          <SidebarButton icon={<History />} label="Deep Journal" active={activeView === 'journal'} onClick={() => setActiveView('journal')} />
          <SidebarButton icon={<ShoppingCart />} label="Trade Execution" active={activeView === 'execution'} onClick={() => setActiveView('execution')} />
        </nav>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="flex-1 flex flex-col max-w-[1920px] h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-14 border-b border-zinc-900 bg-[#0a0a0a]/80 backdrop-blur shrink-0 flex items-center justify-between px-4">
           <div className="flex items-center gap-6 overflow-hidden text-xs font-mono opacity-80">
              <div className="flex items-center gap-2"><span className="text-zinc-500">SOL-PERP</span><span className="text-green-400 font-bold">$148.20</span></div>
              <Separator orientation="vertical" className="h-4 bg-zinc-800" />
              <div className="flex items-center gap-2"><span className="text-zinc-500">BTC-PERP</span><span className="text-red-400 font-bold">$64,230</span></div>
           </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleDemo} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all border ${isDemo ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-800"}`}>
              {isDemo ? <Eye size={12} /> : <EyeOff size={12} />}
              {isDemo ? "Sim Mode" : "Live Mode"}
            </button>
            <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Balance</span>
                <span className="text-xs font-mono font-bold text-zinc-200">{balance.toFixed(3)} SOL</span>
            </div>
            <WalletMultiButton style={{ height: '32px', fontSize: '12px', borderRadius: '6px', backgroundColor: '#4f46e5' }} />
          </div>
        </header>

        {/* DYNAMIC VIEW ROUTING */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            {activeView === 'overview' && (
                <OverviewView trades={trades} stats={stats} allocationData={allocationData} isDemo={isDemo} isLoading={isLoading} />
            )}
            {activeView === 'journal' && (
                <JournalView trades={filteredTrades} filterSymbol={filterSymbol} setFilterSymbol={setFilterSymbol} filterSide={filterSide} setFilterSide={setFilterSide} />
            )}
            {activeView === 'execution' && (
                <ExecutionView balance={balance} />
            )}
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// VIEW 1: OVERVIEW (The standard dashboard)
// ============================================================================
function OverviewView({ trades, stats, allocationData, isDemo, isLoading }: any) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Net PnL" value={`$${stats.netPnl.toFixed(2)}`} subValue="+12.5% this week" positive={stats.netPnl >= 0} />
                <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} subValue={`${stats.totalTrades} Total Trades`} positive={stats.winRate > 50} />
                <StatCard label="Volume" value={`$${(stats.volume/1000).toFixed(1)}k`} subValue="24h Rolling" />
                <StatCard label="Open Interest" value="$12.4k" subValue="3 Active Positions" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px]">
                <Card className="col-span-2 border-zinc-900 bg-[#0a0a0a] shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[320px] p-0">
                        {trades.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={trades} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                                <XAxis dataKey="timestamp" tick={false} axisLine={false} />
                                <YAxis stroke="#404040" fontSize={10} tickFormatter={(val) => `$${val}`} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontSize: '12px' }} />
                                <Area type="monotone" dataKey="pnl" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPnl)" />
                                <Bar dataKey="size" barSize={4} fill="#27272a" yAxisId={0} opacity={0.5} />
                            </ComposedChart>
                            </ResponsiveContainer>
                        ) : (<EmptyState message="No Data Available" />)}
                    </CardContent>
                </Card>

                <Card className="col-span-1 border-zinc-900 bg-[#0a0a0a] shadow-sm flex flex-col">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Asset Allocation</CardTitle></CardHeader>
                    <CardContent className="flex-1 relative">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={allocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {allocationData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a' }} />
                        </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-4">
                            <div className="text-center"><span className="text-2xl font-bold text-white block">$1.4k</span></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ============================================================================
// VIEW 2: DEEP JOURNAL (Advanced Filters & Scatter Plot)
// ============================================================================
function JournalView({ trades, filterSymbol, setFilterSymbol, filterSide, setFilterSide }: any) {
    return (
        <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Advanced Trade Journal</h2>
                <div className="flex gap-4">
                    <Select value={filterSymbol} onValueChange={setFilterSymbol}>
                        <SelectTrigger className="w-[120px] bg-[#0a0a0a] border-zinc-800 text-xs"><SelectValue placeholder="Asset" /></SelectTrigger>
                        <SelectContent className="bg-[#0a0a0a] border-zinc-800 text-zinc-300">
                            <SelectItem value="ALL">All Assets</SelectItem>
                            <SelectItem value="SOL">SOL-PERP</SelectItem>
                            <SelectItem value="BTC">BTC-PERP</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterSide} onValueChange={setFilterSide}>
                        <SelectTrigger className="w-[120px] bg-[#0a0a0a] border-zinc-800 text-xs"><SelectValue placeholder="Side" /></SelectTrigger>
                        <SelectContent className="bg-[#0a0a0a] border-zinc-800 text-zinc-300">
                            <SelectItem value="ALL">All Sides</SelectItem>
                            <SelectItem value="Long">Longs Only</SelectItem>
                            <SelectItem value="Short">Shorts Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Trade Map Chart (Scatter) */}
            <Card className="border-zinc-900 bg-[#0a0a0a] shrink-0">
                <CardHeader><CardTitle className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Trade Entry Map</CardTitle></CardHeader>
                <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                            <XAxis dataKey="timestamp" type="number" domain={['auto', 'auto']} tickFormatter={(time) => new Date(time).toLocaleDateString()} stroke="#404040" fontSize={10} />
                            <YAxis dataKey="price" type="number" name="Entry Price" stroke="#404040" fontSize={10} domain={['auto', 'auto']} />
                            <ZAxis dataKey="size" range={[50, 400]} name="Position Size" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a' }} labelFormatter={() => ''} />
                            <Scatter name="Trades" data={trades} fill="#8884d8">
                                {trades.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={(entry.pnl || 0) >= 0 ? '#10b981' : '#ef4444'} opacity={0.7} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Filtered Table */}
            <Card className="border-zinc-900 bg-[#0a0a0a] flex-1 overflow-hidden flex flex-col">
                <CardContent className="p-0 overflow-y-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="bg-zinc-900/50 sticky top-0 z-10">
                            <TableRow className="border-zinc-800"><TableHead>Asset</TableHead><TableHead>Side</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">PnL</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {trades.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-12 text-zinc-600">No trades match filters.</TableCell></TableRow>
                            ) : trades.map((t: any) => (
                                <TableRow key={t.id} className="border-zinc-900">
                                    <TableCell className="font-mono text-zinc-300 text-xs">{t.symbol}</TableCell>
                                    <TableCell><Badge className={`text-[10px] h-5 border-zinc-800 ${t.side === 'Long' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{t.side}</Badge></TableCell>
                                    <TableCell className="text-right font-mono text-zinc-400 text-xs">${t.price.toFixed(2)}</TableCell>
                                    <TableCell className={`text-right font-mono text-xs ${t.pnl && t.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{t.pnl && t.pnl > 0 ? "+" : ""}{t.pnl?.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

// ============================================================================
// VIEW 3: EXECUTION (Mockup to show Deriverse functionality)
// ============================================================================
function ExecutionView({ balance }: { balance: number }) {
    return (
        <div className="h-full flex items-center justify-center animate-in fade-in duration-300">
            <Card className="border-zinc-900 bg-[#0a0a0a] w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-white">Place Order via Deriverse</CardTitle>
                    <CardDescription className="text-zinc-500">Execute trades directly from the analytics suite.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-xs text-zinc-400 font-mono">
                        <span>Available Balance:</span><span>{balance.toFixed(2)} SOL</span>
                    </div>
                    <Select defaultValue="SOL-PERP">
                        <SelectTrigger className="bg-black border-zinc-800"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-black border-zinc-800"><SelectItem value="SOL-PERP">SOL-PERP</SelectItem><SelectItem value="BTC-PERP">BTC-PERP</SelectItem></SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="number" placeholder="Size (SOL)" className="bg-black border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                        <input type="number" placeholder="Price (Limit)" className="bg-black border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <button className="bg-green-500/10 text-green-500 border border-green-500/50 hover:bg-green-500/20 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors">Buy / Long</button>
                        <button className="bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors">Sell / Short</button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
function SidebarButton({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button onClick={onClick} className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all group ${active ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'}`}>
            <div className="shrink-0">{icon}</div>
            <span className="ml-3 hidden md:block">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 hidden md:block shadow-[0_0_8px_rgba(99,102,241,0.5)]" />}
        </button>
    )
}

function StatCard({ label, value, subValue, positive }: any) {
    return (
        <Card className="border-zinc-900 bg-[#0a0a0a] shadow-sm hover:border-zinc-800 transition-colors">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2"><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</p></div>
                <div className="text-2xl font-bold text-zinc-100 tracking-tight">{value}</div>
                <p className={`text-xs mt-1 ${positive === undefined ? 'text-zinc-600' : (positive ? 'text-green-500/80' : 'text-red-500/80')}`}>{subValue}</p>
            </CardContent>
        </Card>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-zinc-600">
            <Activity className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-xs uppercase tracking-widest opacity-50">{message}</p>
        </div>
    )
}