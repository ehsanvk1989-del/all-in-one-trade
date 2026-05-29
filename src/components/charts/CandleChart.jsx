import React, { useEffect, useRef, useState, useCallback } from 'react';
import { generateCandleData } from '../../utils/mockData';

export default function CandleChart({ symbol, basePrice, height = 280 }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [candles, setCandles] = useState([]);

  useEffect(() => {
    const initial = generateCandleData(basePrice, 60);
    setCandles(initial);

    const interval = setInterval(() => {
      setCandles(prev => {
        const last = prev[prev.length - 1];
        const vol = basePrice * 0.003;
        const newClose = last.close + (Math.random() - 0.5) * vol;
        const newCandle = {
          time: Date.now(),
          open: last.close,
          high: Math.max(last.close, newClose) + Math.random() * vol * 0.5,
          low: Math.min(last.close, newClose) - Math.random() * vol * 0.5,
          close: newClose,
          volume: Math.floor(Math.random() * 800 + 100),
        };
        return [...prev.slice(-59), newCandle];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [symbol, basePrice]);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const padLeft = 8;
    const padRight = 55;
    const padTop = 10;
    const padBottom = 24;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    const prices = candles.flatMap(c => [c.high, c.low]);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;

    const toY = (p) => padTop + (1 - (p - minP) / range) * (H - padTop - padBottom);
    const chartW = W - padLeft - padRight;
    const candleW = Math.max(3, chartW / candles.length - 1.5);

    // Grid lines
    const gridCount = 5;
    for (let i = 0; i <= gridCount; i++) {
      const y = padTop + (i / gridCount) * (H - padTop - padBottom);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(W - padRight, y);
      ctx.stroke();

      // Price labels
      const price = maxP - (i / gridCount) * range;
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        price >= 1000 ? price.toFixed(0) : price >= 1 ? price.toFixed(2) : price.toFixed(4),
        W - padRight + 4,
        y + 3
      );
    }

    // Candles
    candles.forEach((c, i) => {
      const x = padLeft + (i / candles.length) * chartW;
      const isGreen = c.close >= c.open;
      const color = isGreen ? '#1ea774' : '#d44333';

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleW / 2, toY(c.high));
      ctx.lineTo(x + candleW / 2, toY(c.low));
      ctx.stroke();

      // Body
      const bodyTop = toY(Math.max(c.open, c.close));
      const bodyBot = toY(Math.min(c.open, c.close));
      const bodyH = Math.max(1, bodyBot - bodyTop);

      ctx.fillStyle = color;
      ctx.globalAlpha = isGreen ? 0.85 : 0.85;
      ctx.fillRect(x, bodyTop, candleW, bodyH);
      ctx.globalAlpha = 1;
    });

    // Last price line
    if (candles.length > 0) {
      const lastClose = candles[candles.length - 1].close;
      const y = toY(lastClose);
      ctx.strokeStyle = 'rgba(59,130,246,0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(W - padRight, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price label
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(W - padRight, y - 8, padRight, 16);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        lastClose >= 1000 ? lastClose.toFixed(0) : lastClose.toFixed(2),
        W - padRight / 2,
        y + 3
      );
    }

  }, [candles]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => drawChart());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawChart]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: height === '100%' ? '100%' : height, minHeight: 220 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        style={{ display: 'block' }}
      />
      {candles.length > 0 && (
        <div className="absolute top-2 left-2 text-xs font-mono text-white/30">
          {symbol} • 1H • Simulated
        </div>
      )}
    </div>
  );
}
