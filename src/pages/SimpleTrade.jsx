import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, X, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SIMPLE_TRADE_ASSETS, SIMPLE_LEVERAGE_OPTIONS, formatCurrency } from '../utils/mockData';

const COLORS = { buy: '#059669', sell: '#dc2626', gold: '#ffd700' };

function AssetButton({ asset, selected, price, onChange }) {
  const change = ((price - asset.basePrice) / asset.basePrice) * 100;
  const isUp = change >= 0;

  return (
    <button
      onClick={() => onChange(asset)}
      className="flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-w-0"
      style={{
        background: selected ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: selected ? '0 0 20px rgba(255,215,0,0.1)' : 'none',
      }}
    >
      <span className="text-lg mb-1">{asset.icon}</span>
      <div className="text-white/80 text-xs font-semibold">{asset.symbol}</div>
      <div className={`text-xs font-mono mt-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
        {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
      </div>
    </button>
  );
}

function TradeRow({ pos, prices, onClose }) {
  const currentPrice = prices[pos.symbol] || pos.openPrice;
  const priceDiff = pos.direction === 'buy'
    ? currentPrice - pos.openPrice
    : pos.openPrice - currentPrice;
  const pnl = priceDiff * pos.volume * pos.leverage;
  const isProfit = pnl >= 0;

  return (
    <div className="flex items-center gap-2 p-3 rounded-xl transition-all"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${isProfit ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)'}`,
      }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-sm font-semibold">{pos.symbol}</span>
          <span className={`badge-${pos.direction === 'buy' ? 'green' : 'red'} text-xs`}>
            {pos.direction.toUpperCase()}
          </span>
          <span className="badge-gold text-xs">{pos.leverage}x</span>
        </div>
        <div className="text-white/30 text-xs mt-0.5">
          Vol: {pos.volume} | Entry: {pos.openPrice.toFixed(pos.openPrice > 100 ? 2 : 4)}
        </div>
      </div>
      <div className="text-right">
        <div className={`font-mono font-bold text-sm ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
          {isProfit ? '+' : ''}{formatCurrency(pnl)}
        </div>
        <div className="text-white/30 text-xs font-mono">
          {currentPrice.toFixed(currentPrice > 100 ? 2 : 4)}
        </div>
      </div>
      <button
        onClick={() => onClose(pos.id)}
        className="ml-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/20"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <X size={13} className="text-white/50 hover:text-red-400" />
      </button>
    </div>
  );
}

export default function SimpleTrade() {
  const { prices, positions, openPosition, closePosition, wallet, getMetrics } = useApp();
  const [selectedAsset, setSelectedAsset] = useState(SIMPLE_TRADE_ASSETS[0]);
  const [direction, setDirection] = useState('buy');
  const [volume, setVolume] = useState('0.01');
  const [leverage, setLeverage] = useState(10);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [metrics, setMetrics] = useState(getMetrics());

  useEffect(() => {
    const t = setInterval(() => setMetrics(getMetrics()), 1000);
    return () => clearInterval(t);
  }, [getMetrics]);

  const currentPrice = prices[selectedAsset.symbol] || selectedAsset.basePrice;
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

    setSuccess(`${direction.toUpperCase()} position opened on ${selectedAsset.symbol}`);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  }, [volume, wallet.usdt, currentPrice, openPosition, selectedAsset, leverage, direction, stopLoss, takeProfit]);

  return (
    <div className="flex-1 overflow-y-auto animate-fade-in"
      style={{
        background: 'radial-gradient(ellipse at top, rgba(120,0,0,0.04) 0%, transparent 60%), #0a0a0a',
      }}>
      {/* Header bar */}
      <div className="px-5 pt-4 pb-2">
        {/* Asset price display */}
        <div className="flex items-center gap-4 mb-4 p-4 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,215,0,0.08)',
          }}>
          <div className="text-3xl">{selectedAsset.icon}</div>
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider">{selectedAsset.name}</div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold font-mono text-white">
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
            <div className="text-white/30 text-xs">Balance</div>
            <div className="font-mono font-bold text-yellow-400">${formatCurrency(metrics.balance)}</div>
          </div>
        </div>

        {/* Asset selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
          {SIMPLE_TRADE_ASSETS.map(asset => (
            <AssetButton
              key={asset.symbol}
              asset={asset}
              selected={selectedAsset.symbol === asset.symbol}
              price={prices[asset.symbol] || asset.basePrice}
              onChange={setSelectedAsset}
            />
          ))}
        </div>
      </div>

      <div className="px-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trade Panel */}
        <div className="lg:col-span-1">
          <div className="card-premium rounded-xl p-5 space-y-4"
            style={{
              background: 'linear-gradient(145deg, rgba(20,10,10,0.98), rgba(15,10,10,0.98))',
              border: '1px solid rgba(200,0,0,0.12)',
            }}>
            <div className="text-white/60 text-xs font-bold tracking-wider uppercase">Place Order</div>

            {/* Buy/Sell buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDirection('buy')}
                className="py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: direction === 'buy' ? 'linear-gradient(135deg, #065f46, #059669)' : 'rgba(5,150,105,0.08)',
                  border: `1px solid ${direction === 'buy' ? '#059669' : 'rgba(5,150,105,0.2)'}`,
                  color: direction === 'buy' ? '#fff' : '#059669',
                  boxShadow: direction === 'buy' ? '0 0 20px rgba(5,150,105,0.3)' : 'none',
                }}
              >
                ▲ BUY / LONG
              </button>
              <button
                onClick={() => setDirection('sell')}
                className="py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: direction === 'sell' ? 'linear-gradient(135deg, #7f1d1d, #dc2626)' : 'rgba(220,38,38,0.08)',
                  border: `1px solid ${direction === 'sell' ? '#dc2626' : 'rgba(220,38,38,0.2)'}`,
                  color: direction === 'sell' ? '#fff' : '#dc2626',
                  boxShadow: direction === 'sell' ? '0 0 20px rgba(220,38,38,0.3)' : 'none',
                }}
              >
                ▼ SELL / SHORT
              </button>
            </div>

            {/* Volume */}
            <div>
              <label className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1.5 block">
                Volume (Lots)
              </label>
              <input
                type="number"
                value={volume}
                onChange={e => setVolume(e.target.value)}
                step="0.01"
                min="0.01"
                className="input-dark font-mono"
              />
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[0.01, 0.1, 0.5, 1].map(v => (
                  <button
                    key={v}
                    onClick={() => setVolume(v.toString())}
                    className="py-1 rounded text-xs transition-all"
                    style={{
                      background: volume === v.toString() ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${volume === v.toString() ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      color: volume === v.toString() ? '#ffd700' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Leverage */}
            <div>
              <label className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1.5 block">
                Leverage: <span className="text-yellow-400 font-bold">{leverage}x</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {SIMPLE_LEVERAGE_OPTIONS.map(lev => (
                  <button
                    key={lev}
                    onClick={() => setLeverage(lev)}
                    className="py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: leverage === lev ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${leverage === lev ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      color: leverage === lev ? '#ffd700' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>

            {/* Stop Loss & Take Profit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs font-medium mb-1.5 block">Stop Loss</label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={e => setStopLoss(e.target.value)}
                  placeholder="Optional"
                  className="input-dark font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-white/40 text-xs font-medium mb-1.5 block">Take Profit</label>
                <input
                  type="number"
                  value={takeProfit}
                  onChange={e => setTakeProfit(e.target.value)}
                  placeholder="Optional"
                  className="input-dark font-mono text-sm"
                />
              </div>
            </div>

            {/* Error/Success */}
            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs"
                style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}>
                <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
                <span className="text-red-400">{error}</span>
              </div>
            )}
            {success && (
              <div className="p-2.5 rounded-lg text-xs text-emerald-400"
                style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)' }}>
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleTrade}
              className={`w-full py-4 rounded-xl font-bold text-base transition-all ${direction === 'buy' ? 'btn-buy' : 'btn-sell'}`}
            >
              {direction === 'buy' ? '▲ BUY' : '▼ SELL'} {selectedAsset.symbol}
            </button>

            {/* Margin info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-white/30">Required Margin</div>
                <div className="text-white/70 font-mono">${formatCurrency((currentPrice * parseFloat(volume || 0)) / leverage)}</div>
              </div>
              <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-white/30">Free Margin</div>
                <div className="text-white/70 font-mono">${formatCurrency(metrics.freeMargin)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Open Positions */}
        <div className="lg:col-span-2">
          <div className="card-premium rounded-xl p-5"
            style={{
              background: 'linear-gradient(145deg, rgba(15,10,10,0.98), rgba(12,10,10,0.98))',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-white/70 text-sm font-bold uppercase tracking-wider">Open Positions</div>
              <span className="badge-gold">{myPositions.length}</span>
            </div>

            {myPositions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-white/15 text-4xl mb-3">📊</div>
                <div className="text-white/20 text-sm">No open positions</div>
                <div className="text-white/10 text-xs mt-1">Place your first trade using the panel on the left</div>
              </div>
            ) : (
              <div className="space-y-2">
                {myPositions.map(pos => (
                  <TradeRow key={pos.id} pos={pos} prices={prices} onClose={closePosition} />
                ))}
              </div>
            )}

            {/* Account summary */}
            <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/5">
              {[
                { label: 'Balance', value: `$${formatCurrency(metrics.balance)}`, color: 'text-white' },
                { label: 'Equity', value: `$${formatCurrency(metrics.equity)}`, color: metrics.equity >= metrics.balance ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Margin', value: `$${formatCurrency(metrics.usedMargin)}`, color: 'text-yellow-400' },
                { label: 'Free Margin', value: `$${formatCurrency(metrics.freeMargin)}`, color: 'text-white' },
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
