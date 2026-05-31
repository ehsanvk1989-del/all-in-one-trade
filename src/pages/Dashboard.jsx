import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, BarChart3, Activity,
  ArrowUpRight, Zap, Globe, ChevronRight, Shield,
  ArrowDownToLine, ArrowUpFromLine, DollarSign,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCurrency, SIMPLE_TRADE_ASSETS, CRYPTO_FUTURES_ASSETS, FOREX_ASSETS,
} from '../utils/mockData';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, CartesianGrid, XAxis,
} from 'recharts';

// ─── Static seed data ────────────────────────────────────────────────────────
const EQUITY_SEED = [9820,9940,10120,9980,10250,10180,10410,10390,10520,10610,10480,10700,10650,10830,10780,10950,11020,10890,11100,11240];
const DAILY_PNL   = [{day:'Mon',pnl:220},{day:'Tue',pnl:-95},{day:'Wed',pnl:380},{day:'Thu',pnl:145},{day:'Fri',pnl:-60},{day:'Sat',pnl:290},{day:'Sun',pnl:175}];

// ─── Flash animation styles (injected once) ──────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('dash-styles')) {
  const s = document.createElement('style');
  s.id = 'dash-styles';
  s.textContent = `
    @keyframes tileFlashUp   { 0%{background:rgba(30,167,116,0.18)} 100%{background:transparent} }
    @keyframes tileFlashDown { 0%{background:rgba(212,67,51,0.18)}  100%{background:transparent} }
    .tile-flash-up   { animation: tileFlashUp   0.75s ease forwards }
    .tile-flash-down { animation: tileFlashDown 0.75s ease forwards }
  `;
  document.head.appendChild(s);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtPrice(p) {
  if (p >= 10000) return p.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (p >= 100)   return p.toFixed(2);
  if (p >= 1)     return p.toFixed(4);
  return p.toFixed(5);
}

function positionIcon(symbol) {
  if (symbol.includes('BTC'))  return '₿';
  if (symbol.includes('ETH'))  return 'Ξ';
  if (symbol.includes('SOL'))  return '◎';
  if (symbol.includes('DOGE')) return 'Ð';
  if (symbol.includes('XAU') || symbol.includes('XAUUSD')) return '🥇';
  if (symbol.includes('EUR'))  return '€';
  if (symbol.includes('GBP'))  return '£';
  if (symbol.includes('USD/JPY') || symbol.includes('JPY')) return '¥';
  if (symbol.includes('OIL'))  return '🛢️';
  return '📈';
}

