import React, { useState, useEffect, useCallback } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  FOREX_ASSETS, LEVERAGE_OPTIONS,
  formatCurrency
} from '../utils/mockData';
import CandleChart from '../components/charts/CandleChart';

function MarketWatch({ assets, prices, selected, onSelect }) {
  return (
    <div className="border-r border-white/5 flex-shrink-0 overflow-y-auto" style={{ width: '160px' }}>
      <div className="px-3 py-2 border-b border-white/5">
        <span className="text-white/40 text-xs font-semibold uppercase tracking-wide">Market Watch</span>
      </div>
      {assets.map(asset => {
        const price = prices[asset.symbol] || asset.basePrice;
        const change = ((price - asset.basePrice) / asset.basePrice) * 100;
        const isUp = change >= 0;
        const isSelected = selected.symbol === asset.symbol;

        return (
          <div
            key={asset.symbol}
            onClick={() => onSelect(asset)}
            className="px-3 py-2.5 cursor-pointer transition-all border-b border-white/5"
            style={{
              background: isSelected ? 'rgba(67,97,238,0.08)' : 'transparent',
              borderLeft: `2px solid ${isSelected ? '#4361ee' : 'transparent'}`,
            }}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs">{asset.icon}</span>
              <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-white/70'}`}>
                {asset.symbol}
              </span>
            </div>
            <div className="font-mono text-xs text-white/80">
              {price >= 100 ? price.toFixed(2) : price >= 1 ? price.toFixed(4) : price.toFixed(5)}
            </div>
            <div className={`text-xs ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PositionRow({ pos, prices, onClose }) {
  const currentPrice = prices[pos.symbol] || pos.openPrice;
  const priceDiff = pos.direction === 'buy'
    ? currentPrice - pos.openPrice
    : pos.openPrice - currentPrice;
  const pnl = priceDiff * pos.volume * pos.leverage;
  const isProfit = pnl >= 0;

  return (
    <tr className="border-b border-white/5 text-xs hover:bg-white/2 transition-colors">
      <td className="py-1.5 px-3">
        <div className="font-medium text-white/80">{pos.symbol}</div>
      </td>
      <td className={`py-1.5 px-3 font-semibold ${pos.direction === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
        {pos.direction.toUpperCase()}
      </td>
      <td className="py-1.5 px-3 text-yellow-400 font-bold">{pos.leverage}x</td>
      <td className="py-1.5 px-3 text-white/60 font-mono">{pos.volume}</td>
      <td className="py-1.5 px-3 text-white/60 font-mono">{pos.openPrice.toFixed(pos.openPrice > 100 ? 2 : 4)}</td>
      <td className="py-1.5 px-3 text-white/80 font-mono">{currentPrice.toFixed(currentPrice > 100 ? 2 : 4)}</td>
      <td className={`py-1.5 px-3 font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
        {isProfit ? '+' : ''}{formatCurrency(pnl)}
      </td>
      <td className="py-1.5 px-3">
        <button
          onClick={() => onClose(pos.id)}
          className="px-2.5 py-1 rounded text-xs font-medium transition-all"
          style={{ background: 'rgba(220,38,38,0.15)', color: '#ef4444' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.15)'}
        >
          Close
        </button>
      </td>
    </tr>
  );
}

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

  const currentPrice = prices[selectedAsset.symbol] || selectedAsset.basePrice;
  const priceChange = ((currentPrice - selectedAsset.basePrice) / selectedAsset.basePrice) * 100;
  const isUp = priceChange >= 0;

  useEffect(() => {
    const t = setInterval(() => setMetrics(getMetrics()), 1000);
    return () => clearInterval(t);
  }, [getMetrics]);

  const myPositions = positions.filter(p => p.module === 'forex');

  const handleTrade = useCallback(() => {
    const vol = parseFloat(volume);
    if (!vol || vol <= 0) { setError('Invalid volume'); return; }

    openPosition({
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      openPrice: currentPrice,
      volume: vol,
      leverage,
      direction,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      module: 'forex',
    });

    setSuccess(`${direction.toUpperCase()} ${vol} lots on ${selectedAsset.symbol}`);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  }, [volume, currentPrice, leverage, direction, openPosition, selectedAsset, stopLoss, takeProfit]);

  const pip = selectedAsset.basePrice < 10 ? 0.0001 : 0.01;
  const spread = selectedAsset.spread;

  return (
    <div className="flex-1 overflow-hidden flex flex-col" style={{ background: '#0d1117' }}>
      {/* Symbol info bar — TradingView style */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">{selectedAsset.icon}</span>
          <div>
            <div className="text-white font-bold text-base">{selectedAsset.symbol}</div>
            <div className="text-white/30 text-xs">{selectedAsset.name} • Perpetual CFD</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className={`font-mono text-xl font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {currentPrice >= 100 ? currentPrice.toFixed(2) : currentPrice >= 1 ? currentPrice.toFixed(4) : currentPrice.toFixed(5)}
          </span>
        </div>

        <div className={`flex items-center gap-1 text-sm ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{isUp ? '+' : ''}{priceChange.toFixed(3)}%</span>
        </div>

        <div className="hidden sm:flex gap-6 ml-4 text-xs">
          {[
            { label: 'High', value: (currentPrice * 1.012).toFixed(currentPrice > 100 ? 2 : 4), color: 'text-emerald-400' },
            { label: 'Low', value: (currentPrice * 0.988).toFixed(currentPrice > 100 ? 2 : 4), color: 'text-red-400' },
            { label: 'Spread', value: spread, color: 'text-white/50' },
            { label: 'Leverage', value: `${leverage}x`, color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-white/25">{s.label}</div>
              <div className={`font-mono font-medium ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Activity size={12} className="text-emerald-400" />
          <span className="text-emerald-400 text-xs">Live Feed</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Market Watch Sidebar */}
        <MarketWatch
          assets={FOREX_ASSETS}
          prices={prices}
          selected={selectedAsset}
          onSelect={setSelectedAsset}
        />

        {/* Chart area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Chart */}
          <div className="flex-1" style={{ minHeight: 220 }}>
            <CandleChart symbol={selectedAsset.symbol} basePrice={currentPrice} height="100%" />
          </div>

          {/* Positions table */}
          <div className="flex-shrink-0" style={{ height: '180px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex border-b border-white/5">
              {['positions', 'history'].map(tab => (
                <div key={tab} className={`nav-tab ${bottomTab === tab ? 'active' : ''}`}
                  onClick={() => setBottomTab(tab)}>
                  {tab === 'positions' ? `Open (${myPositions.length})` : 'History'}
                </div>
              ))}

              {/* Account metrics in tab bar */}
              <div className="ml-auto flex items-center gap-4 px-4 text-xs">
                {[
                  { label: 'Balance', value: `$${formatCurrency(metrics.balance)}`, color: 'text-white/60' },
                  { label: 'Equity', value: `$${formatCurrency(metrics.equity)}`, color: metrics.equity >= metrics.balance ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'P&L', value: `${metrics.pnl >= 0 ? '+' : ''}$${formatCurrency(metrics.pnl)}`, color: metrics.pnl >= 0 ? 'text-emerald-400' : 'text-red-400' },
                ].map(s => (
                  <div key={s.label} className="hidden md:flex items-center gap-1.5">
                    <span className="text-white/30">{s.label}:</span>
                    <span className={`font-mono font-semibold ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-auto h-[calc(100%-37px)]">
              {bottomTab === 'positions' ? (
                myPositions.length === 0 ? (
                  <div className="text-white/20 text-xs text-center py-4">No open positions on Forex & Commodities</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-white/25 text-xs border-b border-white/5">
                        {['Symbol', 'Dir', 'Lev', 'Volume', 'Entry', 'Current', 'PnL', ''].map(h => (
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
                <div className="p-2 text-white/20 text-xs text-center py-4">Trade history shown in Trade History section</div>
              )}
            </div>
          </div>
        </div>

        {/* Order Panel */}
        <div className="flex-shrink-0 border-l border-white/5 overflow-y-auto" style={{ width: '230px' }}>
          <div className="p-4 space-y-3">
            <div className="text-white/50 text-xs font-bold uppercase tracking-wider">Order Entry</div>

            {/* Buy/Sell */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setDirection('buy')}
                className="py-3 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: direction === 'buy' ? 'linear-gradient(135deg, #065f46, #059669)' : 'rgba(5,150,105,0.08)',
                  color: direction === 'buy' ? '#fff' : '#059669',
                  border: `1px solid ${direction === 'buy' ? '#059669' : 'rgba(5,150,105,0.2)'}`,
                }}
              >
                ▲ BUY
                <div className="text-xs opacity-70 font-normal mt-0.5 font-mono">
                  {(currentPrice + spread).toFixed(currentPrice > 100 ? 2 : 4)}
                </div>
              </button>
              <button
                onClick={() => setDirection('sell')}
                className="py-3 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: direction === 'sell' ? 'linear-gradient(135deg, #7f1d1d, #dc2626)' : 'rgba(220,38,38,0.08)',
                  color: direction === 'sell' ? '#fff' : '#dc2626',
                  border: `1px solid ${direction === 'sell' ? '#dc2626' : 'rgba(220,38,38,0.2)'}`,
                }}
              >
                ▼ SELL
                <div className="text-xs opacity-70 font-normal mt-0.5 font-mono">
                  {(currentPrice - spread).toFixed(currentPrice > 100 ? 2 : 4)}
                </div>
              </button>
            </div>

            {/* Leverage */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-white/30 text-xs">Leverage</span>
                <span className="text-yellow-400 text-xs font-bold">{leverage}x</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[5, 10, 20, 50].map(l => (
                  <button
                    key={l}
                    onClick={() => setLeverage(l)}
                    className="py-1.5 rounded text-xs font-bold transition-all"
                    style={{
                      background: leverage === l ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.04)',
                      color: leverage === l ? '#ffd700' : 'rgba(255,255,255,0.4)',
                      border: `1px solid ${leverage === l ? 'rgba(255,215,0,0.25)' : 'transparent'}`,
                    }}
                  >
                    {l}x
                  </button>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div>
              <label className="text-white/30 text-xs mb-1 block">Volume (Lots)</label>
              <input
                value={volume}
                onChange={e => setVolume(e.target.value)}
                className="input-dark text-xs font-mono"
                placeholder="0.1"
                type="number"
                step="0.01"
              />
              <div className="grid grid-cols-4 gap-1 mt-1">
                {[0.01, 0.1, 0.5, 1].map(v => (
                  <button
                    key={v}
                    onClick={() => setVolume(v.toString())}
                    className="py-1 rounded text-xs text-white/40"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* TP/SL */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-white/30 text-xs mb-1 block">Take Profit</label>
                <input
                  value={takeProfit}
                  onChange={e => setTakeProfit(e.target.value)}
                  placeholder="Optional"
                  className="input-dark text-xs font-mono"
                  type="number"
                  step="0.0001"
                />
              </div>
              <div>
                <label className="text-white/30 text-xs mb-1 block">Stop Loss</label>
                <input
                  value={stopLoss}
                  onChange={e => setStopLoss(e.target.value)}
                  placeholder="Optional"
                  className="input-dark text-xs font-mono"
                  type="number"
                  step="0.0001"
                />
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="flex items-center gap-1.5 p-2 rounded text-xs"
                style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}>
                <AlertCircle size={11} className="text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
            )}
            {success && (
              <div className="p-2 rounded text-xs text-emerald-400"
                style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)' }}>
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleTrade}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: direction === 'buy'
                  ? 'linear-gradient(135deg, #065f46, #059669)'
                  : 'linear-gradient(135deg, #7f1d1d, #dc2626)',
                boxShadow: direction === 'buy'
                  ? '0 0 20px rgba(5,150,105,0.3)'
                  : '0 0 20px rgba(220,38,38,0.3)',
              }}
            >
              {direction === 'buy' ? '▲ Place Buy Order' : '▼ Place Sell Order'}
            </button>

            {/* Account info */}
            <div className="space-y-1.5 pt-1">
              {[
                { label: 'Balance', value: `$${formatCurrency(metrics.balance)}` },
                { label: 'Equity', value: `$${formatCurrency(metrics.equity)}` },
                { label: 'Free Margin', value: `$${formatCurrency(metrics.freeMargin)}` },
                { label: 'Margin Level', value: `${metrics.marginLevel.toFixed(1)}%` },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span className="text-white/25">{item.label}</span>
                  <span className="font-mono text-white/55">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
