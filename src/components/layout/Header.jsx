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
  profile: 'Profile',
  settings: 'Settings',
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
  const { currentPage, prices, priceStatuses, getMetrics, user, logout, setCurrentPage } = useApp();
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

  const latencyColor = latency < 15 ? '#1ea774' : latency < 25 ? '#f59e0b' : '#d44333';

  return (
    <header
      className="sticky top-0 z-20 flex flex-col"
      style={{
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-0)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Price Ticker */}
      <div className="overflow-hidden py-1.5" style={{ borderBottom: '1px solid var(--border-0)' }}>
        <div className="ticker-move">
          {[...tickerAssets, ...tickerAssets].map((asset, idx) => {
            const status = priceStatuses?.[asset.symbol] || 'connecting';
            const price = prices[asset.symbol] ?? asset.basePrice;
            const change = ((price - asset.basePrice) / asset.basePrice * 100);
            const isUp = change >= 0;
            return (
              <span key={idx} className="inline-flex items-center gap-1.5 px-4 text-xs">
                {status === 'live' && <span className="w-1 h-1 rounded-full inline-block" style={{ background: 'var(--green)' }} />}
                {status === 'connecting' && <span className="w-1 h-1 rounded-full inline-block animate-pulse" style={{ background: 'var(--brand)' }} />}
                <span className="font-medium" style={{ color: 'var(--text-3)' }}>{asset.symbol}</span>
                <span className="font-mono font-medium" style={{ color: status === 'connecting' ? 'var(--text-4)' : 'var(--text-2)' }}>
                  {status === 'connecting' ? '---' : price >= 1000 ? price.toFixed(2) : price >= 1 ? price.toFixed(4) : price.toFixed(5)}
                </span>
                {status === 'live' && (
                  <span style={{ color: isUp ? 'var(--green)' : 'var(--red)' }}>
                    {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                  </span>
                )}
                <span className="ml-2" style={{ color: 'var(--border-1)' }}>|</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 gap-3">
        {/* Left: Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm font-semibold tracking-wide whitespace-nowrap" style={{ color: 'var(--text-1)' }}>
            {PAGE_TITLES[currentPage] || 'Plus Trade'}
          </h1>

          {/* Server status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full"
            style={{ background: 'var(--green-bg)', border: '1px solid rgba(30,167,116,0.2)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)', animation: 'pulse 2s infinite' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--green)' }}>Connected</span>
          </div>
        </div>

        {/* Center: Metrics */}
        <div className="hidden lg:flex items-center gap-5 flex-1 justify-center">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>Balance</span>
            <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
              ${formatCurrency(metrics.balance)}
            </span>
          </div>
          <div className="w-px h-3.5" style={{ background: 'var(--border-1)' }} />
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>Equity</span>
            <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
              ${formatCurrency(metrics.equity)}
            </span>
          </div>
          <div className="w-px h-3.5" style={{ background: 'var(--border-1)' }} />
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>P&L</span>
            <span className="font-mono text-sm font-semibold flex items-center gap-1"
              style={{ color: metrics.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {metrics.pnl >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {metrics.pnl >= 0 ? '+' : ''}{formatCurrency(metrics.pnl)}
            </span>
          </div>
        </div>

        {/* Right: Clock, Latency, LIVE, Bell, Profile */}
        <div className="flex items-center gap-2" ref={profileRef}>

          {/* Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
            <Clock size={11} style={{ color: 'var(--text-3)' }} />
            <span className="font-mono text-xs" style={{ color: 'var(--text-2)' }}>{timeStr}</span>
          </div>

          {/* Latency */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
            <Wifi size={11} style={{ color: latencyColor }} />
            <span className="font-mono text-xs" style={{ color: latencyColor }}>{latency}ms</span>
          </div>

          {/* LIVE */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'var(--green-bg)', border: '1px solid rgba(30,167,116,0.2)' }}>
            <Activity size={10} style={{ color: 'var(--green)' }} />
            <span className="text-xs font-semibold tracking-wider" style={{ color: 'var(--green)' }}>LIVE</span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
            className="relative p-2 rounded-lg transition-colors"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-3)' }}
          >
            <Bell size={15} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--brand)' }} />
          </button>

          {/* Profile */}
          {user && (
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg transition-all"
                style={{
                  background: profileOpen ? 'var(--brand-bg2)' : 'var(--bg-surface)',
                  border: `1px solid ${profileOpen ? 'rgba(59,130,246,0.2)' : 'var(--border-0)'}`,
                }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-light))' }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-xs font-medium max-w-[80px] truncate" style={{ color: 'var(--text-2)' }}>
                  {user.name || user.email?.split('@')[0]}
                </span>
                <ChevronDown size={12} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-3)' }} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50 animate-fade-in"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-1)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(20px)',
                  }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-0)' }}>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{user.name || user.email?.split('@')[0]}</div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>{user.email}</div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
                      <span className="text-xs" style={{ color: 'var(--green)' }}>Premium Account</span>
                    </div>
                  </div>
                  <div className="py-1.5">
                    {[
                      { icon: User, label: 'Profile', page: 'profile' },
                      { icon: Settings, label: 'Settings', page: 'settings' },
                    ].map(({ icon: Icon, label, page }) => (
                      <button key={label}
                        onClick={() => { setCurrentPage(page); setProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2 transition-colors text-sm"
                        style={{ color: 'var(--text-2)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-2)'; }}>
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                    <div className="mt-1 pt-1" style={{ borderTop: '1px solid var(--border-0)' }}>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2 transition-colors text-sm"
                        style={{ color: 'var(--red)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
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
