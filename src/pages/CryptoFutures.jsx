import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  CRYPTO_FUTURES_ASSETS,
  generateOrderBook, generateRecentTrades, formatCurrency
} from '../utils/mockData';
import TVChart from '../components/charts/TVChart';

/* ─── Helpers ────────────────────────────────────────────── */
function SectionLabel({ children, right }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25 whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
      {right && <span className="text-[10px] text-white/30 whitespace-nowrap">{right}</span>}
    </div>
  );
}

/* ─── Order Book ─────────────────────────────────────────── */
function OrderBookPanel({ currentPrice, isUp }) {
  const [data, setData] = useState({ asks: [], bids: [] });
  const [recentTrades, setRecentTrades] = useState([]);
  const [tab, setTab] = useState('book');

  useEffect(() => {
    const refresh = () => {
      setData(generateOrderBook(currentPrice));
      setRecentTrades(generateRecentTrades(currentPrice));
    };
    refresh();
    const id = setInterval(refresh, 1800);
    return () => clearInterval(id);
  }, [currentPrice]);

  const maxAskSize = data.asks.length ? Math.max(...data.asks.map(o => parseFloat(o.size))) : 1;
  const maxBidSize = data.bids.length ? Math.max(...data.bids.map(o => parseFloat(o.size))) : 1;

  return (
    <div className="flex flex-col h-full border-r border-white/5 flex-shrink-0"
      style={{ width: 168, background: '#0c0e11' }}>

      {/* Tabs */}
      <div className="flex border-b border-white/5 flex-shrink-0">
        {['book', 'trades'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-xs font-semibold capitalize transition-all"
            style={{
              color: tab === t ? '#ffd700' : 'rgba(255,255,255,0.3)',
              borderBottom: `2px solid ${tab === t ? '#ffd700' : 'transparent'}`,
              background: 'transparent',
            }}
          >
            {t === 'book' ? 'Order Book' : 'Trades'}
          </button>
        ))}
      </div>

      {tab === 'book' ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Column headers */}
          <div className="flex justify-between px-3 py-2 flex-shrink-0">
            {['Price', 'Size', 'Total'].map(h => (
              <span key={h} className="text-[10px] text-white/20 font-semibold">{h}</span>
            ))}
          </div>

          {/* Asks (reverse order — lowest ask closest to mid) */}
          <div className="flex-1 overflow-hidden flex flex-col justify-end pb-0.5">
            {[...(data.asks || [])].reverse().map((ask, i) => (
              <div key={i} className="relative flex items-center justify-between px-3 py-[3px] overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0"
                  style={{
                    width: `${(parseFloat(ask.size) / maxAskSize) * 65}%`,
                    background: 'rgba(239,68,68,0.08)',
                  }} />
                <span className="relative z-10 font-mono text-[11px] text-red-400">{ask.price}</span>
                <span className="relative z-10 font-mono text-[11px] text-white/40">{ask.size}</span>
                <span className="relative z-10 font-mono text-[11px] text-white/25">{ask.total}</span>
              </div>
            ))}
          </div>

          {/* Mid price */}
          <div className="flex items-center justify-between px-3 py-2.5 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span className={`font-mono text-sm font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {currentPrice >= 1000 ? currentPrice.toFixed(2) : currentPrice.toFixed(4)}
            </span>
            <span className="text-white/20 text-[10px]">USDT</span>
          </div>

          {/* Bids */}
          <div className="flex-1 overflow-hidden pt-0.5">
            {(data.bids || []).map((bid, i) => (
              <div key={i} className="relative flex items-center justify-between px-3 py-[3px] overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0"
                  style={{
                    width: `${(parseFloat(bid.size) / maxBidSize) * 65}%`,
                    background: 'rgba(16,185,129,0.08)',
                  }} />
                <span className="relative z-10 font-mono text-[11px] text-emerald-400">{bid.price}</span>
                <span className="relative z-10 font-mono text-[11px] text-white/40">{bid.size}</span>
                <span className="relative z-10 font-mono text-[11px] text-white/25">{bid.total}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Column headers */}
          <div className="flex justify-between px-3 py-2 border-b border-white/5 flex-shrink-0">
            {['Price', 'Size', 'Time'].map(h => (
              <span key={h} className="text-[10px] text-white/20 font-semibold">{h}</span>
            ))}
          </div>
          {recentTrades.map((t, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-[5px] border-b border-white/3">
              <span className={`font-mono text-[11px] ${t.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                {t.price}
              </span>
              <span className="font-mono text-[11px] text-white/40">{t.size}</span>
              <span className="text-[10px] text-white/20">{t.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Positions row ──────────────────────────────────────── */
function PositionRow({ pos, prices, onClose }) {
  const currentPrice = prices[pos.symbol] || pos.openPrice;
  const diff = pos.direction === 'long'
    ? currentPrice - pos.openPrice
    : pos.openPrice - currentPrice;
  const pnl = diff * pos.volume * pos.leverage;
  const pnlPct = (pnl / (pos.openPrice * pos.volume)) * 100;
  const profit = pnl >= 0;

  return (
    <tr className="border-b border-white/5 text-xs hover:bg-white/2 transition-colors">
      <td className="py-2.5 px-3">
        <span className="font-semibold text-white/85">{pos.symbol}</span>
      </td>
      <td className="py-2.5 px-3">
        <span className={`font-bold text-xs ${pos.direction === 'long' ? 'text-emerald-400' : 'text-red-400'}`}>
          {pos.direction.toUpperCase()}
        </span>
      </td>
      <td className="py-2.5 px-3">
        <span className="badge-gold text-[11px]">{pos.leverage}x</span>
      </td>
      <td className="py-2.5 px-3 font-mono text-white/55">{pos.volume}</td>
      <td className="py-2.5 px-3 font-mono text-white/55">{pos.openPrice.toFixed(2)}</td>
      <td className="py-2.5 px-3 font-mono text-white/80 font-medium">{currentPrice.toFixed(2)}</td>
      <td className="py-2.5 px-3">
        <div className={`font-mono font-bold ${profit ? 'text-emerald-400' : 'text-red-400'}`}>
          {profit ? '+' : ''}{formatCurrency(pnl)}
        </div>
        <div className={`text-[10px] ${profit ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
          {profit ? '+' : ''}{pnlPct.toFixed(2)}%
        </div>
      </td>
      <td className="py-2.5 px-3 text-white/25 text-[10px]">{pos.openTime}</td>
      <td className="py-2.5 px-3">
        <button
          onClick={() => onClose(pos.id)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.transform = 'none'; }}
        >
          Close
        </button>
      </td>
    </tr>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
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
  const [bottomTab, setBottomTab] = useState('positions');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [metrics, setMetrics] = useState(getMetrics());
  const vol24hRef = useRef({});

  // Stable 24h stats per symbol
  if (!vol24hRef.current[selectedAsset.symbol]) {
    vol24hRef.current[selectedAsset.symbol] = {
      high: selectedAsset.basePrice * 1.018,
      low: selectedAsset.basePrice * 0.982,
      vol: `${(Math.random() * 55 + 18).toFixed(1)}K`,
    };
  }
  const stats24h = vol24hRef.current[selectedAsset.symbol];

  useEffect(() => {
    const t = setInterval(() => setMetrics(getMetrics()), 1000);
    return () => clearInterval(t);
  }, [getMetrics]);

  const currentPrice = prices[selectedAsset.symbol] || selectedAsset.basePrice;
  const priceChange = ((currentPrice - selectedAsset.basePrice) / selectedAsset.basePrice) * 100;
  const isUp = priceChange >= 0;
  const myPositions = positions.filter(p => p.module === 'crypto');

  const estValue = (parseFloat(amount) || 0) * leverage;
  const reqMargin = (parseFloat(amount) || 0);

  const handleTrade = useCallback(() => {
    const amountVal = parseFloat(amount);
    if (!amountVal || amountVal <= 0) { setError('Enter a valid amount'); return; }
    if (amountVal > wallet.usdt) { setError('Insufficient balance'); return; }

    openPosition({
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      openPrice: currentPrice,
      volume: parseFloat((amountVal / currentPrice).toFixed(6)),
      leverage,
      direction,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      module: 'crypto',
      orderType,
    });

    setError('');
    setSuccess(`${direction === 'long' ? 'Long' : 'Short'} position opened on ${selectedAsset.symbol}`);
    setTimeout(() => setSuccess(''), 3000);
  }, [amount, wallet.usdt, currentPrice, leverage, direction, openPosition, selectedAsset, stopLoss, takeProfit, orderType]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col" style={{ background: '#0b0d0f' }}>

      {/* ── Asset Selector Bar ── */}
      <div className="flex items-center gap-0 px-4 border-b border-white/5 flex-shrink-0 overflow-x-auto"
        style={{ background: '#0c0e11' }}>

        {/* Assets */}
        <div className="flex items-center gap-1 py-2 mr-4">
          {CRYPTO_FUTURES_ASSETS.map(asset => {
            const p = prices[asset.symbol] || asset.basePrice;
            const ch = ((p - asset.basePrice) / asset.basePrice) * 100;
            const sel = selectedAsset.symbol === asset.symbol;
            return (
              <button key={asset.symbol} onClick={() => { setSelectedAsset(asset); setLimitPrice(''); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-shrink-0"
                style={{
                  background: sel ? 'rgba(255,255,255,0.07)' : 'transparent',
                  border: `1px solid ${sel ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                }}>
                <span className="text-base leading-none">{asset.icon}</span>
                <div className="text-left">
                  <div className={`text-xs font-bold ${sel ? 'text-white' : 'text-white/60'}`}>{asset.symbol}</div>
                  <div className={`text-[11px] font-mono ${ch >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {p >= 1000 ? p.toFixed(2) : p.toFixed(4)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-white/5 mr-4 flex-shrink-0" />

        {/* Current symbol stats */}
        <div className="flex items-center gap-6 flex-shrink-0 py-2">
          <div>
            <div className={`font-mono text-lg font-bold leading-tight ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {currentPrice.toFixed(2)}
            </div>
            <div className={`text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {isUp ? '+' : ''}{priceChange.toFixed(3)}%
            </div>
          </div>
          {[
            { label: '24h High', value: stats24h.high.toFixed(2), cls: 'text-emerald-400' },
            { label: '24h Low', value: stats24h.low.toFixed(2), cls: 'text-red-400' },
            { label: '24h Volume', value: stats24h.vol, cls: 'text-white/70' },
            { label: 'Funding', value: '+0.0100%', cls: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="hidden md:block">
              <div className="text-[10px] text-white/25 uppercase tracking-wider">{s.label}</div>
              <div className={`font-mono text-xs font-semibold ${s.cls}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Row ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left: Chart + Positions */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* TradingView chart */}
          <div className="flex-1 min-h-0">
            <TVChart symbol={selectedAsset.symbol} basePrice={currentPrice} />
          </div>

          {/* Positions panel */}
          <div className="flex-shrink-0" style={{ height: 208, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center border-b border-white/5">
              {['positions', 'history'].map(tab => (
                <button key={tab}
                  onClick={() => setBottomTab(tab)}
                  className="nav-tab"
                  style={{ color: bottomTab === tab ? '#ffd700' : 'rgba(255,255,255,0.35)', borderBottomColor: bottomTab === tab ? '#ffd700' : 'transparent' }}>
                  {tab === 'positions' ? `Open Positions (${myPositions.length})` : 'History'}
                </button>
              ))}
            </div>

            <div className="overflow-auto" style={{ height: 'calc(100% - 38px)' }}>
              {bottomTab === 'positions' ? (
                myPositions.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-white/20 text-sm">
                    No open positions
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="sticky top-0" style={{ background: '#0b0d0f' }}>
                      <tr className="text-[10px] uppercase tracking-wider text-white/25 border-b border-white/5">
                        {['Symbol', 'Direction', 'Leverage', 'Size', 'Entry', 'Mark Price', 'PnL', 'Opened', ''].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
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
                <div className="flex items-center justify-center h-full text-white/20 text-sm">
                  Closed trades appear in Trade History
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Order Book + Trade Panel */}
        <div className="flex-shrink-0 flex border-l border-white/5" style={{ width: 500 }}>

          {/* Order Book */}
          <OrderBookPanel currentPrice={currentPrice} isUp={isUp} />

          {/* ─── Trade Panel ────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto flex flex-col"
            style={{ background: '#0d0f12' }}>
            <div className="p-5 flex flex-col gap-5 flex-1">

              {/* ① Direction: Long / Short */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'long', label: 'Long', icon: '▲', sub: 'Buy', green: true },
                  { key: 'short', label: 'Short', icon: '▼', sub: 'Sell', green: false },
                ].map(btn => {
                  const active = direction === btn.key;
                  const color = btn.green ? { solid: '#10b981', bg: '#065f46', glow: 'rgba(16,185,129,0.35)', faint: 'rgba(16,185,129,0.06)' }
                    : { solid: '#ef4444', bg: '#7f1d1d', glow: 'rgba(239,68,68,0.35)', faint: 'rgba(239,68,68,0.06)' };
                  return (
                    <button key={btn.key} onClick={() => setDirection(btn.key)}
                      className="py-4 rounded-xl font-bold text-sm transition-all duration-200 flex flex-col items-center gap-0.5"
                      style={{
                        background: active
                          ? `linear-gradient(160deg, ${color.bg}, ${color.solid})`
                          : color.faint,
                        color: active ? '#fff' : color.solid,
                        border: `1px solid ${active ? color.solid : `${color.solid}30`}`,
                        boxShadow: active ? `0 4px 20px ${color.glow}` : 'none',
                        transform: active ? 'translateY(-1px)' : 'none',
                      }}>
                      <span className="text-lg leading-none">{btn.icon}</span>
                      <span className="text-sm font-bold">{btn.label}</span>
                      <span className="text-[11px] opacity-60 font-normal">{btn.sub}</span>
                    </button>
                  );
                })}
              </div>

              {/* ② Order Type */}
              <div>
                <SectionLabel>Order Type</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  {['market', 'limit'].map(t => (
                    <button key={t} onClick={() => setOrderType(t)}
                      className="py-2.5 rounded-lg text-xs font-bold capitalize transition-all"
                      style={{
                        background: orderType === t ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.04)',
                        color: orderType === t ? '#ffd700' : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${orderType === t ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.07)'}`,
                      }}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                {orderType === 'limit' && (
                  <div className="mt-3">
                    <label className="text-[11px] text-white/35 font-semibold uppercase tracking-wider mb-1.5 block">
                      Limit Price
                    </label>
                    <input
                      value={limitPrice}
                      onChange={e => setLimitPrice(e.target.value)}
                      placeholder={currentPrice.toFixed(2)}
                      className="input-dark font-mono text-sm py-3"
                    />
                  </div>
                )}
              </div>

              {/* ③ Leverage */}
              <div>
                <SectionLabel right={`${leverage}x`}>Leverage</SectionLabel>
                <div className="grid grid-cols-5 gap-1.5">
                  {[5, 10, 20, 50, 100].map(lev => (
                    <button key={lev} onClick={() => setLeverage(lev)}
                      className="py-2.5 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: leverage === lev ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.04)',
                        color: leverage === lev ? '#ffd700' : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${leverage === lev ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        boxShadow: leverage === lev ? '0 0 10px rgba(255,215,0,0.12)' : 'none',
                      }}>
                      {lev}x
                    </button>
                  ))}
                </div>

                {/* Leverage indicator bar */}
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (leverage / 100) * 100)}%`,
                      background: leverage <= 10 ? '#10b981' : leverage <= 20 ? '#ffd700' : leverage <= 50 ? '#f97316' : '#ef4444',
                    }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-white/20">1x</span>
                  <span className="text-[10px] text-white/20">100x</span>
                </div>
              </div>

              {/* ④ Amount */}
              <div>
                <SectionLabel right={`Avail: ${formatCurrency(wallet.usdt)} USDT`}>Amount (USDT)</SectionLabel>
                <input
                  type="number"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setError(''); }}
                  placeholder="Enter amount..."
                  className="input-dark font-mono text-sm py-3 mb-2"
                  style={{ fontSize: '0.95rem' }}
                />
                <div className="grid grid-cols-4 gap-1.5">
                  {[25, 50, 75, 100].map(pct => (
                    <button key={pct}
                      onClick={() => setAmount((wallet.usdt * pct / 100).toFixed(2))}
                      className="py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        color: 'rgba(255,255,255,0.45)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,215,0,0.08)'; e.currentTarget.style.color = '#ffd700'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* Estimated position value */}
                {parseFloat(amount) > 0 && (
                  <div className="mt-2.5 p-2.5 rounded-lg flex items-center justify-between"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-[11px] text-white/30">Position Value</span>
                    <span className="font-mono text-[11px] font-semibold text-white/60">
                      ${formatCurrency(estValue)} USDT
                    </span>
                  </div>
                )}
              </div>

              {/* ⑤ TP / SL */}
              <div>
                <SectionLabel>Take Profit / Stop Loss</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-emerald-400/60 font-semibold mb-1.5 block">
                      Take Profit
                    </label>
                    <input
                      type="number"
                      value={takeProfit}
                      onChange={e => setTakeProfit(e.target.value)}
                      placeholder="Optional"
                      className="input-dark font-mono text-sm py-2.5"
                      style={{ borderColor: takeProfit ? 'rgba(16,185,129,0.3)' : '' }}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-red-400/60 font-semibold mb-1.5 block">
                      Stop Loss
                    </label>
                    <input
                      type="number"
                      value={stopLoss}
                      onChange={e => setStopLoss(e.target.value)}
                      placeholder="Optional"
                      className="input-dark font-mono text-sm py-2.5"
                      style={{ borderColor: stopLoss ? 'rgba(239,68,68,0.3)' : '' }}
                    />
                  </div>
                </div>
              </div>

              {/* ⑥ Messages */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
                  <span className="text-red-400 text-xs">{error}</span>
                </div>
              )}
              {success && (
                <div className="p-3 rounded-xl text-xs text-emerald-400"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {success}
                </div>
              )}

              {/* ⑦ Open Position Button */}
              <button onClick={handleTrade}
                className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 relative overflow-hidden"
                style={{
                  background: direction === 'long'
                    ? 'linear-gradient(135deg, #065f46 0%, #10b981 50%, #065f46 100%)'
                    : 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 50%, #7f1d1d 100%)',
                  backgroundSize: '200% 100%',
                  boxShadow: direction === 'long'
                    ? '0 4px 24px rgba(16,185,129,0.35)'
                    : '0 4px 24px rgba(239,68,68,0.35)',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundPosition = 'right'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundPosition = 'left'; e.currentTarget.style.transform = 'none'; }}
              >
                {direction === 'long' ? '▲ Open Long Position' : '▼ Open Short Position'}
              </button>

              {/* ⑧ Account Metrics */}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="px-4 py-2.5 border-b border-white/5"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25">Account</span>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  {[
                    { label: 'Balance', value: `${formatCurrency(metrics.balance)} USDT`, color: 'text-white/65' },
                    { label: 'Equity', value: `${formatCurrency(metrics.equity)} USDT`, color: metrics.equity >= metrics.balance ? 'text-emerald-400' : 'text-red-400' },
                    { label: 'Used Margin', value: `${formatCurrency(metrics.usedMargin)} USDT`, color: 'text-yellow-400/70' },
                    { label: 'Free Margin', value: `${formatCurrency(metrics.freeMargin)} USDT`, color: 'text-white/65' },
                    { label: 'Margin Level', value: `${metrics.marginLevel.toFixed(1)}%`, color: metrics.marginLevel > 200 ? 'text-emerald-400' : 'text-yellow-400' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-[11px] text-white/30">{item.label}</span>
                      <span className={`font-mono text-[11px] font-semibold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
