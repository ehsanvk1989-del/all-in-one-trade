import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, Star, Flame, Zap, Brain, Shield, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  CRYPTO_FUTURES_ASSETS,
  generateOrderBook, generateRecentTrades, formatCurrency,
} from '../utils/mockData';
import TradingViewWidget from '../components/charts/TradingViewWidget';
import {
  injectTradeAnims, usePriceHistory, useFavorites,
  getSentiment, getVolatility, buildInsight,
  Sparkline, MeterBar, Pill, StatChip, RangeBar,
} from '../components/trade/TradeKit';

injectTradeAnims();

/* ─── Section label ──────────────────────────────────────── */
function SectionLabel({ children, right }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-3)' }}>
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--border-0)' }} />
      {right && <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-3)' }}>{right}</span>}
    </div>
  );
}

/* ─── Market strip card ──────────────────────────────────── */
function MarketCard({ asset, price, status, change, history, selected, hot, fav, onSelect, onFav }) {
  const isUp = change >= 0;
  return (
    <button
      onClick={() => onSelect(asset)}
      className="relative flex-shrink-0 rounded-xl p-3 text-left transition-all duration-200 tk-fade-up"
      style={{
        minWidth: 158,
        background: selected
          ? 'linear-gradient(135deg, rgba(59,130,246,0.13), rgba(124,58,237,0.07))'
          : 'var(--bg-card)',
        border: `1px solid ${selected ? 'rgba(59,130,246,0.4)' : 'var(--border-0)'}`,
        boxShadow: selected ? '0 0 22px rgba(59,130,246,0.14)' : 'none',
      }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{asset.icon}</span>
          <span className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>{asset.symbol.replace('/USDT', '')}</span>
          {hot && (
            <span className="inline-flex items-center" title="Hot market">
              <Flame size={11} style={{ color: 'var(--warn)' }} />
            </span>
          )}
        </div>
        <span
          onClick={(e) => { e.stopPropagation(); onFav(asset.symbol); }}
          className="cursor-pointer transition-transform hover:scale-125"
        >
          <Star size={12}
            style={{ color: fav ? 'var(--warn)' : 'var(--text-4)', fill: fav ? 'var(--warn)' : 'none' }} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="font-mono text-xs font-bold" style={{ color: status === 'connecting' ? 'var(--text-4)' : 'var(--text-1)' }}>
            {status === 'connecting' ? '—' : status === 'unavailable' ? 'N/A' : (price >= 1000 ? price.toFixed(2) : price.toFixed(4))}
          </div>
          <div className="text-xs font-bold mt-0.5" style={{ color: isUp ? 'var(--green)' : 'var(--red)' }}>
            {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
          </div>
        </div>
        <Sparkline history={history} up={isUp} w={52} h={22} id={asset.symbol} fill={false} />
      </div>
    </button>
  );
}

/* ─── Order book ─────────────────────────────────────────── */
function OrderBook({ currentPrice, isUp, spread }) {
  const [data, setData] = useState({ asks: [], bids: [] });
  const [recent, setRecent] = useState([]);
  const [tab, setTab] = useState('book');

  useEffect(() => {
    const refresh = () => {
      setData(generateOrderBook(currentPrice));
      setRecent(generateRecentTrades(currentPrice));
    };
    refresh();
    const id = setInterval(refresh, 1700);
    return () => clearInterval(id);
  }, [currentPrice]);

  const maxAsk = data.asks.length ? Math.max(...data.asks.map(o => parseFloat(o.size))) : 1;
  const maxBid = data.bids.length ? Math.max(...data.bids.map(o => parseFloat(o.size))) : 1;

  // Buy/sell pressure
  const askVol = data.asks.reduce((s, o) => s + parseFloat(o.size), 0);
  const bidVol = data.bids.reduce((s, o) => s + parseFloat(o.size), 0);
  const total = askVol + bidVol || 1;
  const buyPct = (bidVol / total) * 100;

  return (
    <div className="flex flex-col h-full flex-shrink-0"
      style={{ width: 176, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-0)' }}>
      <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid var(--border-0)' }}>
        {['book', 'trades'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-xs font-semibold capitalize transition-all"
            style={{
              color: tab === t ? 'var(--brand)' : 'var(--text-3)',
              borderBottom: `2px solid ${tab === t ? 'var(--brand)' : 'transparent'}`,
            }}>
            {t === 'book' ? 'Order Book' : 'Trades'}
          </button>
        ))}
      </div>

      {tab === 'book' ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex justify-between px-3 py-1.5 flex-shrink-0">
            {['Price', 'Size', 'Total'].map(h => (
              <span key={h} className="text-xs" style={{ color: 'var(--text-4)' }}>{h}</span>
            ))}
          </div>
          <div className="flex-1 overflow-hidden flex flex-col justify-end pb-0.5">
            {[...(data.asks || [])].reverse().map((ask, i) => (
              <div key={i} className="relative flex items-center justify-between px-3 py-[3px] overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0"
                  style={{ width: `${(parseFloat(ask.size) / maxAsk) * 70}%`, background: 'rgba(212,67,51,0.10)' }} />
                <span className="relative z-10 font-mono text-xs" style={{ color: 'var(--red)' }}>{ask.price}</span>
                <span className="relative z-10 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{ask.size}</span>
                <span className="relative z-10 font-mono text-xs" style={{ color: 'var(--text-3)' }}>{ask.total}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-3 py-2 flex-shrink-0"
            style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-0)', borderBottom: '1px solid var(--border-0)' }}>
            <span className="font-mono text-sm font-bold" style={{ color: isUp ? 'var(--green)' : 'var(--red)' }}>
              {currentPrice >= 1000 ? currentPrice.toFixed(2) : currentPrice.toFixed(4)}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>spr {spread}</span>
          </div>
          <div className="flex-1 overflow-hidden pt-0.5">
            {(data.bids || []).map((bid, i) => (
              <div key={i} className="relative flex items-center justify-between px-3 py-[3px] overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0"
                  style={{ width: `${(parseFloat(bid.size) / maxBid) * 70}%`, background: 'rgba(30,167,116,0.10)' }} />
                <span className="relative z-10 font-mono text-xs" style={{ color: 'var(--green)' }}>{bid.price}</span>
                <span className="relative z-10 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{bid.size}</span>
                <span className="relative z-10 font-mono text-xs" style={{ color: 'var(--text-3)' }}>{bid.total}</span>
              </div>
            ))}
          </div>
          {/* Buy/sell pressure */}
          <div className="px-3 py-2 flex-shrink-0" style={{ borderTop: '1px solid var(--border-0)' }}>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span style={{ color: 'var(--green)' }}>B {buyPct.toFixed(0)}%</span>
              <span style={{ color: 'var(--red)' }}>{(100 - buyPct).toFixed(0)}% S</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--red)' }}>
              <div style={{ width: `${buyPct}%`, background: 'var(--green)' }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto tk-no-scrollbar">
          <div className="flex justify-between px-3 py-1.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-0)' }}>
            {['Price', 'Size', 'Time'].map(h => (
              <span key={h} className="text-xs" style={{ color: 'var(--text-4)' }}>{h}</span>
            ))}
          </div>
          {recent.map((t, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-[5px]">
              <span className="font-mono text-xs" style={{ color: t.side === 'buy' ? 'var(--green)' : 'var(--red)' }}>{t.price}</span>
              <span className="font-mono text-xs" style={{ color: 'var(--text-2)' }}>{t.size}</span>
              <span className="text-xs" style={{ color: 'var(--text-4)' }}>{t.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Position row ───────────────────────────────────────── */
function PositionRow({ pos, prices, onClose }) {
  const cur = prices[pos.symbol] ?? pos.openPrice;
  const diff = pos.direction === 'long' ? cur - pos.openPrice : pos.openPrice - cur;
  const pnl = diff * pos.volume * pos.leverage;
  const pnlPct = (pnl / (pos.openPrice * pos.volume)) * 100;
  const profit = pnl >= 0;
  // Liquidation distance estimate
  const liq = pos.direction === 'long'
    ? pos.openPrice * (1 - 1 / pos.leverage)
    : pos.openPrice * (1 + 1 / pos.leverage);
  const liqDist = Math.abs((cur - liq) / cur) * 100;

  return (
    <tr className="text-xs transition-colors" style={{ borderBottom: '1px solid var(--border-0)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <td className="py-2.5 px-3"><span className="font-semibold" style={{ color: 'var(--text-1)' }}>{pos.symbol}</span></td>
      <td className="py-2.5 px-3">
        <span className="font-bold" style={{ color: pos.direction === 'long' ? 'var(--green)' : 'var(--red)' }}>
          {pos.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
        </span>
      </td>
      <td className="py-2.5 px-3"><span className="badge-brand text-xs">{pos.leverage}x</span></td>
      <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text-2)' }}>{pos.volume}</td>
      <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text-2)' }}>{pos.openPrice.toFixed(2)}</td>
      <td className="py-2.5 px-3 font-mono font-medium" style={{ color: 'var(--text-1)' }}>{cur.toFixed(2)}</td>
      <td className="py-2.5 px-3">
        <div className="tk-pnl font-mono font-bold" style={{ color: profit ? 'var(--green)' : 'var(--red)' }}>
          {profit ? '+' : ''}{formatCurrency(pnl)}
        </div>
        <div className="text-xs" style={{ color: profit ? 'rgba(30,167,116,0.7)' : 'rgba(212,67,51,0.7)' }}>
          {profit ? '+' : ''}{pnlPct.toFixed(2)}%
        </div>
      </td>
      <td className="py-2.5 px-3 font-mono text-xs"
        style={{ color: liqDist < 10 ? 'var(--red)' : liqDist < 25 ? 'var(--warn)' : 'var(--text-3)' }}>
        {liqDist.toFixed(1)}%
      </td>
      <td className="py-2.5 px-3">
        <button onClick={() => onClose(pos.id)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(212,67,51,0.2)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,67,51,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--red-bg)'; }}>
          Close
        </button>
      </td>
    </tr>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function CryptoFutures() {
  const { prices, priceStatuses, positions, openPosition, closePosition, wallet, getMetrics } = useApp();
  const symbols = CRYPTO_FUTURES_ASSETS.map(a => a.symbol);
  const histRef = usePriceHistory(prices, symbols);
  const [favs, toggleFav] = useFavorites('tk-crypto-favs');

  const [selectedAsset, setSelectedAsset] = useState(CRYPTO_FUTURES_ASSETS[0]);
  const [leverage, setLeverage] = useState(10);
  const [direction, setDirection] = useState('long');
  const [amount, setAmount] = useState('100');
  const [orderType, setOrderType] = useState('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [showTpSl, setShowTpSl] = useState(false);
  const [bottomTab, setBottomTab] = useState('positions');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [metrics, setMetrics] = useState(getMetrics());
  const [flash, setFlash] = useState('');
  const statRef = useRef({});
  const prevPriceRef = useRef({});

  // Stable 24h stats + funding per symbol
  if (!statRef.current[selectedAsset.symbol]) {
    statRef.current[selectedAsset.symbol] = {
      high: selectedAsset.basePrice * 1.018,
      low: selectedAsset.basePrice * 0.982,
      vol: `${(Math.random() * 55 + 18).toFixed(1)}K`,
      funding: (Math.random() * 0.02 - 0.005),
    };
  }
  const stats24h = statRef.current[selectedAsset.symbol];

  useEffect(() => {
    const t = setInterval(() => setMetrics(getMetrics()), 1000);
    return () => clearInterval(t);
  }, [getMetrics]);

  const currentPrice = prices[selectedAsset.symbol] ?? selectedAsset.basePrice;
  const priceStatus = priceStatuses[selectedAsset.symbol] || 'connecting';
  const priceChange = ((currentPrice - selectedAsset.basePrice) / selectedAsset.basePrice) * 100;
  const isUp = priceChange >= 0;
  const myPositions = positions.filter(p => p.module === 'crypto');

  // Price flash on selected symbol
  useEffect(() => {
    const prev = prevPriceRef.current[selectedAsset.symbol];
    if (prev !== undefined && currentPrice !== prev) {
      setFlash(currentPrice > prev ? 'up' : 'down');
      const t = setTimeout(() => setFlash(''), 600);
      prevPriceRef.current[selectedAsset.symbol] = currentPrice;
      return () => clearTimeout(t);
    }
    prevPriceRef.current[selectedAsset.symbol] = currentPrice;
  }, [currentPrice, selectedAsset.symbol]);

  // Analytics
  const history = histRef.current[selectedAsset.symbol] || [];
  const sentiment = getSentiment(history);
  const volatility = getVolatility(history);
  const insight = buildInsight({ change: priceChange, sentiment, volatility, direction });

  // Hot market = biggest absolute mover
  const hotSymbol = CRYPTO_FUTURES_ASSETS.reduce((hot, a) => {
    const ch = Math.abs(((prices[a.symbol] ?? a.basePrice) - a.basePrice) / a.basePrice);
    return ch > hot.ch ? { sym: a.symbol, ch } : hot;
  }, { sym: null, ch: 0 }).sym;

  // Order entry calcs
  const estValue = (parseFloat(amount) || 0) * leverage;
  const coinSize = currentPrice > 0 ? (parseFloat(amount) || 0) * leverage / currentPrice : 0;
  const liqPrice = direction === 'long'
    ? currentPrice * (1 - 1 / leverage)
    : currentPrice * (1 + 1 / leverage);
  const riskLevel = leverage <= 10 ? { l: 'Low', c: 'var(--green)' } : leverage <= 25 ? { l: 'Moderate', c: 'var(--warn)' } : leverage <= 50 ? { l: 'High', c: '#f97316' } : { l: 'Extreme', c: 'var(--red)' };

  const handleTrade = useCallback(() => {
    const amountVal = parseFloat(amount);
    if (!amountVal || amountVal <= 0) { setError('Enter a valid amount'); return; }
    if (amountVal > wallet.usdt) { setError('Insufficient balance'); return; }
    openPosition({
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      openPrice: currentPrice,
      volume: parseFloat((amountVal / currentPrice).toFixed(6)),
      leverage, direction,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      module: 'crypto', orderType,
    });
    setError('');
    setSuccess(`${direction === 'long' ? 'Long' : 'Short'} opened on ${selectedAsset.symbol}`);
    setTimeout(() => setSuccess(''), 3000);
  }, [amount, wallet.usdt, currentPrice, leverage, direction, openPosition, selectedAsset, stopLoss, takeProfit, orderType]);

  // Funding countdown (next 8h boundary)
  const [fundingIn, setFundingIn] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = new Date(now);
      const h = now.getUTCHours();
      const nextH = Math.ceil((h + 1) / 8) * 8;
      next.setUTCHours(nextH, 0, 0, 0);
      const ms = next - now;
      const hh = String(Math.floor(ms / 3.6e6)).padStart(2, '0');
      const mm = String(Math.floor((ms % 3.6e6) / 6e4)).padStart(2, '0');
      const ss = String(Math.floor((ms % 6e4) / 1e3)).padStart(2, '0');
      setFundingIn(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* ── Market strip ── */}
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto tk-no-scrollbar flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-0)' }}>
        {/* Favorites first, then the rest */}
        {[...CRYPTO_FUTURES_ASSETS].sort((a, b) => (favs.has(b.symbol) ? 1 : 0) - (favs.has(a.symbol) ? 1 : 0)).map(asset => {
          const p = prices[asset.symbol] ?? asset.basePrice;
          const st = priceStatuses[asset.symbol] || 'connecting';
          const ch = ((p - asset.basePrice) / asset.basePrice) * 100;
          return (
            <MarketCard key={asset.symbol} asset={asset} price={p} status={st} change={ch}
              history={histRef.current[asset.symbol] || []}
              selected={selectedAsset.symbol === asset.symbol}
              hot={hotSymbol === asset.symbol}
              fav={favs.has(asset.symbol)}
              onSelect={(a) => { setSelectedAsset(a); setLimitPrice(''); }}
              onFav={toggleFav} />
          );
        })}
      </div>

      {/* ── Symbol header ── */}
      <div className="flex items-center gap-5 px-4 py-3 overflow-x-auto tk-no-scrollbar flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-0)', background: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="text-2xl leading-none">{selectedAsset.icon}</span>
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{selectedAsset.symbol}</div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>{selectedAsset.name} Perpetual</div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className={`font-mono text-2xl font-black leading-none ${flash === 'up' ? 'tk-up' : flash === 'down' ? 'tk-down' : ''}`}
            style={{ color: flash ? undefined : (priceStatus === 'connecting' ? 'var(--text-3)' : isUp ? 'var(--green)' : 'var(--red)') }}>
            {priceStatus === 'connecting' ? '—' : currentPrice.toFixed(2)}
          </div>
          <div className="text-xs font-semibold mt-1" style={{ color: isUp ? 'var(--green)' : 'var(--red)' }}>
            {priceStatus === 'connecting' ? 'Connecting…' : `${isUp ? '▲ +' : '▼ '}${priceChange.toFixed(3)}%`}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-5 flex-shrink-0">
          <StatChip label="24h High" value={stats24h.high.toFixed(2)} color="var(--green)" />
          <StatChip label="24h Low" value={stats24h.low.toFixed(2)} color="var(--red)" />
          <StatChip label="24h Vol" value={stats24h.vol} color="var(--text-2)" />
          <div>
            <div className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-3)' }}>Funding / {fundingIn}</div>
            <div className="font-mono text-xs font-semibold" style={{ color: stats24h.funding >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {stats24h.funding >= 0 ? '+' : ''}{(stats24h.funding).toFixed(4)}%
            </div>
          </div>
        </div>

        <div className="hidden lg:block flex-shrink-0" style={{ width: 160 }}>
          <RangeBar low={stats24h.low} high={stats24h.high} price={currentPrice} decimals={2} />
        </div>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <Pill color={sentiment.color} bg={sentiment.bg}>
            {sentiment.dir === 'up' ? '▲' : sentiment.dir === 'down' ? '▼' : '◆'} {sentiment.label}
          </Pill>
          <Pill color={volatility.color}>⚡ {volatility.label} Vol</Pill>
          <Pill color={priceStatus === 'live' ? 'var(--green)' : 'var(--warn)'} bg={priceStatus === 'live' ? 'var(--green-bg)' : 'var(--warn-bg)'}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: priceStatus === 'live' ? 'var(--green)' : 'var(--warn)', animation: 'pulse 2s infinite' }} />
            {priceStatus === 'live' ? 'LIVE' : priceStatus === 'connecting' ? 'SYNC' : 'N/A'}
          </Pill>
        </div>
      </div>

      {/* ── Main row ── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">

        {/* Left: chart + positions */}
        <div className="flex flex-col min-w-0 lg:flex-1">
          <div className="h-[320px] lg:h-auto lg:flex-1 lg:min-h-0">
            <TradingViewWidget symbol={selectedAsset.symbol} interval="1" />
          </div>

          <div className="flex-shrink-0" style={{ height: 232, borderTop: '1px solid var(--border-0)' }}>
            <div className="flex items-center" style={{ borderBottom: '1px solid var(--border-0)' }}>
              {['positions', 'history'].map(tab => (
                <button key={tab} onClick={() => setBottomTab(tab)} className="nav-tab"
                  style={{ color: bottomTab === tab ? 'var(--brand-light)' : 'var(--text-3)', borderBottomColor: bottomTab === tab ? 'var(--brand)' : 'transparent' }}>
                  {tab === 'positions' ? `Positions (${myPositions.length})` : 'History'}
                </button>
              ))}
            </div>
            <div className="overflow-auto" style={{ height: 'calc(100% - 38px)' }}>
              {bottomTab === 'positions' ? (
                myPositions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-1">
                    <div className="text-3xl mb-1" style={{ opacity: 0.16 }}>📊</div>
                    <div className="text-sm" style={{ color: 'var(--text-3)' }}>No open positions</div>
                    <div className="text-xs" style={{ color: 'var(--text-4)' }}>Open your first futures position from the panel</div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="sticky top-0 z-10" style={{ background: 'var(--bg-base)' }}>
                      <tr className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border-0)' }}>
                        {['Symbol', 'Side', 'Lev', 'Size', 'Entry', 'Mark', 'PnL', 'Liq Dist', ''].map(h => (
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
                <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--text-3)' }}>
                  Closed trades appear in Trade History
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: order book + trade panel */}
        <div className="flex-shrink-0 flex flex-col md:flex-row w-full lg:w-[516px]"
          style={{ borderTop: '1px solid var(--border-0)', borderLeft: '1px solid var(--border-0)' }}>

          <div className="hidden md:flex">
            <OrderBook currentPrice={currentPrice} isUp={isUp} spread={selectedAsset.spread} />
          </div>

          <div className="flex-1 overflow-y-auto tk-no-scrollbar" style={{ background: 'var(--bg-card)' }}>
            <div className="p-4 flex flex-col gap-4">

              {/* Long / Short */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'long', label: 'Long', icon: '▲', sub: 'Buy', solid: '#1ea774', bg: '#054a2e', glow: 'tk-buy-glow' },
                  { key: 'short', label: 'Short', icon: '▼', sub: 'Sell', solid: '#d44333', bg: '#7f1d1d', glow: 'tk-sell-glow' },
                ].map(btn => {
                  const active = direction === btn.key;
                  return (
                    <button key={btn.key} onClick={() => setDirection(btn.key)}
                      className="py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex flex-col items-center gap-0.5"
                      style={{
                        background: active ? `linear-gradient(150deg, ${btn.bg}, ${btn.solid})` : `${btn.solid}11`,
                        color: active ? '#fff' : btn.solid,
                        border: `1px solid ${active ? btn.solid : `${btn.solid}33`}`,
                        animation: active ? `${btn.glow} 3s ease-in-out infinite` : 'none',
                      }}>
                      <span className="text-base leading-none">{btn.icon}</span>
                      <span className="text-sm font-bold">{btn.label}</span>
                      <span className="text-xs opacity-70 font-normal">{btn.sub}</span>
                    </button>
                  );
                })}
              </div>

              {/* Order type */}
              <div>
                <SectionLabel>Order Type</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  {['market', 'limit'].map(t => (
                    <button key={t} onClick={() => setOrderType(t)}
                      className="py-2.5 rounded-lg text-xs font-bold capitalize transition-all"
                      style={{
                        background: orderType === t ? 'var(--brand-bg)' : 'var(--bg-surface)',
                        color: orderType === t ? 'var(--brand)' : 'var(--text-3)',
                        border: `1px solid ${orderType === t ? 'rgba(59,130,246,0.3)' : 'var(--border-0)'}`,
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
                {orderType === 'limit' && (
                  <input value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
                    placeholder={`Limit price (${currentPrice.toFixed(2)})`}
                    className="input-dark font-mono text-sm py-3 mt-2" />
                )}
              </div>

              {/* Leverage */}
              <div>
                <SectionLabel right={<span style={{ color: riskLevel.c }}>{riskLevel.l} risk</span>}>
                  Leverage · <span style={{ color: 'var(--brand-light)' }}>{leverage}x</span>
                </SectionLabel>
                <div className="grid grid-cols-5 gap-1.5">
                  {[5, 10, 20, 50, 100].map(lev => (
                    <button key={lev} onClick={() => setLeverage(lev)}
                      className="py-2.5 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: leverage === lev ? 'linear-gradient(135deg, var(--brand-bg), rgba(124,58,237,0.1))' : 'var(--bg-surface)',
                        color: leverage === lev ? 'var(--brand-light)' : 'var(--text-3)',
                        border: `1px solid ${leverage === lev ? 'rgba(59,130,246,0.4)' : 'var(--border-0)'}`,
                        boxShadow: leverage === lev ? '0 0 12px rgba(59,130,246,0.18)' : 'none',
                      }}>
                      {lev}x
                    </button>
                  ))}
                </div>
                <input type="range" min="1" max="100" value={leverage}
                  onChange={e => setLeverage(parseInt(e.target.value))}
                  className="w-full mt-3 accent-blue-500" style={{ accentColor: 'var(--brand)' }} />
                <div className="flex justify-between mt-0.5">
                  <span className="text-xs" style={{ color: 'var(--text-4)' }}>1x</span>
                  <span className="text-xs" style={{ color: 'var(--text-4)' }}>100x</span>
                </div>
              </div>

              {/* Amount */}
              <div>
                <SectionLabel right={`Avail ${formatCurrency(wallet.usdt)}`}>Amount (USDT)</SectionLabel>
                <input type="number" value={amount} onChange={e => { setAmount(e.target.value); setError(''); }}
                  placeholder="Enter amount…" className="input-dark font-mono text-sm py-3 mb-2" />
                <div className="grid grid-cols-4 gap-1.5">
                  {[25, 50, 75, 100].map(pct => (
                    <button key={pct} onClick={() => setAmount((wallet.usdt * pct / 100).toFixed(2))}
                      className="py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-3)', border: '1px solid var(--border-0)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-bg)'; e.currentTarget.style.color = 'var(--brand)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-3)'; }}>
                      {pct}%
                    </button>
                  ))}
                </div>
                {parseFloat(amount) > 0 && (
                  <div className="mt-2.5 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-0)' }}>
                    {[
                      ['Position Size', `${coinSize.toFixed(coinSize > 1 ? 3 : 5)} ${selectedAsset.symbol.replace('/USDT', '')}`],
                      ['Position Value', `$${formatCurrency(estValue)}`],
                      ['Est. Liquidation', liqPrice.toFixed(2)],
                    ].map(([k, v], i) => (
                      <div key={k} className="flex items-center justify-between px-3 py-2"
                        style={{ background: 'var(--bg-surface)', borderTop: i ? '1px solid var(--border-0)' : 'none' }}>
                        <span className="text-xs" style={{ color: 'var(--text-3)' }}>{k}</span>
                        <span className="font-mono text-xs font-semibold"
                          style={{ color: k === 'Est. Liquidation' ? 'var(--warn)' : 'var(--text-2)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI insight */}
              <div className="rounded-xl p-3"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(124,58,237,0.05))', border: '1px solid rgba(59,130,246,0.18)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Brain size={13} style={{ color: 'var(--brand-light)' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--brand-light)' }}>AI Insight</span>
                  </div>
                  <span className="font-mono text-xs font-bold"
                    style={{ color: insight.tone === 'good' ? 'var(--green)' : insight.tone === 'bad' ? 'var(--red)' : 'var(--warn)' }}>
                    {insight.confidence}% conf
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-1" style={{ color: 'var(--text-2)' }}>{insight.headline}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>{insight.body}</p>
                <div className="mt-2">
                  <MeterBar value={insight.confidence}
                    color={insight.tone === 'good' ? 'linear-gradient(90deg,var(--green),#6ee7b7)' : insight.tone === 'bad' ? 'linear-gradient(90deg,var(--red),#fca5a5)' : 'linear-gradient(90deg,var(--brand),var(--brand-light))'} />
                </div>
              </div>

              {/* TP / SL */}
              <div>
                <button onClick={() => setShowTpSl(v => !v)}
                  className="w-full flex items-center justify-between py-1 text-xs font-semibold uppercase tracking-wider transition-colors"
                  style={{ color: showTpSl ? 'var(--brand)' : 'var(--text-3)' }}>
                  <span>Take Profit / Stop Loss</span>
                  <ChevronDown size={13} style={{ transform: showTpSl ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {showTpSl && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(30,167,116,0.75)' }}>Take Profit</label>
                      <input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)}
                        placeholder="Optional" className="input-dark font-mono text-sm py-2.5"
                        style={{ borderColor: takeProfit ? 'rgba(30,167,116,0.35)' : undefined }} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(212,67,51,0.75)' }}>Stop Loss</label>
                      <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)}
                        placeholder="Optional" className="input-dark font-mono text-sm py-2.5"
                        style={{ borderColor: stopLoss ? 'rgba(212,67,51,0.35)' : undefined }} />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--red-bg)', border: '1px solid rgba(212,67,51,0.2)' }}>
                  <AlertCircle size={13} style={{ color: 'var(--red)', flexShrink: 0 }} />
                  <span className="text-xs" style={{ color: 'var(--red)' }}>{error}</span>
                </div>
              )}
              {success && (
                <div className="p-3 rounded-xl text-xs tk-fade-up" style={{ background: 'var(--green-bg)', border: '1px solid rgba(30,167,116,0.2)', color: 'var(--green)' }}>
                  {success}
                </div>
              )}

              {/* Submit */}
              <button onClick={handleTrade}
                className="w-full py-4 rounded-xl font-black text-sm tracking-widest flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: direction === 'long'
                    ? 'linear-gradient(135deg, #054a2e, #059669 55%, #1ea774)'
                    : 'linear-gradient(135deg, #7f1d1d, #dc2626 55%, #d44333)',
                  color: '#fff',
                  boxShadow: direction === 'long' ? '0 4px 24px rgba(30,167,116,0.38)' : '0 4px 24px rgba(212,67,51,0.38)',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <Zap size={15} />
                {direction === 'long' ? '▲ OPEN LONG' : '▼ OPEN SHORT'}
              </button>

              {/* Account */}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-0)' }}>
                <div className="px-4 py-2.5 flex items-center gap-1.5" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-0)' }}>
                  <Shield size={11} style={{ color: 'var(--text-3)' }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Account & Risk</span>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  {[
                    { label: 'Balance', value: `${formatCurrency(metrics.balance)} USDT`, color: 'var(--text-2)' },
                    { label: 'Equity', value: `${formatCurrency(metrics.equity)} USDT`, color: metrics.equity >= metrics.balance ? 'var(--green)' : 'var(--red)' },
                    { label: 'Used Margin', value: `${formatCurrency(metrics.usedMargin)} USDT`, color: 'var(--brand-light)' },
                    { label: 'Free Margin', value: `${formatCurrency(metrics.freeMargin)} USDT`, color: 'var(--text-2)' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-3)' }}>{item.label}</span>
                      <span className="font-mono text-xs font-semibold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--text-3)' }}>Margin Level</span>
                      <span className="font-mono text-xs font-semibold" style={{ color: metrics.marginLevel > 200 ? 'var(--green)' : 'var(--warn)' }}>
                        {metrics.marginLevel > 900 ? '∞' : `${metrics.marginLevel.toFixed(0)}%`}
                      </span>
                    </div>
                    <MeterBar value={Math.min(100, metrics.marginLevel / 5)}
                      color={metrics.marginLevel > 200 ? 'var(--green)' : 'var(--warn)'} height={4} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