// ─── Mini SVG sparkline ───────────────────────────────────────────────────────
function Sparkline({ seed, width = 56, height = 24 }) {
  const data = useMemo(() => seed, [seed]);
  if (!data || data.length < 2) return <div style={{ width, height }} />;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`
  ).join(' ');
  const isUp = data[data.length - 1] >= data[0];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        stroke={isUp ? 'var(--green)' : 'var(--red)'} opacity={0.85} />
    </svg>
  );
}

// ─── Live price tile ──────────────────────────────────────────────────────────
function PriceTile({ asset, price, onClick }) {
  const prevRef = useRef(price);
  const [flash, setFlash] = useState('');
  const sparkSeed = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => asset.basePrice * (1 + Math.sin(i * 1.4) * 0.007))
  , [asset.basePrice]);

  useEffect(() => {
    if (prevRef.current === price) return;
    const dir = price > prevRef.current ? 'tile-flash-up' : 'tile-flash-down';
    setFlash(dir);
    prevRef.current = price;
    const t = setTimeout(() => setFlash(''), 750);
    return () => clearTimeout(t);
  }, [price]);

  const change = ((price - asset.basePrice) / asset.basePrice) * 100;
  const isUp = change >= 0;

  return (
    <button className={`${flash} rounded-xl p-3 text-left transition-colors duration-150 w-full`}
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-1)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-0)'; }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{asset.icon}</span>
          <span className="text-xs font-bold" style={{ color: 'var(--text-2)' }}>{asset.symbol}</span>
        </div>
        <span className="text-xs font-bold px-1.5 py-0.5 rounded"
          style={{ background: isUp ? 'var(--green-bg)' : 'var(--red-bg)', color: isUp ? 'var(--green)' : 'var(--red)' }}>
          {isUp ? '+' : ''}{change.toFixed(2)}%
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div className="font-mono text-sm font-bold" style={{ color: 'var(--text-1)' }}>{fmtPrice(price)}</div>
        <Sparkline seed={sparkSeed} />
      </div>
    </button>
  );
}

// ─── Trading portal card ──────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 'simple', label: 'Simple Trade',          description: 'One-click buy & sell across crypto, forex, and commodities without leverage.', icon: Zap,      assets: SIMPLE_TRADE_ASSETS.length,   accent: '#10B981', glow: 'rgba(16,185,129,0.14)' },
  { id: 'crypto', label: 'Crypto Futures',        description: 'Trade BTC, ETH, SOL with high-leverage perpetual futures up to 100×.',        icon: BarChart3, assets: CRYPTO_FUTURES_ASSETS.length, accent: '#3B82F6', glow: 'rgba(59,130,246,0.14)'  },
  { id: 'forex',  label: 'Forex & Commodities',   description: 'Major currency pairs, gold, and energy markets with institutional liquidity.', icon: Globe,    assets: FOREX_ASSETS.length,          accent: '#7C3AED', glow: 'rgba(124,58,237,0.14)' },
];

function ProductCard({ product, onClick }) {
  const [hov, setHov] = useState(false);
  const Icon = product.icon;
  return (
    <button onClick={onClick} className="relative text-left rounded-2xl p-5 overflow-hidden transition-all duration-300 w-full"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hov ? product.accent + '50' : 'var(--border-0)'}`,
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 14px 44px ${product.glow}` : '0 2px 8px rgba(0,0,0,0.12)',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{ background: `radial-gradient(ellipse at top left, ${product.glow}, transparent 65%)`, opacity: hov ? 1 : 0.4 }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: `${product.accent}18`, border: `1px solid ${product.accent}35` }}>
            <Icon size={20} style={{ color: product.accent }} />
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded-full"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-3)' }}>
            {product.assets} assets
          </span>
        </div>
        <div className="font-bold text-base mb-1" style={{ color: 'var(--text-1)' }}>{product.label}</div>
        <div className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-3)' }}>{product.description}</div>
        <div className="flex items-center gap-1 text-xs font-semibold transition-all duration-200"
          style={{ color: hov ? product.accent : 'var(--text-4)' }}>
          Start Trading
          <ArrowUpRight size={12} style={{ transform: hov ? 'translate(2px,-2px)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </div>
    </button>
  );
}

// ─── Fear & Greed gauge ───────────────────────────────────────────────────────
function FearGreed({ value = 63 }) {
  const label = value >= 75 ? 'Extreme Greed' : value >= 55 ? 'Greed' : value >= 45 ? 'Neutral' : value >= 25 ? 'Fear' : 'Extreme Fear';
  const color = value >= 55 ? 'var(--green)' : value >= 45 ? 'var(--warn)' : 'var(--red)';
  // Needle: 0%→left(180°), 50%→top(270°/−90°), 100%→right(0°)
  const rad = ((value / 100) * 180 - 180) * (Math.PI / 180);
  const cx = 60, cy = 62, r = 44;
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);
  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="72" viewBox="0 0 120 72">
        <defs>
          <linearGradient id="fgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#d44333" />
            <stop offset="45%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#1ea774" />
          </linearGradient>
        </defs>
        {/* Track */}
        <path d={`M 10 ${cy} A 50 50 0 0 1 110 ${cy}`} fill="none"
          stroke="rgba(255,255,255,0.07)" strokeWidth="8" strokeLinecap="round" />
        {/* Fill */}
        <path d={`M 10 ${cy} A 50 50 0 0 1 110 ${cy}`} fill="none"
          stroke="url(#fgGrad)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${value * 1.57} 200`} />
        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} strokeWidth="2.5" strokeLinecap="round" stroke={color} />
        <circle cx={cx} cy={cy} r="4" fill={color} />
      </svg>
      <div className="font-mono font-black text-2xl -mt-2" style={{ color }}>{value}</div>
      <div className="text-xs font-semibold mt-0.5" style={{ color }}>{label}</div>
    </div>
  );
}

