import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, ChevronRight, Check, Shield, Globe, BarChart2,
  TrendingUp, TrendingDown, Activity, Layers, Lock, Award,
  Users, LineChart, Zap, Menu, X, Clock
} from 'lucide-react';

/* ─── Styles injected once ──────────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('lp-styles')) {
  const s = document.createElement('style');
  s.id = 'lp-styles';
  s.textContent = `
    :root {
      --lp-bg:     #07080c;
      --lp-surf:   #0e1018;
      --lp-card:   #13151f;
      --lp-border: rgba(255,255,255,0.07);
      --lp-gold:   #c9a84c;
      --lp-goldl:  #e2c168;
      --lp-text1:  #f0ede8;
      --lp-text2:  rgba(240,237,232,0.58);
      --lp-text3:  rgba(240,237,232,0.30);
      --lp-green:  #1ea774;
      --lp-red:    #d44333;
    }
    @keyframes lpFadeUp   { from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);} }
    @keyframes lpFadeLeft { from{opacity:0;transform:translateX(-28px);}to{opacity:1;transform:translateX(0);} }
    @keyframes lpFadeRight{ from{opacity:0;transform:translateX(28px);}to{opacity:1;transform:translateX(0);} }
    @keyframes lpFloat    { 0%,100%{transform:translateY(0);}50%{transform:translateY(-7px);} }
    @keyframes lpFloatAlt { 0%,100%{transform:translateY(-5px);}50%{transform:translateY(5px);} }
    @keyframes lpGridMove { 0%{background-position:0 0;}100%{background-position:60px 60px;} }
    @keyframes lpTick     { 0%{transform:translateX(0);}100%{transform:translateX(-50%);} }
    @keyframes lpBlink    { 0%,100%{opacity:1;}50%{opacity:0.25;} }
    @keyframes lpPriceUp  { 0%,100%{color:#1ea774;}50%{color:#42c98e;} }
    @keyframes lpPriceDn  { 0%,100%{color:#d44333;}50%{color:#e06b5e;} }
    @keyframes lpChartDraw{ from{stroke-dashoffset:800;opacity:0;}to{stroke-dashoffset:0;opacity:1;} }
    @keyframes lpScan     { 0%{top:0;opacity:0.5;}100%{top:100%;opacity:0;} }
    @keyframes lpBarGrow  { from{height:0;}to{height:var(--bh);} }
    .lp-reveal     { opacity:0; }
    .lp-reveal.vis { animation:lpFadeUp   0.65s cubic-bezier(.16,1,.3,1) forwards; }
    .lp-reveal-l   { opacity:0; }
    .lp-reveal-l.vis{ animation:lpFadeLeft 0.65s cubic-bezier(.16,1,.3,1) forwards; }
    .lp-reveal-r   { opacity:0; }
    .lp-reveal-r.vis{ animation:lpFadeRight 0.65s cubic-bezier(.16,1,.3,1) forwards; }
    .lp-d0{animation-delay:0s;} .lp-d1{animation-delay:0.1s;} .lp-d2{animation-delay:0.2s;}
    .lp-d3{animation-delay:0.3s;} .lp-d4{animation-delay:0.4s;} .lp-d5{animation-delay:0.5s;}
    @media(max-width:900px){
      .lp-2col{grid-template-columns:1fr!important;}
      .lp-3col{grid-template-columns:1fr!important;}
      .lp-hide-mobile{display:none!important;}
    }
    @media(max-width:600px){
      .lp-hero-ctas{flex-direction:column!important;}
    }
  `;
  document.head.appendChild(s);
}

/* ─── Hooks ─────────────────────────────────────────────────────────────────── */
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

const TICKER_BASE = [
  { sym: 'EUR/USD',  p: 1.0824,   c: -0.12 },
  { sym: 'GBP/USD',  p: 1.2652,   c:  0.08 },
  { sym: 'USD/JPY',  p: 154.32,   c:  0.21 },
  { sym: 'XAU/USD',  p: 4502.40,  c:  0.45 },
  { sym: 'BTC/USDT', p: 75241.50, c:  2.34 },
  { sym: 'ETH/USDT', p: 3521.80,  c:  1.87 },
  { sym: 'WTI',      p: 93.78,    c: -0.67 },
  { sym: 'S&P 500',  p: 5285.50,  c:  0.38 },
];

function useTicker() {
  const [tickers, setTickers] = useState(TICKER_BASE);
  useEffect(() => {
    const id = setInterval(() => setTickers(p => p.map(t => ({
      ...t,
      p: t.p * (1 + (Math.random() - 0.5) * 0.0006),
      c: +(t.c + (Math.random() - 0.5) * 0.03).toFixed(2),
    }))), 2400);
    return () => clearInterval(id);
  }, []);
  return tickers;
}

