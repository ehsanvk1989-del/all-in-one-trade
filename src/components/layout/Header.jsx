import React, { useState, useEffect, useRef } from 'react';
import { Bell, TrendingUp, TrendingDown, Activity, Wifi, Clock, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SIMPLE_TRADE_ASSETS, formatCurrency } from '../../utils/mockData';

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

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useLatency() {
  const [latency, setLatency] = useState(14);
  useEffect(() => {
    const id = setInterval(() => {
      setLatency(Math.floor(Math.random() * 7) + 11); // 11–17ms
    }, 3000);
    return () => clearInterval(id);
  }, []);
  return latency;
}

export default function Header() {
  const { currentPage, prices, getMetrics, user, logout } = useApp();
  const [metrics, setMetrics] = useState({ balance: 0, equity: 0, pnl: 0 });
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const now = useNow();
  const latency = useLatency();

  useEffect(() => {
    const interval = setInterval(() => setMetrics(getMetrics()), 1000);
    setMetrics(getMetrics());
    return () => clearInterval(interval);
  }, [getMetrics]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const tickerAssets = SIMPLE_TRADE_ASSETS.slice(0, 6);

  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const latencyColor = latency < 15 ? '#10b981' : latency < 25 ? '#eab308' : '#ef4444';

  return (
    <header
      className="sticky top-0 z-20 flex flex-col"
      style={{
        background: 'rgba(10,10,10,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
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
      <div className="flex items-center justify-between px-4 py-2.5 gap-3">
        {/* Left: Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm font-semibold text-white/90 tracking-wide whitespace-nowrap">
            {PAGE_TITLES[currentPage] || 'Plus Trade'}
          </h1>

          {/* Server status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'pulse 2s infinite' }} />
            <span className="text-emerald-400 text-xs font-medium">Connected</span>
          </div>
        </div>

        {/* Center: Metrics */}
        <div className="hidden lg:flex items-center gap-5 flex-1 justify-center">
          <div className="flex items-center gap-2">
            <span className="text-white/35 text-xs">Balance</span>
            <span className="font-mono text-sm text-white font-semibold">
              ${formatCurrency(metrics.balance)}
            </span>
          </div>
          <div className="w-px h-3.5 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-white/35 text-xs">Equity</span>
            <span className="font-mono text-sm text-white font-semibold">
              ${formatCurrency(metrics.equity)}
            </span>
          </div>
          <div className="w-px h-3.5 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-white/35 text-xs">P&L</span>
            <span className={`font-mono text-sm font-semibold flex items-center gap-1 ${metrics.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {metrics.pnl >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {metrics.pnl >= 0 ? '+' : ''}{formatCurrency(metrics.pnl)}
            </span>
          </div>
        </div>

        {/* Right: Clock, Latency, LIVE, Bell, Profile */}
        <div className="flex items-center gap-2" ref={profileRef}>

          {/* Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Clock size={11} className="text-white/30" />
            <span className="font-mono text-xs text-white/60">{timeStr}</span>
          </div>

          {/* Latency */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Wifi size={11} style={{ color: latencyColor }} />
            <span className="font-mono text-xs" style={{ color: latencyColor }}>{latency}ms</span>
          </div>

          {/* LIVE */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.18)' }}>
            <Activity size={10} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs font-semibold tracking-wider">LIVE</span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
            className="relative p-2 rounded-lg text-white/40 hover:text-white/80 transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <Bell size={15} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
              style={{ background: '#ffd700', boxShadow: '0 0 6px rgba(255,215,0,0.8)' }} />
          </button>

          {/* Profile */}
          {user && (
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg transition-all"
                style={{
                  background: profileOpen ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${profileOpen ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-black text-xs font-black"
                  style={{ background: 'linear-gradient(135deg, #b8860b, #ffd700)' }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-white/70 text-xs font-medium max-w-[80px] truncate">
                  {user.name || user.email?.split('@')[0]}
                </span>
                <ChevronDown size={12} className={`text-white/30 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50 animate-fade-in"
                  style={{
                    background: 'rgba(14,16,20,0.98)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(20px)',
                  }}>
                  <div className="px-4 py-3 border-b border-white/5">
                    <div className="text-white/80 text-sm font-semibold">{user.name || user.email?.split('@')[0]}</div>
                    <div className="text-white/35 text-xs mt-0.5 truncate">{user.email}</div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-emerald-400 text-xs">Premium Account</span>
                    </div>
                  </div>
                  <div className="py-1.5">
                    {[
                      { icon: User, label: 'Profile' },
                      { icon: Settings, label: 'Settings' },
                    ].map(({ icon: Icon, label }) => (
                      <button key={label}
                        className="w-full flex items-center gap-3 px-4 py-2 text-white/50 hover:text-white/90 hover:bg-white/5 transition-colors text-sm">
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                    <div className="border-t border-white/5 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/08 transition-colors text-sm">
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
