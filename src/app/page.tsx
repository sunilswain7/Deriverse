"use client";

import { useDeriverseData } from "@/hooks/useDeriverseData";
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function OverviewPage() {
  const { trades, stats } = useDeriverseData();

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Net PnL" value={`$${stats.netPnl.toFixed(2)}`} subValue="All Time" positive={stats.netPnl >= 0} />
            <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} subValue={`${stats.totalTrades} Total Trades`} positive={stats.winRate > 50} />
            <StatCard label="Volume" value={`$${(stats.volume/1000).toFixed(1)}k`} subValue="24h Rolling" />
            <StatCard label="Open Interest" value="$12.4k" subValue="Active Positions" />
        </div>

        <Card className="border-zinc-900 bg-[#0a0a0a] shadow-sm">
            <CardHeader>
                <CardTitle className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Account Equity Curve</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
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
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                        <Activity className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-xs uppercase tracking-widest opacity-50">No Data Available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}

function StatCard({ label, value, subValue, positive }: any) {
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