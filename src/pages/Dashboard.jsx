import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, BarChart3, Activity,
  ArrowUpRight, Zap, LineChart, Shield, Clock, Target, Award, Flame
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, SIMPLE_TRADE_ASSETS, CRYPTO_FUTURES_ASSETS } from '../utils/mockData';
import {
  AreaChart, Area, LineChart as ReLineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';

// ─── Static seed for deterministic demo charts ─────────────────────────────
const EQUITY_SEED = [9820, 9940, 10120, 9980, 10250, 10180, 10410, 10390, 10520, 10610,
  10480, 10700, 10650, 10830, 10780, 10950, 11020, 10890, 11100, 11240];
const DAILY_PNL_SEED = [
  { day: 'Mon', pnl: 220 },
  { day: 'Tue', pnl: -95 },
  { day: 'Wed', pnl: 380 },
  { day: 'Thu', pnl: 145 },
  { day: 'Fri', pnl: -60 },
  { day: 'Sat', pnl: 290 },
  { day: 'Sun', pnl: 175 },
];

function MetricCard({ label, value, sub, color, icon: Icon, prefix = '', accent }) {
  return (
    <div className="stat-card flex flex-col gap-2 relative overflow-hidden"
      style={accent ? { borderColor: `${accent}18` } : {}}>
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }} />
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>{label}</span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: accent ? `${accent}12` : 'var(--bg-surface)' }}>
            <Icon size={13} style={{ color: accent || 'var(--text-3)' }} />
          </div>
        )}
      </div>
      <div className={`font-mono text-xl font-bold ${color || ''}`} style={!color ? { color: 'var(--text-1)' } : {}}>
        {prefix}{typeof value === 'number' ? formatCurrency(value) : value}
      </div>
      {sub && <div className="text-xs" style={{ color: 'var(--text-3)' }}>{sub}</div>}
    </div>
  );
}

