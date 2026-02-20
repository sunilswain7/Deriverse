"use client";

import { useState, useMemo } from "react";
import { 
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ScatterChart, ZAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

// --- MOCK PRICE ENGINE ---
// Generates realistic looking price action and fake strategy markers
const generateMarketData = () => {
  let price = 145.00;
  const data = [];
  for(let i = 0; i < 60; i++) {
    price = price + (Math.random() * 4 - 2);
    // Generate random strategy markers
    const isWhale = Math.random() > 0.92;
    const isRSI = Math.random() > 0.88;
    
    data.push({
      time: new Date(Date.now() - (60 - i) * 3600000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      price: Number(price.toFixed(2)),
      whaleMarker: isWhale ? price - 1 : null,
      rsiMarker: isRSI ? price + 1 : null,
    });
  }
  return data;
};

export default function TradeTerminal() {
  const [asset, setAsset] = useState("SOL-PERP");
  const [marketData] = useState(generateMarketData());
  const currentPrice = marketData[marketData.length - 1].price;
  const [leverage, setLeverage] = useState([10]);

  // Strategy Toggles
  const [showWhales, setShowWhales] = useState(true);
  const [showRSI, setShowRSI] = useState(false);

  return (
    <div className="p-4 md:p-6 h-full flex flex-col gap-6 animate-in fade-in">
      
      {/* Top Header: Asset Info */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-6">
            <h2 className="text-3xl font-black text-white tracking-tighter">{asset}</h2>
            <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Mark Price</p>
                <p className="text-xl font-mono text-green-400">${currentPrice.toFixed(2)}</p>
            </div>
            <div className="hidden md:block">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">24h Vol</p>
                <p className="text-md font-mono text-zinc-300">$12.4M</p>
            </div>
        </div>
      </div>

      {/* Main Grid: Chart + Order Book */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
        
        {/* LEFT PANEL: Advanced Charting & Strategy */}
        <Card className="lg:col-span-2 border-zinc-900 bg-[#0a0a0a] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-zinc-900/50">
            <CardTitle className="text-sm text-zinc-300 font-bold uppercase tracking-wider">Strategy Matrix Chart</CardTitle>
            
            {/* The Strategy Checkboxes */}
            <div className="flex gap-4">
               <div className="flex items-center space-x-2">
                 <Checkbox id="whale" checked={showWhales} onCheckedChange={(c) => setShowWhales(!!c)} className="border-indigo-500 data-[state=checked]:bg-indigo-500" />
                 <label htmlFor="whale" className="text-xs font-medium text-zinc-400 cursor-pointer">Whale Entries (Purple)</label>
               </div>
               <div className="flex items-center space-x-2">
                 <Checkbox id="rsi" checked={showRSI} onCheckedChange={(c) => setShowRSI(!!c)} className="border-amber-500 data-[state=checked]:bg-amber-500" />
                 <label htmlFor="rsi" className="text-xs font-medium text-zinc-400 cursor-pointer">RSI Divergence (Orange)</label>
               </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 mt-4 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={marketData} margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="time" stroke="#404040" fontSize={10} tickLine={false} />
                <YAxis stroke="#404040" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a' }} />
                
                {/* Main Price Line */}
                <Line type="monotone" dataKey="price" stroke="#fff" strokeWidth={2} dot={false} />
                
                {/* Conditionally Rendered Strategy Markers */}
                {showWhales && (
                    <Scatter dataKey="whaleMarker" fill="#8b5cf6" shape="star" />
                )}
                {showRSI && (
                    <Scatter dataKey="rsiMarker" fill="#f59e0b" shape="triangle" />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* RIGHT PANEL: Complex Order Execution */}
        <Card className="border-zinc-900 bg-[#0a0a0a] flex flex-col">
           <Tabs defaultValue="perp" className="w-full h-full flex flex-col">
              <TabsList className="bg-zinc-900 m-4 p-1 rounded-lg grid grid-cols-3">
                 <TabsTrigger value="spot" className="text-xs data-[state=active]:bg-zinc-800">Spot</TabsTrigger>
                 <TabsTrigger value="perp" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Perpetual</TabsTrigger>
                 <TabsTrigger value="options" className="text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">Options</TabsTrigger>
              </TabsList>

              <TabsContent value="perp" className="flex-1 px-4 pb-4 space-y-6">
                 {/* Order Type */}
                 <div className="grid grid-cols-2 gap-2 bg-black p-1 rounded-md border border-zinc-900">
                    <button className="bg-zinc-800 text-white text-xs py-1.5 rounded uppercase font-bold tracking-wider">Limit</button>
                    <button className="text-zinc-500 hover:text-white text-xs py-1.5 rounded uppercase font-bold tracking-wider transition-colors">Market</button>
                 </div>

                 {/* Inputs */}
                 <div className="space-y-3">
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-xs text-zinc-500 font-bold uppercase">Price</span>
                        <input type="text" defaultValue={currentPrice.toFixed(2)} className="w-full bg-black border border-zinc-800 rounded-lg py-3 pr-3 pl-16 text-right text-white font-mono text-sm focus:border-indigo-500 focus:outline-none" />
                        <span className="absolute right-3 top-3 text-xs text-zinc-600">USDC</span>
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-xs text-zinc-500 font-bold uppercase">Size</span>
                        <input type="text" placeholder="0.00" className="w-full bg-black border border-zinc-800 rounded-lg py-3 pr-3 pl-16 text-right text-white font-mono text-sm focus:border-indigo-500 focus:outline-none" />
                        <span className="absolute right-3 top-3 text-xs text-zinc-600">SOL</span>
                    </div>
                 </div>

                 {/* Leverage Slider */}
                 <div className="space-y-4 pt-2 border-t border-zinc-900/50">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-500 uppercase font-bold">Leverage</span>
                        <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">{leverage[0]}x</span>
                    </div>
                    <Slider defaultValue={[10]} max={50} step={1} onValueChange={setLeverage} className="py-2" />
                 </div>

                 {/* Action Buttons */}
                 <div className="grid grid-cols-2 gap-3 pt-4">
                    <button className="bg-green-500 hover:bg-green-400 text-black py-4 rounded-lg font-black uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                        Buy / Long
                    </button>
                    <button className="bg-red-500 hover:bg-red-400 text-white py-4 rounded-lg font-black uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                        Sell / Short
                    </button>
                 </div>
              </TabsContent>

              {/* Options Mockup Content */}
              <TabsContent value="options" className="flex-1 px-4 space-y-4">
                 <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                     <p className="text-xs text-purple-400 mb-2">European Options Chain - Mar 2026</p>
                     <div className="flex justify-between text-white font-mono text-sm mb-1">
                         <span>Strike $150</span>
                         <span className="text-green-400">Call $12.40</span>
                     </div>
                     <div className="flex justify-between text-white font-mono text-sm">
                         <span>Strike $140</span>
                         <span className="text-red-400">Put $8.20</span>
                     </div>
                 </div>
                 <button className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-lg font-black uppercase tracking-widest text-sm transition-all">
                     Buy Option Contract
                 </button>
              </TabsContent>

           </Tabs>
        </Card>

      </div>
    </div>
  );
}