/* ─── Logo ──────────────────────────────────────────────────────────────────── */
function Logo({ size = 'md' }) {
  const s = size === 'sm' ? { box: 28, txt: 12, name: 12 } : { box: 36, txt: 15, name: 14 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: s.box, height: s.box, borderRadius: 8, background: 'linear-gradient(135deg,#9a7a35,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: '#07080c', fontWeight: 900, fontSize: s.txt }}>P</span>
      </div>
      <div>
        <div style={{ background: 'linear-gradient(135deg,#e2c168,#c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 800, fontSize: s.name, letterSpacing: '0.12em' }}>PLUS TRADE</div>
        <div style={{ color: 'rgba(240,237,232,0.28)', fontSize: 9, letterSpacing: '0.1em' }}>REGULATED BROKER</div>
      </div>
    </div>
  );
}

/* ─── Navbar ────────────────────────────────────────────────────────────────── */
function Navbar({ onEnter, scrolled }) {
  const [mOpen, setMOpen] = useState(false);
  const links = [
    { label: 'Markets',   href: '#markets'   },
    { label: 'Platform',  href: '#platform'  },
    { label: 'Features',  href: '#features'  },
    { label: 'About',     href: '#vision'    },
  ];
  const go = (id) => { document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' }); setMOpen(false); };

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(7,8,12,0.97)' : 'transparent',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
    }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 32px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <Logo />

        <div className="lp-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map(l => (
            <button key={l.label} onClick={() => go(l.href)}
              style={{ background: 'none', border: 'none', color: 'rgba(240,237,232,0.55)', fontSize: 13.5, fontWeight: 500, padding: '6px 14px', cursor: 'pointer', borderRadius: 6, transition: 'all 0.18s', letterSpacing: '0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f0ede8'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,237,232,0.55)'; e.currentTarget.style.background = 'none'; }}>
              {l.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="lp-hide-mobile" onClick={onEnter}
            style={{ background: 'none', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 7, padding: '7px 18px', color: '#c9a84c', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.02em' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.10)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'; }}>
            Sign In
          </button>
          <button onClick={onEnter}
            style={{ background: 'linear-gradient(135deg,#c9a84c,#e2c168)', border: 'none', borderRadius: 7, padding: '8px 20px', color: '#07080c', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', boxShadow: '0 2px 12px rgba(201,168,76,0.2)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(201,168,76,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(201,168,76,0.2)'; }}>
            Open Account <ArrowRight size={13} />
          </button>
          <button onClick={() => setMOpen(v => !v)} style={{ display: 'none', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '7px', cursor: 'pointer', color: '#f0ede8' }} className="lp-show-mobile">
            {mOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>
      {mOpen && (
        <div style={{ background: '#0c0d13', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 24px 18px' }}>
          {links.map(l => <button key={l.label} onClick={() => go(l.href)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'rgba(240,237,232,0.7)', fontSize: 15, fontWeight: 500, padding: '10px 0', cursor: 'pointer' }}>{l.label}</button>)}
          <button onClick={onEnter} style={{ marginTop: 8, width: '100%', padding: '11px', background: 'linear-gradient(135deg,#c9a84c,#e2c168)', border: 'none', borderRadius: 8, color: '#07080c', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Open Account</button>
        </div>
      )}
    </nav>
  );
}

/* ─── Market Ticker Bar ─────────────────────────────────────────────────────── */
function TickerBar({ tickers }) {
  const fmt = t => t.p >= 10000 ? t.p.toFixed(2) : t.p >= 100 ? t.p.toFixed(2) : t.p >= 1 ? t.p.toFixed(4) : t.p.toFixed(5);
  return (
    <div style={{ background: 'rgba(0,0,0,0.45)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', padding: '7px 0' }}>
      <div style={{ display: 'inline-flex', whiteSpace: 'nowrap', animation: 'lpTick 30s linear infinite' }}>
        {[...tickers, ...tickers].map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 20px', fontSize: 11.5 }}>
            <span style={{ color: 'rgba(240,237,232,0.36)', fontWeight: 500 }}>{t.sym}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: t.c >= 0 ? '#1ea774' : '#d44333', fontSize: 11.5 }}>{fmt(t)}</span>
            <span style={{ fontSize: 10, color: t.c >= 0 ? '#1ea774' : '#d44333' }}>{t.c >= 0 ? '▲' : '▼'} {Math.abs(t.c).toFixed(2)}%</span>
            <span style={{ color: 'rgba(255,255,255,0.06)', marginLeft: 2 }}>│</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Hero Section ──────────────────────────────────────────────────────────── */
function HeroSection({ onEnter, tickers }) {
  const btc = tickers.find(t => t.sym === 'BTC/USDT') || TICKER_BASE[4];
  const gold = tickers.find(t => t.sym === 'XAU/USD') || TICKER_BASE[3];
  const eur = tickers.find(t => t.sym === 'EUR/USD') || TICKER_BASE[0];

  return (
    <section style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'var(--lp-bg)', display: 'flex', alignItems: 'center', paddingTop: 66 }}>
      {/* Subtle grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.018, backgroundImage: 'linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)', backgroundSize: '64px 64px', animation: 'lpGridMove 30s linear infinite' }} />
      {/* Subtle radial light */}
      <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 60%)', top: '50%', left: '40%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
      {/* Bottom fade */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to bottom, transparent, var(--lp-bg))', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1240, margin: '0 auto', width: '100%', padding: '80px 40px', position: 'relative', zIndex: 2 }} className="lp-2col" >
        <div className="lp-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>

          {/* Left: headline */}
          <div>
            {/* Regulated badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: 4, padding: '5px 14px', marginBottom: 28, animation: 'lpFadeUp 0.55s ease forwards' }}>
              <Shield size={11} style={{ color: '#c9a84c' }} />
              <span style={{ color: '#c9a84c', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em' }}>MULTI-ASSET TRADING PLATFORM</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.4rem,4.2vw,3.6rem)', fontWeight: 800, color: '#f0ede8', lineHeight: 1.1, marginBottom: 22, opacity: 0, animation: 'lpFadeUp 0.6s ease 0.08s forwards', letterSpacing: '-0.01em' }}>
              Trade Every Market<br />
              <span style={{ background: 'linear-gradient(135deg,#e2c168,#c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>With One Account</span>
            </h1>

            <p style={{ fontSize: 16.5, color: 'rgba(240,237,232,0.52)', lineHeight: 1.72, maxWidth: 480, marginBottom: 38, opacity: 0, animation: 'lpFadeUp 0.6s ease 0.16s forwards' }}>
              Access forex, commodities, indices, and crypto through a unified premium platform. Institutional-grade tools. Demo execution. Real market data.
            </p>

            <div className="lp-hero-ctas" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', opacity: 0, animation: 'lpFadeUp 0.6s ease 0.24s forwards' }}>
              <button onClick={onEnter}
                style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#c9a84c,#e2c168)', border: 'none', borderRadius: 7, color: '#07080c', fontWeight: 800, fontSize: 14.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.22s', boxShadow: '0 4px 18px rgba(201,168,76,0.25)', letterSpacing: '0.01em' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(201,168,76,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 18px rgba(201,168,76,0.25)'; }}>
                Start Trading Free
              </button>
              <button onClick={() => document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ padding: '13px 26px', background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 7, color: 'rgba(240,237,232,0.78)', fontWeight: 500, fontSize: 14.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.22s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = ''; }}>
                Explore Platform <ChevronRight size={15} />
              </button>
            </div>

            {/* Trust signals */}
            <div style={{ display: 'flex', gap: 24, marginTop: 44, opacity: 0, animation: 'lpFadeUp 0.6s ease 0.36s forwards', flexWrap: 'wrap' }}>
              {[['50+','Global Markets'],['$2.4B+','Daily Volume'],['150K+','Active Traders'],['99.9%','Platform Uptime']].map(([v,l]) => (
                <div key={l} style={{ borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: 24, lastChild: { borderRight: 'none' } }}>
                  <div style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg,#e2c168,#c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.1 }}>{v}</div>
                  <div style={{ color: 'rgba(240,237,232,0.32)', fontSize: 11.5, marginTop: 3, letterSpacing: '0.02em' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Market data widget */}
          <div className="lp-hide-mobile" style={{ display: 'flex', justifyContent: 'center', opacity: 0, animation: 'lpFadeRight 0.7s ease 0.22s forwards' }}>
            <HeroWidget tickers={tickers} btc={btc} gold={gold} eur={eur} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroWidget({ tickers, btc, gold, eur }) {
  const chartPath = 'M 0,72 C 18,64 30,70 50,52 S 84,36 104,46 S 140,28 162,34 S 198,16 222,12 L 268,8';
  const rows = [
    { sym: 'BTC/USDT', icon: '₿', p: btc.p, c: btc.c, dp: 2 },
    { sym: 'XAU/USD',  icon: '🥇', p: gold.p, c: gold.c, dp: 2 },
    { sym: 'EUR/USD',  icon: '€',  p: eur.p,  c: eur.c,  dp: 4 },
    ...tickers.filter(t => t.sym === 'GBP/USD' || t.sym === 'USD/JPY').map(t => ({ sym: t.sym, icon: t.sym === 'GBP/USD' ? '£' : '¥', p: t.p, c: t.c, dp: t.sym === 'USD/JPY' ? 2 : 4 })),
  ];

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 430 }}>
      {/* Main panel */}
      <div style={{ background: 'var(--lp-card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.7)', animation: 'lpFloat 8s ease-in-out infinite' }}>
        {/* Header */}
        <div style={{ padding: '11px 16px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={13} style={{ color: '#c9a84c' }} />
            <span style={{ color: 'rgba(240,237,232,0.5)', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em' }}>MARKET WATCH · LIVE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1ea774', animation: 'lpBlink 2s ease-in-out infinite' }} />
            <span style={{ color: '#1ea774', fontSize: 10, fontWeight: 600 }}>CONNECTED</span>
          </div>
        </div>

        {/* Chart area */}
        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '6px 0 0', position: 'relative', overflow: 'hidden', height: 100 }}>
          <div style={{ padding: '4px 14px 2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: 'rgba(240,237,232,0.35)', fontSize: 9, letterSpacing: '0.1em' }}>BTC/USDT</span>
              <div style={{ color: '#1ea774', fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, lineHeight: 1.1, animation: 'lpPriceUp 2.5s ease-in-out infinite' }}>{btc.p.toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'rgba(240,237,232,0.28)', fontSize: 9 }}>24H CHANGE</span>
              <div style={{ color: '#1ea774', fontSize: 13, fontWeight: 700 }}>+{Math.abs(btc.c).toFixed(2)}%</div>
            </div>
          </div>
          <svg width="100%" height="55" viewBox="0 0 270 55" preserveAspectRatio="none" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="hfill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1ea774" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#1ea774" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={chartPath + ' L 268,55 L 0,55 Z'} fill="url(#hfill)" />
            <path d={chartPath} fill="none" stroke="#1ea774" strokeWidth="1.5"
              style={{ strokeDasharray: 800, strokeDashoffset: 800, animation: 'lpChartDraw 2.5s ease forwards 0.5s' }} />
          </svg>
          <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(30,167,116,0.3),transparent)', animation: 'lpScan 4s linear infinite' }} />
        </div>

        {/* Market rows */}
        <div>
          {rows.map((r, i) => (
            <div key={r.sym} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: i === 0 ? 'rgba(201,168,76,0.04)' : 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontSize: 14 }}>{r.icon}</span>
                <div>
                  <div style={{ color: i === 0 ? '#f0ede8' : 'rgba(240,237,232,0.6)', fontSize: 11.5, fontWeight: 600 }}>{r.sym}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, fontWeight: 600, color: '#f0ede8' }}>{r.p.toFixed(r.dp)}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: r.c >= 0 ? '#1ea774' : '#d44333' }}>{r.c >= 0 ? '+' : ''}{r.c.toFixed(2)}%</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer bar */}
        <div style={{ padding: '9px 16px', background: 'rgba(201,168,76,0.05)', borderTop: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(240,237,232,0.35)', fontSize: 10 }}>50+ instruments available</span>
          <span style={{ color: '#c9a84c', fontSize: 10, fontWeight: 600 }}>View All Markets →</span>
        </div>
      </div>

      {/* Secondary floating card */}
      <div style={{ position: 'absolute', bottom: -16, right: -24, background: 'var(--lp-card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', animation: 'lpFloatAlt 9s ease-in-out infinite', zIndex: 2 }}>
        <div style={{ color: 'rgba(240,237,232,0.3)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Account Equity</div>
        <div style={{ color: '#e2c168', fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700 }}>$14,322.50</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
          <TrendingUp size={10} style={{ color: '#1ea774' }} />
          <span style={{ color: '#1ea774', fontSize: 10, fontWeight: 600 }}>+$1,842.50 today</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Section: Markets ──────────────────────────────────────────────────────── */
function MarketsSection({ tickers }) {
  const [hRef, hVis] = useReveal();
  const instruments = [
    { cat: 'Crypto', count: '4 pairs', items: ['BTC/USDT','ETH/USDT','SOL/USDT','DOGE/USDT'], icon: '₿', source: 'Binance WS' },
    { cat: 'Forex',  count: '4 pairs', items: ['EUR/USD','GBP/USD','USD/JPY','AUD/USD'],      icon: '💱', source: 'TwelveData' },
    { cat: 'Commodities', count: '2 markets', items: ['XAU/USD (Gold)','WTI Crude Oil'],       icon: '🥇', source: 'TwelveData' },
    { cat: 'CFDs',   count: 'Demo mode', items: ['Indices CFDs','Stock CFDs','ETF CFDs'],       icon: '📊', source: 'Simulated' },
  ];

  return (
    <section id="markets" style={{ background: '#0a0b10', padding: '100px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.15),transparent)' }} />
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px' }}>
        <div ref={hRef} className={`lp-reveal ${hVis ? 'vis' : ''}`} style={{ marginBottom: 56 }}>
          <div style={{ color: 'var(--lp-gold)', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>GLOBAL MARKETS</div>
          <div className="lp-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'flex-end' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 800, color: '#f0ede8', lineHeight: 1.15, margin: 0, letterSpacing: '-0.01em' }}>
              All Your Markets,<br />One Platform
            </h2>
            <p style={{ color: 'rgba(240,237,232,0.48)', fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
              Trade the world's most liquid markets through a unified account. Real market data from institutional-grade sources.
            </p>
          </div>
        </div>

        {/* Live ticker preview */}
        <div style={{ background: 'var(--lp-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden', marginBottom: 32 }}>
          <div style={{ padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1ea774', animation: 'lpBlink 2s infinite' }} />
              <span style={{ color: 'rgba(240,237,232,0.38)', fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>LIVE MARKET RATES</span>
            </div>
            <span style={{ color: 'rgba(240,237,232,0.25)', fontSize: 10 }}>Updated in real-time</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="lp-2col">
            {tickers.slice(0, 4).map((t, i) => {
              const fmt = t.p >= 100 ? t.p.toFixed(2) : t.p.toFixed(4);
              return (
                <div key={t.sym} style={{ padding: '16px 18px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ color: 'rgba(240,237,232,0.36)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 4 }}>{t.sym}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 17, fontWeight: 700, color: '#f0ede8', lineHeight: 1 }}>{fmt}</div>
                  <div style={{ color: t.c >= 0 ? '#1ea774' : '#d44333', fontSize: 11, fontWeight: 600, marginTop: 4 }}>{t.c >= 0 ? '▲' : '▼'} {Math.abs(t.c).toFixed(2)}%</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }} className="lp-2col">
            {tickers.slice(4, 8).map((t, i) => {
              const fmt = t.p >= 100 ? t.p.toFixed(2) : t.p.toFixed(4);
              return (
                <div key={t.sym} style={{ padding: '14px 18px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ color: 'rgba(240,237,232,0.36)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 4 }}>{t.sym}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 600, color: 'rgba(240,237,232,0.75)' }}>{fmt}</div>
                  <div style={{ color: t.c >= 0 ? '#1ea774' : '#d44333', fontSize: 10, fontWeight: 600, marginTop: 3 }}>{t.c >= 0 ? '+' : ''}{t.c.toFixed(2)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instrument categories */}
        <div className="lp-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {instruments.map((inst, idx) => (
            <MarketCatCard key={inst.cat} inst={inst} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketCatCard({ inst, idx }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} className={`lp-reveal lp-d${idx} ${vis ? 'vis' : ''}`}
      style={{ background: 'var(--lp-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '20px', transition: 'all 0.25s ease', cursor: 'default' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; e.currentTarget.style.background = 'rgba(201,168,76,0.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'var(--lp-card)'; }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{inst.icon}</span>
        <span style={{ background: 'var(--lp-surf)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: '2px 8px', color: 'rgba(240,237,232,0.38)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em' }}>{inst.source}</span>
      </div>
      <div style={{ color: '#f0ede8', fontWeight: 700, fontSize: 14.5, marginBottom: 3 }}>{inst.cat}</div>
      <div style={{ color: '#c9a84c', fontSize: 10, fontWeight: 600, marginBottom: 12 }}>{inst.count}</div>
      {inst.items.map(item => (
        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(201,168,76,0.5)', flexShrink: 0 }} />
          <span style={{ color: 'rgba(240,237,232,0.45)', fontSize: 12 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Section: Platform ─────────────────────────────────────────────────────── */
function PlatformSection({ onEnter }) {
  const [hRef, hVis] = useReveal();
  const platforms = [
    {
      id: 'simple', name: 'Simple Trade', tag: 'MOST POPULAR',
      desc: 'A clean, one-click trading experience for major assets. Designed for traders who value speed and simplicity with a premium feel.',
      icon: Zap, color: '#c9a84c',
      features: ['One-click execution', 'Live P&L display', 'Up to 20x leverage', 'Gold, Crypto & Forex'],
    },
    {
      id: 'crypto', name: 'Crypto Futures', tag: 'PROFESSIONAL',
      desc: 'Professional-grade crypto futures terminal with real Binance prices, TradingView charts, and advanced order management.',
      icon: BarChart2, color: '#5b8dee',
      features: ['Real Binance WebSocket prices', 'TradingView live charts', 'Liquidation price tracking', 'Up to 100x leverage'],
    },
    {
      id: 'forex', name: 'Forex & Commodities', tag: 'INSTITUTIONAL',
      desc: 'Institutional broker-grade terminal for forex and commodity trading with real market data and embedded TradingView charts.',
      icon: LineChart, color: '#1ea774',
      features: ['Real TwelveData prices', 'Embedded TradingView charts', 'Major pairs & commodities', 'Professional spread display'],
    },
  ];

  return (
    <section id="platform" style={{ background: 'var(--lp-bg)', padding: '100px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.12),transparent)' }} />
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px' }}>
        <div ref={hRef} className={`lp-reveal ${hVis ? 'vis' : ''}`} style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ color: 'var(--lp-gold)', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>TRADING MODULES</div>
          <h2 style={{ fontSize: 'clamp(1.9rem,3.6vw,2.9rem)', fontWeight: 800, color: '#f0ede8', marginBottom: 16, lineHeight: 1.18, letterSpacing: '-0.01em' }}>
            Three Professional<br />
            <span style={{ background: 'linear-gradient(135deg,#e2c168,#c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Trading Environments</span>
          </h2>
          <p style={{ color: 'rgba(240,237,232,0.45)', fontSize: 15.5, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Each module is purpose-built for its market. One account, three distinct professional experiences.
          </p>
        </div>

        <div className="lp-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {platforms.map((p, i) => <PlatformCard key={p.id} p={p} idx={i} onEnter={onEnter} />)}
        </div>
      </div>
    </section>
  );
}

function PlatformCard({ p, idx, onEnter }) {
  const [ref, vis] = useReveal();
  const Icon = p.icon;
  return (
    <div ref={ref} className={`lp-reveal lp-d${idx} ${vis ? 'vis' : ''}`}>
      <div style={{ background: 'var(--lp-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '28px', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.25s ease', cursor: 'default' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = `${p.color}30`; e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4)`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: `${p.color}18`, border: `1px solid ${p.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} style={{ color: p.color }} />
          </div>
          <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '3px 8px', color: p.color, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>{p.tag}</span>
        </div>

        <h3 style={{ color: '#f0ede8', fontWeight: 700, fontSize: 17.5, marginBottom: 10, letterSpacing: '-0.01em' }}>{p.name}</h3>
        <p style={{ color: 'rgba(240,237,232,0.45)', fontSize: 13.5, lineHeight: 1.68, marginBottom: 20, flex: 1 }}>{p.desc}</p>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px' }}>
          {p.features.map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: `${p.color}18`, border: `1px solid ${p.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={8} style={{ color: p.color }} />
              </div>
              <span style={{ color: 'rgba(240,237,232,0.5)', fontSize: 12.5 }}>{f}</span>
            </li>
          ))}
        </ul>

        <button onClick={onEnter}
          style={{ width: '100%', padding: '10px', background: `${p.color}0e`, border: `1px solid ${p.color}28`, borderRadius: 8, color: p.color, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = `${p.color}1c`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${p.color}0e`; }}>
          Open {p.name} <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

/* ─── Section: Features / Why Us ────────────────────────────────────────────── */
function FeaturesSection() {
  const [hRef, hVis] = useReveal();
  const features = [
    { icon: Activity,  color: '#1ea774', title: 'Real-Time Market Data',    desc: 'Binance WebSocket for crypto prices. TwelveData API for forex and commodities. Zero simulated prices in market feeds.' },
    { icon: BarChart2, color: '#5b8dee', title: 'TradingView Integration',  desc: 'Embedded TradingView widgets with institutional-quality candlestick charts accurately reflecting selected instruments.' },
    { icon: Shield,    color: '#c9a84c', title: 'Demo-Safe Execution',      desc: 'All order execution is fully simulated. No real funds required. Perfect for demos, validation, and investor presentations.' },
    { icon: Globe,     color: '#1ea774', title: 'Multi-Asset Coverage',     desc: 'Trade crypto futures, forex majors, gold, crude oil, and simplified markets through one unified account.' },
    { icon: Lock,      color: '#c9a84c', title: 'Professional Architecture',desc: 'React 18 + Vite + Tailwind. Real-time context state, localStorage persistence, WebSocket price service.' },
    { icon: Award,     color: '#5b8dee', title: 'Investor-Grade UI',        desc: 'Institutional dark luxury design. Clean surfaces, refined typography, professional spacing — no neon or gaming aesthetics.' },
  ];

  return (
    <section id="features" style={{ background: '#0a0b10', padding: '100px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.12),transparent)' }} />
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px' }}>
        <div ref={hRef} className={`lp-reveal ${hVis ? 'vis' : ''}`} style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ color: 'var(--lp-gold)', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>WHY PLUS TRADE</div>
          <h2 style={{ fontSize: 'clamp(1.9rem,3.6vw,2.9rem)', fontWeight: 800, color: '#f0ede8', marginBottom: 16, lineHeight: 1.18, letterSpacing: '-0.01em' }}>
            Built for Performance,<br />
            <span style={{ background: 'linear-gradient(135deg,#e2c168,#c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Designed for Professionals</span>
          </h2>
        </div>

        <div className="lp-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return <FeatureCard key={f.title} f={f} Icon={Icon} idx={i} />;
          })}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ f, Icon, idx }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} className={`lp-reveal lp-d${idx % 3} ${vis ? 'vis' : ''}`}>
      <div style={{ background: 'var(--lp-card)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '24px', height: '100%', transition: 'all 0.25s ease' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}28`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = ''; }}>
        <div style={{ width: 40, height: 40, borderRadius: 9, background: `${f.color}14`, border: `1px solid ${f.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon size={18} style={{ color: f.color }} />
        </div>
        <h3 style={{ color: '#f0ede8', fontWeight: 700, fontSize: 14.5, marginBottom: 8, letterSpacing: '-0.005em' }}>{f.title}</h3>
        <p style={{ color: 'rgba(240,237,232,0.42)', fontSize: 13, lineHeight: 1.65 }}>{f.desc}</p>
      </div>
    </div>
  );
}

/* ─── Section: Vision ───────────────────────────────────────────────────────── */
function VisionSection({ onEnter }) {
  const [lRef, lVis] = useReveal();
  const [rRef, rVis] = useReveal();

  return (
    <section id="vision" style={{ background: 'var(--lp-bg)', padding: '100px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.12),transparent)' }} />
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px' }}>
        <div className="lp-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

          {/* Left */}
          <div ref={lRef} className={`lp-reveal-l ${lVis ? 'vis' : ''}`}>
            <div style={{ color: 'var(--lp-gold)', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 16 }}>INVESTOR VISION</div>
            <h2 style={{ fontSize: 'clamp(1.9rem,3.5vw,2.8rem)', fontWeight: 800, color: '#f0ede8', lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.01em' }}>
              A Funded Multi-Asset<br />
              <span style={{ background: 'linear-gradient(135deg,#e2c168,#c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Trading Platform</span>
            </h2>
            <p style={{ color: 'rgba(240,237,232,0.50)', fontSize: 15.5, lineHeight: 1.72, marginBottom: 32 }}>
              Plus Trade is designed to compete visually and functionally with regulated global brokers. A unified premium product concept built for demo validation, investor confidence, and future backend integration.
            </p>

            {[
              { icon: Layers, c: '#c9a84c', t: 'Unified Multi-Market', d: 'One platform covering crypto, forex, commodities, and simplified trading — each with distinct professional UX.' },
              { icon: Users,  c: '#1ea774', t: 'Scalable Architecture', d: 'React 18 + real-time data layer. Ready for backend integration: KYC, execution, custody, risk management.' },
              { icon: Globe,  c: '#5b8dee', t: 'Multi-Segment Market', d: 'Serves retail traders, institutions, and premium gaming-adjacent users through purpose-designed experiences.' },
            ].map(({ icon: Icon, c, t, d }) => (
              <div key={t} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${c}12`, border: `1px solid ${c}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Icon size={15} style={{ color: c }} />
                </div>
                <div>
                  <div style={{ color: '#f0ede8', fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>{t}</div>
                  <div style={{ color: 'rgba(240,237,232,0.38)', fontSize: 13, lineHeight: 1.6 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: stats panel */}
          <div ref={rRef} className={`lp-reveal-r ${rVis ? 'vis' : ''}`}>
            <div style={{ background: 'var(--lp-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', animation: 'lpFloat 10s ease-in-out infinite' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1ea774' }} />
                <span style={{ color: 'rgba(240,237,232,0.35)', fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>PLATFORM METRICS</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                {[['50+','Global Instruments'],['$0','Real Funds at Risk'],['3','Trading Modules'],['100%','Demo Ready']].map(([v,l],i) => (
                  <div key={l} style={{ padding: '18px 20px', borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,#e2c168,#c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>{v}</div>
                    <div style={{ color: 'rgba(240,237,232,0.35)', fontSize: 11.5, marginTop: 5 }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'rgba(240,237,232,0.28)', fontSize: 10, letterSpacing: '0.1em', marginBottom: 10, textTransform: 'uppercase', fontWeight: 600 }}>Tech Stack</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['React 18','Vite','Tailwind CSS','Recharts','Binance WS','TwelveData','TradingView'].map(t => (
                    <span key={t} style={{ padding: '3px 9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, color: 'rgba(240,237,232,0.48)', fontSize: 11, fontWeight: 500 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section: Final CTA ────────────────────────────────────────────────────── */
function CTASection({ onEnter }) {
  const [ref, vis] = useReveal();
  return (
    <section id="cta" style={{ background: '#0a0b10', padding: '100px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.18),transparent)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.04) 0%, transparent 55%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div ref={ref} className={`lp-reveal ${vis ? 'vis' : ''}`}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(30,167,116,0.08)', border: '1px solid rgba(30,167,116,0.2)', borderRadius: 4, padding: '5px 14px', marginBottom: 28 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1ea774', animation: 'lpBlink 1.8s ease-in-out infinite' }} />
            <span style={{ color: '#1ea774', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em' }}>PLATFORM LIVE · DEMO MODE ACTIVE</span>
          </div>

          <h2 style={{ fontSize: 'clamp(2rem,4.5vw,3.4rem)', fontWeight: 800, color: '#f0ede8', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.01em' }}>
            Ready to Enter<br />
            <span style={{ background: 'linear-gradient(135deg,#e2c168,#c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Plus Trade?</span>
          </h2>

          <p style={{ fontSize: 16, color: 'rgba(240,237,232,0.48)', lineHeight: 1.72, marginBottom: 38 }}>
            Experience the full platform. Three trading modules, real market data, live P&L, wallet management — all in a premium institutional environment.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onEnter}
              style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#c9a84c,#e2c168)', border: 'none', borderRadius: 8, color: '#07080c', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(201,168,76,0.28)', transition: 'all 0.22s', letterSpacing: '0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,168,76,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.28)'; }}>
              Enter Plus Trade <ArrowRight size={15} />
            </button>
            <button onClick={onEnter}
              style={{ padding: '14px 28px', background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, color: 'rgba(240,237,232,0.75)', fontWeight: 500, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.22s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = ''; }}>
              View Demo <ChevronRight size={15} />
            </button>
          </div>

          <p style={{ marginTop: 24, color: 'rgba(240,237,232,0.22)', fontSize: 12.5 }}>
            Demo platform · No real funds · For demonstration and validation purposes only
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────────────── */
function Footer({ onEnter }) {
  return (
    <footer style={{ background: '#05060a', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '36px 0' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <Logo size="sm" />
        <div style={{ color: 'rgba(240,237,232,0.22)', fontSize: 12, textAlign: 'center', lineHeight: 1.6 }}>
          © 2026 Plus Trade · Demo Platform · Not financial advice · No real funds
        </div>
        <button onClick={onEnter}
          style={{ background: 'none', border: '1px solid rgba(201,168,76,0.22)', borderRadius: 6, padding: '7px 16px', color: 'rgba(201,168,76,0.65)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.18s', letterSpacing: '0.02em' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.color = '#c9a84c'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.22)'; e.currentTarget.style.color = 'rgba(201,168,76,0.65)'; }}>
          Launch Platform <ArrowRight size={12} />
        </button>
      </div>
    </footer>
  );
}

/* ─── Main export ───────────────────────────────────────────────────────────── */
export default function LandingPage({ onEnter }) {
  const tickers = useTicker();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{ background: '#07080c', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar onEnter={onEnter} scrolled={scrolled} />
      <HeroSection onEnter={onEnter} tickers={tickers} />
      <TickerBar tickers={tickers} />
      <MarketsSection tickers={tickers} />
      <PlatformSection onEnter={onEnter} />
      <FeaturesSection />
      <VisionSection onEnter={onEnter} />
      <CTASection onEnter={onEnter} />
      <Footer onEnter={onEnter} />
    </div>
  );
}
