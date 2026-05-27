import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/mockData';

export default function OpenPositions() {
  const { positions, prices, closePosition, getMetrics, getLiquidationPrice } = useApp();
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
    const currentPrice = prices[pos.symbol] ?? pos.openPrice;
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
            label: 'Unrealized P&L',
            value: `${totalPnL >= 0 ? '+' : ''}$${formatCurrency(Math.abs(totalPnL))}`,
            color: totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400',
          },
          { label: 'Equity', value: `$${formatCurrency(metrics.equity)}`, color: 'text-white' },
          {
            label: 'Margin Level',
            value: `${metrics.marginLevel.toFixed(1)}%`,
            color: metrics.marginLevel > 200 ? 'text-emerald-400' : metrics.marginLevel > 100 ? 'text-yellow-400' : 'text-red-400',
          },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="text-white/30 text-xs uppercase tracking-wider mb-1">{stat.label}</div>
            <div className={`font-mono font-bold text-lg ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
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
            }}>
            {f === 'all' ? 'All' : MODULE_LABELS[f]}
          </button>
        ))}
        <span className="ml-auto text-white/20 text-xs">{filteredPositions.length} position{filteredPositions.length !== 1 ? 's' : ''}</span>
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
                  {['Symbol', 'Module', 'Direction', 'Lev.', 'Volume', 'Entry', 'Mark', 'Liq. Price', 'P&L', 'ROE%', 'Time', ''].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-white/30 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPositions.map(pos => {
                  const currentPrice = prices[pos.symbol] ?? pos.openPrice;
                  const isBuy = pos.direction === 'buy' || pos.direction === 'long';
                  const priceDiff = isBuy ? currentPrice - pos.openPrice : pos.openPrice - currentPrice;
                  const pnl = priceDiff * pos.volume * pos.leverage;
                  const marginUsed = pos.openPrice * pos.volume / pos.leverage;
                  const roe = marginUsed > 0 ? (pnl / marginUsed) * 100 : 0;
                  const isProfit = pnl >= 0;
                  const liqPrice = getLiquidationPrice ? getLiquidationPrice(pos) : (isBuy ? pos.openPrice * 0.9 : pos.openPrice * 1.1);
                  const distToLiq = Math.abs(((currentPrice - liqPrice) / currentPrice) * 100);
                  const nearLiq = distToLiq < 5;

                  return (
                    <tr key={pos.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-3 py-3">
                        <div className="text-white/80 font-semibold text-sm">{pos.symbol}</div>
                        <div className="text-white/30 text-xs">{pos.name}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            background: `${MODULE_COLORS[pos.module] || '#888'}15`,
                            color: MODULE_COLORS[pos.module] || '#888',
                          }}>
                          {MODULE_LABELS[pos.module] || pos.module}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`flex items-center gap-1 text-xs font-bold ${isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isBuy ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {pos.direction.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="badge-gold">{pos.leverage}x</span>
                      </td>
                      <td className="px-3 py-3 text-white/60 font-mono text-sm">{pos.volume}</td>
                      <td className="px-3 py-3 text-white/60 font-mono text-sm">
                        {pos.openPrice >= 100 ? pos.openPrice.toFixed(2) : pos.openPrice.toFixed(4)}
                      </td>
                      <td className="px-3 py-3 text-white font-mono text-sm font-semibold">
                        {currentPrice >= 100 ? currentPrice.toFixed(2) : currentPrice.toFixed(4)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          {nearLiq && <AlertTriangle size={11} className="text-yellow-400 flex-shrink-0" />}
                          <span className={`font-mono text-xs ${nearLiq ? 'text-yellow-400' : 'text-white/40'}`}>
                            {liqPrice >= 100 ? liqPrice.toFixed(2) : liqPrice.toFixed(4)}
                          </span>
                        </div>
                        <div className="text-white/20 text-xs">{distToLiq.toFixed(1)}% away</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className={`font-mono font-bold text-sm ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isProfit ? '+' : ''}{formatCurrency(pnl)}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className={`font-mono text-sm font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isProfit ? '+' : ''}{roe.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-3 py-3 text-white/30 text-xs whitespace-nowrap">{pos.openTime}</td>
                      <td className="px-3 py-3">
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
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(220,38,38,0.1)';
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

      {filteredPositions.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => filteredPositions.forEach(p => closePosition(p.id))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'rgba(220,38,38,0.1)',
              color: '#ef4444',
              border: '1px solid rgba(220,38,38,0.2)',
            }}>
            <X size={14} /> Close All Positions
          </button>
        </div>
      )}
    </div>
  );
}
