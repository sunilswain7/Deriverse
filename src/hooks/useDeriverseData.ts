import { useState, useEffect, useMemo, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// 1. Setup Config
const PROGRAM_ID_STR = process.env.NEXT_PUBLIC_DERIVERSE_PROGRAM_ID || 'CDESjex4EDBKLwx9ZPzVbjiHEHatasb5fhSJZMzNfvw2';
let PROGRAM_ID: PublicKey;
try {
  PROGRAM_ID = new PublicKey(PROGRAM_ID_STR);
} catch (e) {
  console.error("Invalid Program ID", e);
  PROGRAM_ID = PublicKey.default;
}

// 2. Define the Trade Interface
export interface Trade {
  id: string;
  symbol: string;
  side: 'Long' | 'Short';
  type: 'Market' | 'Limit';
  price: number;
  size: number;
  pnl?: number;
  timestamp: number;
  status: 'Open' | 'Closed' | 'Filled' | 'Liquidated';
}

export const useDeriverseData = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [isDemo, setIsDemo] = useState(false); // Toggle State

  // ------------------------------------------------------------------
  // THE "BLENDER" (Real Live Calculations)
  // This runs automatically whenever 'trades' changes, regardless of source.
  // ------------------------------------------------------------------
  const stats = useMemo(() => {
    if (!trades.length) return { totalTrades: 0, winRate: 0, volume: 0, netPnl: 0 };
    
    // 1. Filter for closed trades
    const closedTrades = trades.filter(t => t.status === 'Closed' && t.pnl !== undefined);
    
    // 2. Count Wins
    const wins = closedTrades.filter(t => (t.pnl || 0) > 0).length;
    
    // 3. Sum PnL
    const totalPnl = closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    
    // 4. Sum Volume
    const totalVol = trades.reduce((acc, t) => acc + (t.size * t.price), 0);

    return { 
        totalTrades: trades.length, 
        winRate: closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0, 
        volume: totalVol,
        netPnl: totalPnl
    };
  }, [trades]); 

  // ------------------------------------------------------------------
  // SOURCE A: The Real Data (Solana RPC)
  // ------------------------------------------------------------------
  const fetchRealHistory = useCallback(async () => {
      if (!publicKey) return;
      setIsLoading(true);
      try {
        console.log(`Fetching REAL history for ${publicKey.toBase58()}...`);
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 20 });
        const txs = await connection.getParsedTransactions(signatures.map(s => s.signature), {
            maxSupportedTransactionVersion: 0
        });

        const validTrades: Trade[] = [];
        txs.forEach((tx, i) => {
            if (!tx || !tx.meta) return;
            // Filter by Deriverse Program ID
            const relevantAccount = tx.transaction.message.accountKeys.find(k => 
                k.pubkey.toBase58() === PROGRAM_ID.toBase58()
            );

            if (relevantAccount) {
                const signature = signatures[i].signature;
                const timestamp = (tx.blockTime || 0) * 1000;
                
                // Heuristic Parsing (Best guess for hackathon)
                validTrades.push({
                    id: signature,
                    symbol: "SOL-PERP",
                    side: 'Long', 
                    type: 'Market',
                    price: 150, // Placeholder
                    size: 10,
                    pnl: 0,
                    timestamp: timestamp,
                    status: 'Closed'
                });
            }
        });
        setTrades(validTrades);
      } catch (error) {
        console.error("Failed to fetch real data", error);
      } finally {
        setIsLoading(false);
      }
  }, [publicKey, connection]);

  // ------------------------------------------------------------------
  // SOURCE B: The Demo Data (Generator)
  // ------------------------------------------------------------------
  const generateMockData = () => {
    const mockTrades: Trade[] = [];
    const now = Date.now();
    
    // Generate 15 fake trades that look REAL
    for (let i = 0; i < 15; i++) {
        const isLong = Math.random() > 0.4;
        const pnl = (Math.random() * 500) - 200; // Random PnL between -200 and +300
        
        mockTrades.push({
            id: `demo-${Math.random().toString(36).substr(2, 9)}`,
            symbol: i % 3 === 0 ? "BTC-PERP" : "SOL-PERP",
            side: isLong ? 'Long' : 'Short',
            type: 'Market',
            price: 140 + Math.random() * 20,
            size: 10 + Math.random() * 100,
            pnl: pnl,
            timestamp: now - (i * 86400000 * 0.5), // Spread over last few days
            status: 'Closed'
        });
    }
    // Sort them by time so the Chart looks correct
    return mockTrades.sort((a, b) => a.timestamp - b.timestamp);
  };

  // ------------------------------------------------------------------
  // The Toggle Switch
  // ------------------------------------------------------------------
  const toggleDemo = () => {
      if (isDemo) {
          // Switching OFF Demo -> Load Real
          setIsDemo(false);
          setTrades([]); // Clear first
          fetchRealHistory(); 
      } else {
          // Switching ON Demo -> Load Fake
          setIsDemo(true);
          const fakes = generateMockData();
          setTrades(fakes);
      }
  };

  // Init: Fetch Real Balance & History on Load
  useEffect(() => {
    if (!publicKey) return;
    connection.getBalance(publicKey).then(bal => setBalance(bal / LAMPORTS_PER_SOL));
    
    // Only fetch real history if we are NOT in demo mode
    if (!isDemo) fetchRealHistory();
  }, [publicKey, connection, isDemo, fetchRealHistory]);

  return { trades, stats, isLoading, balance, isDemo, toggleDemo };
};