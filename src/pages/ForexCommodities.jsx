import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, Activity, Star, Search, Clock, Calendar, Brain, Zap, ChevronDown, Gauge } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FOREX_ASSETS, formatCurrency } from '../utils/mockData';
import TradingViewWidget from '../components/charts/TradingViewWidget';
import {
  injectTradeAnims, usePriceHistory, useFavorites,
  getSentiment, getVolatility, buildInsight,
  Sparkline, MeterBar, Pill, StatChip, RangeBar,
} from '../components/trade/TradeKit';

injectTradeAnims();

/* ─── Trading sessions (UTC) ─────────────────────────────── */
const SESSIONS = [
  { name: 'Sydney', open: 22, close: 7 },
  { name: 'Tokyo', open: 0, close: 9 },
  { name: 'London', open: 8, close: 17 },
  { name: 'New York', open: 13, close: 22 },
];
function sessionActive(s, h) {
  return s.open < s.close ? (h >= s.open && h < s.close) : (h >= s.open || h < s.close);
}

/* ─── Economic calendar (next events) ────────────────────── */
const ECON_EVENTS = [
  { time: '13:30', cur: 'USD', title: 'Core CPI m/m', impact: 'high' },
  { time: '15:00', cur: 'USD', title: 'Fed Chair Speaks', impact: 'high' },
  { time: '09:00', cur: 'EUR', title: 'ECB Economic Bulletin', impact: 'med' },
  { time: '07:00', cur: 'GBP', title: 'GDP m/m', impact: 'med' },
  { time: '23:50', cur: 'JPY', title: 'BOJ Summary of Opinions', impact: 'low' },
];
const IMPACT_COLOR = { high: 'var(--red)', med: 'var(--warn)', low: 'var(--text-3)' };

/* ─── Section label ──────────────────────────────────────── */
function SectionLabel({ children, right }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-3)' }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--border-0)' }} />
      {right && <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-3)' }}>{right}</span>}
    </div>
  );
}

