import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { generateCandleData } from '../../utils/mockData';

const CANDLE_INTERVAL = 3600; // 1-hour candles in seconds

export default function TVChart({ symbol, basePrice }) {
  const containerRef = useRef(null);
  // Bundle all mutable chart state into one ref to avoid stale closure issues
  const stateRef = useRef({ chart: null, candle: null, vol: null, live: null });
  const basePriceRef = useRef(basePrice);

  // Keep basePriceRef current without triggering re-effects
  useEffect(() => { basePriceRef.current = basePrice; }, [basePrice]);

  // Create / recreate chart when symbol changes
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: '#0b0d0f' },
        textColor: 'rgba(255,255,255,0.35)',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.028)' },
        horzLines: { color: 'rgba(255,255,255,0.028)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'rgba(59,130,246,0.3)',
          labelBackgroundColor: '#1e2025',
          width: 1,
          style: 3,
        },
        horzLine: {
          color: 'rgba(59,130,246,0.3)',
          labelBackgroundColor: '#1e2025',
          width: 1,
          style: 3,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.07)',
        scaleMargins: { top: 0.08, bottom: 0.24 },
        textColor: 'rgba(255,255,255,0.35)',
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.07)',
        textColor: 'rgba(255,255,255,0.35)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 8,
        barSpacing: 10,
      },
    });

    // Candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#1ea774',
      downColor: '#d44333',
      borderUpColor: '#1ea774',
      borderDownColor: '#d44333',
      wickUpColor: 'rgba(16,185,129,0.7)',
      wickDownColor: 'rgba(239,68,68,0.7)',
    });

    // Volume histogram on a separate price scale
    const volSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
      color: 'rgba(255,255,255,0.15)',
    });
    chart.priceScale('vol').applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    // Build initial data — 100 one-hour candles ending at the current rounded hour
    const nowSec = Math.floor(Date.now() / 1000);
    const endTime = Math.floor(nowSec / CANDLE_INTERVAL) * CANDLE_INTERVAL;
    const COUNT = 100;
    const initialPrice = basePriceRef.current;
    const rawCandles = generateCandleData(initialPrice, COUNT);

    const cData = rawCandles.map((c, i) => ({
      time: endTime - (COUNT - i) * CANDLE_INTERVAL,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    const vData = rawCandles.map((c, i) => ({
      time: endTime - (COUNT - i) * CANDLE_INTERVAL,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)',
    }));

    candleSeries.setData(cData);
    volSeries.setData(vData);
    chart.timeScale().fitContent();

    const lastBar = cData[cData.length - 1];

    stateRef.current = {
      chart,
      candle: candleSeries,
      vol: volSeries,
      live: { bar: { ...lastBar }, tickCount: 0 },
    };

    return () => {
      chart.remove();
      stateRef.current = { chart: null, candle: null, vol: null, live: null };
    };
  }, [symbol]); // Recreate only on symbol change

  // Live tick simulation — runs once, reads latest data via refs
  useEffect(() => {
    const id = setInterval(() => {
      const { candle, vol, live } = stateRef.current;
      if (!candle || !live) return;

      const bp = basePriceRef.current;
      const volatility = bp * 0.0022;
      const prevClose = live.bar.close;
      const newClose = prevClose + (Math.random() - 0.49) * volatility;

      live.tickCount++;

      if (live.tickCount >= 18) {
        // Advance to a fresh candle
        live.bar = {
          time: live.bar.time + CANDLE_INTERVAL,
          open: prevClose,
          high: Math.max(prevClose, newClose) + Math.random() * volatility * 0.5,
          low: Math.min(prevClose, newClose) - Math.random() * volatility * 0.5,
          close: newClose,
        };
        live.tickCount = 0;
      } else {
        // Update current candle
        live.bar = {
          ...live.bar,
          high: Math.max(live.bar.high, newClose),
          low: Math.min(live.bar.low, newClose),
          close: newClose,
        };
      }

      try {
        candle.update(live.bar);
        vol?.update({
          time: live.bar.time,
          value: Math.random() * 450 + 80,
          color: live.bar.close >= live.bar.open
            ? 'rgba(16,185,129,0.35)'
            : 'rgba(239,68,68,0.35)',
        });
      } catch (_) { /* ignore stale-series errors during symbol switch */ }
    }, 1500);

    return () => clearInterval(id);
  }, []); // Never re-create this interval

  return (
    <div className="relative w-full h-full" style={{ minHeight: 220 }}>
      <div ref={containerRef} className="w-full h-full" />
      {/* Subtle watermark */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none select-none">
        <div className="w-5 h-5 rounded flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#6D28D9,#3B82F6)' }}>
          <span className="text-black font-black text-xs">P</span>
        </div>
        <span className="text-white/15 text-xs font-semibold tracking-wider">PLUS TRADE</span>
        <span className="text-white/10 text-xs">• SIMULATED</span>
      </div>
    </div>
  );
}
