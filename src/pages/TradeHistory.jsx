import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/mockData';

export default function TradeHistory() {
  const { tradeHistory } = useApp();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time');

  const MODULE_LABELS = { simple: 'Simple Trade', crypto: 'Crypto Futures', forex: 'Forex & Commodities' };
  const MODULE_COLORS = { simple: '#c9a84c', crypto: '#c9a84c', forex: '#1ea774' };

  const filtered = filter === 'all' ? tradeHistory : tradeHistory.filter(t => t.module === filter);
  const totalPnL = filtered.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = filtered.filter(t => (t.pnl || 0) > 0).length;
  const losses = filtered.filter(t => (t.pnl || 0) <= 0).length;
  const winRate = filtered.length > 0 ? ((wins / filtered.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex-1 overflow-y-auto p-5 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Trades', value: filtered.length, color: 'text-white' },
          {
            label: 'Total Realized P&L',
            value: `${totalPnL >= 0 ? '+' : ''}$${formatCurrency(Math.abs(totalPnL))}`,
            color: totalPnL >= 0 ? 'text-green-500' : 'text-red-500',
          },
          { label: 'Win Rate', value: `${winRate}%`, color: parseFloat(winRate) >= 50 ? 'text-green-500' : 'text-red-500' },
          {
            label: 'W / L',
            value: `${wins} / ${losses}`,
            color: 'text-white',
          },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="text-white/30 text-xs uppercase tracking-wider mb-1">{stat.label}</div>
            <div className={`font-mono font-bold text-lg ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs">Filter:</span>
          {['all', 'simple', 'crypto', 'forex'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize"
              style={{
                background: filter === f ? 'rgba(201,168,76,0.10)' : 'rgba(255,255,255,0.04)',
                color: filter === f ? '#c9a84c' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${filter === f ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {f === 'all' ? 'All' : f === 'simple' ? 'Simple' : f === 'crypto' ? 'Crypto' : 'Forex'}
            </button>
          ))}
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
          style={{
            background: 'var(--gold-bg2)',
            color: 'var(--gold)',
            border: '1px solid rgba(201,168,76,0.15)',
          }}
        >
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card-premium rounded-xl p-12 text-center">
          <div className="text-5xl mb-4 opacity-20">📋</div>
          <div className="text-white/30 text-lg font-medium">No Trade History</div>
          <div className="text-white/15 text-sm mt-2">Closed trades will appear here</div>
        </div>
      ) : (
        <div className="card-premium rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Symbol', 'Module', 'Direction', 'Leverage', 'Volume', 'Open Price', 'Close Price', 'Realized P&L', 'Close Time'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/30 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(trade => {
                  const pnl = trade.pnl || 0;
                  const isProfit = pnl >= 0;
                  const isBuy = trade.direction === 'buy' || trade.direction === 'long';

                  return (
                    <tr key={trade.id} className="border-b border-white/5 transition-colors hover:bg-white/2">
                      <td className="px-4 py-3">
                        <div className="text-white/80 font-semibold text-sm">{trade.symbol}</div>
                        <div className="text-white/25 text-xs">{trade.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            background: `${MODULE_COLORS[trade.module] || '#888'}15`,
                            color: MODULE_COLORS[trade.module] || '#888',
                          }}>
                          {MODULE_LABELS[trade.module] || trade.module}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs font-bold ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                          {isBuy ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {trade.direction?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge-gold">{trade.leverage}x</span>
                      </td>
                      <td className="px-4 py-3 text-white/60 font-mono text-sm">{trade.volume}</td>
                      <td className="px-4 py-3 text-white/60 font-mono text-sm">
                        {trade.openPrice >= 100 ? trade.openPrice.toFixed(2) : trade.openPrice.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-white font-mono text-sm">
                        {trade.closePrice >= 100 ? trade.closePrice.toFixed(2) : trade.closePrice.toFixed(4)}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1 font-mono font-bold text-sm ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                          {isProfit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {isProfit ? '+' : ''}{formatCurrency(pnl)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">{trade.closeTime}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
