import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, X, ChevronUp, ChevronDown, AlertCircle, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SIMPLE_TRADE_ASSETS, SIMPLE_LEVERAGE_OPTIONS, formatCurrency } from '../utils/mockData';

// Inject cinematic animations once
if (typeof document !== 'undefined' && !document.getElementById('simple-trade-anims')) {
  const s = document.createElement('style');
  s.id = 'simple-trade-anims';
  s.textContent = `
    @keyframes buyGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(5,150,105,0.3), inset 0 1px 0 rgba(255,255,255,0.1); }
      50%       { box-shadow: 0 0 40px rgba(5,150,105,0.6), 0 0 80px rgba(5,150,105,0.2), inset 0 1px 0 rgba(255,255,255,0.2); }
    }
    @keyframes sellGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(212,67,51,0.3), inset 0 1px 0 rgba(255,255,255,0.1); }
      50%       { box-shadow: 0 0 40px rgba(212,67,51,0.6), 0 0 80px rgba(212,67,51,0.2), inset 0 1px 0 rgba(255,255,255,0.2); }
    }
    @keyframes pnlCount {
      from { opacity: 0.5; transform: scale(0.97); }
      to   { opacity: 1;   transform: scale(1); }
    }
    @keyframes priceBlinkUp {
      0%, 100% { color: #1ea774; }
      50%       { color: #6ee7b7; }
    }
    @keyframes priceBlinkDown {
      0%, 100% { color: #d44333; }
      50%       { color: #fca5a5; }
    }
  `;
  document.head.appendChild(s);
}

// Per-symbol volatility per tick (realistic small moves)
const SIM_VOLATILITY = {
  XAUUSD: 0.00025,
  OIL:    0.00035,
  EURUSD: 0.00010,
  GBPUSD: 0.00010,
  BTC:    0.00045,
  ETH:    0.00055,
};

