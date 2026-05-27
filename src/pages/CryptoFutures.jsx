import React, { useState, useEffect, useCallback } from 'react';
import { X, TrendingUp, TrendingDown, BarChart2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  CRYPTO_FUTURES_ASSETS, LEVERAGE_OPTIONS,
  generateOrderBook, generateRecentTrades, formatCurrency
} from '../utils/mockData';
import CandleChart from '../components/charts/CandleChart';

function OrderBookSide({ orders, side }) {
  const maxSize = Math.max(...orders.map(o => parseFloat(o.size)));
  return (
    <div className="space-y-0.5">
      {orders.map((order, i) => (
        <div key={i} className="relative flex items-center justify-between px-2 py-0.5 text-xs font-mono overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{
              background: side === 'ask' ? '#ef4444' : '#10b981',
              width: `${(parseFloat(order.size) / maxSize) * 100}%`,
              right: side === 'ask' ? 0 : 'auto',
              left: side === 'bid' ? 0 : 'auto',
            }}
          />
          <span className={`relative z-10 ${side === 'ask' ? 'text-red-400' : 'text-emerald-400'}`}>
            {order.price}
          </span>
          <span className="relative z-10 text-white/50">{order.size}</span>
          <span className="relative z-10 text-white/30">{order.total}</span>
        </div>
      ))}
    </div>
  );
}

