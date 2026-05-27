import React, { useState, useEffect } from 'react';
import { Bell, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SIMPLE_TRADE_ASSETS } from '../../utils/mockData';
import { formatCurrency } from '../../utils/mockData';

const PAGE_TITLES = {
  selection: 'Platform Selection',
  dashboard: 'Dashboard',
  wallet: 'Wallet',
  positions: 'Open Positions',
  history: 'Trade History',
  simple: 'Simple Trade',
  crypto: 'Crypto Futures',
  forex: 'Forex & Commodities',
};

export default function Header() {
  const { currentPage, prices, getMetrics, user } = useApp();
  const [metrics, setMetrics] = useState({ balance: 0, equity: 0, pnl: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getMetrics());
    }, 1000);
    setMetrics(getMetrics());
    return () => clearInterval(interval);
  }, [getMetrics]);

  const tickerAssets = SIMPLE_TRADE_ASSETS.slice(0, 6);

  return (
    <header
      className="sticky top-0 z-20 flex flex-col"
      style={{
        background: 'rgba(10,10,10,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Price Ticker */}
      <div className="overflow-hidden py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="ticker-move">
          {[...tickerAssets, ...tickerAssets].map((asset, idx) => {
            const price = prices[asset.symbol] || asset.basePrice;
            const change = ((price - asset.basePrice) / asset.basePrice * 100);
            const isUp = change >= 0;
            return (
              <span key={idx} className="inline-flex items-center gap-1.5 px-4 text-xs">
                <span className="text-white/40 font-medium">{asset.symbol}</span>
                <span className="font-mono font-medium text-white/80">
                  {price >= 1000 ? price.toFixed(2) : price >= 1 ? price.toFixed(4) : price.toFixed(5)}
                </span>
                <span className={isUp ? 'text-emerald-400' : 'text-red-400'}>
                  {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                </span>
                <span className="text-white/10 ml-2">|</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Page Title */}
        <div>
          <h1 className="text-sm font-semibold text-white/90 tracking-wide">
            {PAGE_TITLES[currentPage] || 'Plus Trade'}
          </h1>
        </div>

        {/* Metrics */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs">Balance</span>
            <span className="font-mono text-sm text-white font-semibold">
              ${formatCurrency(metrics.balance)}
            </span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs">Equity</span>
            <span className="font-mono text-sm text-white font-semibold">
              ${formatCurrency(metrics.equity)}
            </span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs">P&L</span>
            <span className={`font-mono text-sm font-semibold flex items-center gap-1 ${metrics.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {metrics.pnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {metrics.pnl >= 0 ? '+' : ''}{formatCurrency(metrics.pnl)}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.2)' }}>
            <Activity size={10} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs font-medium">LIVE</span>
          </div>
          <button className="relative p-2 rounded-lg text-white/40 hover:text-white/80 transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-400" />
          </button>
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-black text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #b8860b, #ffd700)' }}>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
