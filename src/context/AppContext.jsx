import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  SIMPLE_TRADE_ASSETS,
  CRYPTO_FUTURES_ASSETS,
  FOREX_ASSETS,
  generatePrice,
  MOCK_TRANSACTIONS,
} from '../utils/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Auth
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pt_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation
  const [currentPage, setCurrentPage] = useState('selection');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Wallet
  const [wallet, setWallet] = useState(() => {
    const saved = localStorage.getItem('pt_wallet');
    return saved ? JSON.parse(saved) : {
      usdt: 10000.00,
      transactions: MOCK_TRANSACTIONS,
    };
  });

  // Open positions (all trading modules)
  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('pt_positions');
    return saved ? JSON.parse(saved) : [];
  });

  // Trade history
  const [tradeHistory, setTradeHistory] = useState(() => {
    const saved = localStorage.getItem('pt_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Live prices
  const [prices, setPrices] = useState(() => {
    const init = {};
    [...SIMPLE_TRADE_ASSETS, ...CRYPTO_FUTURES_ASSETS, ...FOREX_ASSETS].forEach(a => {
      init[a.symbol] = a.basePrice;
    });
    return init;
  });

  const pricesRef = useRef(prices);
  pricesRef.current = prices;
  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  // Price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        [...SIMPLE_TRADE_ASSETS, ...CRYPTO_FUTURES_ASSETS, ...FOREX_ASSETS].forEach(asset => {
          const volatility = asset.basePrice > 1000 ? 0.0008 : asset.basePrice > 100 ? 0.001 : asset.basePrice > 1 ? 0.0005 : 0.002;
          next[asset.symbol] = generatePrice(next[asset.symbol] || asset.basePrice, volatility);
        });
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('pt_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pt_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('pt_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('pt_history', JSON.stringify(tradeHistory));
  }, [tradeHistory]);

  // Computed metrics
  const getMetrics = useCallback(() => {
    const currentPrices = pricesRef.current;
    let totalPnL = 0;

    positionsRef.current.forEach(pos => {
      const currentPrice = currentPrices[pos.symbol] || pos.openPrice;
      const priceDiff = pos.direction === 'long' || pos.direction === 'buy'
        ? currentPrice - pos.openPrice
        : pos.openPrice - currentPrice;
      const pnl = priceDiff * pos.volume * pos.leverage;
      totalPnL += pnl;
    });

    const balance = wallet.usdt;
    const equity = balance + totalPnL;
    const usedMargin = positionsRef.current.reduce((sum, p) => sum + (p.openPrice * p.volume * (p.leverage > 0 ? 1 / p.leverage : 1)), 0);
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

  // Open position
  const openPosition = useCallback((positionData) => {
    const id = Date.now().toString();
    const newPos = {
      id,
      ...positionData,
      openTime: new Date().toLocaleString(),
      timestamp: Date.now(),
    };
    setPositions(prev => [...prev, newPos]);
    return id;
  }, []);

  // Close position
  const closePosition = useCallback((positionId) => {
    const currentPrices = pricesRef.current;
    setPositions(prev => {
      const pos = prev.find(p => p.id === positionId);
      if (!pos) return prev;

      const currentPrice = currentPrices[pos.symbol] || pos.openPrice;
      const priceDiff = pos.direction === 'long' || pos.direction === 'buy'
        ? currentPrice - pos.openPrice
        : pos.openPrice - currentPrice;
      const pnl = priceDiff * pos.volume * pos.leverage;
      const closeData = {
        ...pos,
        closePrice: currentPrice,
        closeTime: new Date().toLocaleString(),
        pnl,
        status: 'closed',
      };

      setTradeHistory(h => [closeData, ...h]);
      setWallet(w => ({ ...w, usdt: w.usdt + pnl }));

      return prev.filter(p => p.id !== positionId);
    });
  }, []);

  // Wallet actions
  const deposit = useCallback((amount) => {
    const tx = {
      id: Date.now(),
      type: 'deposit',
      amount,
      currency: 'USDT',
      network: 'TRC20',
      status: 'completed',
      date: new Date().toLocaleString(),
      txHash: 'TX' + Math.random().toString(36).substr(2, 12).toUpperCase(),
    };
    setWallet(w => ({ usdt: w.usdt + amount, transactions: [tx, ...w.transactions] }));
  }, []);

  const withdraw = useCallback((amount) => {
    const tx = {
      id: Date.now(),
      type: 'withdrawal',
      amount,
      currency: 'USDT',
      network: 'TRC20',
      status: 'processing',
      date: new Date().toLocaleString(),
      txHash: 'TX' + Math.random().toString(36).substr(2, 12).toUpperCase(),
    };
    setWallet(w => ({
      usdt: Math.max(0, w.usdt - amount),
      transactions: [tx, ...w.transactions],
    }));
  }, []);

  const login = useCallback((email) => {
    const userData = { email, name: email.split('@')[0], loginTime: Date.now() };
    setUser(userData);
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
    getMetrics,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