function PositionRow({ pos, prices, onClose }) {
  const currentPrice = prices[pos.symbol] || pos.openPrice;
  const priceDiff = pos.direction === 'long'
    ? currentPrice - pos.openPrice
    : pos.openPrice - currentPrice;
  const pnl = priceDiff * pos.volume * pos.leverage;
  const pnlPct = (pnl / (pos.openPrice * pos.volume)) * 100;
  const isProfit = pnl >= 0;

  return (
    <tr className="border-b border-white/5 text-xs hover:bg-white/2 transition-colors">
      <td className="py-2 px-3">
        <div className="font-medium text-white/80">{pos.symbol}</div>
        <div className={`text-xs mt-0.5 ${pos.direction === 'long' ? 'text-emerald-400' : 'text-red-400'}`}>
          {pos.direction.toUpperCase()}
        </div>
      </td>
      <td className="py-2 px-3 text-yellow-400 font-bold">{pos.leverage}x</td>
      <td className="py-2 px-3 text-white/60 font-mono">{pos.volume}</td>
      <td className="py-2 px-3 text-white/60 font-mono">{pos.openPrice.toFixed(2)}</td>
      <td className="py-2 px-3 text-white/80 font-mono">{currentPrice.toFixed(2)}</td>
      <td className={`py-2 px-3 font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
        {isProfit ? '+' : ''}{formatCurrency(pnl)}
        <div className="text-xs opacity-70">{isProfit ? '+' : ''}{pnlPct.toFixed(2)}%</div>
      </td>
      <td className="py-2 px-3 text-white/30">{pos.openTime}</td>
      <td className="py-2 px-3">
        <button
          onClick={() => onClose(pos.id)}
          className="px-3 py-1 rounded text-xs font-medium transition-all"
          style={{ background: 'rgba(220,38,38,0.15)', color: '#ef4444', border: '1px solid rgba(220,38,38,0.2)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.15)'}
        >
          Close
        </button>
      </td>
    </tr>
  );
}

export default function CryptoFutures() {
  const { prices, positions, openPosition, closePosition, wallet, getMetrics } = useApp();
  const [selectedAsset, setSelectedAsset] = useState(CRYPTO_FUTURES_ASSETS[0]);
  const [leverage, setLeverage] = useState(10);
  const [direction, setDirection] = useState('long');
  const [amount, setAmount] = useState('100');
  const [orderType, setOrderType] = useState('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [orderBook, setOrderBook] = useState({ asks: [], bids: [] });
  const [recentTrades, setRecentTrades] = useState([]);
  const [bottomTab, setBottomTab] = useState('positions');
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState(getMetrics());

  const currentPrice = prices[selectedAsset.symbol] || selectedAsset.basePrice;
  const priceChange = ((currentPrice - selectedAsset.basePrice) / selectedAsset.basePrice) * 100;
  const isUp = priceChange >= 0;

  useEffect(() => {
    const t = setInterval(() => {
      setMetrics(getMetrics());
      setOrderBook(generateOrderBook(currentPrice));
      setRecentTrades(generateRecentTrades(currentPrice));
    }, 2000);
    setOrderBook(generateOrderBook(currentPrice));
    setRecentTrades(generateRecentTrades(currentPrice));
    return () => clearInterval(t);
  }, [currentPrice, getMetrics]);

  const myPositions = positions.filter(p => p.module === 'crypto');

  const handleTrade = useCallback(() => {
    const amountVal = parseFloat(amount);
    if (!amountVal || amountVal <= 0) { setError('Invalid amount'); return; }
    if (amountVal > wallet.usdt) { setError('Insufficient balance'); return; }

    const volume = amountVal / currentPrice;
    openPosition({
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      openPrice: currentPrice,
      volume: parseFloat(volume.toFixed(6)),
      leverage,
      direction,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      module: 'crypto',
      orderType,
    });

    setError('');
  }, [amount, wallet.usdt, currentPrice, leverage, direction, openPosition, selectedAsset, stopLoss, takeProfit, orderType]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col" style={{ background: '#0b0d0f' }}>
      {/* Top bar: asset selector + price */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-white/5 overflow-x-auto flex-shrink-0">
        {CRYPTO_FUTURES_ASSETS.map(asset => {
          const p = prices[asset.symbol] || asset.basePrice;
          const ch = ((p - asset.basePrice) / asset.basePrice) * 100;
          const selected = selectedAsset.symbol === asset.symbol;
          return (
            <button
              key={asset.symbol}
              onClick={() => setSelectedAsset(asset)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all flex-shrink-0"
              style={{
                background: selected ? 'rgba(67,97,238,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selected ? 'rgba(67,97,238,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <span className="text-lg">{asset.icon}</span>
              <div className="text-left">
                <div className="text-white/80 text-xs font-semibold">{asset.symbol}</div>
                <div className={`text-xs font-mono ${ch >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {p >= 1000 ? p.toFixed(2) : p.toFixed(4)}
                </div>
              </div>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-6 flex-shrink-0">
          <div className="text-center">
            <div className="font-mono text-base font-bold text-white">{currentPrice.toFixed(2)}</div>
            <div className={`text-xs ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {isUp ? '+' : ''}{priceChange.toFixed(3)}%
            </div>
          </div>
          <div className="hidden sm:flex gap-4 text-xs">
            {[
              { label: '24h High', value: (currentPrice * 1.015).toFixed(2), color: 'text-emerald-400' },
              { label: '24h Low', value: (currentPrice * 0.985).toFixed(2), color: 'text-red-400' },
              { label: '24h Vol', value: `${(Math.random() * 50 + 20).toFixed(1)}K`, color: 'text-white/60' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-white/30">{s.label}</div>
                <div className={`font-mono ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Chart + order book */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Chart */}
          <div className="flex-1 min-h-0 relative" style={{ minHeight: 220 }}>
            <CandleChart symbol={selectedAsset.symbol} basePrice={currentPrice} height="100%" />
          </div>

          {/* Bottom section: Positions */}
          <div className="flex-shrink-0" style={{ height: '200px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex border-b border-white/5">
              {['positions', 'history'].map(tab => (
                <div key={tab} className={`nav-tab ${bottomTab === tab ? 'active' : ''}`}
                  onClick={() => setBottomTab(tab)}>
                  {tab === 'positions' ? `Positions (${myPositions.length})` : 'History'}
                </div>
              ))}
            </div>

            <div className="overflow-auto h-[calc(100%-37px)]">
              {bottomTab === 'positions' ? (
                myPositions.length === 0 ? (
                  <div className="text-white/20 text-xs text-center py-6">No open positions</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-white/30 text-xs border-b border-white/5">
                        {['Symbol', 'Leverage', 'Size', 'Entry', 'Mark', 'PnL', 'Time', ''].map(h => (
                          <th key={h} className="px-3 py-1.5 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {myPositions.map(pos => (
                        <PositionRow key={pos.id} pos={pos} prices={prices} onClose={closePosition} />
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                <div className="p-2">
                  {positions.filter(p => p.module === 'crypto').length === 0 && (
                    <div className="text-white/20 text-xs text-center py-4">No trade history</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Order Book + Order Panel */}
        <div className="flex-shrink-0 flex border-l border-white/5" style={{ width: '320px' }}>
          {/* Order Book */}
          <div className="flex-shrink-0 border-r border-white/5" style={{ width: '140px' }}>
            <div className="px-2 py-2 border-b border-white/5">
              <span className="text-white/40 text-xs font-semibold uppercase tracking-wide">Order Book</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1">
              {['Price', 'Size', 'Total'].map(h => (
                <span key={h} className="text-white/20 text-xs">{h}</span>
              ))}
            </div>
            <OrderBookSide orders={orderBook.asks || []} side="ask" />
            <div className="py-1.5 px-2 text-center font-mono font-bold text-sm"
              style={{ color: isUp ? '#10b981' : '#ef4444', background: 'rgba(255,255,255,0.03)' }}>
              {currentPrice.toFixed(2)}
            </div>
            <OrderBookSide orders={orderBook.bids || []} side="bid" />

            {/* Recent trades */}
            <div className="border-t border-white/5 mt-2">
              <div className="px-2 py-1.5">
                <span className="text-white/30 text-xs font-semibold uppercase">Recent</span>
              </div>
              {(recentTrades || []).slice(0, 6).map((t, i) => (
                <div key={i} className="flex items-center justify-between px-2 py-0.5 text-xs font-mono">
                  <span className={t.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}>
                    {t.price}
                  </span>
                  <span className="text-white/30">{t.size}</span>
                  <span className="text-white/20">{t.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trade Panel */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-3">
              {/* Long/Short */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setDirection('long')}
                  className="py-2.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: direction === 'long' ? '#059669' : 'rgba(5,150,105,0.08)',
                    color: direction === 'long' ? '#fff' : '#059669',
                    border: `1px solid ${direction === 'long' ? '#059669' : 'rgba(5,150,105,0.2)'}`,
                  }}
                >
                  ▲ LONG
                </button>
                <button
                  onClick={() => setDirection('short')}
                  className="py-2.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: direction === 'short' ? '#dc2626' : 'rgba(220,38,38,0.08)',
                    color: direction === 'short' ? '#fff' : '#dc2626',
                    border: `1px solid ${direction === 'short' ? '#dc2626' : 'rgba(220,38,38,0.2)'}`,
                  }}
                >
                  ▼ SHORT
                </button>
              </div>

              {/* Order type */}
              <div className="grid grid-cols-2 gap-1.5">
                {['market', 'limit'].map(t => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className="py-1.5 rounded text-xs font-medium capitalize transition-all"
                    style={{
                      background: orderType === t ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.04)',
                      color: orderType === t ? '#ffd700' : 'rgba(255,255,255,0.4)',
                      border: `1px solid ${orderType === t ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Leverage */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/40 text-xs">Leverage</span>
                  <span className="text-yellow-400 text-xs font-bold">{leverage}x</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[5, 10, 20, 50].map(lev => (
                    <button
                      key={lev}
                      onClick={() => setLeverage(lev)}
                      className="py-1.5 rounded text-xs font-bold transition-all"
                      style={{
                        background: leverage === lev ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)',
                        color: leverage === lev ? '#ffd700' : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${leverage === lev ? 'rgba(255,215,0,0.2)' : 'transparent'}`,
                      }}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>

              {orderType === 'limit' && (
                <div>
                  <label className="text-white/30 text-xs mb-1 block">Limit Price</label>
                  <input
                    value={limitPrice}
                    onChange={e => setLimitPrice(e.target.value)}
                    placeholder={currentPrice.toFixed(2)}
                    className="input-dark text-xs font-mono"
                  />
                </div>
              )}

              <div>
                <label className="text-white/30 text-xs mb-1 block">Amount (USDT)</label>
                <input
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="100"
                  className="input-dark text-xs font-mono"
                />
                <div className="grid grid-cols-4 gap-1 mt-1">
                  {[25, 50, 75, 100].map(pct => (
                    <button
                      key={pct}
                      onClick={() => setAmount((wallet.usdt * pct / 100).toFixed(2))}
                      className="py-1 rounded text-xs text-white/40 transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/30 text-xs mb-1 block">TP</label>
                  <input
                    value={takeProfit}
                    onChange={e => setTakeProfit(e.target.value)}
                    placeholder="Optional"
                    className="input-dark text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-white/30 text-xs mb-1 block">SL</label>
                  <input
                    value={stopLoss}
                    onChange={e => setStopLoss(e.target.value)}
                    placeholder="Optional"
                    className="input-dark text-xs font-mono"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 p-2 rounded text-xs"
                  style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}>
                  <AlertCircle size={11} className="text-red-400" />
                  <span className="text-red-400">{error}</span>
                </div>
              )}

              <button
                onClick={handleTrade}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: direction === 'long'
                    ? 'linear-gradient(135deg, #065f46, #059669)'
                    : 'linear-gradient(135deg, #7f1d1d, #dc2626)',
                  boxShadow: direction === 'long'
                    ? '0 0 20px rgba(5,150,105,0.3)'
                    : '0 0 20px rgba(220,38,38,0.3)',
                }}
              >
                {direction === 'long' ? '▲ Open Long' : '▼ Open Short'}
              </button>

              {/* Balance info */}
              <div className="space-y-1 pt-1">
                {[
                  { label: 'Balance', value: `${formatCurrency(metrics.balance)} USDT` },
                  { label: 'Equity', value: `${formatCurrency(metrics.equity)} USDT` },
                  { label: 'Margin', value: `${formatCurrency(metrics.usedMargin)} USDT` },
                  { label: 'Free Margin', value: `${formatCurrency(metrics.freeMargin)} USDT` },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-white/30">{item.label}</span>
                    <span className="font-mono text-white/60">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
