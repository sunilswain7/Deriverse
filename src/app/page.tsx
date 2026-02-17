"use client";

import { useMemo } from 'react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useDeriverseData } from "@/hooks/useDeriverseData";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, History, Wallet, Settings, TrendingUp, TrendingDown, Activity 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { trades, stats, isLoading, balance } = useDeriverseData();

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-400">
            DERISCOPE
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Pro Analytics Suite</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {['Overview', 'Journal', 'Risk Analysis', 'Settings'].map((item, i) => (
            <button key={item} className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${i === 0 ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:bg-zinc-900'}`}>
              {i === 0 && <LayoutDashboard className="mr-2 h-4 w-4" />}
              {i === 1 && <History className="mr-2 h-4 w-4" />}
              {i === 2 && <Activity className="mr-2 h-4 w-4" />}
              {i === 3 && <Settings className="mr-2 h-4 w-4" />}
              {item}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Pro Plan</span>
              <span className="text-xs text-zinc-500">Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-zinc-950 text-zinc-100">
        
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/95 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <span className="text-sm text-zinc-500">Market Status:</span>
             <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">
               Operational
             </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right mr-2 hidden sm:block">
                <p className="text-xs text-zinc-500">Wallet Balance</p>
                <p className="text-sm font-bold font-mono text-white">{balance.toFixed(3)} SOL</p>
            </div>
            <WalletMultiButton style={{ height: '40px', fontSize: '14px', borderRadius: '8px', backgroundColor: '#4f46e5' }} />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard title="Total Volume" value={`$${stats.volume.toLocaleString()}`} icon={<Activity className="h-4 w-4 text-zinc-500" />} />
            <KpiCard title="Win Rate" value={`${stats.winRate.toFixed(1)}%`} icon={<TrendingUp className="h-4 w-4 text-green-500" />} />
            <KpiCard title="Total Trades" value={stats.totalTrades.toString()} icon={<History className="h-4 w-4 text-blue-500" />} />
            <KpiCard title="Net PnL" value={`$${stats.netPnl.toFixed(2)}`} icon={<Wallet className="h-4 w-4 text-purple-500" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Section */}
            <Card className="col-span-2 border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-white">Equity Curve</CardTitle>
                <CardDescription className="text-zinc-400">Performance over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trades.length > 0 ? trades : [{timestamp: 0, pnl: 0}]}>
                    <defs>
                      <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis stroke="#666" fontSize={12} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="pnl" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPnl)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="col-span-1 border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-zinc-400">On-Chain Interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full bg-zinc-800" />
                        <Skeleton className="h-12 w-full bg-zinc-800" />
                        <Skeleton className="h-12 w-full bg-zinc-800" />
                    </div>
                  ) : trades.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500">
                        No Deriverse trades found.
                    </div>
                  ) : (
                    trades.slice(0, 5).map((trade, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${trade.side === 'Long' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            {trade.side === 'Long' ? <TrendingUp size={16} className="text-green-500" /> : <TrendingDown size={16} className="text-red-500" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-white">{trade.symbol}</span>
                            <span className="text-xs text-zinc-500">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-sm text-zinc-300">
                                {trade.pnl && trade.pnl > 0 ? "+" : ""}{trade.pnl?.toFixed(2)}
                            </p>
                            <Badge variant="secondary" className="text-[10px] h-5 bg-zinc-800 text-zinc-400">Confirmed</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Table */}
          <Tabs defaultValue="trades" className="w-full">
            <TabsList className="bg-zinc-900">
              <TabsTrigger value="trades" className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-white">Trade History</TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-white">Open Orders</TabsTrigger>
              <TabsTrigger value="fees" className="data-[state=active]:bg-zinc-800 text-zinc-400 data-[state=active]:text-white">Fee Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="trades">
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-white">Detailed Journal</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400">Asset</TableHead>
                        <TableHead className="text-zinc-400">Type</TableHead>
                        <TableHead className="text-zinc-400">Side</TableHead>
                        <TableHead className="text-zinc-400">Signature</TableHead>
                        <TableHead className="text-right text-zinc-400">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {trades.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-zinc-500 h-24">No trades found in recent history.</TableCell>
                            </TableRow>
                        )}
                        {trades.map((t) => (
                            <TableRow key={t.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                <TableCell className="font-medium text-white">{t.symbol}</TableCell>
                                <TableCell className="text-zinc-300">{t.type}</TableCell>
                                <TableCell>
                                    <Badge className={t.side === 'Long' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}>
                                        {t.side}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-zinc-500">
                                    {t.id.slice(0, 8)}...{t.id.slice(-8)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="outline" className="border-zinc-700 text-zinc-400">{t.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
}

function KpiCard({ title, value, icon }: { title: string, value: string, icon: any }) {
    return (
        <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
            </CardContent>
        </Card>
    )
}