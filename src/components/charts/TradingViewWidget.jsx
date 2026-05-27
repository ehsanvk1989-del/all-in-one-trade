import React, { useEffect, useRef } from 'react';

// Our app symbol → TradingView symbol
const TV_SYMBOL_MAP = {
  // Crypto (Binance)
  'BTC/USDT': 'BINANCE:BTCUSDT',
  'ETH/USDT': 'BINANCE:ETHUSDT',
  'SOL/USDT': 'BINANCE:SOLUSDT',
  'DOGE/USDT': 'BINANCE:DOGEUSDT',
  // Forex / Commodities
  'XAU/USD': 'TVC:GOLD',
  'EUR/USD': 'FX:EURUSD',
  'GBP/USD': 'FX:GBPUSD',
  'USD/JPY': 'FX:USDJPY',
  'OIL': 'TVC:USOIL',
  // SimpleTrade aliases (same assets, different symbol keys)
  'BTC': 'BINANCE:BTCUSDT',
  'ETH': 'BINANCE:ETHUSDT',
  'XAUUSD': 'TVC:GOLD',
  'EURUSD': 'FX:EURUSD',
  'GBPUSD': 'FX:GBPUSD',
};

// Load the TradingView chart library once, globally
let _scriptReady = false;
const _waiters = [];

function ensureTVScript(cb) {
  if (_scriptReady) { cb(); return; }
  _waiters.push(cb);
  if (document.getElementById('__tv_script')) return; // already injecting
  const s = document.createElement('script');
  s.id = '__tv_script';
  s.src = 'https://s3.tradingview.com/tv.js';
  s.async = true;
  s.onload = () => {
    _scriptReady = true;
    _waiters.splice(0).forEach(fn => fn());
  };
  s.onerror = () => {
    console.warn('[TradingViewWidget] Failed to load tv.js');
    _waiters.splice(0);
  };
  document.head.appendChild(s);
}

let _idCounter = 0;

export default function TradingViewWidget({ symbol, interval = '60' }) {
  const outerRef = useRef(null);
  // Each mount gets a stable unique DOM id
  const containerId = useRef(`__tv_${++_idCounter}`).current;

  const tvSymbol = TV_SYMBOL_MAP[symbol] || null;

  useEffect(() => {
    if (!outerRef.current || !tvSymbol) return;

    // Reset container
    outerRef.current.innerHTML = '';
    const div = document.createElement('div');
    div.id = containerId;
    div.style.cssText = 'width:100%;height:100%';
    outerRef.current.appendChild(div);

    ensureTVScript(() => {
      // Guard: div might have been removed if component unmounted during async load
      if (!document.getElementById(containerId)) return;
      if (typeof window.TradingView === 'undefined') return;

      try {
        new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval,
          container_id: containerId,
          theme: 'dark',
          style: '1', // candlestick
          locale: 'en',
          toolbar_bg: '#0c0e11',
          enable_publishing: false,
          withdateranges: true,
          range: '5D',
          hide_side_toolbar: false,
          allow_symbol_change: false,
          save_image: false,
          details: false,
          hotlist: false,
          calendar: false,
          backgroundColor: 'rgba(11,13,15,1)',
          gridColor: 'rgba(255,255,255,0.03)',
        });
      } catch (e) {
        console.warn('[TradingViewWidget] Widget error:', e);
      }
    });

    return () => {
      // Wipe the container on unmount / symbol change
      if (outerRef.current) outerRef.current.innerHTML = '';
    };
  }, [tvSymbol, interval, containerId]);

  if (!tvSymbol) {
    return (
      <div className="w-full h-full flex items-center justify-center"
        style={{ background: '#0b0d0f' }}>
        <div className="text-center p-6 space-y-2">
          <div className="text-3xl opacity-20">⚠️</div>
          <div className="text-white/30 text-sm">No chart mapping for <b>{symbol}</b></div>
        </div>
      </div>
    );
  }

  return <div ref={outerRef} style={{ width: '100%', height: '100%' }} />;
}
