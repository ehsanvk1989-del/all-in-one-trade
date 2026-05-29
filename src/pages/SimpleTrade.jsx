import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Zap, Activity, AlertCircle, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SIMPLE_TRADE_ASSETS, SIMPLE_LEVERAGE_OPTIONS, formatCurrency } from '../utils/mockData';

// ─── Animations ───────────────────────────────────────────────────────────────

if (typeof document !== 'undefined' && !document.getElementById('st-anims')) {
  const s = document.createElement('style');
  s.id = 'st-anims';
  s.textContent = `
    @keyframes st-price-up {
      0%   { color: #6ee7b7; text-shadow: 0 0 14px rgba(30,167,116,0.8); }
      100% { color: #1ea774; text-shadow: none; }
    }
    @keyframes st-price-down {
      0%   { color: #fca5a5; text-shadow: 0 0 14px rgba(212,67,51,0.8); }
      100% { color: #d44333; text-shadow: none; }
    }
    @keyframes st-buy-glow {
      0%, 100% { box-shadow: 0 4px 20px rgba(30,167,116,0.25); }
      50%       { box-shadow: 0 4px 48px rgba(30,167,116,0.55), 0 0 80px rgba(30,167,116,0.12); }
    }
    @keyframes st-sell-glow {
      0%, 100% { box-shadow: 0 4px 20px rgba(212,67,51,0.25); }
      50%       { box-shadow: 0 4px 48px rgba(212,67,51,0.55), 0 0 80px rgba(212,67,51,0.12); }
    }
    @keyframes st-pnl {
      from { opacity: 0.55; transform: translateY(2px); }
      to   { opacity: 1;    transform: translateY(0); }
    }
    @keyframes st-pop {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.025); box-shadow: 0 0 40px rgba(59,130,246,0.4); }
      100% { transform: scale(1); }
    }
    @keyframes st-card-in {
      from { opacity: 0; transform: translateY(10px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)   scale(1); }
    }
    .st-price-up   { animation: st-price-up   0.65s ease forwards; }
    .st-price-down { animation: st-price-down 0.65s ease forwards; }
    .st-pnl        { animation: st-pnl   0.28s ease forwards; }
    .st-pop        { animation: st-pop   0.5s  cubic-bezier(0.34,1.56,0.64,1); }
    .st-card-in    { animation: st-card-in 0.35s ease forwards; }
  `;
  document.head.appendChild(s);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SIM_VOL = {
  XAUUSD: 0.00025, OIL: 0.00035,
  EURUSD: 0.00010, GBPUSD: 0.00010,
  BTC: 0.00045,    ETH: 0.00055,
};
const HISTORY_LEN = 40;

function initSimPrices() {
  return Object.fromEntries(SIMPLE_TRADE_ASSETS.map(a => [a.symbol, a.basePrice]));
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ history, isUp, w = 68, h = 26, id }) {
  if (!history || history.length < 2) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const pts = history.map((v, i) => {
    const x = (i / (history.length - 1)) * w;
    const y = h - 2 - ((v - min) / range) * (h - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const fill = `0,${h} ${pts} ${w},${h}`;
  const col = isUp ? '#1ea774' : '#d44333';
  const gid = `sg-${id}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity="0.22" />
          <stop offset="100%" stopColor={col} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#${gid})`} />
      <polyline points={pts} fill="none" stroke={col} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Asset Card ───────────────────────────────────────────────────────────────

function AssetCard({ asset, selected, price, history, onChange }) {
  const change = ((price - asset.basePrice) / asset.basePrice) * 100;
  const isUp = change >= 0;
  return (
    <button
      onClick={() => onChange(asset)}
      className="flex flex-col p-3 rounded-xl transition-all duration-200 flex-shrink-0 text-left"
      style={{
        minWidth: 108,
        background: selected
          ? 'linear-gradient(135deg, rgba(59,130,246,0.13), rgba(124,58,237,0.08))'
          : 'var(--bg-card)',
        border: `1px solid ${selected ? 'rgba(59,130,246,0.38)' : 'var(--border-0)'}`,
        boxShadow: selected ? '0 0 24px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.04)' : 'none',
        transform: selected ? 'translateY(-2px)' : 'none',
      }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xl">{asset.icon}</span>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)', animation: 'pulse 2s infinite' }} />
      </div>
      <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-1)' }}>{asset.symbol}</div>
      <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-3)' }}>
        {price >= 1000 ? price.toFixed(2) : price >= 1 ? price.toFixed(4) : price.toFixed(5)}
      </div>
      <Sparkline history={history} isUp={isUp} w={72} h={24} id={asset.symbol} />
      <div className="text-xs font-bold mt-1.5"
        style={{ color: isUp ? 'var(--green)' : 'var(--red)' }}>
        {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
      </div>
    </button>
  );
}

// ─── Analytics helpers ────────────────────────────────────────────────────────

function getSentiment(history) {
  if (!history || history.length < 5) {
    return { label: '◆ Neutral', color: 'var(--warn)', bg: 'var(--warn-bg)' };
  }
  const last = history.slice(-14);
  let ups = 0;
  for (let i = 1; i < last.length; i++) if (last[i] > last[i - 1]) ups++;
  const ratio = ups / (last.length - 1);
  if (ratio >= 0.62) return { label: '▲ Bullish', color: 'var(--green)', bg: 'var(--green-bg)' };
  if (ratio <= 0.38) return { label: '▼ Bearish', color: 'var(--red)',   bg: 'var(--red-bg)' };
  return { label: '◆ Neutral', color: 'var(--warn)', bg: 'var(--warn-bg)' };
}

function getVolatility(history, symbol) {
  if (!history || history.length < 8) return { label: '● Low', color: 'var(--green)' };
  const diffs = [];
  for (let i = 1; i < history.length; i++) {
    diffs.push(Math.abs((history[i] - history[i - 1]) / history[i - 1]));
  }
  const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const base = SIM_VOL[symbol] || 0.0003;
  const ratio = avg / base;
  if (ratio >= 1.55) return { label: '⚡ High',   color: 'var(--red)' };
  if (ratio >= 1.1)  return { label: '~ Medium', color: 'var(--warn)' };
  return { label: '● Low', color: 'var(--green)' };
}

// ─── Signal Strength ──────────────────────────────────────────────────────────

function SignalStrength({ direction, sentiment }) {
  const bullish = sentiment.label.includes('Bullish');
  const bearish = sentiment.label.includes('Bearish');
  const aligned = (direction === 'buy' && bullish) || (direction === 'sell' && bearish);
  const opposed  = (direction === 'buy' && bearish) || (direction === 'sell' && bullish);
  const score = aligned ? 81 : opposed ? 26 : 54;
  const label = score >= 70 ? 'Strong' : score >= 50 ? 'Moderate' : 'Weak';
  const color = score >= 70 ? 'var(--green)' : score >= 50 ? 'var(--brand)' : 'var(--text-3)';
  const barBg = score >= 70
    ? 'linear-gradient(90deg, var(--green), #6ee7b7)'
    : score >= 50
      ? 'linear-gradient(90deg, var(--brand), var(--brand-light))'
      : 'var(--text-4)';
  return (
    <div className="px-3 py-2.5 rounded-xl"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-3)' }}>
          Signal Strength
        </span>
        <span className="text-xs font-black" style={{ color }}>{label}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-0)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: barBg }} />
      </div>
    </div>
  );
}

