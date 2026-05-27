import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  SIMPLE_TRADE_ASSETS,
  CRYPTO_FUTURES_ASSETS,
  FOREX_ASSETS,
  MOCK_TRANSACTIONS,
} from '../utils/mockData';
import { startPriceService, subscribe as subscribePrices } from '../utils/priceService';

const AppContext = createContext(null);

const ALL_ASSETS = [...SIMPLE_TRADE_ASSETS, ...CRYPTO_FUTURES_ASSETS, ...FOREX_ASSETS];

// Build initial prices object from base prices (shown while "connecting")
function buildInitialPrices() {
  const init = {};
  ALL_ASSETS.forEach(a => { init[a.symbol] = a.basePrice; });
  return init;
}

// Build initial statuses — all "connecting" until real data arrives
function buildInitialStatuses() {
  const init = {};
  ALL_ASSETS.forEach(a => { init[a.symbol] = 'connecting'; });
  return init;
}

// Demo seed data — shown on first load so the app isn't empty
const DEMO_POSITIONS = [
  { id: 'demo_1', symbol: 'BTC/USDT', name: 'Bitcoin',  openPrice: 66850.00, volume: 0.05, leverage: 10, direction: 'long', module: 'crypto', openTime: '5/27/2026, 08:14:32 AM', timestamp: Date.now() - 3600000 * 5 },
  { id: 'demo_2', symbol: 'ETH/USDT', name: 'Ethereum', openPrice: 3580.00,  volume: 0.5,  leverage: 5,  direction: 'short', module: 'crypto', openTime: '5/27/2026, 10:02:55 AM', timestamp: Date.now() - 3600000 * 3 },
  { id: 'demo_3', symbol: 'XAU/USD',  name: 'Gold',     openPrice: 2298.50,  volume: 0.1,  leverage: 20, direction: 'long',  module: 'forex',  openTime: '5/27/2026, 11:45:00 AM', timestamp: Date.now() - 3600000 * 2 },
  { id: 'demo_4', symbol: 'XAUUSD',   name: 'Gold',     openPrice: 2305.00,  volume: 0.02, leverage: 10, direction: 'buy',   module: 'simple', openTime: '5/27/2026, 13:20:10 PM', timestamp: Date.now() - 3600000 },
];

