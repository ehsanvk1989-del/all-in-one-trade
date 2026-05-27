import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FOREX_ASSETS, formatCurrency } from '../utils/mockData';
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

/* ─── Market Watch Sidebar ───────────────────────────────── */
function MarketWatch({ prices, selected, onSelect }) {
  return (
    <div className="flex-shrink-0 flex flex-col h-full border-r border-white/5 overflow-hidden"
      style={{ width: 162, background: '#0c0e11' }}>
      {/* Header */}
      <div className="px-3 py-3 border-b border-white/5 flex-shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25">Market Watch</span>
      </div>

      {/* Asset list */}
      <div className="flex-1 overflow-y-auto">
        {FOREX_ASSETS.map(asset => {
          const price = prices[asset.symbol] || asset.basePrice;
          const change = ((price - asset.basePrice) / asset.basePrice) * 100;
          const isUp = change >= 0;
          const isSel = selected.symbol === asset.symbol;

          return (
            <div key={asset.symbol} onClick={() => onSelect(asset)}
              className="px-3 py-3 cursor-pointer transition-all"
              style={{
                background: isSel ? 'rgba(255,255,255,0.05)' : 'transparent',
                borderLeft: `2px solid ${isSel ? '#4361ee' : 'transparent'}`,
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm leading-none">{asset.icon}</span>
                  <span className={`text-xs font-bold ${isSel ? 'text-white' : 'text-white/65'}`}>
                    {asset.symbol}
                  </span>
                </div>
                <span className={`text-[10px] font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isUp ? '+' : ''}{change.toFixed(2)}%
                </span>
              </div>
              <div className={`font-mono text-xs font-semibold ${isSel ? 'text-white' : 'text-white/55'}`}>
                {price >= 100 ? price.toFixed(2) : price >= 1 ? price.toFixed(4) : price.toFixed(5)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Session indicator */}
      <div className="px-3 py-2.5 border-t border-white/5 flex-shrink-0">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-white/30 font-semibold">Markets Open</span>
        </div>
        <div className="text-[10px] text-white/20">London / NY sessions</div>
      </div>
    </div>
  );
}

/* ─── Position Row ───────────────────────────────────────── */
function PositionRow({ pos, prices, onClose }) {
  const currentPrice = prices[pos.symbol] || pos.openPrice;
  const diff = pos.direction === 'buy' ? currentPrice - pos.openPrice : pos.openPrice - currentPrice;
  const pnl = diff * pos.volume * pos.leverage;
  const profit = pnl >= 0;

  return (
    <tr className="border-b border-white/5 text-xs hover:bg-white/2 transition-colors">
      <td className="py-2.5 px-3 font-semibold text-white/80">{pos.symbol}</td>
      <td className={`py-2.5 px-3 font-bold ${pos.direction === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
        {pos.direction.toUpperCase()}
      </td>
      <td className="py-2.5 px-3"><span className="badge-gold text-[11px]">{pos.leverage}x</span></td>
      <td className="py-2.5 px-3 font-mono text-white/55">{pos.volume}</td>
      <td className="py-2.5 px-3 font-mono text-white/55">
        {pos.openPrice >= 100 ? pos.openPrice.toFixed(2) : pos.openPrice.toFixed(4)}
      </td>
      <td className="py-2.5 px-3 font-mono text-white/80 font-medium">
        {currentPrice >= 100 ? currentPrice.toFixed(2) : currentPrice.toFixed(4)}
      </td>
      <td className={`py-2.5 px-3 font-mono font-bold ${profit ? 'text-emerald-400' : 'text-red-400'}`}>
        {profit ? '+' : ''}{formatCurrency(pnl)}
      </td>
      <td className="py-2.5 px-3">
        <button onClick={() => onClose(pos.id)}
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
export default function ForexCommodities() {
  const { prices, positions, openPosition, closePosition, wallet, getMetrics } = useApp();
  const [selectedAsset, setSelectedAsset] = useState(FOREX_ASSETS[0]);
  const [leverage, setLeverage] = useState(10);
  const [direction, setDirection] = useState('buy');
  const [volume, setVolume] = useState('0.1');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bottomTab, setBottomTab] = useState('positions');
  const [metrics, setMetrics] = useState(getMetrics());
  const stats24hRef = useRef({});

  // Stable 24h stats per symbol
  if (!stats24hRef.current[selectedAsset.symbol]) {
    const bp = selectedAsset.basePrice;
    stats24hRef.current[selectedAsset.symbol] = {
      high: bp * (1 + 0.006 + Math.random() * 0.006),
      low: bp * (1 - 0.006 - Math.random() * 0.006),
      change: (Math.random() - 0.42) * 0.8,
    };
  }
  const stats = stats24hRef.current[selectedAsset.symbol];

  useEffect(() => {
    const t = setInterval(() => setMetrics(getMetrics()), 1000);
    return () => clearInterval(t);
  }, [getMetrics]);

  const currentPrice = prices[selectedAsset.symbol] || selectedAsset.basePrice;
  const priceChange = ((currentPrice - selectedAsset.basePrice) / selectedAsset.basePrice) * 100;
  const isUp = priceChange >= 0;
  const myPositions = positions.filter(p => p.module === 'forex');
  const spread = selectedAsset.spread;

  const askPrice = currentPrice + spread;
  const bidPrice = currentPrice - spread;

  const handleTrade = useCallback(() => {
    const vol = parseFloat(volume);
    if (!vol || vol <= 0) { setError('Enter a valid volume'); return; }

    openPosition({
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      openPrice: direction === 'buy' ? askPrice : bidPrice,
      volume: vol,
      leverage,
      direction,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      module: 'forex',
    });

    setError('');
    setSuccess(`${direction.toUpperCase()} ${vol} lots on ${selectedAsset.symbol}`);
    setTimeout(() => setSuccess(''), 3000);
  }, [volume, leverage, direction, openPosition, selectedAsset, stopLoss, takeProfit, askPrice, bidPrice]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col" style={{ background: '#0d1117' }}>

      {/* ── Symbol info bar — TradingView style ── */}
      <div className="flex items-center gap-0 px-4 border-b border-white/5 flex-shrink-0"
        style={{ background: '#0e1218' }}>
        <div className="flex items-center gap-3 py-2.5 mr-5">
          <span className="text-xl leading-none">{selectedAsset.icon}</span>
          <div>
            <div className="text-sm font-bold text-white">{selectedAsset.symbol}</div>
            <div className="text-[10px] text-white/30">{selectedAsset.name} • Perpetual CFD</div>
          </div>
        </div>

        <div className="w-px h-8 bg-white/5 mr-5 flex-shrink-0" />

        {/* Price */}
        <div className="mr-5 py-2.5">
          <div className={`font-mono text-xl font-bold leading-none ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {currentPrice >= 100 ? currentPrice.toFixed(2) : currentPrice >= 1 ? currentPrice.toFixed(4) : currentPrice.toFixed(5)}
          </div>
          <div className={`text-xs font-semibold mt-0.5 flex items-center gap-1 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isUp ? '+' : ''}{priceChange.toFixed(3)}%
          </div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6 py-2.5">
          {[
            { label: '24h High', value: stats.high.toFixed(currentPrice > 100 ? 2 : 4), cls: 'text-emerald-400/80' },
            { label: '24h Low', value: stats.low.toFixed(currentPrice > 100 ? 2 : 4), cls: 'text-red-400/80' },
            { label: 'Spread', value: spread.toString(), cls: 'text-white/50' },
            { label: 'Leverage', value: `${leverage}x`, cls: 'text-yellow-400' },
            { label: 'Open P&L', value: `${metrics.pnl >= 0 ? '+' : ''}$${formatCurrency(metrics.pnl)}`, cls: metrics.pnl >= 0 ? 'text-emerald-400' : 'text-red-400' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-[10px] text-white/20 uppercase tracking-wider">{s.label}</div>
              <div className={`font-mono text-xs font-semibold ${s.cls}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Live badge */}
        <div className="ml-auto flex items-center gap-1.5 py-2.5">
          <Activity size={11} className="text-emerald-400" />
          <span className="text-emerald-400 text-[11px] font-semibold">LIVE</span>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Market Watch */}
        <MarketWatch prices={prices} selected={selectedAsset} onSelect={setSelectedAsset} />

        {/* Chart + Positions */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Chart */}
          <div className="flex-1 min-h-0">
            <TVChart symbol={selectedAsset.symbol} basePrice={currentPrice} />
          </div>

          {/* Positions */}
          <div className="flex-shrink-0" style={{ height: 200, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center border-b border-white/5">
              {['positions', 'history'].map(tab => (
                <button key={tab} onClick={() => setBottomTab(tab)}
                  className="nav-tab"
                  style={{ color: bottomTab === tab ? '#ffd700' : 'rgba(255,255,255,0.35)', borderBottomColor: bottomTab === tab ? '#ffd700' : 'transparent' }}>
                  {tab === 'positions' ? `Open Positions (${myPositions.length})` : 'History'}
                </button>
              ))}

              {/* Metrics inline */}
              <div className="ml-auto flex items-center gap-4 px-4 text-xs">
                {[
                  { l: 'Balance', v: `$${formatCurrency(metrics.balance)}`, c: 'text-white/50' },
                  { l: 'Equity', v: `$${formatCurrency(metrics.equity)}`, c: metrics.equity >= metrics.balance ? 'text-emerald-400' : 'text-red-400' },
                  { l: 'Margin', v: `$${formatCurrency(metrics.usedMargin)}`, c: 'text-yellow-400/70' },
                  { l: 'Free Margin', v: `$${formatCurrency(metrics.freeMargin)}`, c: 'text-white/50' },
                ].map(s => (
                  <div key={s.l} className="hidden lg:flex items-center gap-1.5">
                    <span className="text-white/20">{s.l}:</span>
                    <span className={`font-mono font-semibold ${s.c}`}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-auto" style={{ height: 'calc(100% - 38px)' }}>
              {bottomTab === 'positions' ? (
                myPositions.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-white/20 text-sm">
                    No open Forex & Commodities positions
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="sticky top-0" style={{ background: '#0d1117' }}>
                      <tr className="text-[10px] uppercase tracking-wider text-white/25 border-b border-white/5">
                        {['Symbol', 'Direction', 'Leverage', 'Volume', 'Entry', 'Current', 'P&L', ''].map(h => (
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

        {/* ─── Trade Panel ────────────────────────────────── */}
        <div className="flex-shrink-0 flex flex-col overflow-y-auto border-l border-white/5"
          style={{ width: 300, background: '#0e1218' }}>
          <div className="p-5 flex flex-col gap-5">

            {/* ① Buy / Sell */}
            <div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDirection('buy')}
                  className="py-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-1"
                  style={{
                    background: direction === 'buy'
                      ? 'linear-gradient(160deg, #065f46, #10b981)'
                      : 'rgba(16,185,129,0.06)',
                    color: direction === 'buy' ? '#fff' : '#10b981',
                    border: `1px solid ${direction === 'buy' ? '#10b981' : 'rgba(16,185,129,0.2)'}`,
                    boxShadow: direction === 'buy' ? '0 4px 20px rgba(16,185,129,0.3)' : 'none',
                    transform: direction === 'buy' ? 'translateY(-1px)' : 'none',
                  }}>
                  <span className="text-lg font-bold leading-none">▲</span>
                  <span className="text-sm font-bold">BUY</span>
                  <span className="font-mono text-[11px] opacity-70">
                    {askPrice >= 100 ? askPrice.toFixed(2) : askPrice.toFixed(4)}
                  </span>
                </button>

                <button onClick={() => setDirection('sell')}
                  className="py-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-1"
                  style={{
                    background: direction === 'sell'
                      ? 'linear-gradient(160deg, #7f1d1d, #ef4444)'
                      : 'rgba(239,68,68,0.06)',
                    color: direction === 'sell' ? '#fff' : '#ef4444',
                    border: `1px solid ${direction === 'sell' ? '#ef4444' : 'rgba(239,68,68,0.2)'}`,
                    boxShadow: direction === 'sell' ? '0 4px 20px rgba(239,68,68,0.3)' : 'none',
                    transform: direction === 'sell' ? 'translateY(-1px)' : 'none',
                  }}>
                  <span className="text-lg font-bold leading-none">▼</span>
                  <span className="text-sm font-bold">SELL</span>
                  <span className="font-mono text-[11px] opacity-70">
                    {bidPrice >= 100 ? bidPrice.toFixed(2) : bidPrice.toFixed(4)}
                  </span>
                </button>
              </div>

              {/* Spread indicator */}
              <div className="mt-2.5 flex items-center justify-center gap-2 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-[10px] text-white/25">Spread:</span>
                <span className="font-mono text-[11px] text-white/45 font-semibold">{(spread * 2).toFixed(currentPrice > 100 ? 2 : 4)}</span>
                <span className="w-px h-3 bg-white/10" />
                <span className="text-[10px] text-white/25">Pip:</span>
                <span className="font-mono text-[11px] text-white/45 font-semibold">{currentPrice > 100 ? '0.01' : '0.0001'}</span>
              </div>
            </div>

            {/* ② Leverage */}
            <div>
              <SectionLabel right={`${leverage}x`}>Leverage</SectionLabel>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map(l => (
                  <button key={l} onClick={() => setLeverage(l)}
                    className="py-2.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: leverage === l ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.04)',
                      color: leverage === l ? '#ffd700' : 'rgba(255,255,255,0.4)',
                      border: `1px solid ${leverage === l ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: leverage === l ? '0 0 10px rgba(255,215,0,0.1)' : 'none',
                    }}>
                    {l}x
                  </button>
                ))}
              </div>
            </div>

            {/* ③ Volume */}
            <div>
              <SectionLabel>Volume (Lots)</SectionLabel>
              <input
                type="number"
                value={volume}
                onChange={e => { setVolume(e.target.value); setError(''); }}
                placeholder="0.1"
                step="0.01"
                className="input-dark font-mono text-sm py-3 mb-2"
              />
              <div className="grid grid-cols-4 gap-1.5">
                {[0.01, 0.1, 0.5, 1].map(v => (
                  <button key={v} onClick={() => setVolume(v.toString())}
                    className="py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: volume === v.toString() ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.04)',
                      color: volume === v.toString() ? '#ffd700' : 'rgba(255,255,255,0.4)',
                      border: `1px solid ${volume === v.toString() ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    {v}
                  </button>
                ))}
              </div>

              {/* Notional value */}
              {parseFloat(volume) > 0 && (
                <div className="mt-2.5 p-2.5 rounded-lg flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="text-[11px] text-white/30">Notional Value</span>
                  <span className="font-mono text-[11px] font-semibold text-white/55">
                    ${formatCurrency(parseFloat(volume) * currentPrice * leverage)}
                  </span>
                </div>
              )}
            </div>

            {/* ④ TP / SL */}
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
                    step="0.0001"
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
                    step="0.0001"
                    className="input-dark font-mono text-sm py-2.5"
                    style={{ borderColor: stopLoss ? 'rgba(239,68,68,0.3)' : '' }}
                  />
                </div>
              </div>
            </div>

            {/* ⑤ Messages */}
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

            {/* ⑥ Place Order Button */}
            <button onClick={handleTrade}
              className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200"
              style={{
                background: direction === 'buy'
                  ? 'linear-gradient(135deg, #065f46 0%, #10b981 50%, #065f46 100%)'
                  : 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 50%, #7f1d1d 100%)',
                backgroundSize: '200% 100%',
                boxShadow: direction === 'buy'
                  ? '0 4px 24px rgba(16,185,129,0.35)'
                  : '0 4px 24px rgba(239,68,68,0.35)',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundPosition = 'right'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundPosition = 'left'; e.currentTarget.style.transform = 'none'; }}
            >
              {direction === 'buy' ? '▲ Place Buy Order' : '▼ Place Sell Order'}
            </button>

            {/* ⑦ Account Metrics */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="px-4 py-2.5 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25">Account</span>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                {[
                  { label: 'Balance', value: `$${formatCurrency(metrics.balance)}`, color: 'text-white/65' },
                  { label: 'Equity', value: `$${formatCurrency(metrics.equity)}`, color: metrics.equity >= metrics.balance ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'Free Margin', value: `$${formatCurrency(metrics.freeMargin)}`, color: 'text-white/65' },
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
  );
}