// ─── Position Preview ─────────────────────────────────────────────────────────

function PositionPreview({ direction, price, volume, leverage }) {
  const vol = parseFloat(volume || 0);
  const scenarios = [
    { label: '+1%', pct: 0.01 },
    { label: '+2%', pct: 0.02 },
    { label: '-1%', pct: -0.01 },
    { label: '-2%', pct: -0.02 },
  ];
  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border-0)' }}>
      <div className="px-3 py-2 flex items-center gap-1.5"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-0)' }}>
        <Target size={10} style={{ color: 'var(--text-3)' }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
          P&L Scenarios
        </span>
      </div>
      <div className="grid grid-cols-4">
        {scenarios.map(({ label, pct }) => {
          const pnl = (direction === 'buy' ? pct : -pct) * price * vol * leverage;
          const isGain = pnl >= 0;
          return (
            <div key={label} className="px-2 py-2.5 text-center"
              style={{ borderRight: '1px solid var(--border-0)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-4)' }}>{label}</div>
              <div className="text-xs font-mono font-bold"
                style={{ color: isGain ? 'var(--green)' : 'var(--red)' }}>
                {isGain ? '+' : ''}{formatCurrency(pnl)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Position Card ────────────────────────────────────────────────────────────

function PositionCard({ pos, prices, onClose }) {
  const current = prices[pos.symbol] ?? pos.openPrice;
  const diff = pos.direction === 'buy' ? current - pos.openPrice : pos.openPrice - current;
  const pnl = diff * pos.volume * pos.leverage;
  const roe = (pnl / ((pos.openPrice * pos.volume) / pos.leverage)) * 100;
  const isProfit = pnl >= 0;
  const asset = SIMPLE_TRADE_ASSETS.find(a => a.symbol === pos.symbol);

  return (
    <div className="st-card-in rounded-xl p-4 transition-all duration-500"
      style={{
        background: isProfit
          ? 'linear-gradient(135deg, rgba(30,167,116,0.07), rgba(30,167,116,0.02))'
          : 'linear-gradient(135deg, rgba(212,67,51,0.07), rgba(212,67,51,0.02))',
        border: `1px solid ${isProfit ? 'rgba(30,167,116,0.2)' : 'rgba(212,67,51,0.2)'}`,
        boxShadow: isProfit ? '0 0 24px rgba(30,167,116,0.06)' : '0 0 24px rgba(212,67,51,0.06)',
      }}>
      <div className="flex items-start gap-3">
        {/* Left: asset + details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-lg leading-none">{asset?.icon}</span>
            <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{pos.symbol}</span>
            <span className="px-1.5 py-0.5 rounded text-xs font-black"
              style={{
                background: pos.direction === 'buy' ? 'rgba(30,167,116,0.18)' : 'rgba(212,67,51,0.18)',
                color: pos.direction === 'buy' ? 'var(--green)' : 'var(--red)',
              }}>
              {pos.direction === 'buy' ? '▲ LONG' : '▼ SHORT'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-xs font-black"
              style={{ background: 'var(--brand-bg)', color: 'var(--brand-light)' }}>
              {pos.leverage}x
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-0.5 text-xs">
            {[
              ['Entry', pos.openPrice.toFixed(pos.openPrice > 100 ? 2 : 4)],
              ['Now',   current.toFixed(current > 100 ? 2 : 4)],
              ['Vol',   pos.volume],
              ['Size',  `$${formatCurrency(pos.openPrice * pos.volume)}`],
            ].map(([k, v]) => (
              <span key={k} style={{ color: 'var(--text-3)' }}>
                {k} <span className="font-mono" style={{ color: 'var(--text-2)' }}>{v}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right: P&L + close */}
        <div className="flex items-start gap-2 flex-shrink-0">
          <div className="st-pnl text-right">
            <div className="font-mono font-black text-base"
              style={{ color: isProfit ? 'var(--green)' : 'var(--red)' }}>
              {isProfit ? '+' : ''}{formatCurrency(pnl)}
            </div>
            <div className="text-xs font-mono mt-0.5"
              style={{ color: isProfit ? 'rgba(30,167,116,0.65)' : 'rgba(212,67,51,0.65)' }}>
              {isProfit ? '+' : ''}{roe.toFixed(1)}% ROE
            </div>
          </div>
          <button
            onClick={() => onClose(pos.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.color = 'var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-3)'; }}>
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SimpleTrade() {
  const { prices: realPrices, priceStatuses, positions, openPosition, closePosition, wallet, getMetrics } = useApp();

  // Simulated prices — self-scheduling ticks at 0.8–2s
  const [simPrices, setSimPrices] = useState(initSimPrices);
  const tickRef = useRef(null);

  // Price history per symbol (sparklines + analytics)
  const histRef = useRef(Object.fromEntries(SIMPLE_TRADE_ASSETS.map(a => [a.symbol, [a.basePrice]])));

  // Previous simulated prices for flash direction detection
  const prevSimRef = useRef({});

  useEffect(() => {
    function tick() {
      setSimPrices(prev => {
        const next = { ...prev };
        SIMPLE_TRADE_ASSETS.forEach(({ symbol }) => {
          const vol = SIM_VOL[symbol] || 0.0003;
          next[symbol] = prev[symbol] * (1 + (Math.random() - 0.5) * 2 * vol);
          const h = histRef.current[symbol] || [];
          h.push(next[symbol]);
          if (h.length > HISTORY_LEN) h.shift();
          histRef.current[symbol] = h;
        });
        return next;
      });
      tickRef.current = setTimeout(tick, 800 + Math.random() * 1200);
    }
    tickRef.current = setTimeout(tick, 800 + Math.random() * 1200);
    return () => clearTimeout(tickRef.current);
  }, []);

  // Effective prices — real when live, simulated otherwise
  const effectivePrices = {};
  SIMPLE_TRADE_ASSETS.forEach(({ symbol }) => {
    const status = priceStatuses?.[symbol];
    effectivePrices[symbol] = (status === 'live' && realPrices[symbol] != null)
      ? realPrices[symbol]
      : simPrices[symbol];
  });

  // Trade state
  const [selectedAsset, setSelectedAsset] = useState(SIMPLE_TRADE_ASSETS[0]);
  const [direction, setDirection] = useState('buy');
  const [volume, setVolume] = useState('0.01');
  const [leverage, setLeverage] = useState(10);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const [tradeFlash, setTradeFlash] = useState(false);
  const [priceFlash, setPriceFlash] = useState(''); // 'up' | 'down' | ''
  const [metrics, setMetrics] = useState(getMetrics());

  useEffect(() => {
    const t = setInterval(() => setMetrics(getMetrics()), 1000);
    return () => clearInterval(t);
  }, [getMetrics]);

  // Detect price direction for hero flash
  useEffect(() => {
    const sym = selectedAsset.symbol;
    const cur = simPrices[sym];
    const prev = prevSimRef.current[sym];
    if (prev !== undefined && cur !== undefined && cur !== prev) {
      const dir = cur > prev ? 'up' : 'down';
      setPriceFlash(dir);
      const t = setTimeout(() => setPriceFlash(''), 700);
      prevSimRef.current[sym] = cur;
      return () => clearTimeout(t);
    }
    prevSimRef.current[sym] = cur;
  }, [simPrices, selectedAsset.symbol]);

  const currentPrice = effectivePrices[selectedAsset.symbol] ?? selectedAsset.basePrice;
  const priceChange  = ((currentPrice - selectedAsset.basePrice) / selectedAsset.basePrice) * 100;
  const isUp = priceChange >= 0;

  const history    = histRef.current[selectedAsset.symbol] || [];
  const sentiment  = getSentiment(history);
  const volatility = getVolatility(history, selectedAsset.symbol);

  const myPositions = positions.filter(p => p.module === 'simple');
  const vol         = parseFloat(volume || 0);
  const notional    = vol * currentPrice * leverage;
  const margin      = vol * currentPrice / leverage;
  const priceDecimals = currentPrice >= 1000 ? 2 : currentPrice >= 1 ? 4 : 5;

  const handleTrade = useCallback(() => {
    const v = parseFloat(volume);
    if (!v || v <= 0) { setError('Enter a valid volume'); return; }
    const req = currentPrice * v / leverage;
    if (req > metrics.freeMargin) { setError('Insufficient free margin'); return; }
    openPosition({
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      openPrice: currentPrice,
      volume: v,
      leverage,
      direction,
      stopLoss:   stopLoss   ? parseFloat(stopLoss)   : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      module: 'simple',
    });
    setError('');
    setTradeFlash(true);
    setTimeout(() => setTradeFlash(false), 900);
  }, [volume, currentPrice, leverage, metrics.freeMargin, openPosition, selectedAsset, direction, stopLoss, takeProfit]);

  return (
    <div className="flex-1 overflow-y-auto animate-fade-in"
      style={{ background: 'radial-gradient(ellipse at 25% 0%, rgba(59,130,246,0.05) 0%, transparent 55%), var(--bg-base)' }}>

      {/* ── Asset Selector Strip ── */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {SIMPLE_TRADE_ASSETS.map(asset => (
            <AssetCard
              key={asset.symbol}
              asset={asset}
              selected={selectedAsset.symbol === asset.symbol}
              price={effectivePrices[asset.symbol] ?? asset.basePrice}
              history={histRef.current[asset.symbol] || []}
              onChange={setSelectedAsset}
            />
          ))}
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="px-4 pt-3 pb-6 grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* ── Trade Panel ── */}
        <div className="lg:col-span-2 space-y-3">

          {/* Price Hero */}
          <div className="rounded-xl p-4 relative overflow-hidden transition-all duration-400"
            style={{
              background: tradeFlash
                ? 'linear-gradient(135deg, rgba(59,130,246,0.11), rgba(124,58,237,0.06))'
                : 'var(--bg-card)',
              border: `1px solid ${tradeFlash ? 'rgba(59,130,246,0.38)' : 'var(--border-0)'}`,
              boxShadow: tradeFlash ? '0 0 40px rgba(59,130,246,0.18)' : 'none',
            }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl leading-none">{selectedAsset.icon}</span>
                  <div>
                    <div className="text-xs font-black tracking-widest" style={{ color: 'var(--text-3)' }}>
                      {selectedAsset.name.toUpperCase()}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-4)' }}>{selectedAsset.symbol}</div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full ml-1" style={{ background: 'var(--green)', animation: 'pulse 2s infinite' }} />
                </div>
                <div
                  className={`font-black font-mono text-3xl leading-none ${priceFlash === 'up' ? 'st-price-up' : priceFlash === 'down' ? 'st-price-down' : ''}`}
                  style={{ color: priceFlash ? undefined : 'var(--text-1)' }}>
                  {currentPrice.toFixed(priceDecimals)}
                </div>
                <div className="flex items-center gap-2.5 mt-1.5">
                  <span className="text-sm font-bold"
                    style={{ color: isUp ? 'var(--green)' : 'var(--red)' }}>
                    {isUp ? '▲' : '▼'} {Math.abs(priceChange).toFixed(3)}%
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-4)' }}>
                    spread {selectedAsset.spread}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs mb-0.5" style={{ color: 'var(--text-3)' }}>Free Margin</div>
                <div className="font-mono font-bold text-sm" style={{ color: 'var(--brand-light)' }}>
                  ${formatCurrency(metrics.freeMargin)}
                </div>
              </div>
            </div>

            {/* Market badges */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: sentiment.bg, color: sentiment.color }}>
                {sentiment.label}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: 'var(--bg-surface)', color: volatility.color }}>
                {volatility.label} Vol
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-3)' }}>
                {priceStatuses?.[selectedAsset.symbol] === 'live' ? '🔴 Live feed' : '⚡ Simulated'}
              </span>
            </div>
          </div>

          {/* Trade Form */}
          <div className="rounded-xl p-4 space-y-4"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-0)',
              boxShadow: '0 4px 32px rgba(0,0,0,0.28)',
            }}>

            {/* Direction toggle */}
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  d: 'buy', label: '▲ BUY', sub: 'LONG',
                  activeBg: 'linear-gradient(135deg, #054a2e, #059669 55%, #1ea774)',
                  activeBorder: '#1ea774',
                  idleColor: 'var(--green)',
                  anim: 'st-buy-glow 3s ease-in-out infinite',
                },
                {
                  d: 'sell', label: '▼ SELL', sub: 'SHORT',
                  activeBg: 'linear-gradient(135deg, #7f1d1d, #dc2626 55%, #d44333)',
                  activeBorder: '#d44333',
                  idleColor: 'var(--red)',
                  anim: 'st-sell-glow 3s ease-in-out infinite',
                },
              ].map(({ d, label, sub, activeBg, activeBorder, idleColor, anim }) => (
                <button key={d}
                  onClick={() => setDirection(d)}
                  className="py-4 rounded-xl font-black text-sm tracking-widest transition-all duration-200"
                  style={{
                    background: direction === d ? activeBg : `${idleColor}11`,
                    border: `1px solid ${direction === d ? activeBorder : `${idleColor}33`}`,
                    color: direction === d ? '#fff' : idleColor,
                    animation: direction === d ? anim : 'none',
                  }}>
                  {label}
                  <div className="text-xs font-normal opacity-75 mt-0.5">{sub}</div>
                </button>
              ))}
            </div>

            {/* Volume */}
            <div>
              <label className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold tracking-wider uppercase"
                  style={{ color: 'var(--text-3)' }}>Volume (Lots)</span>
                <span className="text-xs font-mono"
                  style={{ color: 'var(--text-4)' }}>
                  ≈ ${formatCurrency(vol * currentPrice)}
                </span>
              </label>
              <input
                type="number"
                value={volume}
                onChange={e => setVolume(e.target.value)}
                step="0.01" min="0.01"
                className="input-dark font-mono w-full"
              />
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[0.01, 0.1, 0.5, 1].map(v => (
                  <button key={v} onClick={() => setVolume(String(v))}
                    className="py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: volume === String(v) ? 'var(--brand-bg)' : 'var(--bg-surface)',
                      border: `1px solid ${volume === String(v) ? 'rgba(59,130,246,0.35)' : 'var(--border-0)'}`,
                      color: volume === String(v) ? 'var(--brand)' : 'var(--text-3)',
                    }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Leverage */}
            <div>
              <label className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold tracking-wider uppercase"
                  style={{ color: 'var(--text-3)' }}>Leverage</span>
                <span className="font-mono font-black text-sm"
                  style={{ color: 'var(--brand-light)' }}>{leverage}x</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {SIMPLE_LEVERAGE_OPTIONS.map(lev => (
                  <button key={lev} onClick={() => setLeverage(lev)}
                    className="py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: leverage === lev
                        ? 'linear-gradient(135deg, var(--brand-bg), rgba(124,58,237,0.1))'
                        : 'var(--bg-surface)',
                      border: `1px solid ${leverage === lev ? 'rgba(59,130,246,0.4)' : 'var(--border-0)'}`,
                      color: leverage === lev ? 'var(--brand-light)' : 'var(--text-3)',
                      boxShadow: leverage === lev ? '0 0 14px rgba(59,130,246,0.18)' : 'none',
                    }}>
                    {lev}x
                  </button>
                ))}
              </div>
            </div>

            {/* Signal strength */}
            <SignalStrength direction={direction} sentiment={sentiment} />

            {/* P&L Scenarios */}
            <PositionPreview
              direction={direction}
              price={currentPrice}
              volume={volume}
              leverage={leverage}
            />

            {/* Advanced SL/TP */}
            <div>
              <button
                onClick={() => setShowAdvanced(v => !v)}
                className="w-full flex items-center justify-between text-xs py-1 transition-colors"
                style={{ color: showAdvanced ? 'var(--brand)' : 'var(--text-3)' }}>
                <span className="font-semibold uppercase tracking-wider">Stop Loss / Take Profit</span>
                <span style={{ opacity: 0.7 }}>{showAdvanced ? '▲ Hide' : '▼ Show'}</span>
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block"
                      style={{ color: 'rgba(212,67,51,0.75)' }}>Stop Loss</label>
                    <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)}
                      placeholder="Optional" className="input-dark font-mono text-sm w-full"
                      style={{ borderColor: stopLoss ? 'rgba(212,67,51,0.35)' : undefined }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block"
                      style={{ color: 'rgba(30,167,116,0.75)' }}>Take Profit</label>
                    <input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)}
                      placeholder="Optional" className="input-dark font-mono text-sm w-full"
                      style={{ borderColor: takeProfit ? 'rgba(30,167,116,0.35)' : undefined }} />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs"
                style={{ background: 'var(--red-bg)', border: '1px solid rgba(212,67,51,0.22)' }}>
                <AlertCircle size={12} style={{ color: 'var(--red)', flexShrink: 0 }} />
                <span style={{ color: 'var(--red)' }}>{error}</span>
              </div>
            )}

            {/* Submit CTA */}
            <button
              onClick={handleTrade}
              className={`w-full py-4 rounded-xl font-black text-sm tracking-widest flex items-center justify-center gap-2 transition-all duration-200 ${tradeFlash ? 'st-pop' : ''}`}
              style={{
                background: direction === 'buy'
                  ? 'linear-gradient(135deg, #054a2e, #059669 55%, #1ea774)'
                  : 'linear-gradient(135deg, #7f1d1d, #dc2626 55%, #d44333)',
                color: '#fff',
                boxShadow: direction === 'buy'
                  ? '0 4px 24px rgba(30,167,116,0.38)'
                  : '0 4px 24px rgba(212,67,51,0.38)',
                border: 'none',
              }}>
              <Zap size={15} />
              {direction === 'buy' ? '▲ OPEN LONG' : '▼ OPEN SHORT'} {selectedAsset.symbol}
            </button>

            {/* Margin summary */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Required Margin', value: `$${formatCurrency(margin)}` },
                { label: 'Position Value',  value: `$${formatCurrency(notional)}` },
              ].map(s => (
                <div key={s.label} className="px-2.5 py-2 rounded-lg text-center"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                  <div className="text-xs" style={{ color: 'var(--text-4)' }}>{s.label}</div>
                  <div className="font-mono font-bold text-xs mt-0.5"
                    style={{ color: 'var(--text-2)' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Positions & Account Panel ── */}
        <div className="lg:col-span-3 space-y-3">

          {/* Account stats */}
          <div className="rounded-xl p-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: 'Balance', value: `$${formatCurrency(metrics.balance)}`, color: 'var(--text-1)' },
                { label: 'Equity',  value: `$${formatCurrency(metrics.equity)}`,
                  color: metrics.equity >= metrics.balance ? 'var(--green)' : 'var(--red)' },
                { label: 'Used Margin', value: `$${formatCurrency(metrics.usedMargin)}`, color: 'var(--brand-light)' },
                { label: "Today's P&L",
                  value: `${metrics.pnl >= 0 ? '+' : ''}$${formatCurrency(metrics.pnl)}`,
                  color: metrics.pnl >= 0 ? 'var(--green)' : 'var(--red)' },
              ].map(stat => (
                <div key={stat.label} className="text-center p-2.5 rounded-xl"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>{stat.label}</div>
                  <div className="font-mono font-bold text-sm" style={{ color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Open Positions */}
          <div className="rounded-xl p-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={14} style={{ color: 'var(--brand)' }} />
                <span className="text-sm font-bold tracking-wider uppercase"
                  style={{ color: 'var(--text-1)' }}>Open Positions</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-black"
                style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}>
                {myPositions.length}
              </span>
            </div>

            {myPositions.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-4" style={{ opacity: 0.18 }}>📈</div>
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-3)' }}>
                  No open positions
                </div>
                <div className="text-xs" style={{ color: 'var(--text-4)' }}>
                  Select an asset and open your first trade
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myPositions.map(pos => (
                  <PositionCard key={pos.id} pos={pos} prices={effectivePrices} onClose={closePosition} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