function FearGreedGauge({ value = 63 }) {
  const label = value >= 75 ? 'Extreme Greed' : value >= 55 ? 'Greed' : value >= 45 ? 'Neutral' : value >= 25 ? 'Fear' : 'Extreme Fear';
  const color = value >= 75 ? '#1ea774' : value >= 55 ? '#1ea774' : value >= 45 ? '#c9a84c' : value >= 25 ? '#c9a84c' : '#d44333';
  const angle = (value / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-12 overflow-hidden">
        {/* Arc background */}
        <svg viewBox="0 0 96 48" className="absolute inset-0 w-full h-full">
          <path d="M 8 48 A 40 40 0 0 1 88 48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 8 48 A 40 40 0 0 1 88 48" fill="none"
            stroke={`url(#fgGradient)`} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${value * 1.257} 200`} />
          <defs>
            <linearGradient id="fgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d44333" />
              <stop offset="50%" stopColor="#c9a84c" />
              <stop offset="100%" stopColor="#1ea774" />
            </linearGradient>
          </defs>
          {/* Needle */}
          <line
            x1="48" y1="48"
            x2={48 + 32 * Math.cos((angle * Math.PI) / 180)}
            y2={48 + 32 * Math.sin((angle * Math.PI) / 180)}
            stroke={color} strokeWidth="2" strokeLinecap="round"
          />
          <circle cx="48" cy="48" r="3" fill={color} />
        </svg>
      </div>
      <div className="font-mono font-black text-2xl" style={{ color }}>{value}</div>
      <div className="text-xs font-semibold" style={{ color }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { prices, positions, tradeHistory, wallet, getMetrics, setCurrentPage } = useApp();
  const [metrics, setMetrics] = useState(getMetrics());
  const [equityHistory, setEquityHistory] = useState(() =>
    EQUITY_SEED.map((v, i) => ({ t: i, v }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const m = getMetrics();
      setMetrics(m);
      setEquityHistory(prev => {
        const next = [...prev, { t: prev.length, v: m.equity }];
        return next.slice(-30);
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [getMetrics]);

  const pnlToday = tradeHistory
    .filter(t => {
      const d = new Date(t.timestamp);
      return d.toDateString() === new Date().toDateString();
    })
    .reduce((sum, t) => sum + (t.pnl || 0), 0);

  const wins = tradeHistory.filter(t => (t.pnl || 0) > 0).length;
  const losses = tradeHistory.filter(t => (t.pnl || 0) <= 0).length;
  const winRate = tradeHistory.length > 0 ? Math.round((wins / tradeHistory.length) * 100) : 0;
  const avgWin = wins > 0 ? tradeHistory.filter(t => (t.pnl || 0) > 0).reduce((s, t) => s + t.pnl, 0) / wins : 0;
  const totalRealizedPnl = tradeHistory.reduce((s, t) => s + (t.pnl || 0), 0);

  const riskLevel = metrics.marginLevel > 200 ? 'Low' : metrics.marginLevel > 100 ? 'Medium' : 'High';
  const riskColor = riskLevel === 'Low' ? '#1ea774' : riskLevel === 'Medium' ? '#c9a84c' : '#d44333';

  // Top movers
  const topMovers = useMemo(() => {
    return [...SIMPLE_TRADE_ASSETS, ...CRYPTO_FUTURES_ASSETS].map(asset => {
      const price = prices[asset.symbol] ?? asset.basePrice;
      const change = ((price - asset.basePrice) / asset.basePrice) * 100;
      return { ...asset, price, change };
    }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5);
  }, [prices]);

  const winRateData = [
    { name: 'Wins', value: wins || 7, color: '#1ea774' },
    { name: 'Losses', value: losses || 2, color: '#d44333' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 animate-fade-in">

      {/* Account Health Bar */}
      <div className="rounded-xl p-4 flex items-center justify-between flex-wrap gap-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))' }}>
            <Shield size={16} className="text-black" />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Account Status</div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>Margin Level: {metrics.marginLevel.toFixed(1)}%</div>
          </div>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          {[
            { label: 'Status', value: 'Active', color: '#1ea774' },
            { label: 'Risk', value: riskLevel, color: riskColor },
            { label: 'Account', value: 'Premium', color: '#c9a84c' },
            { label: 'KYC', value: 'Verified ✓', color: '#1ea774' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className="font-semibold text-sm" style={{ color: item.color }}>{item.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-3)' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Balance" value={metrics.balance} prefix="$" icon={Wallet} accent="#c9a84c" sub="Available funds" />
        <MetricCard label="Equity" value={metrics.equity} prefix="$" icon={TrendingUp}
          color={metrics.equity >= metrics.balance ? 'text-green-500' : 'text-red-500'}
          accent="#1ea774"
          sub={`${metrics.equity >= metrics.balance ? '▲' : '▼'} ${Math.abs(((metrics.equity - metrics.balance) / metrics.balance) * 100).toFixed(2)}%`} />
        <MetricCard label="Used Margin" value={metrics.usedMargin} prefix="$" icon={BarChart3}
          color="text-gold" accent="#c9a84c" sub="In open positions" />
        <MetricCard label="Free Margin" value={metrics.freeMargin} prefix="$" icon={Activity}
          color={metrics.freeMargin > 0 ? 'text-white' : 'text-red-500'}
          sub="Available to trade" />
        <MetricCard label="Open P&L" value={Math.abs(metrics.pnl)}
          prefix={metrics.pnl >= 0 ? '+$' : '-$'}
          icon={metrics.pnl >= 0 ? TrendingUp : TrendingDown}
          color={metrics.pnl >= 0 ? 'text-green-500' : 'text-red-500'}
          accent={metrics.pnl >= 0 ? '#1ea774' : '#d44333'}
          sub="Unrealized" />
        <MetricCard label="Realized P&L" value={Math.abs(totalRealizedPnl)}
          prefix={totalRealizedPnl >= 0 ? '+$' : '-$'}
          icon={Clock}
          color={totalRealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'}
          sub="All time" />
        <MetricCard label="Open Positions" value={metrics.openPositions}
          icon={Activity} accent="#c9a84c" sub="Active trades" />
        <MetricCard label="Total Trades" value={tradeHistory.length}
          icon={BarChart3} sub="All time" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Equity Curve */}
        <div className="lg:col-span-2 card-premium rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-white font-semibold">Equity Curve</div>
              <div className="text-white/30 text-xs mt-0.5">Live account equity tracking</div>
            </div>
            <div className="font-mono font-bold text-sm"
              style={{ color: metrics.equity >= wallet.usdt ? 'var(--green)' : 'var(--red)' }}>
              ${formatCurrency(metrics.equity)}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={equityHistory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a84c" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#c9a84c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#c9a84c" strokeWidth={1.5}
                fill="url(#equityGrad)" dot={false} />
              <Tooltip
                contentStyle={{ background: '#181b26', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ display: 'none' }}
                formatter={v => [`$${formatCurrency(v)}`, 'Equity']}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Analytics */}
        <div className="card-premium rounded-xl p-5">
          <div className="text-white font-semibold mb-4">Performance</div>
          <div className="flex items-center gap-4 mb-4">
            <ResponsiveContainer width={80} height={80}>
              <PieChart>
                <Pie data={winRateData} cx="50%" cy="50%" innerRadius={25} outerRadius={38}
                  dataKey="value" strokeWidth={0}>
                  {winRateData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div>
              <div className="font-mono font-black text-2xl" style={{ color: 'var(--text-1)' }}>{winRate || 78}%</div>
              <div className="text-xs" style={{ color: 'var(--text-3)' }}>Win Rate</div>
              <div className="text-xs mt-1 font-mono" style={{ color: 'var(--green)' }}>{wins || 7}W / {losses || 2}L</div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Avg Win', value: `+$${formatCurrency(avgWin || 282)}`, up: true },
              { label: 'Best Trade', value: '+$570.00', up: true },
              { label: 'Total P&L', value: `${totalRealizedPnl >= 0 ? '+' : ''}$${formatCurrency(totalRealizedPnl || 900)}`, up: totalRealizedPnl >= 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>{item.label}</span>
                <span className="font-mono text-xs font-bold" style={{ color: item.up ? 'var(--green)' : 'var(--red)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily P&L + Market Overview + Fear & Greed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Daily P&L */}
        <div className="card-premium rounded-xl p-5">
          <div className="text-white font-semibold mb-1">Daily P&L</div>
          <div className="text-white/30 text-xs mb-4">7-day realized breakdown</div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={DAILY_PNL_SEED} barSize={18} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(240,237,232,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#181b26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }}
                formatter={v => [`${v >= 0 ? '+' : ''}$${Math.abs(v)}`, 'P&L']}
                labelStyle={{ color: 'rgba(240,237,232,0.5)' }}
              />
              <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                {DAILY_PNL_SEED.map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? '#1ea774' : '#d44333'} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Market Overview */}
        <div className="card-premium rounded-xl p-5">
          <div className="text-white font-semibold mb-4">Market Overview</div>
          <div className="space-y-2">
            {SIMPLE_TRADE_ASSETS.map(asset => {
              const price = prices[asset.symbol] ?? asset.basePrice;
              const change = ((price - asset.basePrice) / asset.basePrice) * 100;
              const isUp = change >= 0;
              return (
                <div key={asset.symbol}
                  className="flex items-center justify-between py-1 last:border-0"
                  style={{ borderBottom: '1px solid var(--border-0)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{asset.icon}</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{asset.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs" style={{ color: 'var(--text-1)' }}>
                      {price >= 1000 ? price.toFixed(2) : price >= 1 ? price.toFixed(4) : price.toFixed(5)}
                    </div>
                    <div className="text-xs" style={{ color: isUp ? 'var(--green)' : 'var(--red)' }}>
                      {isUp ? '+' : ''}{change.toFixed(3)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fear & Greed + Top Movers */}
        <div className="card-premium rounded-xl p-5 flex flex-col gap-4">
          <div>
            <div className="text-white font-semibold mb-3">Fear & Greed Index</div>
            <FearGreedGauge value={63} />
          </div>
          <div className="pt-4" style={{ borderTop: '1px solid var(--border-0)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>Top Movers</div>
            <div className="space-y-1.5">
              {topMovers.slice(0, 3).map(asset => (
                <div key={asset.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{asset.icon}</span>
                    <span className="text-xs" style={{ color: 'var(--text-2)' }}>{asset.symbol}</span>
                  </div>
                  <span className="font-mono text-xs font-bold" style={{ color: asset.change >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {asset.change >= 0 ? '▲' : '▼'} {Math.abs(asset.change).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: positions + history + quick access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Open Positions */}
        <div className="card-premium rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Open Positions</div>
            <span className="badge-gold">{positions.length}</span>
          </div>
          {positions.length === 0 ? (
            <div className="text-sm text-center py-6" style={{ color: 'var(--text-4)' }}>No open positions</div>
          ) : (
            <div className="space-y-2">
              {positions.slice(0, 4).map(pos => {
                const currentPrice = prices[pos.symbol] ?? pos.openPrice;
                const priceDiff = (pos.direction === 'long' || pos.direction === 'buy')
                  ? currentPrice - pos.openPrice
                  : pos.openPrice - currentPrice;
                const pnl = priceDiff * pos.volume * pos.leverage;
                const isBuy = pos.direction === 'long' || pos.direction === 'buy';
                return (
                  <div key={pos.id}
                    className="flex items-center justify-between p-2 rounded-lg"
                    style={{ background: 'var(--bg-surface)' }}>
                    <div>
                      <div className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>{pos.symbol}</div>
                      <div className="text-xs" style={{ color: isBuy ? 'var(--green)' : 'var(--red)' }}>
                        {pos.direction?.toUpperCase()} {pos.leverage}x
                      </div>
                    </div>
                    <div className="font-mono text-xs font-bold" style={{ color: pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                    </div>
                  </div>
                );
              })}
              {positions.length > 4 && (
                <button onClick={() => setCurrentPage('positions')}
                  className="text-xs w-full text-center pt-1 hover:underline"
                  style={{ color: 'var(--gold)' }}>
                  View all {positions.length} →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recent History */}
        <div className="card-premium rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Recent Trades</div>
            <span className="badge-gold">{tradeHistory.length}</span>
          </div>
          {tradeHistory.length === 0 ? (
            <div className="text-sm text-center py-6" style={{ color: 'var(--text-4)' }}>No closed trades</div>
          ) : (
            <div className="space-y-2">
              {tradeHistory.slice(0, 4).map(trade => (
                <div key={trade.id}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ background: 'var(--bg-surface)' }}>
                  <div>
                    <div className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>{trade.symbol}</div>
                    <div className="text-xs" style={{ color: 'var(--text-3)' }}>{trade.closeTime}</div>
                  </div>
                  <div className="font-mono text-xs font-bold"
                    style={{ color: (trade.pnl || 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {(trade.pnl || 0) >= 0 ? '+' : ''}{formatCurrency(trade.pnl || 0)}
                  </div>
                </div>
              ))}
              {tradeHistory.length > 4 && (
                <button onClick={() => setCurrentPage('history')}
                  className="text-xs w-full text-center pt-1 hover:underline"
                  style={{ color: 'var(--gold)' }}>
                  View all {tradeHistory.length} →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Access */}
        <div className="card-premium rounded-xl p-5">
          <div className="text-sm font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Quick Trade</div>
          <div className="space-y-2">
            {[
              { id: 'simple', label: 'Simple Trade', icon: Zap },
              { id: 'crypto', label: 'Crypto Futures', icon: BarChart3 },
              { id: 'forex', label: 'Forex & Commodities', icon: LineChart },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-150"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-0)'; }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--gold-bg2)' }}>
                    <Icon size={14} style={{ color: 'var(--gold)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>{item.label}</span>
                  <ArrowUpRight size={13} className="ml-auto" style={{ color: 'var(--text-4)' }} />
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-0)' }}>
            <button
              onClick={() => setCurrentPage('wallet')}
              className="w-full flex items-center gap-3 p-3 rounded-lg transition-all"
              style={{ background: 'var(--gold-bg2)', border: '1px solid rgba(201,168,76,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--gold-bg2)'}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-bg)' }}>
                <Wallet size={14} style={{ color: 'var(--gold)' }} />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium" style={{ color: 'var(--gold-light)' }}>Deposit USDT</div>
                <div className="text-xs" style={{ color: 'var(--text-3)' }}>Balance: ${formatCurrency(wallet.usdt)}</div>
              </div>
              <ArrowUpRight size={13} className="ml-auto" style={{ color: 'var(--gold-dark)' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
