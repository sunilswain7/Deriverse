"use client";

import { useState, useEffect } from "react";
import { useDeriverseData } from "@/hooks/useDeriverseData";
import { 
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter 
} from 'recharts';
import { 
  Activity, Layers, Zap, Newspaper, ChevronDown, 
  TrendingUp, TrendingDown, Clock, Crosshair, Maximize2
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ==========================================
// 1. DYNAMIC PERIOD MAPPING
// ==========================================
const periodConfig: Record<string, { interval: string, limit: number }> = {
  '1 Day': { interval: '15m', limit: 96 },
  '7 Day': { interval: '2h', limit: 84 },
  '30 Day': { interval: '12h', limit: 60 },
  '1 Month': { interval: '12h', limit: 60 },
  '3 Months': { interval: '1d', limit: 90 },
  '6 Months': { interval: '3d', limit: 60 },
  '1 Year': { interval: '1w', limit: 52 },
  '5 Years': { interval: '1M', limit: 60 },
};

const formatChartTime = (timestamp: number, p: string) => {
    const d = new Date(timestamp);
    if (['1 Day', '7 Day'].includes(p)) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (['1 Year', '5 Years'].includes(p)) return d.toLocaleDateString([], { month: 'short', year: 'numeric' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ==========================================
// 2. BULLETPROOF CANDLESTICK SHAPE
// ==========================================
const CustomCandlestick = (props: any) => {
  const { x, y, width, height, payload } = props;
  
  // Safe exit if Recharts hydration fails to pass props
  if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number' || !payload) {
    return null;
  }

  const { open, close, high, low } = payload;
  const isGreen = close >= open;
  const color = isGreen ? '#10b981' : '#ef4444'; 

  // Math to calculate exact pixel coordinates within the bounding box Recharts gives us
  const priceRange = Math.abs(high - low);
  const pixelsPerPrice = priceRange > 0 ? height / priceRange : 0;
  
  const yOpen = y + (high - Math.max(open, close)) * pixelsPerPrice;
  const barHeight = Math.max(Math.abs(open - close) * pixelsPerPrice, 1); // Min 1px height
  
  const centerX = x + width / 2;
  const bodyWidth = Math.max(width * 0.6, 2); // Body takes up 60% of available width
  const bodyX = x + (width - bodyWidth) / 2;

  return (
    <g>
      {/* Wick */}
      <line x1={centerX} y1={y} x2={centerX} y2={y + height} stroke={color} strokeWidth={1} />
      {/* Body */}
      <rect x={bodyX} y={yOpen} width={bodyWidth} height={barHeight} fill={color} stroke={color} />
    </g>
  );
};

// ==========================================
// 3. PRO CROSSHAIR TOOLTIP
// ==========================================
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isGreen = data.close >= data.open;
    const colorClass = isGreen ? "text-green-400" : "text-red-400";
    
    return (
      <div className="bg-[#09090b]/95 backdrop-blur-md border border-zinc-800 p-3 rounded-lg shadow-2xl text-xs font-mono z-50 min-w-[150px]">
        <div className="text-zinc-400 mb-2 border-b border-zinc-800 pb-1.5 flex justify-between">
            <span>Time</span> <span>{data.time}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <span className="text-zinc-500">Open</span> <span className="text-right text-zinc-200">{data.open.toFixed(2)}</span>
          <span className="text-zinc-500">High</span> <span className="text-right text-zinc-200">{data.high.toFixed(2)}</span>
          <span className="text-zinc-500">Low</span> <span className="text-right text-zinc-200">{data.low.toFixed(2)}</span>
          <span className="text-zinc-500">Close</span> <span className={`text-right font-bold ${colorClass}`}>{data.close.toFixed(2)}</span>
        </div>
      </div>
    );
  }
  return null;
};

// --- STATIC MOCKS ---
const mockNews = [
  { time: "10:42", text: "Crypto markets rally as trading volume spikes across major DEXs.", impact: "positive" },
  { time: "09:15", text: "Global macro data suggests lower inflation, boosting risk assets.", impact: "positive" },
  { time: "08:30", text: "Minor network congestion reported on alternative L1s.", impact: "negative" },
  { time: "07:00", text: "Large stablecoin mints detected at Treasury.", impact: "neutral" },
];

export default function AdvancedTradeTerminal() {
  const { balance } = useDeriverseData();
  
  const [isMounted, setIsMounted] = useState(false);
  const [asset, setAsset] = useState("SOL"); 
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [orderBook, setOrderBook] = useState<any>({ asks: [], bids: [] });
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);

  const [inputPrice, setInputPrice] = useState("");
  const [orderType, setOrderType] = useState("Limit");
  const [leverage, setLeverage] = useState([10]);
  const [period, setPeriod] = useState("1 Day");

  // INDICATOR STATE
  const [showVolume, setShowVolume] = useState(true);
  const [showMA, setShowMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [showBB, setShowBB] = useState(true);
  const [showSAR, setShowSAR] = useState(false);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(true);

  // REAL-TIME DATA ENGINE
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchLiveMarketData = async () => {
      try {
        const symbol = `${asset}USDT`; 

        const tickerRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
        const tickerData = await tickerRes.json();
        setCurrentPrice(parseFloat(tickerData.lastPrice));
        setPriceChange(parseFloat(tickerData.priceChangePercent));
        if (orderType === "Limit" && inputPrice === "") setInputPrice(parseFloat(tickerData.lastPrice).toFixed(2));

        const config = periodConfig[period] || periodConfig['1 Day'];
        const klineRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${config.interval}&limit=${config.limit}`);
        const klineData = await klineRes.json();
        
        let currentRsi = 50; // Mock baseline for RSI
        const formattedKlines = klineData.map((d: any, index: number, arr: any[]) => {
           const open = parseFloat(d[1]);
           const high = parseFloat(d[2]);
           const low = parseFloat(d[3]);
           const close = parseFloat(d[4]);
           
           // Generate realistic-looking technical indicators for the UI demo
           if (index > 0) {
               const prevClose = parseFloat(arr[index-1][4]);
               currentRsi = Math.min(Math.max(currentRsi + ((close - prevClose) / prevClose) * 1500, 15), 85);
           }

           return {
             time: formatChartTime(d[0], period),
             open, high, low, close,
             volume: parseFloat(d[5]),
             ma20: close * (1 + (Math.random() * 0.002 - 0.001)), 
             ema9: close * (1 + (Math.random() * 0.001 - 0.0005)), 
             bbUpper: close * 1.015,
             bbLower: close * 0.985,
             sar: close >= open ? low * 0.99 : high * 1.01,
             rsi: currentRsi,
             macdLine: Math.random() * 2 - 1,
             macdSignal: Math.random() * 2 - 1,
             macdHist: Math.random() * 1 - 0.5
           }
        });
        setChartData(formattedKlines);

        const depthRes = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=15`);
        const depthData = await depthRes.json();
        
        let askTotal = 0;
        const asks = depthData.asks.map((a: any) => { askTotal += parseFloat(a[1]); return { price: parseFloat(a[0]), size: parseFloat(a[1]), total: askTotal } }).reverse(); 
        let bidTotal = 0;
        const bids = depthData.bids.map((b: any) => { bidTotal += parseFloat(b[1]); return { price: parseFloat(b[0]), size: parseFloat(b[1]), total: bidTotal } });

        setOrderBook({ asks, bids });
        setIsMounted(true);

      } catch (error) {
        console.error("Failed to fetch live market data", error);
      }
    };

    fetchLiveMarketData();
    intervalId = setInterval(fetchLiveMarketData, 5000);
    return () => clearInterval(intervalId); 
  }, [asset, period]); 

  if (!isMounted) {
    return <div className="h-[calc(100vh-56px)] w-full bg-[#030303] flex flex-col items-center justify-center text-zinc-500 font-mono text-sm uppercase tracking-widest"><Activity className="animate-pulse mb-4" /> Initializing Terminal...</div>;
  }

  return (
    <div className="h-[calc(100vh-56px)] w-full bg-[#030303] text-zinc-300 p-2 overflow-hidden flex flex-col gap-2">
      
      {/* HEADER: Market Pulse */}
      <div className="flex items-center justify-between bg-[#0a0a0a] border border-zinc-900 rounded-lg p-2 px-4 shrink-0">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${asset === 'SOL' ? 'bg-indigo-500/20' : asset === 'BTC' ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}>
                   <div className={`w-3 h-3 rounded-full ${asset === 'SOL' ? 'bg-indigo-500' : asset === 'BTC' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                </div>
                <Select value={asset} onValueChange={(val) => { setAsset(val); setIsMounted(false); }}>
                    <SelectTrigger className="w-[140px] bg-transparent border-0 text-xl font-black text-white tracking-tighter focus:ring-0 p-0 h-auto">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                        <SelectItem value="SOL">SOL-PERP</SelectItem>
                        <SelectItem value="BTC">BTC-PERP</SelectItem>
                        <SelectItem value="ETH">ETH-PERP</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="hidden md:flex items-center gap-6">
                <div><p className="text-[10px] text-zinc-500 uppercase font-bold">Mark Price</p><p className="text-sm font-mono text-zinc-100">${currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p></div>
                <div><p className="text-[10px] text-zinc-500 uppercase font-bold">24h Change</p><p className={`text-sm font-mono ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%</p></div>
            </div>
        </div>
        <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-400 animate-pulse"><Clock size={12} className="mr-1"/> Live Feed</Badge>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 min-h-0">
        
        {/* LEFT PANEL: Order Book */}
        <Card className="hidden lg:flex col-span-2 border-zinc-900 bg-[#0a0a0a] flex-col overflow-hidden">
            <CardHeader className="py-2 px-3 border-b border-zinc-900 shrink-0">
                <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Layers size={14} /> Order Book
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden text-[10px] font-mono">
                <div className="grid grid-cols-3 px-3 py-1 text-zinc-500 font-bold bg-zinc-900/30">
                    <span>Price</span><span className="text-right">Size</span><span className="text-right">Total</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-end">
                    {orderBook.asks.map((ask: any, i: number) => (
                        <div key={i} className="grid grid-cols-3 px-3 py-0.5 relative group cursor-pointer hover:bg-zinc-800" onClick={() => setInputPrice(ask.price.toFixed(2))}>
                            <div className="absolute top-0 right-0 bottom-0 bg-red-500/10 z-0" style={{ width: `${Math.min((ask.total / orderBook.asks[0]?.total) * 100, 100)}%` }} />
                            <span className="text-red-400 z-10">{ask.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            <span className="text-right text-zinc-300 z-10">{ask.size.toFixed(3)}</span>
                            <span className="text-right text-zinc-500 z-10">{ask.total.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="py-2 text-center border-y border-zinc-900 bg-zinc-950">
                    <span className={`text-sm font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>${currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {orderBook.bids.map((bid: any, i: number) => (
                        <div key={i} className="grid grid-cols-3 px-3 py-0.5 relative group cursor-pointer hover:bg-zinc-800" onClick={() => setInputPrice(bid.price.toFixed(2))}>
                            <div className="absolute top-0 right-0 bottom-0 bg-green-500/10 z-0" style={{ width: `${Math.min((bid.total / orderBook.bids[orderBook.bids.length-1]?.total) * 100, 100)}%` }} />
                            <span className="text-green-400 z-10">{bid.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            <span className="text-right text-zinc-300 z-10">{bid.size.toFixed(3)}</span>
                            <span className="text-right text-zinc-500 z-10">{bid.total.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* CENTER PANEL: Advanced Charting Stack */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-2 min-h-0">
            
            <Card className="flex-[2] border-zinc-900 bg-[#0a0a0a] flex flex-col min-h-[400px]">
                {/* Chart Controls */}
                <CardHeader className="py-2 px-3 border-b border-zinc-900 flex flex-col gap-2 shrink-0">
                    <div className="flex flex-wrap items-center justify-between w-full">
                        <div className="flex bg-zinc-900 rounded p-0.5 shrink-0">
                            {['1 Day', '7 Day', '30 Day', '1 Month', '3 Months', '6 Months', '1 Year', '5 Years'].map(p => (
                                <button key={p} onClick={() => { setPeriod(p); setIsMounted(false); }} className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase transition-colors whitespace-nowrap ${period === p ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{p}</button>
                            ))}
                        </div>
                        <div className="flex gap-2 text-zinc-500">
                            <Crosshair size={14} className="cursor-pointer hover:text-white" />
                            <Maximize2 size={14} className="cursor-pointer hover:text-white" />
                        </div>
                    </div>
                    {/* Checkbox Matrix */}
                    <div className="flex flex-wrap items-center gap-4 text-[10px] pt-1 border-t border-zinc-900/50">
                        <label className="flex items-center gap-1 cursor-pointer"><Checkbox checked={showVolume} onCheckedChange={(c) => setShowVolume(!!c)} className="w-3 h-3" /> Volume</label>
                        <label className="flex items-center gap-1 cursor-pointer"><Checkbox checked={showEMA} onCheckedChange={(c) => setShowEMA(!!c)} className="w-3 h-3 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500" /> EMA(9)</label>
                        <label className="flex items-center gap-1 cursor-pointer"><Checkbox checked={showMA} onCheckedChange={(c) => setShowMA(!!c)} className="w-3 h-3 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500" /> MA(20)</label>
                        <label className="flex items-center gap-1 cursor-pointer"><Checkbox checked={showBB} onCheckedChange={(c) => setShowBB(!!c)} className="w-3 h-3 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" /> Bollinger Bands</label>
                        <label className="flex items-center gap-1 cursor-pointer"><Checkbox checked={showSAR} onCheckedChange={(c) => setShowSAR(!!c)} className="w-3 h-3 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500" /> Parabolic SAR</label>
                        <Separator orientation="vertical" className="h-3 bg-zinc-800" />
                        <span className="text-zinc-600 font-bold uppercase">Oscillators:</span>
                        <label className="flex items-center gap-1 cursor-pointer"><Checkbox checked={showRSI} onCheckedChange={(c) => setShowRSI(!!c)} className="w-3 h-3 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500" /> RSI</label>
                        <label className="flex items-center gap-1 cursor-pointer"><Checkbox checked={showMACD} onCheckedChange={(c) => setShowMACD(!!c)} className="w-3 h-3 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" /> MACD</label>
                    </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                    {/* MAIN PRICE CHART */}
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 20, right: 0, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="1 4" stroke="#1f1f2e" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#404040" fontSize={10} orientation="right" tickFormatter={(v) => v.toFixed(2)} axisLine={false} tickLine={false} />
                                
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '3 3' }} isAnimationActive={false} />
                                
                                {showVolume && <Bar dataKey="volume" yAxisId="vol" fill="#1f1f2e" opacity={0.6} isAnimationActive={false} />}
                                <YAxis yAxisId="vol" hide domain={[0, 'dataMax * 5']} />

                                {/* Overlays */}
                                {showBB && <Area type="monotone" dataKey="bbUpper" stroke="none" fill="#3b82f6" fillOpacity={0.05} isAnimationActive={false}/>}
                                {showBB && <Area type="monotone" dataKey="bbLower" stroke="none" fill="#3b82f6" fillOpacity={0.05} isAnimationActive={false}/>}
                                {showBB && <Line type="monotone" dataKey="bbUpper" stroke="#3b82f6" strokeWidth={1} strokeOpacity={0.5} dot={false} isAnimationActive={false}/>}
                                {showBB && <Line type="monotone" dataKey="bbLower" stroke="#3b82f6" strokeWidth={1} strokeOpacity={0.5} dot={false} isAnimationActive={false}/>}
                                {showMA && <Line type="monotone" dataKey="ma20" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false}/>}
                                {showEMA && <Line type="monotone" dataKey="ema9" stroke="#06b6d4" strokeWidth={1.5} dot={false} isAnimationActive={false}/>}
                                {showSAR && <Scatter dataKey="sar" fill="#ec4899" shape="cross" isAnimationActive={false} />}
                                
                                {/* REAL CANDLESTICKS */}
                                <Bar dataKey={["low", "high"] as any} shape={<CustomCandlestick />} isAnimationActive={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* SUB-CHART 1: RSI */}
                    {showRSI && (
                        <div className="h-24 border-t border-zinc-900 relative">
                            <span className="absolute top-1 left-2 text-[9px] font-bold text-purple-500 z-10">RSI (14)</span>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                                    <XAxis dataKey="time" hide />
                                    <YAxis domain={[0, 100]} stroke="#404040" fontSize={9} orientation="right" ticks={[30, 50, 70]} axisLine={false} tickLine={false} />
                                    <CartesianGrid strokeDasharray="2 2" stroke="#1f1f2e" vertical={false} />
                                    <Line type="monotone" dataKey="rsi" stroke="#a855f7" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* SUB-CHART 2: MACD */}
                    {showMACD && (
                        <div className="h-24 border-t border-zinc-900 relative">
                            <span className="absolute top-1 left-2 text-[9px] font-bold text-emerald-500 z-10">MACD (12, 26, 9)</span>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                                    <XAxis dataKey="time" hide />
                                    <YAxis domain={['auto', 'auto']} stroke="#404040" fontSize={9} orientation="right" axisLine={false} tickLine={false} />
                                    <Bar dataKey="macdHist" fill="#10b981" isAnimationActive={false} />
                                    <Line type="monotone" dataKey="macdLine" stroke="#10b981" strokeWidth={1} dot={false} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="macdSignal" stroke="#ef4444" strokeWidth={1} dot={false} isAnimationActive={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* RIGHT PANEL: Execution */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-2 min-h-0">
            <Card className="border-zinc-900 bg-[#0a0a0a] flex flex-col shrink-0">
                <Tabs defaultValue="perp" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-zinc-950 p-1 rounded-t-lg border-b border-zinc-900 rounded-b-none">
                        <TabsTrigger value="perp" className="text-[10px] uppercase font-bold text-indigo-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Perps</TabsTrigger>
                        <TabsTrigger value="options" className="text-[10px] uppercase font-bold text-purple-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white">Options</TabsTrigger>
                    </TabsList>
                    <TabsContent value="perp" className="p-4 m-0 space-y-4">
                        <div className="flex bg-zinc-900 rounded p-1">
                            {['Limit', 'Market', 'Stop'].map(t => (
                                <button key={t} onClick={() => { setOrderType(t); if(t==="Market") setInputPrice("Market Price"); else setInputPrice(currentPrice.toFixed(2)); }} className={`flex-1 text-xs py-1.5 rounded font-bold transition-colors ${orderType === t ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{t}</button>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase px-1"><span>Price</span><span>USDC</span></div>
                            <input type="text" disabled={orderType === "Market"} value={inputPrice} onChange={(e) => setInputPrice(e.target.value)} className="w-full bg-black border border-zinc-800 rounded py-2 px-3 text-right text-white font-mono text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50" />
                            <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase px-1 pt-2"><span>Size</span><span>{asset}</span></div>
                            <input type="text" placeholder="0.00" className="w-full bg-black border border-zinc-800 rounded py-2 px-3 text-right text-white font-mono text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div className="pt-2">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold">Leverage</span>
                                <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">{leverage[0]}x</span>
                            </div>
                            <Slider defaultValue={[10]} max={50} step={1} onValueChange={setLeverage} className="py-2" />
                        </div>
                        <div className="bg-black border border-zinc-900 rounded p-3 space-y-2 text-[10px]">
                            <div className="flex justify-between text-zinc-400"><span>Avail. Margin</span><span className="font-mono text-white">${balance.toFixed(2)}</span></div>
                            <div className="flex justify-between text-zinc-400"><span>Est. Liq Price</span><span className="font-mono text-amber-500">-</span></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <button className="bg-green-500 hover:bg-green-400 text-black py-3 rounded font-black uppercase tracking-widest text-xs transition-colors">Long</button>
                            <button className="bg-red-500 hover:bg-red-400 text-white py-3 rounded font-black uppercase tracking-widest text-xs transition-colors">Short</button>
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
      </div>
    </div>
  );
}