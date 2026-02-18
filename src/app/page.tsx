"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useDeriverseData } from "@/hooks/useDeriverseData";
import { 
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  LayoutDashboard, History, Activity, Settings, Eye, EyeOff, ArrowUpRight, ArrowDownRight, Zap 
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const { trades, stats, isLoading, balance, isDemo, toggleDemo } = useDeriverseData();

  const allocationData = [
    { name: 'SOL-PERP', value: 400, color: '#8b5cf6' }, 
    { name: 'BTC-PERP', value: 300, color: '#3b82f6' },
    { name: 'USDC', value: 300, color: '#10b981' },     
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 flex font-sans selection:bg-indigo-500/30">
      
      {/* 1. Slim Sidebar (Terminal Style) */}
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
        
        <nav className="flex-1 px-2 md:px-4 space-y-1 mt-6">
          {['Overview', 'Journal', 'Risk', 'Settings'].map((item, i) => (
            <button key={item} className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all group ${i === 0 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'}`}>
              <div className="shrink-0">
                {i === 0 && <LayoutDashboard className="h-5 w-5" />}
                {i === 1 && <History className="h-5 w-5" />}
                {i === 2 && <Activity className="h-5 w-5" />}
                {i === 3 && <Settings className="h-5 w-5" />}
              </div>
              <span className="ml-3 hidden md:block">{item}</span>
              {i === 0 && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 hidden md:block shadow-[0_0_8px_rgba(99,102,241,0.5)]" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col max-w-[1920px]">
        
        {/* Top Header & Ticker */}
        <header className="h-14 border-b border-zinc-900 bg-[#0a0a0a]/80 backdrop-blur sticky top-0 z-20 flex items-center justify-between px-4">
           {/* Market Ticker */}
           <div className="flex items-center gap-6 overflow-hidden text-xs font-mono opacity-80">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">SOL-PERP</span>
                <span className="text-green-400 font-bold">$148.20</span>
                <span className="text-green-500/50">+2.4%</span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-zinc-800" />
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">BTC-PERP</span>
                <span className="text-red-400 font-bold">$64,230</span>
                <span className="text-red-500/50">-0.8%</span>
              </div>
               <Separator orientation="vertical" className="h-4 bg-zinc-800" />
               <div className="flex items-center gap-2">
                <span className="text-zinc-500">ETH-PERP</span>
                <span className="text-green-400 font-bold">$3,450</span>
                <span className="text-green-500/50">+1.1%</span>
              </div>
           </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleDemo}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all border ${
                isDemo 
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]" 
                  : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-800"
              }`}
            >
              {isDemo ? <Eye size={12} /> : <EyeOff size={12} />}
              {isDemo ? "Sim Mode" : "Live Mode"}
            </button>

            <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Balance</span>
                <span className="text-xs font-mono font-bold text-zinc-200">{balance.toFixed(3)} SOL</span>
            </div>
            <WalletMultiButton style={{ height: '32px', fontSize: '12px', borderRadius: '6px', backgroundColor: '#4f46e5', fontFamily: 'monospace' }} />
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="p-4 md:p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Row 1: High Density Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Net PnL" value={`$${stats.netPnl.toFixed(2)}`} subValue="+12.5% this week" positive={stats.netPnl >= 0} />
            <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} subValue={`${stats.totalTrades} Total Trades`} positive={stats.winRate > 50} />
            <StatCard label="Volume" value={`$${(stats.volume/1000).toFixed(1)}k`} subValue="24h Rolling" />
            <StatCard label="Open Interest" value="$12.4k" subValue="3 Active Positions" />
          </div>

          {/* Row 2: The "Pro" Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px]">
            {/* Main Chart: Equity + Drawdown */}
            <Card className="col-span-2 border-zinc-900 bg-[#0a0a0a] shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Performance Analysis</CardTitle>
                  <CardDescription className="text-xs text-zinc-600">PnL vs. Trade Volume</CardDescription>
                </div>
                <div className="flex gap-2">
                   <Badge variant="outline" className="text-xs bg-zinc-900 text-zinc-500 border-zinc-800 cursor-pointer hover:text-zinc-300">1D</Badge>
                   <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20">1W</Badge>
                   <Badge variant="outline" className="text-xs bg-zinc-900 text-zinc-500 border-zinc-800 cursor-pointer hover:text-zinc-300">1M</Badge>
                </div>
              </CardHeader>
              <CardContent className="h-[320px] p-0">
                 {trades.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trades} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                        <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                        <XAxis dataKey="timestamp" tick={false} axisLine={false} />
                        <YAxis stroke="#404040" fontSize={10} tickFormatter={(val) => `$${val}`} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontSize: '12px' }}
                            itemStyle={{ color: '#e4e4e7' }}
                            labelStyle={{ color: '#a1a1aa' }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Area type="monotone" dataKey="pnl" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPnl)" />
                        <Bar dataKey="size" barSize={4} fill="#27272a" yAxisId={0} opacity={0.5} />
                    </ComposedChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                        <Activity className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-xs uppercase tracking-widest opacity-50">No Data Available</p>
                    </div>
                 )}
              </CardContent>
            </Card>

            {/* Side Chart: Allocation / Risk */}
            <Card className="col-span-1 border-zinc-900 bg-[#0a0a0a] shadow-sm flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: '#fff' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                   <div className="text-center">
                      <span className="text-2xl font-bold text-white block">$1.4k</span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Total Value</span>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Denser Table + Tabs */}
          <Tabs defaultValue="trades" className="w-full">
            <TabsList className="bg-zinc-900 p-1 border border-zinc-800 rounded-lg">
              <TabsTrigger value="trades" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500">Trade History</TabsTrigger>
              <TabsTrigger value="orders" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500">Open Orders</TabsTrigger>
              <TabsTrigger value="fees" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500">Fee Analysis</TabsTrigger>
            </TabsList>
            
            {/* 1. Trade History Tab */}
            <TabsContent value="trades">
              <Card className="border-zinc-900 bg-[#0a0a0a]">
                 <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-900/50">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="h-9 text-xs font-medium text-zinc-500 uppercase">Asset</TableHead>
                                <TableHead className="h-9 text-xs font-medium text-zinc-500 uppercase">Side</TableHead>
                                <TableHead className="h-9 text-xs font-medium text-zinc-500 uppercase text-right">Size</TableHead>
                                <TableHead className="h-9 text-xs font-medium text-zinc-500 uppercase text-right">Price</TableHead>
                                <TableHead className="h-9 text-xs font-medium text-zinc-500 uppercase text-right">PnL</TableHead>
                                <TableHead className="h-9 text-xs font-medium text-zinc-500 uppercase text-right">Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trades.length === 0 && !isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-zinc-600 text-xs uppercase tracking-widest">
                                       {isDemo ? "Initialize Demo Mode to see data" : "No recent trades found"}
                                    </TableCell>
                                </TableRow>
                            )}
                            {trades.map((t) => (
                                <TableRow key={t.id} className="border-zinc-900 hover:bg-zinc-900/50">
                                    <TableCell className="font-mono text-zinc-300 font-bold text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1 h-3 rounded-full ${t.symbol.includes("SOL") ? "bg-indigo-500" : "bg-orange-500"}`} />
                                            {t.symbol}
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline" className={`text-[10px] h-5 border-zinc-800 ${t.side === 'Long' ? 'text-green-500 bg-green-500/5' : 'text-red-500 bg-red-500/5'}`}>{t.side}</Badge></TableCell>
                                    <TableCell className="text-right font-mono text-zinc-400 text-xs">{t.size.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-mono text-zinc-400 text-xs">${t.price.toFixed(2)}</TableCell>
                                    <TableCell className={`text-right font-mono text-xs ${t.pnl && t.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {t.pnl && t.pnl > 0 ? "+" : ""}{t.pnl?.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right text-zinc-600 text-xs">{new Date(t.timestamp).toLocaleTimeString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </CardContent>
              </Card>
            </TabsContent>

            {/* 2. Open Orders Tab */}
            <TabsContent value="orders">
               <Card className="border-zinc-900 bg-[#0a0a0a] min-h-[200px] flex flex-col items-center justify-center text-zinc-500">
                  {isDemo ? (
                      <div className="w-full">
                         <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-transparent"><TableHead className="text-xs uppercase">Symbol</TableHead><TableHead className="text-xs uppercase">Type</TableHead><TableHead className="text-xs uppercase">Price</TableHead><TableHead className="text-right text-xs uppercase">Action</TableHead></TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="border-zinc-900 hover:bg-zinc-900/50">
                                    <TableCell className="font-mono text-zinc-300 text-xs">SOL-PERP</TableCell>
                                    <TableCell className="text-xs text-zinc-500">Limit Buy</TableCell>
                                    <TableCell className="font-mono text-zinc-300 text-xs">$132.50</TableCell>
                                    <TableCell className="text-right"><Badge variant="destructive" className="text-[10px] cursor-pointer">Cancel</Badge></TableCell>
                                </TableRow>
                                <TableRow className="border-zinc-900 hover:bg-zinc-900/50">
                                    <TableCell className="font-mono text-zinc-300 text-xs">BTC-PERP</TableCell>
                                    <TableCell className="text-xs text-zinc-500">Take Profit</TableCell>
                                    <TableCell className="font-mono text-zinc-300 text-xs">$68,000</TableCell>
                                    <TableCell className="text-right"><Badge variant="destructive" className="text-[10px] cursor-pointer">Cancel</Badge></TableCell>
                                </TableRow>
                            </TableBody>
                         </Table>
                      </div>
                  ) : (
                      <div className="text-center">
                          <Activity className="h-8 w-8 mb-2 opacity-20 mx-auto" />
                          <p className="text-xs uppercase tracking-widest">No Open Orders</p>
                      </div>
                  )}
               </Card>
            </TabsContent>

            {/* 3. Fee Analysis Tab */}
            <TabsContent value="fees">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-zinc-900 bg-[#0a0a0a] p-4">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Total Fees Paid</p>
                      <h3 className="text-xl font-bold text-zinc-200 mt-1">${(stats.volume * 0.0005).toFixed(2)}</h3>
                      <p className="text-xs text-zinc-600 mt-2">Avg 0.05% per trade</p>
                  </Card>
                  <Card className="border-zinc-900 bg-[#0a0a0a] p-4">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Funding Paid</p>
                      <h3 className="text-xl font-bold text-red-400/80 mt-1">-$12.40</h3>
                      <p className="text-xs text-zinc-600 mt-2">Hourly Funding Rate</p>
                  </Card>
                  <Card className="border-zinc-900 bg-[#0a0a0a] p-4">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Rebates Earned</p>
                      <h3 className="text-xl font-bold text-green-400/80 mt-1">+$0.00</h3>
                      <p className="text-xs text-zinc-600 mt-2">Maker Volume Rewards</p>
                  </Card>
               </div>
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
}


function StatCard({ label, value, subValue, positive }: { label: string, value: string, subValue: string, positive?: boolean }) {
    return (
        <Card className="border-zinc-900 bg-[#0a0a0a] shadow-sm hover:border-zinc-800 transition-colors group">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</p>
                    {positive !== undefined && (
                        <div className={`p-1 rounded-full ${positive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        </div>
                    )}
                </div>
                <div className="text-2xl font-bold text-zinc-100 tracking-tight group-hover:text-white transition-colors">
                    {value}
                </div>
                <p className={`text-xs mt-1 ${positive === undefined ? 'text-zinc-600' : (positive ? 'text-green-500/80' : 'text-red-500/80')}`}>
                    {subValue}
                </p>
            </CardContent>
        </Card>
    )
}