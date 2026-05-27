import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/mockData';

export default function OpenPositions() {
  const { positions, prices, closePosition, getMetrics } = useApp();
  const [metrics, setMetrics] = useState(getMetrics());
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const t = setInterval(() => setMetrics(getMetrics()), 1000);
    return () => clearInterval(t);
  }, [getMetrics]);

  const filteredPositions = filter === 'all'
    ? positions
    : positions.filter(p => p.module === filter);

  const totalPnL = positions.reduce((sum, pos) => {
    const currentPrice = prices[pos.symbol] || pos.openPrice;
    const priceDiff = (pos.direction === 'long' || pos.direction === 'buy')
      ? currentPrice - pos.openPrice
      : pos.openPrice - currentPrice;
    return sum + priceDiff * pos.volume * pos.leverage;
  }, 0);

  const MODULE_LABELS = { simple: 'Simple Trade', crypto: 'Crypto Futures', forex: 'Forex & Commodities' };
  const MODULE_COLORS = { simple: '#e63946', crypto: '#4361ee', forex: '#06d6a0' };

  return (
    <div className="flex-1 overflow-y-auto p-5 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Positions', value: positions.length, color: 'text-white' },
          {
            label: 'Total P&L',
            value: `${totalPnL >= 0 ? '+' : ''}$${formatCurrency(Math.abs(totalPnL))}`,
            color: totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
          },
          { label: 'Equity', value: `$${formatCurrency(metrics.equity)}`, color: 'text-white' },
          {
            label: 'Margin Level',
            value: `${metrics.marginLevel.toFixed(1)}%`,
            color: metrics.marginLevel > 200 ? 'text-emerald-400' : metrics.marginLevel > 100 ? 'text-yellow-400' : 'text-red-400'
          },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="text-white/30 text-xs uppercase tracking-wider mb-1">{stat.label}</div>
            <div className={`font-mono font-bold text-lg ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-white/30 text-xs">Filter:</span>
        {['all', 'simple', 'crypto', 'forex'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize"
            style={{
              background: filter === f ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.04)',
              color: filter === f ? '#ffd700' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${filter === f ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            {f === 'all' ? 'All' : MODULE_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Positions Table */}
      {filteredPositions.length === 0 ? (
        <div className="card-premium rounded-xl p-12 text-center">
          <div className="text-5xl mb-4 opacity-20">📊</div>
          <div className="text-white/30 text-lg font-medium">No Open Positions</div>
          <div className="text-white/15 text-sm mt-2">
            {filter === 'all' ? 'Place a trade to see your positions here' : `No open ${MODULE_LABELS[filter]} positions`}
          </div>
        </div>
      ) : (
        <div className="card-premium rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Symbol', 'Module', 'Direction', 'Leverage', 'Volume', 'Open Price', 'Current Price', 'Unrealized P&L', 'P&L %', 'Time', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/30 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPositions.map(pos => {
                  const currentPrice = prices[pos.symbol] || pos.openPrice;
                  const priceDiff = (pos.direction === 'long' || pos.direction === 'buy')
                    ? currentPrice - pos.openPrice
                    : pos.openPrice - currentPrice;
                  const pnl = priceDiff * pos.volume * pos.leverage;
                  const pnlPct = (pnl / (pos.openPrice * pos.volume)) * 100;
                  const isProfit = pnl >= 0;
                  const isBuy = pos.direction === 'buy' || pos.direction === 'long';

                  return (
                    <tr key={pos.id}
                      className="border-b border-white/5 transition-colors hover:bg-white/2">
                      <td className="px-4 py-3">
                        <div className="text-white/80 font-semibold text-sm">{pos.symbol}</div>
                        <div className="text-white/30 text-xs">{pos.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            background: `${MODULE_COLORS[pos.module]}15`,
                            color: MODULE_COLORS[pos.module],
                          }}>
                          {MODULE_LABELS[pos.module]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs font-bold ${isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isBuy ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {pos.direction.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge-gold">{pos.leverage}x</span>
                      </td>
                      <td className="px-4 py-3 text-white/60 font-mono text-sm">{pos.volume}</td>
                      <td className="px-4 py-3 text-white/60 font-mono text-sm">
                        {pos.openPrice >= 100 ? pos.openPrice.toFixed(2) : pos.openPrice.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-white font-mono text-sm font-semibold">
                        {currentPrice >= 100 ? currentPrice.toFixed(2) : currentPrice.toFixed(4)}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`font-mono font-bold text-sm ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isProfit ? '+' : ''}{formatCurrency(pnl)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`font-mono text-xs ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isProfit ? '+' : ''}{pnlPct.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">{pos.openTime}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => closePosition(pos.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: 'rgba(220,38,38,0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(220,38,38,0.2)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(220,38,38,0.25)';
                            e.currentTarget.style.transform = 'scale(1.02)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(220,38,38,0.1)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <X size={11} /> Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Close All button */}
      {filteredPositions.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => filteredPositions.forEach(p => closePosition(p.id))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'rgba(220,38,38,0.1)',
              color: '#ef4444',
              border: '1px solid rgba(220,38,38,0.2)',
            }}
          >
            <X size={14} /> Close All Positions
          </button>
        </div>
      )}
    </div>
  );
}