/* ─── Market Watch sidebar ───────────────────────────────── */
function MarketWatch({ prices, priceStatuses, histRef, selected, onSelect, favs, onFav }) {
  const [query, setQuery] = useState('');
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  const h = now.getUTCHours();

  const filtered = FOREX_ASSETS
    .filter(a => a.symbol.toLowerCase().includes(query.toLowerCase()) || a.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (favs.has(b.symbol) ? 1 : 0) - (favs.has(a.symbol) ? 1 : 0));

  return (
    <div className="flex-shrink-0 flex flex-col border-r overflow-hidden"
      style={{ width: 208, background: 'var(--bg-surface)', borderColor: 'var(--border-0)' }}>
      {/* Search */}
      <div className="p-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-0)' }}>
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
          <Search size={12} style={{ color: 'var(--text-3)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search markets…"
            className="bg-transparent outline-none text-xs flex-1 min-w-0" style={{ color: 'var(--text-1)' }} />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto tk-no-scrollbar">
        {filtered.map(asset => {
          const status = priceStatuses?.[asset.symbol] || 'connecting';
          const price = prices[asset.symbol] ?? asset.basePrice;
          const change = ((price - asset.basePrice) / asset.basePrice) * 100;
          const isUp = change >= 0;
          const isSel = selected.symbol === asset.symbol;
          return (
            <div key={asset.symbol} onClick={() => onSelect(asset)}
              className="px-3 py-2.5 cursor-pointer transition-all"
              style={{
                background: isSel ? 'rgba(59,130,246,0.1)' : 'transparent',
                borderLeft: `2px solid ${isSel ? 'var(--brand)' : 'transparent'}`,
                borderBottom: '1px solid var(--border-0)',
              }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm leading-none">{asset.icon}</span>
                  <span className="text-xs font-bold truncate" style={{ color: isSel ? 'var(--text-1)' : 'var(--text-2)' }}>{asset.symbol}</span>
                  <Star size={10} onClick={(e) => { e.stopPropagation(); onFav(asset.symbol); }}
                    className="cursor-pointer flex-shrink-0 hover:scale-125 transition-transform"
                    style={{ color: favs.has(asset.symbol) ? 'var(--warn)' : 'var(--text-4)', fill: favs.has(asset.symbol) ? 'var(--warn)' : 'none' }} />
                </div>
                <Sparkline history={histRef.current[asset.symbol] || []} up={isUp} w={36} h={16} id={`mw-${asset.symbol}`} fill={false} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold" style={{ color: isSel ? 'var(--text-1)' : 'var(--text-3)' }}>
                  {status === 'unavailable' ? 'No data' : status === 'connecting' ? '--' : price >= 100 ? price.toFixed(2) : price >= 1 ? price.toFixed(4) : price.toFixed(5)}
                </span>
                <span className="text-xs font-bold" style={{ color: status !== 'live' ? 'var(--text-4)' : isUp ? 'var(--green)' : 'var(--red)' }}>
                  {status === 'live' ? `${isUp ? '+' : ''}${change.toFixed(2)}%` : '···'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Session tracker */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border-0)' }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Clock size={11} style={{ color: 'var(--text-3)' }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Sessions</span>
        </div>
        <div className="space-y-1.5">
          {SESSIONS.map(s => {
            const active = sessionActive(s, h);
            return (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? 'var(--green)' : 'var(--text-4)', animation: active ? 'pulse 2s infinite' : 'none' }} />
                  <span className="text-xs" style={{ color: active ? 'var(--text-1)' : 'var(--text-3)' }}>{s.name}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: active ? 'var(--green)' : 'var(--text-4)' }}>{active ? 'Open' : 'Closed'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Position row ───────────────────────────────────────── */
function PositionRow({ pos, prices, onClose }) {
  const cur = prices[pos.symbol] ?? pos.openPrice;
  const diff = pos.direction === 'buy' ? cur - pos.openPrice : pos.openPrice - cur;
  const pnl = diff * pos.volume * pos.leverage;
  const profit = pnl >= 0;
  const dec = pos.openPrice >= 100 ? 2 : 4;
  return (
    <tr className="text-xs transition-colors" style={{ borderBottom: '1px solid var(--border-0)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--text-1)' }}>{pos.symbol}</td>
      <td className="py-2.5 px-3 font-bold" style={{ color: pos.direction === 'buy' ? 'var(--green)' : 'var(--red)' }}>
        {pos.direction === 'buy' ? '▲ BUY' : '▼ SELL'}
      </td>
      <td className="py-2.5 px-3"><span className="badge-brand text-xs">{pos.leverage}x</span></td>
      <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text-2)' }}>{pos.volume}</td>
      <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text-2)' }}>{pos.openPrice.toFixed(dec)}</td>
      <td className="py-2.5 px-3 font-mono font-medium" style={{ color: 'var(--text-1)' }}>{cur.toFixed(dec)}</td>
      <td className="py-2.5 px-3 tk-pnl font-mono font-bold" style={{ color: profit ? 'var(--green)' : 'var(--red)' }}>
        {profit ? '+' : ''}{formatCurrency(pnl)}
      </td>
      <td className="py-2.5 px-3">
        <button onClick={() => onClose(pos.id)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(212,67,51,0.2)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,67,51,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--red-bg)'}>
          Close
        </button>
      </td>
    </tr>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function ForexCommodities() {
  const { prices, priceStatuses, positions, openPosition, closePosition, wallet, getMetrics } = useApp();
  const symbols = FOREX_ASSETS.map(a => a.symbol);
  const histRef = usePriceHistory(prices, symbols);
  const [favs, toggleFav] = useFavorites('tk-forex-favs');

  const [selectedAsset, setSelectedAsset] = useState(FOREX_ASSETS[0]);
  const [leverage, setLeverage] = useState(10);
  const [direction, setDirection] = useState('buy');
  const [volume, setVolume] = useState('0.1');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [showTpSl, setShowTpSl] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bottomTab, setBottomTab] = useState('positions');
  const [metrics, setMetrics] = useState(getMetrics());
  const [flash, setFlash] = useState('');
  const statsRef = useRef({});
  const prevPriceRef = useRef({});

  if (!statsRef.current[selectedAsset.symbol]) {
    const bp = selectedAsset.basePrice;
    statsRef.current[selectedAsset.symbol] = {
      high: bp * (1 + 0.006 + Math.random() * 0.006),
      low: bp * (1 - 0.006 - Math.random() * 0.006),
    };
  }
  const stats = statsRef.current[selectedAsset.symbol];

  useEffect(() => {
    const t = setInterval(() => setMetrics(getMetrics()), 1000);
    return () => clearInterval(t);
  }, [getMetrics]);

  const priceStatus = priceStatuses?.[selectedAsset.symbol] || 'connecting';
  const currentPrice = prices[selectedAsset.symbol] ?? selectedAsset.basePrice;
  const priceChange = ((currentPrice - selectedAsset.basePrice) / selectedAsset.basePrice) * 100;
  const isUp = priceChange >= 0;
  const myPositions = positions.filter(p => p.module === 'forex');
  const spread = selectedAsset.spread;
  const dec = currentPrice >= 100 ? 2 : currentPrice >= 1 ? 4 : 5;
  const askPrice = currentPrice + spread;
  const bidPrice = currentPrice - spread;

  // Flash
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
  const buyers = sentiment.dir === 'up' ? Math.max(55, sentiment.score) : sentiment.dir === 'down' ? Math.min(45, sentiment.score) : 50;

  const handleTrade = useCallback(() => {
    const vol = parseFloat(volume);
    if (!vol || vol <= 0) { setError('Enter a valid volume'); return; }
    openPosition({
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      openPrice: direction === 'buy' ? askPrice : bidPrice,
      volume: vol, leverage, direction,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      module: 'forex',
    });
    setError('');
    setSuccess(`${direction.toUpperCase()} ${vol} lots on ${selectedAsset.symbol}`);
    setTimeout(() => setSuccess(''), 3000);
  }, [volume, leverage, direction, openPosition, selectedAsset, stopLoss, takeProfit, askPrice, bidPrice]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* ── Symbol header ── */}
      <div className="flex items-center gap-5 px-4 py-3 overflow-x-auto tk-no-scrollbar flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-0)', background: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="text-2xl leading-none">{selectedAsset.icon}</span>
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{selectedAsset.symbol}</div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>{selectedAsset.name} · CFD</div>
          </div>
        </div>

        <div className="flex-shrink-0">
          {priceStatus === 'unavailable' ? (
            <div className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--warn)' }}>
              <AlertCircle size={12} /> Market data unavailable
            </div>
          ) : (
            <>
              <div className={`font-mono text-2xl font-black leading-none ${flash === 'up' ? 'tk-up' : flash === 'down' ? 'tk-down' : ''}`}
                style={{ color: flash ? undefined : (priceStatus === 'connecting' ? 'var(--text-3)' : isUp ? 'var(--green)' : 'var(--red)') }}>
                {priceStatus === 'connecting' ? '---' : currentPrice.toFixed(dec)}
              </div>
              <div className="text-xs font-semibold mt-1" style={{ color: isUp ? 'var(--green)' : 'var(--red)' }}>
                {priceStatus === 'connecting' ? 'Connecting…' : `${isUp ? '▲ +' : '▼ '}${priceChange.toFixed(3)}%`}
              </div>
            </>
          )}
        </div>

        <div className="hidden md:flex items-center gap-5 flex-shrink-0">
          <StatChip label="24h High" value={stats.high.toFixed(dec)} color="var(--green)" />
          <StatChip label="24h Low" value={stats.low.toFixed(dec)} color="var(--red)" />
          <StatChip label="Spread" value={spread.toString()} color="var(--text-2)" />
          <StatChip label="Open P&L" value={`${metrics.pnl >= 0 ? '+' : ''}$${formatCurrency(metrics.pnl)}`} color={metrics.pnl >= 0 ? 'var(--green)' : 'var(--red)'} />
        </div>

        <div className="hidden lg:block flex-shrink-0" style={{ width: 160 }}>
          <RangeBar low={stats.low} high={stats.high} price={currentPrice} decimals={dec} />
        </div>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <Pill color={sentiment.color} bg={sentiment.bg}>
            {sentiment.dir === 'up' ? '▲' : sentiment.dir === 'down' ? '▼' : '◆'} {sentiment.label}
          </Pill>
          <Pill color={volatility.color}>⚡ {volatility.label}</Pill>
          <Pill color={priceStatus === 'live' ? 'var(--green)' : 'var(--warn)'} bg={priceStatus === 'live' ? 'var(--green-bg)' : 'var(--warn-bg)'}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: priceStatus === 'live' ? 'var(--green)' : 'var(--warn)', animation: 'pulse 2s infinite' }} />
            {priceStatus === 'live' ? 'LIVE' : priceStatus === 'connecting' ? 'SYNC' : 'N/A'}
          </Pill>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">

        {/* Market Watch */}
        <div className="hidden lg:flex">
          <MarketWatch prices={prices} priceStatuses={priceStatuses} histRef={histRef}
            selected={selectedAsset} onSelect={setSelectedAsset} favs={favs} onFav={toggleFav} />
        </div>

        {/* Chart + positions */}
        <div className="flex flex-col min-w-0 lg:flex-1">
          <div className="h-[320px] lg:h-auto lg:flex-1 lg:min-h-0">
            <TradingViewWidget symbol={selectedAsset.symbol} interval="60" />
          </div>

          <div className="flex-shrink-0" style={{ height: 220, borderTop: '1px solid var(--border-0)' }}>
            <div className="flex items-center" style={{ borderBottom: '1px solid var(--border-0)' }}>
              {['positions', 'history'].map(tab => (
                <button key={tab} onClick={() => setBottomTab(tab)} className="nav-tab"
                  style={{ color: bottomTab === tab ? 'var(--brand-light)' : 'var(--text-3)', borderBottomColor: bottomTab === tab ? 'var(--brand)' : 'transparent' }}>
                  {tab === 'positions' ? `Positions (${myPositions.length})` : 'History'}
                </button>
              ))}
              <div className="ml-auto hidden lg:flex items-center gap-4 px-4 text-xs">
                {[
                  { l: 'Balance', v: `$${formatCurrency(metrics.balance)}`, c: 'var(--text-2)' },
                  { l: 'Equity', v: `$${formatCurrency(metrics.equity)}`, c: metrics.equity >= metrics.balance ? 'var(--green)' : 'var(--red)' },
                  { l: 'Free Margin', v: `$${formatCurrency(metrics.freeMargin)}`, c: 'var(--text-2)' },
                ].map(s => (
                  <div key={s.l} className="flex items-center gap-1.5">
                    <span style={{ color: 'var(--text-4)' }}>{s.l}</span>
                    <span className="font-mono font-semibold" style={{ color: s.c }}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-auto" style={{ height: 'calc(100% - 38px)' }}>
              {bottomTab === 'positions' ? (
                myPositions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-1">
                    <div className="text-3xl mb-1" style={{ opacity: 0.16 }}>📈</div>
                    <div className="text-sm" style={{ color: 'var(--text-3)' }}>No open positions</div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="sticky top-0 z-10" style={{ background: 'var(--bg-base)' }}>
                      <tr className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border-0)' }}>
                        {['Symbol', 'Side', 'Lev', 'Volume', 'Entry', 'Current', 'P&L', ''].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {myPositions.map(pos => <PositionRow key={pos.id} pos={pos} prices={prices} onClose={closePosition} />)}
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

        {/* Trade panel */}
        <div className="flex-shrink-0 w-full lg:w-[316px] overflow-y-auto tk-no-scrollbar"
          style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-0)', borderLeft: '1px solid var(--border-0)' }}>
          <div className="p-4 flex flex-col gap-4">

            {/* Buy / Sell */}
            <div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDirection('buy')}
                  className="py-3.5 rounded-xl transition-all duration-200 flex flex-col items-center gap-0.5"
                  style={{
                    background: direction === 'buy' ? 'linear-gradient(150deg, #054a2e, #1ea774)' : 'rgba(30,167,116,0.07)',
                    color: direction === 'buy' ? '#fff' : 'var(--green)',
                    border: `1px solid ${direction === 'buy' ? 'var(--green)' : 'rgba(30,167,116,0.25)'}`,
                    animation: direction === 'buy' ? 'tk-buy-glow 3s ease-in-out infinite' : 'none',
                  }}>
                  <span className="text-base font-bold leading-none">▲</span>
                  <span className="text-sm font-bold">BUY</span>
                  <span className="font-mono text-xs opacity-75">{askPrice.toFixed(dec)}</span>
                </button>
                <button onClick={() => setDirection('sell')}
                  className="py-3.5 rounded-xl transition-all duration-200 flex flex-col items-center gap-0.5"
                  style={{
                    background: direction === 'sell' ? 'linear-gradient(150deg, #7f1d1d, #d44333)' : 'rgba(212,67,51,0.07)',
                    color: direction === 'sell' ? '#fff' : 'var(--red)',
                    border: `1px solid ${direction === 'sell' ? 'var(--red)' : 'rgba(212,67,51,0.25)'}`,
                    animation: direction === 'sell' ? 'tk-sell-glow 3s ease-in-out infinite' : 'none',
                  }}>
                  <span className="text-base font-bold leading-none">▼</span>
                  <span className="text-sm font-bold">SELL</span>
                  <span className="font-mono text-xs opacity-75">{bidPrice.toFixed(dec)}</span>
                </button>
              </div>
              <div className="mt-2.5 flex items-center justify-center gap-2 py-1.5 rounded-lg"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                <span className="text-xs" style={{ color: 'var(--text-4)' }}>Spread</span>
                <span className="font-mono text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{(spread * 2).toFixed(dec)}</span>
                <span className="w-px h-3" style={{ background: 'var(--border-1)' }} />
                <span className="text-xs" style={{ color: 'var(--text-4)' }}>Pip</span>
                <span className="font-mono text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{currentPrice > 100 ? '0.01' : '0.0001'}</span>
              </div>
            </div>

            {/* Buyers vs Sellers strength meter */}
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Gauge size={12} style={{ color: 'var(--brand-light)' }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Strength</span>
                </div>
                <span className="text-xs font-bold" style={{ color: buyers >= 50 ? 'var(--green)' : 'var(--red)' }}>
                  {buyers >= 50 ? 'Buyers' : 'Sellers'} lead
                </span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden" style={{ background: 'var(--red)' }}>
                <div className="transition-all duration-700" style={{ width: `${buyers}%`, background: 'var(--green)' }} />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-mono" style={{ color: 'var(--green)' }}>{buyers.toFixed(0)}%</span>
                <span className="text-xs font-mono" style={{ color: 'var(--red)' }}>{(100 - buyers).toFixed(0)}%</span>
              </div>
            </div>

            {/* Leverage */}
            <div>
              <SectionLabel right={`${leverage}x`}>Leverage</SectionLabel>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map(l => (
                  <button key={l} onClick={() => setLeverage(l)}
                    className="py-2.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: leverage === l ? 'linear-gradient(135deg, var(--brand-bg), rgba(124,58,237,0.1))' : 'var(--bg-surface)',
                      color: leverage === l ? 'var(--brand-light)' : 'var(--text-3)',
                      border: `1px solid ${leverage === l ? 'rgba(59,130,246,0.4)' : 'var(--border-0)'}`,
                      boxShadow: leverage === l ? '0 0 12px rgba(59,130,246,0.16)' : 'none',
                    }}>
                    {l}x
                  </button>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div>
              <SectionLabel right={parseFloat(volume) > 0 ? `$${formatCurrency(parseFloat(volume) * currentPrice * leverage)}` : null}>Volume (Lots)</SectionLabel>
              <input type="number" value={volume} onChange={e => { setVolume(e.target.value); setError(''); }}
                placeholder="0.1" step="0.01" className="input-dark font-mono text-sm py-3 mb-2" />
              <div className="grid grid-cols-4 gap-1.5">
                {[0.01, 0.1, 0.5, 1].map(v => (
                  <button key={v} onClick={() => setVolume(v.toString())}
                    className="py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: volume === v.toString() ? 'var(--brand-bg)' : 'var(--bg-surface)',
                      color: volume === v.toString() ? 'var(--brand)' : 'var(--text-3)',
                      border: `1px solid ${volume === v.toString() ? 'rgba(59,130,246,0.3)' : 'var(--border-0)'}`,
                    }}>
                    {v}
                  </button>
                ))}
              </div>
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
                  {insight.confidence}%
                </span>
              </div>
              <p className="text-xs leading-relaxed mb-1" style={{ color: 'var(--text-2)' }}>{insight.headline}</p>
              <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-3)' }}>{insight.body}</p>
              <MeterBar value={insight.confidence}
                color={insight.tone === 'good' ? 'linear-gradient(90deg,var(--green),#6ee7b7)' : insight.tone === 'bad' ? 'linear-gradient(90deg,var(--red),#fca5a5)' : 'linear-gradient(90deg,var(--brand),var(--brand-light))'} />
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
                      placeholder="Optional" step="0.0001" className="input-dark font-mono text-sm py-2.5"
                      style={{ borderColor: takeProfit ? 'rgba(30,167,116,0.35)' : undefined }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(212,67,51,0.75)' }}>Stop Loss</label>
                    <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)}
                      placeholder="Optional" step="0.0001" className="input-dark font-mono text-sm py-2.5"
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
                background: direction === 'buy'
                  ? 'linear-gradient(135deg, #054a2e, #059669 55%, #1ea774)'
                  : 'linear-gradient(135deg, #7f1d1d, #dc2626 55%, #d44333)',
                color: '#fff',
                boxShadow: direction === 'buy' ? '0 4px 24px rgba(30,167,116,0.38)' : '0 4px 24px rgba(212,67,51,0.38)',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <Zap size={15} />
              {direction === 'buy' ? '▲ PLACE BUY ORDER' : '▼ PLACE SELL ORDER'}
            </button>

            {/* Economic calendar */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-0)' }}>
              <div className="px-4 py-2.5 flex items-center gap-1.5" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-0)' }}>
                <Calendar size={11} style={{ color: 'var(--text-3)' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Economic Calendar</span>
              </div>
              <div>
                {ECON_EVENTS.map((ev, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-4 py-2"
                    style={{ borderTop: i ? '1px solid var(--border-0)' : 'none' }}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: IMPACT_COLOR[ev.impact] }} />
                    <span className="font-mono text-xs flex-shrink-0" style={{ color: 'var(--text-3)' }}>{ev.time}</span>
                    <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--brand-light)' }}>{ev.cur}</span>
                    <span className="text-xs truncate" style={{ color: 'var(--text-2)' }}>{ev.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Account */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-0)' }}>
              <div className="px-4 py-2.5 flex items-center gap-1.5" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-0)' }}>
                <Activity size={11} style={{ color: 'var(--text-3)' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Account</span>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                {[
                  { label: 'Balance', value: `$${formatCurrency(metrics.balance)}`, color: 'var(--text-2)' },
                  { label: 'Equity', value: `$${formatCurrency(metrics.equity)}`, color: metrics.equity >= metrics.balance ? 'var(--green)' : 'var(--red)' },
                  { label: 'Free Margin', value: `$${formatCurrency(metrics.freeMargin)}`, color: 'var(--text-2)' },
                  { label: 'Margin Level', value: metrics.marginLevel > 900 ? '∞' : `${metrics.marginLevel.toFixed(1)}%`, color: metrics.marginLevel > 200 ? 'var(--green)' : 'var(--warn)' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>{item.label}</span>
                    <span className="font-mono text-xs font-semibold" style={{ color: item.color }}>{item.value}</span>
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