const DEMO_HISTORY = [
  { id: 'h1', symbol: 'BTC/USDT', name: 'Bitcoin',   openPrice: 65200, closePrice: 67100, volume: 0.03, leverage: 10, direction: 'long',  module: 'crypto', pnl:  570, openTime: '5/26/2026, 09:00 AM', closeTime: '5/26/2026, 14:30 PM', status: 'closed', timestamp: Date.now() - 86400000 },
  { id: 'h2', symbol: 'ETH/USDT', name: 'Ethereum',  openPrice: 3620,  closePrice: 3490,  volume: 0.2,  leverage: 5,  direction: 'long',  module: 'crypto', pnl: -130, openTime: '5/26/2026, 10:15 AM', closeTime: '5/26/2026, 16:00 PM', status: 'closed', timestamp: Date.now() - 82800000 },
  { id: 'h3', symbol: 'XAU/USD',  name: 'Gold',      openPrice: 2285,  closePrice: 2312,  volume: 0.1,  leverage: 20, direction: 'long',  module: 'forex',  pnl:  270, openTime: '5/25/2026, 08:30 AM', closeTime: '5/25/2026, 15:45 PM', status: 'closed', timestamp: Date.now() - 172800000 },
  { id: 'h4', symbol: 'EUR/USD',  name: 'Euro/USD',  openPrice: 1.0861,closePrice: 1.0834,volume: 1000, leverage: 100,direction: 'short', module: 'forex',  pnl:  270, openTime: '5/25/2026, 12:00 PM', closeTime: '5/25/2026, 17:30 PM', status: 'closed', timestamp: Date.now() - 169200000 },
  { id: 'h5', symbol: 'XAUUSD',   name: 'Gold',      openPrice: 2318,  closePrice: 2302,  volume: 0.05, leverage: 10, direction: 'buy',   module: 'simple', pnl:  -80, openTime: '5/24/2026, 11:00 AM', closeTime: '5/24/2026, 14:00 PM', status: 'closed', timestamp: Date.now() - 259200000 },
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pt_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentPage, setCurrentPage] = useState('selection');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [wallet, setWallet] = useState(() => {
    const saved = localStorage.getItem('pt_wallet');
    return saved ? JSON.parse(saved) : { usdt: 10000.00, transactions: MOCK_TRANSACTIONS };
  });

  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('pt_positions');
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed?.length ? parsed : DEMO_POSITIONS;
  });

  const [tradeHistory, setTradeHistory] = useState(() => {
    const saved = localStorage.getItem('pt_history');
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed?.length ? parsed : DEMO_HISTORY;
  });

  // Real prices from priceService (initialized with base prices so UI renders immediately)
  const [prices, setPrices] = useState(buildInitialPrices);
  // Status per symbol: 'connecting' | 'live' | 'unavailable'
  const [priceStatuses, setPriceStatuses] = useState(buildInitialStatuses);

  const pricesRef = useRef(prices);
  pricesRef.current = prices;
  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  // ── Start real-time price service ────────────────────────────────────────────
  useEffect(() => {
    startPriceService();
    const unsub = subscribePrices(({ prices: p, statuses: s }) => {
      setPrices(prev => ({ ...prev, ...p }));
      setPriceStatuses(prev => ({ ...prev, ...s }));
    });
    return unsub;
  }, []);

  // ── Persist to localStorage ──────────────────────────────────────────────────
  useEffect(() => { if (user) localStorage.setItem('pt_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('pt_wallet', JSON.stringify(wallet)); }, [wallet]);
  useEffect(() => { localStorage.setItem('pt_positions', JSON.stringify(positions)); }, [positions]);
  useEffect(() => { localStorage.setItem('pt_history', JSON.stringify(tradeHistory)); }, [tradeHistory]);

  // ── Computed metrics ─────────────────────────────────────────────────────────
  const getMetrics = useCallback(() => {
    const currentPrices = pricesRef.current;
    let totalPnL = 0;

    positionsRef.current.forEach(pos => {
      const currentPrice = currentPrices[pos.symbol] ?? pos.openPrice;
      const priceDiff = (pos.direction === 'long' || pos.direction === 'buy')
        ? currentPrice - pos.openPrice
        : pos.openPrice - currentPrice;
      totalPnL += priceDiff * pos.volume * pos.leverage;
    });

    const balance = wallet.usdt;
    const equity = balance + totalPnL;
    const usedMargin = positionsRef.current.reduce(
      (sum, p) => sum + (p.openPrice * p.volume * (p.leverage > 0 ? 1 / p.leverage : 1)), 0
    );
    const freeMargin = equity - usedMargin;
    const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : 999;

    return {
      balance,
      equity,
      usedMargin,
      freeMargin,
      pnl: totalPnL,
      marginLevel: Math.max(0, marginLevel),
      openPositions: positionsRef.current.length,
    };
  }, [wallet.usdt]);

  // ── Liquidation price ────────────────────────────────────────────────────────
  const getLiquidationPrice = useCallback((pos) => {
    const mmRate = 0.005;
    const isLong = pos.direction === 'long' || pos.direction === 'buy';
    return isLong
      ? pos.openPrice * (1 - 1 / pos.leverage + mmRate)
      : pos.openPrice * (1 + 1 / pos.leverage - mmRate);
  }, []);

  // ── Open / close positions ───────────────────────────────────────────────────
  const openPosition = useCallback((positionData) => {
    const id = Date.now().toString();
    setPositions(prev => [...prev, { id, ...positionData, openTime: new Date().toLocaleString(), timestamp: Date.now() }]);
    return id;
  }, []);

  const closePosition = useCallback((positionId) => {
    const currentPrices = pricesRef.current;
    setPositions(prev => {
      const pos = prev.find(p => p.id === positionId);
      if (!pos) return prev;

      const currentPrice = currentPrices[pos.symbol] ?? pos.openPrice;
      const priceDiff = (pos.direction === 'long' || pos.direction === 'buy')
        ? currentPrice - pos.openPrice
        : pos.openPrice - currentPrice;
      const pnl = priceDiff * pos.volume * pos.leverage;

      setTradeHistory(h => [{ ...pos, closePrice: currentPrice, closeTime: new Date().toLocaleString(), pnl, status: 'closed' }, ...h]);
      setWallet(w => ({ ...w, usdt: w.usdt + pnl }));

      return prev.filter(p => p.id !== positionId);
    });
  }, []);

  // ── Wallet actions ───────────────────────────────────────────────────────────
  const deposit = useCallback((amount) => {
    const tx = { id: Date.now(), type: 'deposit', amount, currency: 'USDT', network: 'TRC20', status: 'completed', date: new Date().toLocaleString(), txHash: 'TX' + Math.random().toString(36).substr(2, 12).toUpperCase() };
    setWallet(w => ({ usdt: w.usdt + amount, transactions: [tx, ...w.transactions] }));
  }, []);

  const withdraw = useCallback((amount) => {
    const tx = { id: Date.now(), type: 'withdrawal', amount, currency: 'USDT', network: 'TRC20', status: 'processing', date: new Date().toLocaleString(), txHash: 'TX' + Math.random().toString(36).substr(2, 12).toUpperCase() };
    setWallet(w => ({ usdt: Math.max(0, w.usdt - amount), transactions: [tx, ...w.transactions] }));
  }, []);

  const login = useCallback((email) => {
    setUser({ email, name: email.split('@')[0], loginTime: Date.now() });
    setCurrentPage('selection');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentPage('login');
    localStorage.removeItem('pt_user');
  }, []);

  const value = {
    user, login, logout,
    currentPage, setCurrentPage,
    sidebarOpen, setSidebarOpen,
    wallet, deposit, withdraw,
    positions, openPosition, closePosition,
    tradeHistory,
    prices,
    priceStatuses,
    getMetrics,
    getLiquidationPrice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