// ─── Portfolio Hero ───────────────────────────────────────────────────────────
function PortfolioHero({ metrics, wallet, pnlToday }) {
  const isUp = metrics.equity >= wallet.usdt;
  const pct  = wallet.usdt > 0 ? ((metrics.equity - wallet.usdt) / wallet.usdt * 100) : 0;
  return (
    <div className="relative rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
      {/* Top accent line */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #3B82F6 35%, #7C3AED 65%, transparent)' }} />
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 85% 40%, rgba(59,130,246,0.06), transparent 55%)' }} />
      <div className="relative px-6 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: main balance */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Live Account</span>
            </div>
            <div className="font-mono text-4xl font-black tracking-tight" style={{ color: 'var(--text-1)' }}>
              ${formatCurrency(metrics.equity)}
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-sm font-mono" style={{ color: 'var(--text-3)' }}>
                Deposited ${formatCurrency(wallet.usdt)}
              </span>
              <span className="flex items-center gap-1 text-sm font-mono font-bold"
                style={{ color: isUp ? 'var(--green)' : 'var(--red)' }}>
                {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {isUp ? '+' : ''}{pct.toFixed(2)}% all time
              </span>
            </div>
          </div>
          {/* Right: metric pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Free Margin',  value: `$${formatCurrency(metrics.freeMargin)}`, color: 'var(--text-1)' },
              { label: 'Open P&L',    value: `${metrics.pnl >= 0 ? '+' : ''}$${formatCurrency(Math.abs(metrics.pnl))}`, color: metrics.pnl >= 0 ? 'var(--green)' : 'var(--red)' },
              { label: "Today's P&L", value: `${pnlToday >= 0 ? '+' : ''}$${formatCurrency(Math.abs(pnlToday))}`, color: pnlToday >= 0 ? 'var(--green)' : 'var(--red)' },
              { label: 'Positions',   value: metrics.openPositions, color: 'var(--brand-light)' },
            ].map(m => (
              <div key={m.label} className="px-4 py-2.5 rounded-xl text-center flex-shrink-0"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                <div className="font-mono text-sm font-bold" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Status chips */}
        <div className="flex items-center gap-2 mt-4 pt-4 flex-wrap"
          style={{ borderTop: '1px solid var(--border-0)' }}>
          {[
            { label: 'Active',        bg: 'rgba(30,167,116,0.1)',   color: 'var(--green)' },
            { label: 'Premium',       bg: 'rgba(59,130,246,0.1)',   color: '#3B82F6' },
            { label: 'KYC Verified',  bg: 'rgba(124,58,237,0.1)',   color: '#7C3AED' },
            {
              label: `Margin ${metrics.marginLevel.toFixed(0)}%`,
              bg:    metrics.marginLevel > 200 ? 'rgba(30,167,116,0.1)' : 'rgba(245,158,11,0.1)',
              color: metrics.marginLevel > 200 ? 'var(--green)' : 'var(--warn)',
            },
          ].map(c => (
            <span key={c.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: c.bg, color: c.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { prices, positions, tradeHistory, wallet, getMetrics, setCurrentPage } = useApp();
  const [metrics, setMetrics]           = useState(getMetrics);
  const [equityHistory, setEquityHistory] = useState(() => EQUITY_SEED.map((v, i) => ({ t: i, v })));
  const [period, setPeriod]             = useState('1W');

  useEffect(() => {
    const id = setInterval(() => {
      const m = getMetrics();
      setMetrics(m);
      setEquityHistory(prev => [...prev, { t: prev.length, v: m.equity }].slice(-50));
    }, 1500);
    return () => clearInterval(id);
  }, [getMetrics]);

  const pnlToday = useMemo(() => {
    const today = new Date().toDateString();
    return tradeHistory
      .filter(t => t.timestamp && new Date(t.timestamp).toDateString() === today)
      .reduce((s, t) => s + (t.pnl || 0), 0);
  }, [tradeHistory]);

  const wins    = useMemo(() => tradeHistory.filter(t => (t.pnl || 0) > 0).length, [tradeHistory]);
  const losses  = useMemo(() => tradeHistory.filter(t => (t.pnl || 0) <= 0).length, [tradeHistory]);
  const winRate = tradeHistory.length > 0 ? Math.round(wins / tradeHistory.length * 100) : 78;
  const avgWin  = wins > 0 ? tradeHistory.filter(t => (t.pnl || 0) > 0).reduce((s, t) => s + t.pnl, 0) / wins : 282;
  const totalRealizedPnl = tradeHistory.reduce((s, t) => s + (t.pnl || 0), 0);

  const winData = [
    { name: 'Wins',   value: wins   || 7, color: 'var(--green)' },
    { name: 'Losses', value: losses || 2, color: 'var(--red)'   },
  ];

  const topMovers = useMemo(() => {
    return [...SIMPLE_TRADE_ASSETS, ...CRYPTO_FUTURES_ASSETS]
      .map(a => ({ ...a, price: prices[a.symbol] ?? a.basePrice, change: ((prices[a.symbol] ?? a.basePrice) - a.basePrice) / a.basePrice * 100 }))
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 4);
  }, [prices]);

  const marketAssets = useMemo(() => [
    ...CRYPTO_FUTURES_ASSETS.slice(0, 4),
    ...FOREX_ASSETS.slice(0, 4),
  ], []);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4 animate-fade-in">

      {/* ── 1. Portfolio Hero ─────────────────────────────────────────── */}
      <PortfolioHero metrics={metrics} wallet={wallet} pnlToday={pnlToday} />

      {/* ── 2. Trading Portals ────────────────────────────────────────── */}
      <div>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-4)' }}>
          Trading Markets
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRODUCTS.map(p => (
            <ProductCard key={p.id} product={p} onClick={() => setCurrentPage(p.id)} />
          ))}
        </div>
      </div>

      {/* ── 3. Live Markets + Equity Curve ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Live price grid */}
        <div className="lg:col-span-2 rounded-2xl p-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Live Markets</span>
            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--green)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {marketAssets.map(asset => (
              <PriceTile key={asset.symbol} asset={asset}
                price={prices[asset.symbol] ?? asset.basePrice}
                onClick={() => setCurrentPage(CRYPTO_FUTURES_ASSETS.includes(asset) ? 'crypto' : 'forex')}
              />
            ))}
          </div>
        </div>

        {/* Equity Curve */}
        <div className="lg:col-span-3 rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-4)' }}>Equity Curve</div>
              <div className="font-mono text-2xl font-black" style={{ color: 'var(--text-1)' }}>
                ${formatCurrency(metrics.equity)}
              </div>
              <div className="text-xs font-mono font-bold mt-0.5"
                style={{ color: metrics.equity >= wallet.usdt ? 'var(--green)' : 'var(--red)' }}>
                {metrics.equity >= wallet.usdt ? '▲' : '▼'} {Math.abs(((metrics.equity - wallet.usdt) / (wallet.usdt || 1)) * 100).toFixed(2)}% vs deposit
              </div>
            </div>
            <div className="flex gap-1">
              {['1H', '1D', '1W'].map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: period === p ? 'var(--brand-bg)' : 'transparent',
                    color:      period === p ? 'var(--brand-light)' : 'var(--text-4)',
                    border: `1px solid ${period === p ? 'rgba(59,130,246,0.2)' : 'transparent'}`,
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <AreaChart data={equityHistory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3B82F6" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2}
                fill="url(#eqGrad)" dot={false} activeDot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ display: 'none' }}
                formatter={v => [`$${formatCurrency(v)}`, 'Equity']}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 4. Performance Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Win Rate */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
          <div className="text-sm font-bold mb-4" style={{ color: 'var(--text-1)' }}>Performance</div>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-shrink-0 w-20 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={winData} cx="50%" cy="50%" innerRadius={25} outerRadius={38}
                    dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270}>
                    {winData.map((e, i) => <Cell key={i} fill={e.color} opacity={0.9} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono font-black text-xs" style={{ color: 'var(--text-1)' }}>{winRate}%</span>
              </div>
            </div>
            <div>
              <div className="font-mono text-3xl font-black" style={{ color: 'var(--green)' }}>{winRate}%</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Win Rate</div>
              <div className="font-mono text-xs mt-1">
                <span style={{ color: 'var(--green)' }}>{wins || 7}W</span>
                <span style={{ color: 'var(--text-4)' }}> / </span>
                <span style={{ color: 'var(--red)' }}>{losses || 2}L</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Avg Win',        value: `+$${formatCurrency(avgWin)}`,                   color: 'var(--green)' },
              { label: 'Total Realized', value: `${totalRealizedPnl >= 0 ? '+' : ''}$${formatCurrency(Math.abs(totalRealizedPnl || 900))}`, color: totalRealizedPnl >= 0 ? 'var(--green)' : 'var(--red)' },
              { label: 'Total Trades',   value: tradeHistory.length || 9,                        color: 'var(--text-1)' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ background: 'var(--bg-surface)' }}>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>{item.label}</span>
                <span className="font-mono text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily P&L */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
          <div className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-1)' }}>Daily P&L</div>
          <div className="text-xs mb-4" style={{ color: 'var(--text-4)' }}>7-day realized</div>
          <ResponsiveContainer width="100%" height={118}>
            <BarChart data={DAILY_PNL} barSize={20} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(240,237,232,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }}
                formatter={v => [`${v >= 0 ? '+' : ''}$${Math.abs(v)}`, 'P&L']}
                labelStyle={{ color: 'rgba(240,237,232,0.5)' }}
              />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {DAILY_PNL.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? '#1ea774' : '#d44333'} opacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { label: 'Up Days',   value: `+$${DAILY_PNL.filter(d => d.pnl > 0).reduce((s, d) => s + d.pnl, 0)}`, color: 'var(--green)' },
              { label: 'Down Days', value: `-$${Math.abs(DAILY_PNL.filter(d => d.pnl < 0).reduce((s, d) => s + d.pnl, 0))}`, color: 'var(--red)' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ background: 'var(--bg-surface)' }}>
                <div className="font-mono text-sm font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-1)' }}>Market Sentiment</div>
          <div className="flex justify-center mb-4">
            <FearGreed value={63} />
          </div>
          <div style={{ borderTop: '1px solid var(--border-0)', paddingTop: '12px' }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-4)' }}>Top Movers</div>
            <div className="space-y-2">
              {topMovers.map(asset => (
                <div key={asset.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{asset.icon}</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{asset.symbol}</span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                    style={{ background: asset.change >= 0 ? 'var(--green-bg)' : 'var(--red-bg)', color: asset.change >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Open Positions ─────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-0)' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Open Positions</span>
            {positions.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: 'var(--brand-bg)', color: 'var(--brand-light)' }}>
                {positions.length} active
              </span>
            )}
          </div>
          {positions.length > 0 && (
            <button onClick={() => setCurrentPage('positions')}
              className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--brand)' }}>
              View All <ChevronRight size={12} />
            </button>
          )}
        </div>

        {positions.length === 0 ? (
          <div className="py-10 text-center">
            <Activity size={26} style={{ color: 'var(--text-4)', margin: '0 auto 10px' }} />
            <div className="text-sm mb-3" style={{ color: 'var(--text-4)' }}>No open positions</div>
            <button onClick={() => setCurrentPage('simple')}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'var(--brand-bg)', color: 'var(--brand-light)', border: '1px solid rgba(59,130,246,0.2)' }}>
              Start Trading
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface)' }}>
                  {['Symbol', 'Direction', 'Leverage', 'Entry', 'Current', 'P&L', 'Opened'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.slice(0, 6).map(pos => {
                  const cur    = prices[pos.symbol] ?? pos.openPrice;
                  const diff   = (pos.direction === 'long' || pos.direction === 'buy') ? cur - pos.openPrice : pos.openPrice - cur;
                  const pnl    = diff * pos.volume * pos.leverage;
                  const isBuy  = pos.direction === 'long' || pos.direction === 'buy';
                  return (
                    <tr key={pos.id} style={{ borderTop: '1px solid var(--border-0)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                            style={{ background: 'var(--bg-surface)' }}>
                            {positionIcon(pos.symbol)}
                          </div>
                          <div>
                            <div className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>{pos.symbol}</div>
                            <div className="text-xs" style={{ color: 'var(--text-4)' }}>{pos.name || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ background: isBuy ? 'var(--green-bg)' : 'var(--red-bg)', color: isBuy ? 'var(--green)' : 'var(--red)' }}>
                          {isBuy ? 'BUY' : 'SELL'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs px-2 py-1 rounded"
                          style={{ background: 'var(--brand-bg)', color: 'var(--brand-light)' }}>
                          {pos.leverage}×
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>
                        {fmtPrice(pos.openPrice)}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs" style={{ color: 'var(--text-1)' }}>
                        {fmtPrice(cur)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-sm font-bold"
                          style={{ color: pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                          {pnl >= 0 ? '+' : ''}${formatCurrency(pnl)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-3)' }}>
                        {pos.openTime?.split(',')[0] ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 6. Recent Trades + Wallet ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Recent Trades */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-0)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Recent Trades</span>
            <button onClick={() => setCurrentPage('history')}
              className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>
              View All →
            </button>
          </div>
          {tradeHistory.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: 'var(--text-4)' }}>No closed trades yet</div>
          ) : (
            tradeHistory.slice(0, 5).map(trade => {
              const isBuy = trade.direction === 'long' || trade.direction === 'buy';
              const isWin = (trade.pnl || 0) >= 0;
              return (
                <div key={trade.id} className="flex items-center justify-between px-5 py-3.5 transition-colors"
                  style={{ borderBottom: '1px solid var(--border-0)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 rounded-full flex-shrink-0" style={{ height: 30, background: isWin ? 'var(--green)' : 'var(--red)' }} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{trade.symbol}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded"
                          style={{ background: isBuy ? 'var(--green-bg)' : 'var(--red-bg)', color: isBuy ? 'var(--green)' : 'var(--red)' }}>
                          {isBuy ? 'BUY' : 'SELL'}
                        </span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>{trade.closeTime}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm"
                      style={{ color: isWin ? 'var(--green)' : 'var(--red)' }}>
                      {isWin ? '+' : ''}${formatCurrency(trade.pnl || 0)}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-4)' }}>{trade.leverage}× leverage</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Wallet */}
        <div className="lg:col-span-2 rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
          <div className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Wallet</div>

          {/* Balance card */}
          <div className="relative rounded-2xl p-4 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(124,58,237,0.07))', border: '1px solid rgba(59,130,246,0.14)' }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>USDT Balance</div>
            <div className="font-mono text-3xl font-black" style={{ color: 'var(--text-1)' }}>
              ${formatCurrency(wallet.usdt)}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Available to deposit or trade</div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Deposit',  icon: ArrowDownToLine, bg: 'var(--green-bg)',  border: 'rgba(30,167,116,0.15)',  color: 'var(--green)',  hov: 'rgba(30,167,116,0.18)' },
              { label: 'Withdraw', icon: ArrowUpFromLine,  bg: 'var(--brand-bg)', border: 'rgba(59,130,246,0.15)',  color: 'var(--brand)',  hov: 'rgba(59,130,246,0.14)' },
            ].map(a => {
              const Icon = a.icon;
              return (
                <button key={a.label} onClick={() => setCurrentPage('wallet')}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                  style={{ background: a.bg, border: `1px solid ${a.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = a.hov}
                  onMouseLeave={e => e.currentTarget.style.background = a.bg}>
                  <Icon size={16} style={{ color: a.color }} />
                  <span className="text-xs font-semibold" style={{ color: a.color }}>{a.label}</span>
                </button>
              );
            })}
          </div>

          {/* Recent transactions */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-4)' }}>
              Recent Activity
            </div>
            <div className="space-y-2">
              {(wallet.transactions || []).slice(0, 3).map((tx, i) => {
                const isDeposit = tx.type === 'deposit';
                const Icon = isDeposit ? ArrowDownToLine : ArrowUpFromLine;
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: isDeposit ? 'var(--green-bg)' : 'var(--brand-bg)' }}>
                        <Icon size={10} style={{ color: isDeposit ? 'var(--green)' : 'var(--brand)' }} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>
                          {isDeposit ? 'Deposit' : 'Withdrawal'}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-4)' }}>{tx.date}</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold"
                      style={{ color: isDeposit ? 'var(--green)' : 'var(--red)' }}>
                      {isDeposit ? '+' : '-'}${formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
