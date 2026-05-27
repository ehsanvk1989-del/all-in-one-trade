import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, BarChart3, Activity,
  ArrowUpRight, ArrowDownRight, Zap, LineChart, Shield, Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, SIMPLE_TRADE_ASSETS } from '../utils/mockData';
import { LineChart as ReLineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function MetricCard({ label, value, sub, color, icon: Icon, prefix = '' }) {
  return (
    <div className="stat-card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-xs font-medium uppercase tracking-wide">{label}</span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <Icon size={13} className="text-white/40" />
          </div>
        )}
      </div>
      <div className={`font-mono text-xl font-bold ${color || 'text-white'}`}>
        {prefix}{typeof value === 'number' ? formatCurrency(value) : value}
      </div>
      {sub && <div className="text-white/30 text-xs">{sub}</div>}
    </div>
  );
}

function MiniChart({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <ReLineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        <Tooltip
          contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
          labelStyle={{ display: 'none' }}
          formatter={v => [`$${formatCurrency(v)}`, '']}
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const { prices, positions, tradeHistory, wallet, getMetrics, setCurrentPage } = useApp();
  const [metrics, setMetrics] = useState(getMetrics());
  const [equityHistory, setEquityHistory] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const m = getMetrics();
      setMetrics(m);
      setEquityHistory(prev => {
        const next = [...prev, { t: Date.now(), v: m.equity }];
        return next.slice(-30);
      });
    }, 1500);

    // Init chart
    if (!initialized) {
      const base = wallet.usdt;
      const hist = Array.from({ length: 20 }, (_, i) => ({
        t: Date.now() - (20 - i) * 60000,
        v: base + (Math.random() - 0.5) * base * 0.02 * i,
      }));
      setEquityHistory(hist);
      setInitialized(true);
    }

    return () => clearInterval(interval);
  }, [getMetrics, wallet.usdt, initialized]);

  const pnlToday = tradeHistory
    .filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + (t.pnl || 0), 0);

  const riskLevel = metrics.marginLevel > 200 ? 'Low' : metrics.marginLevel > 100 ? 'Medium' : 'High';
  const riskColor = riskLevel === 'Low' ? 'text-emerald-400' : riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 animate-fade-in">
      {/* Account Health Bar */}
      <div className="rounded-xl p-4 flex items-center justify-between flex-wrap gap-4"
        style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #b8860b, #ffd700)' }}>
            <Shield size={16} className="text-black" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Account Status</div>
            <div className="text-white/40 text-xs">Margin Level: {metrics.marginLevel.toFixed(1)}%</div>
          </div>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          {[
            { label: 'Status', value: 'Active', color: 'text-emerald-400' },
            { label: 'Risk Level', value: riskLevel, color: riskColor },
            { label: 'Account Type', value: 'Premium', color: 'text-yellow-400' },
            { label: 'KYC', value: 'Verified', color: 'text-emerald-400' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className={`font-semibold text-sm ${item.color}`}>{item.value}</div>
              <div className="text-white/30 text-xs">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Total Balance"
          value={metrics.balance}
          prefix="$"
          icon={Wallet}
          sub="Available funds"
        />
        <MetricCard
          label="Equity"
          value={metrics.equity}
          prefix="$"
          icon={TrendingUp}
          color={metrics.equity >= metrics.balance ? 'text-emerald-400' : 'text-red-400'}
          sub={`${metrics.equity >= metrics.balance ? '▲' : '▼'} ${Math.abs(((metrics.equity - metrics.balance) / metrics.balance) * 100).toFixed(2)}%`}
        />
        <MetricCard
          label="Used Margin"
          value={metrics.usedMargin}
          prefix="$"
          icon={BarChart3}
          color="text-yellow-400"
          sub="In open positions"
        />
        <MetricCard
          label="Free Margin"
          value={metrics.freeMargin}
          prefix="$"
          icon={Activity}
          color={metrics.freeMargin > 0 ? 'text-white' : 'text-red-400'}
          sub="Available to trade"
        />
        <MetricCard
          label="Open P&L"
          value={Math.abs(metrics.pnl)}
          prefix={metrics.pnl >= 0 ? '+$' : '-$'}
          icon={metrics.pnl >= 0 ? TrendingUp : TrendingDown}
          color={metrics.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}
          sub="Unrealized"
        />
        <MetricCard
          label="Today's P&L"
          value={Math.abs(pnlToday)}
          prefix={pnlToday >= 0 ? '+$' : '-$'}
          icon={Clock}
          color={pnlToday >= 0 ? 'text-emerald-400' : 'text-red-400'}
          sub="Realized today"
        />
        <MetricCard
          label="Open Positions"
          value={metrics.openPositions}
          icon={Activity}
          color="text-blue-400"
          sub="Active trades"
        />
        <MetricCard
          label="Total Trades"
          value={tradeHistory.length}
          icon={BarChart3}
          color="text-white"
          sub="All time"
        />
      </div>

      {/* Equity Chart + Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Equity Chart */}
        <div className="lg:col-span-2 card-premium rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-white font-semibold">Equity Curve</div>
              <div className="text-white/30 text-xs mt-0.5">Real-time account equity</div>
            </div>
            <div className={`font-mono font-bold ${metrics.equity >= wallet.usdt ? 'text-emerald-400' : 'text-red-400'}`}>
              ${formatCurrency(metrics.equity)}
            </div>
          </div>
          {equityHistory.length > 1 ? (
            <MiniChart data={equityHistory} color="#ffd700" />
          ) : (
            <div className="h-16 flex items-center justify-center text-white/20 text-sm">
              Chart loading...
            </div>
          )}
        </div>

        {/* Market Overview */}
        <div className="card-premium rounded-xl p-5">
          <div className="text-white font-semibold mb-4">Market Overview</div>
          <div className="space-y-2">
            {SIMPLE_TRADE_ASSETS.map(asset => {
              const price = prices[asset.symbol] || asset.basePrice;
              const change = ((price - asset.basePrice) / asset.basePrice) * 100;
              const isUp = change >= 0;
              return (
                <div key={asset.symbol}
                  className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{asset.icon}</span>
                    <div>
                      <div className="text-white/80 text-xs font-medium">{asset.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs text-white">
                      {price >= 1000 ? price.toFixed(2) : price >= 1 ? price.toFixed(4) : price.toFixed(5)}
                    </div>
                    <div className={`text-xs ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isUp ? '+' : ''}{change.toFixed(3)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom section: open positions + recent history + quick access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Open Positions */}
        <div className="lg:col-span-1 card-premium rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white font-semibold">Open Positions</div>
            <span className="badge-gold">{positions.length}</span>
          </div>
          {positions.length === 0 ? (
            <div className="text-white/20 text-sm text-center py-6">No open positions</div>
          ) : (
            <div className="space-y-2">
              {positions.slice(0, 4).map(pos => {
                const currentPrice = prices[pos.symbol] || pos.openPrice;
                const priceDiff = (pos.direction === 'long' || pos.direction === 'buy')
                  ? currentPrice - pos.openPrice
                  : pos.openPrice - currentPrice;
                const pnl = priceDiff * pos.volume * pos.leverage;
                return (
                  <div key={pos.id}
                    className="flex items-center justify-between p-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div>
                      <div className="text-white/80 text-xs font-medium">{pos.symbol}</div>
                      <div className={`text-xs ${(pos.direction === 'long' || pos.direction === 'buy') ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pos.direction?.toUpperCase()} {pos.volume}
                      </div>
                    </div>
                    <div className={`font-mono text-xs font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                    </div>
                  </div>
                );
              })}
              {positions.length > 4 && (
                <button onClick={() => setCurrentPage('positions')} className="text-yellow-400 text-xs w-full text-center pt-1 hover:underline">
                  View all {positions.length} positions →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recent Trade History */}
        <div className="lg:col-span-1 card-premium rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white font-semibold">Recent History</div>
            <span className="badge-gold">{tradeHistory.length}</span>
          </div>
          {tradeHistory.length === 0 ? (
            <div className="text-white/20 text-sm text-center py-6">No closed trades</div>
          ) : (
            <div className="space-y-2">
              {tradeHistory.slice(0, 4).map(trade => (
                <div key={trade.id}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div>
                    <div className="text-white/80 text-xs font-medium">{trade.symbol}</div>
                    <div className="text-white/30 text-xs">{trade.closeTime}</div>
                  </div>
                  <div className={`font-mono text-xs font-bold ${(trade.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {(trade.pnl || 0) >= 0 ? '+' : ''}{formatCurrency(trade.pnl || 0)}
                  </div>
                </div>
              ))}
              {tradeHistory.length > 4 && (
                <button onClick={() => setCurrentPage('history')} className="text-yellow-400 text-xs w-full text-center pt-1 hover:underline">
                  View all {tradeHistory.length} trades →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Access */}
        <div className="card-premium rounded-xl p-5">
          <div className="text-white font-semibold mb-4">Quick Trade</div>
          <div className="space-y-2">
            {[
              { id: 'simple', label: 'Simple Trade', icon: Zap, color: '#e63946' },
              { id: 'crypto', label: 'Crypto Futures', icon: BarChart3, color: '#4361ee' },
              { id: 'forex', label: 'Forex & Commodities', icon: LineChart, color: '#06d6a0' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `rgba(${parseInt(item.color.slice(1, 3), 16)},${parseInt(item.color.slice(3, 5), 16)},${parseInt(item.color.slice(5, 7), 16)},0.08)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}20` }}>
                    <Icon size={15} style={{ color: item.color }} />
                  </div>
                  <span className="text-white/70 text-sm font-medium">{item.label}</span>
                  <ArrowUpRight size={14} className="ml-auto text-white/20" />
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <button
              onClick={() => setCurrentPage('wallet')}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.1)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,215,0,0.1)' }}>
                <Wallet size={15} className="text-yellow-400" />
              </div>
              <div className="text-left">
                <div className="text-yellow-400 text-sm font-medium">Deposit USDT</div>
                <div className="text-white/30 text-xs">Balance: ${formatCurrency(wallet.usdt)}</div>
              </div>
              <ArrowUpRight size={14} className="ml-auto text-yellow-400/50" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