function buildSimPrices() {
  const out = {};
  SIMPLE_TRADE_ASSETS.forEach(a => { out[a.symbol] = a.basePrice; });
  return out;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AssetButton({ asset, selected, price, onChange }) {
  const change = ((price - asset.basePrice) / asset.basePrice) * 100;
  const isUp = change >= 0;

  return (
    <button
      onClick={() => onChange(asset)}
      className="flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-w-0"
      style={{
        background: selected ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: selected ? '0 0 24px rgba(59,130,246,0.12)' : 'none',
        transform: selected ? 'translateY(-1px)' : 'none',
      }}
    >
      <span className="text-lg mb-1">{asset.icon}</span>
      <div className="flex items-center gap-1">
        <div className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
        <div className="text-white/80 text-xs font-semibold">{asset.symbol}</div>
      </div>
      <div className={`text-xs font-mono mt-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
        {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
      </div>
    </button>
  );
}

function LivePnL({ pos, prices }) {
  const currentPrice = prices[pos.symbol] ?? pos.openPrice;
  const priceDiff = pos.direction === 'buy'
    ? currentPrice - pos.openPrice
    : pos.openPrice - currentPrice;
  const pnl = priceDiff * pos.volume * pos.leverage;
  const roe = (pnl / (pos.openPrice * pos.volume / pos.leverage)) * 100;
  const isProfit = pnl >= 0;

  return (
    <div style={{ animation: 'pnlCount 0.3s ease' }}>
      <div className={`font-mono font-black text-sm ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
        {isProfit ? '+' : ''}{formatCurrency(pnl)}
      </div>
      <div className={`text-xs font-mono ${isProfit ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
        ROE {isProfit ? '+' : ''}{roe.toFixed(1)}%
      </div>
    </div>
  );
}

function TradeRow({ pos, prices, onClose }) {
  const currentPrice = prices[pos.symbol] ?? pos.openPrice;
  const isProfit = (() => {
    const diff = pos.direction === 'buy' ? currentPrice - pos.openPrice : pos.openPrice - currentPrice;
    return diff * pos.volume * pos.leverage >= 0;
  })();

  return (
    <div className="flex items-center gap-2 p-3 rounded-xl transition-all"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${isProfit ? 'rgba(5,150,105,0.15)' : 'rgba(212,67,51,0.15)'}`,
      }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-sm font-semibold">{pos.symbol}</span>
          <span className={`badge-${pos.direction === 'buy' ? 'green' : 'red'} text-xs`}>
            {pos.direction.toUpperCase()}
          </span>
          <span className="badge-brand text-xs">{pos.leverage}x</span>
        </div>
        <div className="text-white/30 text-xs mt-0.5">
          Vol: {pos.volume} · Entry: {pos.openPrice.toFixed(pos.openPrice > 100 ? 2 : 4)}
        </div>
      </div>
      <LivePnL pos={pos} prices={prices} />
      <div className="text-right mr-1">
        <div className="text-white/40 text-xs font-mono">
          {currentPrice.toFixed(currentPrice > 100 ? 2 : 4)}
        </div>
      </div>
      <button
        onClick={() => onClose(pos.id)}
        className="ml-1 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
        style={{ background: 'rgba(255,255,255,0.05)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,67,51,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
      >
        <X size={13} className="text-white/50" />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SimpleTrade() {
  const { prices: realPrices, priceStatuses, positions, openPosition, closePosition, wallet, getMetrics } = useApp();

  // Local simulated prices — always alive, tick every 1-2 seconds
  const [simPrices, setSimPrices] = useState(buildSimPrices);
  const tickRef = useRef(null);

  useEffect(() => {
    function tick() {
      setSimPrices(prev => {
        const next = { ...prev };
        SIMPLE_TRADE_ASSETS.forEach(({ symbol }) => {
          const vol = SIM_VOLATILITY[symbol] || 0.0003;
          const change = (Math.random() - 0.5) * 2 * vol;
          next[symbol] = prev[symbol] * (1 + change);
        });
        return next;
      });
      tickRef.current = setTimeout(tick, 1000 + Math.random() * 1000);
    }
    tickRef.current = setTimeout(tick, 1000 + Math.random() * 1000);
    return () => clearTimeout(tickRef.current);
  }, []);

  // Merge: prefer real price when live, otherwise use simulated
  const effectivePrices = {};
  SIMPLE_TRADE_ASSETS.forEach(({ symbol }) => {
    const status = priceStatuses?.[symbol];
    effectivePrices[symbol] = (status === 'live' && realPrices[symbol] != null)
      ? realPrices[symbol]
      : simPrices[symbol];
  });

  const [selectedAsset, setSelectedAsset] = useState(SIMPLE_TRADE_ASSETS[0]);
  const [direction, setDirection] = useState('buy');
  const [volume, setVolume] = useState('0.01');
  const [leverage, setLeverage] = useState(10);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [error, setError] = useState('');
  const [tradeFlash, setTradeFlash] = useState(false);
  const [metrics, setMetrics] = useState(getMetrics());

  useEffect(() => {
    const t = setInterval(() => setMetrics(getMetrics()), 1000);
    return () => clearInterval(t);
  }, [getMetrics]);

  const currentPrice = effectivePrices[selectedAsset.symbol] ?? selectedAsset.basePrice;
  const priceChange = ((currentPrice - selectedAsset.basePrice) / selectedAsset.basePrice) * 100;
  const isUp = priceChange >= 0;

  const myPositions = positions.filter(p => p.module === 'simple');

  const handleTrade = useCallback(() => {
    const vol = parseFloat(volume);
    if (!vol || vol <= 0) { setError('Invalid volume'); return; }
    if (vol > wallet.usdt / currentPrice) { setError('Insufficient balance'); return; }

    openPosition({
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      openPrice: currentPrice,
      volume: vol,
      leverage,
      direction,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      module: 'simple',
    });

    setError('');
    setTradeFlash(true);
    setTimeout(() => setTradeFlash(false), 800);
  }, [volume, wallet.usdt, currentPrice, openPosition, selectedAsset, leverage, direction, stopLoss, takeProfit]);

  const notionalValue = (parseFloat(volume || 0) * currentPrice * leverage).toFixed(2);

  return (
    <div className="flex-1 overflow-y-auto animate-fade-in"
      style={{
        background: 'radial-gradient(ellipse at top, rgba(100,0,0,0.06) 0%, transparent 60%), #0a0a0a',
      }}>

      {/* Price display bar */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-4 mb-4 p-4 rounded-xl"
          style={{
            background: tradeFlash ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${tradeFlash ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.08)'}`,
            transition: 'all 0.4s ease',
          }}>
          <div className="text-3xl select-none">{selectedAsset.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <div className="text-white/40 text-xs uppercase tracking-wider">{selectedAsset.name}</div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-end gap-2 mt-0.5">
              <span className="text-3xl font-bold font-mono text-white"
                style={{ animation: `${isUp ? 'priceBlinkUp' : 'priceBlinkDown'} 1.5s ease-in-out infinite` }}>
                {currentPrice >= 1000
                  ? currentPrice.toFixed(2)
                  : currentPrice >= 1
                    ? currentPrice.toFixed(4)
                    : currentPrice.toFixed(5)}
              </span>
              <span className={`text-sm font-medium mb-1 flex items-center gap-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {Math.abs(priceChange).toFixed(3)}%
              </span>
            </div>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <div className="text-white/30 text-xs">Free Margin</div>
            <div className="font-mono font-bold text-blue-400">${formatCurrency(metrics.freeMargin)}</div>
          </div>
        </div>

        {/* Asset selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
          {SIMPLE_TRADE_ASSETS.map(asset => (
            <AssetButton
              key={asset.symbol}
              asset={asset}
              selected={selectedAsset.symbol === asset.symbol}
              price={effectivePrices[asset.symbol] ?? asset.basePrice}
              onChange={setSelectedAsset}
            />
          ))}
        </div>
      </div>

      <div className="px-5 grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Trade Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-xl p-5 space-y-4"
            style={{
              background: 'linear-gradient(145deg, rgba(22,12,10,0.99), rgba(14,10,10,0.99))',
              border: '1px solid rgba(200,0,0,0.14)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ animation: 'pulse 2s infinite' }} />
              <span className="text-white/50 text-xs font-bold tracking-wider uppercase">Place Order</span>
            </div>

            {/* Cinematic BUY/SELL buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDirection('buy')}
                className="py-4 rounded-xl font-black text-sm transition-all duration-200 relative overflow-hidden"
                style={{
                  background: direction === 'buy'
                    ? 'linear-gradient(135deg, #064e3b 0%, #059669 60%, #1ea774 100%)'
                    : 'rgba(5,150,105,0.07)',
                  border: `1px solid ${direction === 'buy' ? '#1ea774' : 'rgba(5,150,105,0.2)'}`,
                  color: direction === 'buy' ? '#fff' : '#059669',
                  animation: direction === 'buy' ? 'buyGlow 2.5s ease-in-out infinite' : 'none',
                  fontSize: '0.875rem',
                  letterSpacing: '0.08em',
                }}
              >
                ▲ BUY
                <div className="text-xs font-normal opacity-70 mt-0.5">LONG</div>
              </button>
              <button
                onClick={() => setDirection('sell')}
                className="py-4 rounded-xl font-black text-sm transition-all duration-200 relative overflow-hidden"
                style={{
                  background: direction === 'sell'
                    ? 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 60%, #d44333 100%)'
                    : 'rgba(212,67,51,0.07)',
                  border: `1px solid ${direction === 'sell' ? '#d44333' : 'rgba(212,67,51,0.2)'}`,
                  color: direction === 'sell' ? '#fff' : '#dc2626',
                  animation: direction === 'sell' ? 'sellGlow 2.5s ease-in-out infinite' : 'none',
                  fontSize: '0.875rem',
                  letterSpacing: '0.08em',
                }}
              >
                ▼ SELL
                <div className="text-xs font-normal opacity-70 mt-0.5">SHORT</div>
              </button>
            </div>

            {/* Volume */}
            <div>
              <label className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5 block">
                Volume (Lots)
              </label>
              <input
                type="number"
                value={volume}
                onChange={e => setVolume(e.target.value)}
                step="0.01" min="0.01"
                className="input-dark font-mono"
              />
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[0.01, 0.1, 0.5, 1].map(v => (
                  <button key={v} onClick={() => setVolume(v.toString())}
                    className="py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: volume === v.toString() ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${volume === v.toString() ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      color: volume === v.toString() ? '#3B82F6' : 'rgba(255,255,255,0.4)',
                    }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Leverage */}
            <div>
              <label className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5 block">
                Leverage: <span className="text-blue-400 font-black">{leverage}x</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {SIMPLE_LEVERAGE_OPTIONS.map(lev => (
                  <button key={lev} onClick={() => setLeverage(lev)}
                    className="py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: leverage === lev ? 'rgba(59,130,246,0.14)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${leverage === lev ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.06)'}`,
                      color: leverage === lev ? '#3B82F6' : 'rgba(255,255,255,0.4)',
                      boxShadow: leverage === lev ? '0 0 10px rgba(59,130,246,0.15)' : 'none',
                    }}>
                    {lev}x
                  </button>
                ))}
              </div>
            </div>

            {/* Notional value */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.08)' }}>
              <span className="text-white/40 text-xs">Position Value</span>
              <span className="font-mono text-blue-400 font-bold text-sm">${formatCurrency(parseFloat(notionalValue))}</span>
            </div>

            {/* Stop Loss & Take Profit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-red-400/60 text-xs font-semibold mb-1.5 block">Stop Loss</label>
                <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)}
                  placeholder="Optional" className="input-dark font-mono text-sm"
                  style={{ borderColor: stopLoss ? 'rgba(239,68,68,0.3)' : undefined }} />
              </div>
              <div>
                <label className="text-emerald-400/60 text-xs font-semibold mb-1.5 block">Take Profit</label>
                <input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)}
                  placeholder="Optional" className="input-dark font-mono text-sm"
                  style={{ borderColor: takeProfit ? 'rgba(16,185,129,0.3)' : undefined }} />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs"
                style={{ background: 'rgba(212,67,51,0.1)', border: '1px solid rgba(212,67,51,0.2)' }}>
                <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
                <span className="text-red-400">{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleTrade}
              className={`w-full py-4 rounded-xl font-black text-base tracking-widest transition-all relative overflow-hidden ${direction === 'buy' ? 'btn-buy' : 'btn-sell'}`}
              style={{ fontSize: '1rem', letterSpacing: '0.1em' }}
            >
              <div className="flex items-center justify-center gap-2">
                <Zap size={16} />
                {direction === 'buy' ? '▲ OPEN LONG' : '▼ OPEN SHORT'} {selectedAsset.symbol}
              </div>
            </button>

            {/* Margin info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-white/30">Required Margin</div>
                <div className="text-white/70 font-mono font-bold">${formatCurrency((currentPrice * parseFloat(volume || 0)) / leverage)}</div>
              </div>
              <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-white/30">Free Margin</div>
                <div className="text-white/70 font-mono font-bold">${formatCurrency(metrics.freeMargin)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Open Positions */}
        <div className="lg:col-span-2">
          <div className="card-premium rounded-xl p-5"
            style={{
              background: 'linear-gradient(145deg, rgba(14,10,10,0.99), rgba(12,10,10,0.99))',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-white/70 text-sm font-bold uppercase tracking-wider">Open Positions</div>
              <span className="badge-brand">{myPositions.length}</span>
            </div>

            {myPositions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3 opacity-20">📊</div>
                <div className="text-white/20 text-sm">No open positions</div>
                <div className="text-white/10 text-xs mt-1">Place your first trade using the panel on the left</div>
              </div>
            ) : (
              <div className="space-y-2">
                {myPositions.map(pos => (
                  <TradeRow key={pos.id} pos={pos} prices={effectivePrices} onClose={closePosition} />
                ))}
              </div>
            )}

            {/* Account summary */}
            <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/5">
              {[
                { label: 'Balance', value: `$${formatCurrency(metrics.balance)}`, color: 'text-white' },
                { label: 'Equity', value: `$${formatCurrency(metrics.equity)}`, color: metrics.equity >= metrics.balance ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Margin', value: `$${formatCurrency(metrics.usedMargin)}`, color: 'text-blue-400' },
                { label: 'Free', value: `$${formatCurrency(metrics.freeMargin)}`, color: 'text-white' },
              ].map(stat => (
                <div key={stat.label} className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-white/30 text-xs">{stat.label}</div>
                  <div className={`font-mono font-bold text-xs mt-0.5 ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
