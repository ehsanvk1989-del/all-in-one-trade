import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, ChevronRight, ArrowRight, Check, Shield, Activity,
  Globe, BarChart2, Layers, Wallet, TrendingUp, TrendingDown,
  Star, Target, Users, Award, LineChart, Lock, Menu, X
} from 'lucide-react';

// ─── Inject styles once ───────────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('lp-anim')) {
  const s = document.createElement('style');
  s.id = 'lp-anim';
  s.textContent = `
    @keyframes lpOrb { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(25px,-35px) scale(1.08);} 66%{transform:translate(-18px,18px) scale(0.95);} }
    @keyframes lpFloat { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-12px);} }
    @keyframes lpFloatAlt { 0%,100%{transform:translateY(-8px);} 50%{transform:translateY(8px);} }
    @keyframes lpChartDraw { from{stroke-dashoffset:700;opacity:0;} to{stroke-dashoffset:0;opacity:1;} }
    @keyframes lpGridDrift { 0%{background-position:0 0;} 100%{background-position:60px 60px;} }
    @keyframes lpReveal { from{opacity:0;transform:translateY(44px);} to{opacity:1;transform:translateY(0);} }
    @keyframes lpRevealL { from{opacity:0;transform:translateX(-40px);} to{opacity:1;transform:translateX(0);} }
    @keyframes lpRevealR { from{opacity:0;transform:translateX(40px);} to{opacity:1;transform:translateX(0);} }
    @keyframes lpGlow { 0%,100%{box-shadow:0 0 0 1px rgba(255,215,0,0.1),0 20px 60px rgba(0,0,0,0.8);} 50%{box-shadow:0 0 0 1px rgba(255,215,0,0.3),0 20px 60px rgba(0,0,0,0.8),0 0 50px rgba(255,215,0,0.07);} }
    @keyframes lpScan { 0%{top:-2px;opacity:0.7;} 100%{top:105%;opacity:0;} }
    @keyframes lpBlink { 0%,100%{opacity:1;} 50%{opacity:0.2;} }
    @keyframes lpPriceUp { 0%,100%{color:#10b981;} 50%{color:#6ee7b7;} }
    @keyframes lpPriceDn { 0%,100%{color:#ef4444;} 50%{color:#fca5a5;} }
    @keyframes lpBorderPulse { 0%,100%{border-color:rgba(255,215,0,0.12);} 50%{border-color:rgba(255,215,0,0.35);} }
    @keyframes lpFadeCount { from{opacity:0;transform:scale(0.9);} to{opacity:1;transform:scale(1);} }
    @keyframes lpTickerScroll { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
    @keyframes lpNavBg { from{background:transparent;} to{background:rgba(5,5,7,0.96);} }
    .lp-reveal{opacity:0;} .lp-reveal.lp-vis{animation:lpReveal 0.75s cubic-bezier(.16,1,.3,1) forwards;}
    .lp-reveal-l{opacity:0;} .lp-reveal-l.lp-vis{animation:lpRevealL 0.75s cubic-bezier(.16,1,.3,1) forwards;}
    .lp-reveal-r{opacity:0;} .lp-reveal-r.lp-vis{animation:lpRevealR 0.75s cubic-bezier(.16,1,.3,1) forwards;}
    .lp-d0{animation-delay:0s;} .lp-d1{animation-delay:0.1s;} .lp-d2{animation-delay:0.2s;}
    .lp-d3{animation-delay:0.3s;} .lp-d4{animation-delay:0.4s;} .lp-d5{animation-delay:0.5s;} .lp-d6{animation-delay:0.6s;}
    .lp-card-hover{transition:transform 0.35s ease,box-shadow 0.35s ease;}
    .lp-card-hover:hover{transform:translateY(-6px);}
    @media(max-width:900px){.lp-hero-grid{grid-template-columns:1fr!important;} .lp-hide-sm{display:none!important;} .lp-3col{grid-template-columns:1fr!important;} .lp-2col{grid-template-columns:1fr!important;}}
    @media(max-width:640px){.lp-hero-ctas{flex-direction:column!important;} .lp-stats-row{gap:24px!important;}}
  `;
  document.head.appendChild(s);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

const TICKER_INIT = [
  { sym: 'BTC/USDT', price: 75241.50, chg: 2.34 },
  { sym: 'ETH/USDT', price: 3521.80,  chg: 1.87 },
  { sym: 'SOL/USDT', price: 148.32,   chg: 3.21 },
  { sym: 'XAU/USD',  price: 4502.40,  chg: 0.45 },
  { sym: 'EUR/USD',  price: 1.0824,   chg: -0.12 },
  { sym: 'GBP/USD',  price: 1.2652,   chg: 0.08 },
  { sym: 'OIL',      price: 93.78,    chg: -0.67 },
  { sym: 'DOGE/USDT',price: 0.1534,   chg: 5.44 },
];

function useTicker() {
  const [tickers, setTickers] = useState(TICKER_INIT);
  useEffect(() => {
    const id = setInterval(() => {
      setTickers(p => p.map(t => ({
        ...t,
        price: t.price * (1 + (Math.random() - 0.5) * 0.0008),
        chg: +(t.chg + (Math.random() - 0.5) * 0.04).toFixed(2),
      })));
    }, 2200);
    return () => clearInterval(id);
  }, []);
  return tickers;
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#b8860b,#ffd700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: '#000', fontWeight: 900, fontSize: 15 }}>P</span>
      </div>
      <div>
        <div style={{ background: 'linear-gradient(135deg,#ffd700,#ff9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 800, fontSize: 14, letterSpacing: '0.16em' }}>PLUS TRADE</div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, letterSpacing: '0.12em' }}>PREMIUM PLATFORM</div>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onEnter, scrolled }) {
  const [open, setOpen] = useState(false);
  const links = [
    { label: 'Platform', href: '#products' },
    { label: 'Markets', href: '#markets' },
    { label: 'Features', href: '#features' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Demo', href: '#cta' },
  ];
  const scrollTo = (id) => { document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' }); setOpen(false); };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(5,5,7,0.97)' : 'transparent',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <Logo />

        {/* Desktop nav links */}
        <div className="lp-hide-sm" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {links.map(l => (
            <button key={l.label} onClick={() => scrollTo(l.href)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 13.5, fontWeight: 500, padding: '6px 14px', cursor: 'pointer', borderRadius: 8, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'none'; }}>
              {l.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onEnter}
            style={{ background: 'linear-gradient(135deg,#b8860b,#ffd700)', border: 'none', borderRadius: 9, padding: '9px 20px', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.25s', boxShadow: '0 2px 16px rgba(255,215,0,0.25)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(255,215,0,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 16px rgba(255,215,0,0.25)'; }}>
            Enter App <ArrowRight size={14} />
          </button>
          <button className="lp-hide-sm" style={{ display: 'none' }} /> {/* spacer */}
          {/* Hamburger */}
          <button onClick={() => setOpen(v => !v)} style={{ display: 'none', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px', color: 'white', cursor: 'pointer' }}
            className="lp-menu-btn">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div style={{ background: 'rgba(5,5,7,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 24px 20px' }}>
          {links.map(l => (
            <button key={l.label} onClick={() => scrollTo(l.href)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 500, padding: '10px 0', cursor: 'pointer' }}>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── Hero Background ──────────────────────────────────────────────────────────
function HeroBG() {
  return (
    <>
      {/* Moving grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.022, backgroundImage: 'linear-gradient(rgba(255,215,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,1) 1px, transparent 1px)', backgroundSize: '60px 60px', animation: 'lpGridDrift 25s linear infinite' }} />
      {/* Orbs */}
      <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.055) 0%, transparent 65%)', top: -200, left: -200, animation: 'lpOrb 20s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,214,160,0.035) 0%, transparent 65%)', top: '5%', right: -100, animation: 'lpOrb 26s ease-in-out 4s infinite reverse' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(67,97,238,0.04) 0%, transparent 65%)', bottom: 0, left: '35%', animation: 'lpOrb 22s ease-in-out 8s infinite' }} />
      {/* Bottom vignette */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to bottom, transparent, #050507)' }} />
    </>
  );
}

// ─── Animated candlestick chart line (hero visual) ────────────────────────────
function MiniChart({ color = '#10b981', pathD, id }) {
  return (
    <svg width="100%" height="90" viewBox="0 0 260 90" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={pathD + ` L 260,90 L 0,90 Z`} fill={`url(#fill-${id})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.8"
        style={{ strokeDasharray: 700, strokeDashoffset: 700, animation: 'lpChartDraw 2.5s ease forwards 0.3s' }} />
    </svg>
  );
}

// ─── Floating terminal mock ───────────────────────────────────────────────────
function TerminalMock({ tickers }) {
  const btc = tickers.find(t => t.sym === 'BTC/USDT') || TICKER_INIT[0];
  const eth = tickers.find(t => t.sym === 'ETH/USDT') || TICKER_INIT[1];
  const gold = tickers.find(t => t.sym === 'XAU/USD') || TICKER_INIT[3];

  const chartPath = 'M 0,75 C 20,68 35,80 55,60 S 85,40 105,52 S 138,32 158,42 S 192,22 215,15 L 260,10';

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 470 }}>
      {/* Main card */}
      <div style={{ background: 'rgba(10,12,16,0.98)', border: '1px solid rgba(255,215,0,0.18)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.85), 0 0 60px rgba(255,215,0,0.04)', animation: 'lpGlow 4s ease-in-out infinite, lpFloat 7s ease-in-out infinite' }}>
        {/* Window chrome */}
        <div style={{ padding: '9px 14px', background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {['#ef4444','#eab308','#10b981'].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.65 }} />)}
          <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10, marginLeft: 6, letterSpacing: '0.09em' }}>plus-trade · crypto-futures</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'lpBlink 2s ease-in-out infinite' }} />
            <span style={{ color: '#10b981', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}>LIVE</span>
          </div>
        </div>

        {/* Symbol bar */}
        <div style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>₿</span>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 13, lineHeight: 1 }}>BTC/USDT</div>
            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, marginTop: 2 }}>Bitcoin · Perpetual CFD</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 21, fontWeight: 700, color: '#10b981', animation: 'lpPriceUp 2.5s ease-in-out infinite', lineHeight: 1 }}>
              {btc.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ color: '#10b981', fontSize: 11, fontWeight: 600, marginTop: 2 }}>+{btc.chg.toFixed(2)}%</div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ background: '#080a0d', position: 'relative', overflow: 'hidden', height: 95 }}>
          <MiniChart color="#10b981" pathD={chartPath} id="hero" />
          <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.35), transparent)', animation: 'lpScan 3.5s linear infinite' }} />
        </div>

        {/* Buy/Sell */}
        <div style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: 'linear-gradient(135deg,#064e3b,#10b981)', borderRadius: 8, padding: '9px 0', textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 12, boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}>▲ BUY LONG</div>
          <div style={{ background: 'linear-gradient(135deg,#7f1d1d,#ef4444)', borderRadius: 8, padding: '9px 0', textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>▼ SELL SHORT</div>
        </div>

        {/* Stats */}
        <div style={{ padding: '8px 16px 12px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between' }}>
          {[{ l:'Leverage',v:'10x',c:'#ffd700'},{l:'Volume',v:'0.05',c:'rgba(255,255,255,0.55)'},{l:'P&L',v:'+$312.40',c:'#10b981'},{l:'ROE',v:'+14.2%',c:'#10b981'}].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.l}</div>
              <div style={{ color: s.c, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating ETH card */}
      <div style={{ position: 'absolute', top: -18, right: -26, background: 'rgba(10,12,16,0.97)', border: '1px solid rgba(67,97,238,0.35)', borderRadius: 12, padding: '9px 13px', boxShadow: '0 10px 36px rgba(0,0,0,0.7)', animation: 'lpFloatAlt 8s ease-in-out infinite', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 15 }}>Ξ</span>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, marginBottom: 2 }}>ETH/USDT</div>
            <div style={{ color: '#10b981', fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700 }}>{eth.price.toFixed(2)}</div>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: 5, padding: '2px 7px', marginLeft: 4 }}>
            <span style={{ color: '#10b981', fontSize: 10, fontWeight: 600 }}>+{eth.chg.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Floating P&L card */}
      <div style={{ position: 'absolute', bottom: -18, left: -26, background: 'rgba(10,12,16,0.97)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 12, padding: '9px 13px', boxShadow: '0 10px 36px rgba(0,0,0,0.7)', animation: 'lpFloat 9s ease-in-out 2s infinite', zIndex: 2 }}>
        <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Total Open P&L</div>
        <div style={{ color: '#ffd700', fontFamily: 'JetBrains Mono, monospace', fontSize: 19, fontWeight: 800, lineHeight: 1 }}>+$1,842.50</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>4 Open Positions</span>
        </div>
      </div>

      {/* Floating Gold card */}
      <div style={{ position: 'absolute', top: '45%', right: -32, background: 'rgba(10,12,16,0.97)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 12, padding: '8px 12px', boxShadow: '0 8px 28px rgba(0,0,0,0.7)', animation: 'lpFloatAlt 10s ease-in-out 3s infinite', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🥇</span>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>XAU/USD</div>
            <div style={{ color: '#ffd700', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700 }}>{gold.price.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Hero ────────────────────────────────────────────────────────────
function HeroSection({ onLaunch, onExplore, tickers }) {
  return (
    <section style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#050507', display: 'flex', alignItems: 'center', paddingTop: 68 }}>
      <HeroBG />
      <div className="lp-hero-grid" style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '60px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: 64, position: 'relative', zIndex: 2 }}>

        {/* Left */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.22)', borderRadius: 100, padding: '5px 14px', marginBottom: 26, animation: 'lpReveal 0.6s ease forwards' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffd700', animation: 'lpBlink 2s ease-in-out infinite' }} />
            <span style={{ color: '#ffd700', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em' }}>ALL-IN-ONE TRADING PLATFORM</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem,4.5vw,3.8rem)', fontWeight: 800, lineHeight: 1.1, color: 'white', marginBottom: 22, animation: 'lpReveal 0.7s ease 0.1s both' }}>
            All-in-One Trading.{' '}
            <span style={{ background: 'linear-gradient(135deg,#ffd700,#ff9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>One Platform.</span>
            <br />Infinite Markets.
          </h1>

          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 510, marginBottom: 36, animation: 'lpReveal 0.7s ease 0.2s both' }}>
            Trade crypto futures, forex, commodities, and simplified casino-style markets through one premium unified trading experience.
          </p>

          <div className="lp-hero-ctas" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', animation: 'lpReveal 0.7s ease 0.3s both' }}>
            <button onClick={onLaunch}
              style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#b8860b,#ffd700,#b8860b)', backgroundSize: '200% 100%', border: 'none', borderRadius: 10, color: '#000', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 24px rgba(255,215,0,0.3)', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(255,215,0,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(255,215,0,0.3)'; }}>
              <Zap size={16} /> Launch Demo
            </button>
            <button onClick={onExplore}
              style={{ padding: '13px 26px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, color: 'rgba(255,255,255,0.82)', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = ''; }}>
              Explore Platform <ChevronRight size={16} />
            </button>
          </div>

          {/* Stats */}
          <div className="lp-stats-row" style={{ display: 'flex', gap: 36, marginTop: 48, animation: 'lpReveal 0.7s ease 0.45s both' }}>
            {[['$2.4B+','Daily Volume'],['150K+','Active Traders'],['50+','Markets'],['99.9%','Uptime']].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg,#ffd700,#ff9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{v}</div>
                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 12, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: mock terminal */}
        <div className="lp-hide-sm" style={{ display: 'flex', justifyContent: 'center', paddingRight: 40, animation: 'lpReveal 0.85s ease 0.3s both' }}>
          <TerminalMock tickers={tickers} />
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0, animation: 'lpReveal 0.6s ease 1.2s forwards' }}>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Scroll</span>
        <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(255,215,0,0.5), transparent)', animation: 'lpScan 1.8s ease-in-out infinite' }} />
      </div>
    </section>
  );
}

// ─── Ticker bar ───────────────────────────────────────────────────────────────
function TickerBar({ tickers }) {
  const fmt = (t) => t.price >= 1000 ? t.price.toFixed(2) : t.price >= 1 ? t.price.toFixed(4) : t.price.toFixed(5);
  return (
    <div style={{ background: 'rgba(0,0,0,0.55)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', padding: '7px 0' }}>
      <div style={{ display: 'inline-flex', whiteSpace: 'nowrap', animation: 'lpTickerScroll 28s linear infinite' }}>
        {[...tickers, ...tickers].map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '0 22px', fontSize: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.38)' }}>{t.sym}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: t.chg >= 0 ? '#10b981' : '#ef4444' }}>{fmt(t)}</span>
            <span style={{ color: t.chg >= 0 ? '#10b981' : '#ef4444', fontSize: 10 }}>{t.chg >= 0 ? '▲' : '▼'} {Math.abs(t.chg).toFixed(2)}%</span>
            <span style={{ color: 'rgba(255,255,255,0.07)' }}>|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ p, idx, onLaunch }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} className={`lp-reveal lp-d${idx + 1} ${vis ? 'lp-vis' : ''}`}>
      <div className="lp-card-hover" style={{ background: p.cardBg, border: `1px solid ${p.border}`, borderRadius: 18, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 24px 70px rgba(0,0,0,0.7), 0 0 40px ${p.color}18`; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}>

        {/* Mock screen */}
        <div style={{ background: '#0b0d11', borderBottom: `1px solid ${p.border}` }}>
          {/* Chrome bar */}
          <div style={{ padding: '7px 12px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 5 }}>
            {['#ef4444','#eab308','#10b981'].map(c => <div key={c} style={{ width: 7, height: 7, borderRadius: '50%', background: c, opacity: 0.6 }} />)}
            <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 9, marginLeft: 6 }}>{p.badge.toLowerCase()}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: p.color }} />
              <span style={{ color: p.color, fontSize: 8, fontWeight: 700 }}>LIVE</span>
            </div>
          </div>
          {p.mock}
        </div>

        {/* Content */}
        <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${p.color}18`, border: `1px solid ${p.color}35`, borderRadius: 100, padding: '3px 10px', marginBottom: 12, alignSelf: 'flex-start' }}>
            <span style={{ fontSize: 12 }}>{p.icon}</span>
            <span style={{ color: p.color, fontSize: 9, fontWeight: 800, letterSpacing: '0.12em' }}>{p.badge}</span>
          </div>
          <h3 style={{ color: 'white', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{p.name}</h3>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, lineHeight: 1.65, marginBottom: 16, flex: 1 }}>{p.desc}</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px' }}>
            {p.features.map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <div style={{ width: 15, height: 15, borderRadius: '50%', background: `${p.color}18`, border: `1px solid ${p.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={8} style={{ color: p.color }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.48)', fontSize: 12 }}>{f}</span>
              </li>
            ))}
          </ul>
          <button onClick={onLaunch}
            style={{ width: '100%', padding: '10px', background: `${p.color}12`, border: `1px solid ${p.color}30`, borderRadius: 9, color: p.color, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${p.color}24`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${p.color}12`; }}>
            Launch {p.badge.split(' ')[0]} <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Product Tour ────────────────────────────────────────────────────
function ProductTourSection({ onLaunch }) {
  const [hRef, hVis] = useReveal();

  const products = [
    {
      id: 'simple', icon: '🎰', badge: 'SIMPLE TRADE', name: 'Casino-Style Trading',
      color: '#e63946', border: 'rgba(230,57,70,0.2)', cardBg: 'linear-gradient(160deg,rgba(230,57,70,0.06),rgba(230,57,70,0.01))',
      desc: 'A luxury arcade-style experience. One-click buy and sell on major assets. Built for speed, excitement, and instant gratification.',
      features: ['One-click execution', 'Simulated live price ticking', 'Casino-style BUY / SELL', 'Live P&L + ROE display'],
      mock: (
        <div style={{ padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div style={{ background: 'linear-gradient(135deg,#064e3b,#10b981)', borderRadius: 8, padding: '11px 0', textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 13, boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}>▲ BUY</div>
            <div style={{ background: 'linear-gradient(135deg,#7f1d1d,#ef4444)', borderRadius: 8, padding: '11px 0', textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>▼ SELL</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '9px 11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>XAUUSD</span>
            <span style={{ color: '#ffd700', fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 700 }}>4,502.40</span>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {['1x','5x','10x','20x'].map(l => (
              <div key={l} style={{ flex: 1, background: l === '10x' ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '5px 0', textAlign: 'center', color: l === '10x' ? '#ffd700' : 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 600, border: `1px solid ${l === '10x' ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.06)'}` }}>{l}</div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'crypto', icon: '₿', badge: 'CRYPTO FUTURES', name: 'OKX-Style Terminal',
      color: '#4361ee', border: 'rgba(67,97,238,0.2)', cardBg: 'linear-gradient(160deg,rgba(67,97,238,0.07),rgba(67,97,238,0.01))',
      desc: 'Professional perpetual futures with real Binance WebSocket prices, TradingView charts, liquidation tracking, and ROE per position.',
      features: ['Real Binance WebSocket prices', 'TradingView live charts', 'Liq. price + ROE tracking', 'Advanced order management'],
      mock: (
        <div style={{ height: 130, position: 'relative', display: 'flex' }}>
          <div style={{ width: 78, borderRight: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
            {['BTC/USDT','ETH/USDT','SOL/USDT'].map((sym, i) => (
              <div key={sym} style={{ padding: '7px 8px', background: i === 0 ? 'rgba(255,255,255,0.04)' : 'transparent', borderLeft: `2px solid ${i === 0 ? '#4361ee' : 'transparent'}`, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ color: i === 0 ? '#fff' : 'rgba(255,255,255,0.38)', fontSize: 9, fontWeight: 700 }}>{sym.split('/')[0]}</div>
                <div style={{ color: '#10b981', fontSize: 8, fontFamily: 'monospace' }}>+{(1.2 + i * 0.8).toFixed(1)}%</div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, background: '#08090c', position: 'relative', overflow: 'hidden' }}>
            <svg width="100%" height="130" viewBox="0 0 180 130" preserveAspectRatio="none">
              <path d="M 0,110 L 25,95 L 50,100 L 75,75 L 100,80 L 125,55 L 150,60 L 180,35 L 180,130 L 0,130 Z" fill="rgba(67,97,238,0.1)" />
              <path d="M 0,110 L 25,95 L 50,100 L 75,75 L 100,80 L 125,55 L 150,60 L 180,35"
                fill="none" stroke="#4361ee" strokeWidth="1.5"
                style={{ strokeDasharray: 600, strokeDashoffset: 600, animation: 'lpChartDraw 2s ease forwards 0.2s' }} />
            </svg>
          </div>
        </div>
      ),
    },
    {
      id: 'forex', icon: '💱', badge: 'FOREX & COMMODITIES', name: 'TradingView Terminal',
      color: '#06d6a0', border: 'rgba(6,214,160,0.2)', cardBg: 'linear-gradient(160deg,rgba(6,214,160,0.07),rgba(6,214,160,0.01))',
      desc: 'Professional forex and commodity CFDs with real TwelveData prices, embedded TradingView charts, and spread/pip display.',
      features: ['TwelveData REST API prices', 'TradingView embedded charts', 'Forex & commodity CFDs', 'Full spread & pip tracking'],
      mock: (
        <div>
          {[['XAU/USD','4,502.40','+0.45%',true],['EUR/USD','1.0824','-0.12%',false],['GBP/USD','1.2652','+0.08%',true],['OIL','93.78','-0.67%',false]].map(([sym,px,chg,up],i) => (
            <div key={sym} style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', background: i === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
              <span style={{ color: i === 0 ? '#fff' : 'rgba(255,255,255,0.42)', fontSize: 10, fontWeight: 600 }}>{sym}</span>
              <span style={{ color: up ? '#10b981' : '#ef4444', fontFamily: 'monospace', fontSize: 10 }}>{px}</span>
              <span style={{ color: up ? '#10b981' : '#ef4444', fontSize: 9 }}>{chg}</span>
            </div>
          ))}
          <div style={{ padding: '8px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ background: 'linear-gradient(135deg,#065f46,#10b981)', borderRadius: 6, padding: '7px', textAlign: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>▲ BUY 1.0826</div>
            <div style={{ background: 'linear-gradient(135deg,#7f1d1d,#ef4444)', borderRadius: 6, padding: '7px', textAlign: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>▼ SELL 1.0822</div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="products" style={{ background: '#070709', padding: '110px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,215,0,0.18),transparent)' }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
        <div ref={hRef} className={`lp-reveal ${hVis ? 'lp-vis' : ''}`} style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ color: '#ffd700', fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>PRODUCT TOUR</div>
          <h2 style={{ fontSize: 'clamp(1.9rem,3.8vw,3rem)', fontWeight: 800, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
            Three Worlds of Trading.<br />
            <span style={{ background: 'linear-gradient(135deg,#ffd700,#ff9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>One Unified Platform.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 16.5, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Each module is purpose-built with a distinct experience — from cinematic simplicity to institutional-grade terminals.
          </p>
        </div>

        <div className="lp-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {products.map((p, i) => <ProductCard key={p.id} p={p} idx={i} onLaunch={onLaunch} />)}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Features / real market data ─────────────────────────────────────
function FeaturesSection({ onLaunch }) {
  const [hRef, hVis] = useReveal();
  const features = [
    { icon: Activity, color: '#10b981', title: 'Real-Time Crypto Prices', desc: 'Binance public WebSocket streams deliver live BTC, ETH, SOL, and DOGE prices with zero delay. No API key required.', stat: '<10ms', statLabel: 'WebSocket latency' },
    { icon: Globe, color: '#4361ee', title: 'Forex & Commodity Data', desc: 'TwelveData REST API powers real EUR/USD, GBP/USD, USD/JPY, XAU/USD, and WTI Crude prices — polled every 30 seconds.', stat: '30s', statLabel: 'Poll interval' },
    { icon: BarChart2, color: '#ffd700', title: 'TradingView Live Charts', desc: 'Embedded TradingView widgets provide institutional-quality candlestick charts with full symbol accuracy across all modules.', stat: '100%', statLabel: 'Chart accuracy' },
    { icon: Shield, color: '#e63946', title: 'Simulated Demo Execution', desc: 'Order execution, P&L, wallet, and position management are fully simulated — perfect for demos, validation, and investor presentations.', stat: '$0', statLabel: 'Real funds at risk' },
  ];

  return (
    <section id="features" style={{ background: '#050507', padding: '110px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(67,97,238,0.04) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(255,215,0,0.03) 0%, transparent 60%)' }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', position: 'relative', zIndex: 1 }}>
        <div ref={hRef} className={`lp-reveal ${hVis ? 'lp-vis' : ''}`} style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ color: '#ffd700', fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>REAL MARKET DATA</div>
          <h2 style={{ fontSize: 'clamp(1.9rem,3.8vw,3rem)', fontWeight: 800, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
            Live Data. Real Charts.<br />
            <span style={{ background: 'linear-gradient(135deg,#ffd700,#ff9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Demo Execution.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 16.5, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            The platform connects to real data sources so investors see actual market behavior — while all trading remains safely simulated.
          </p>
        </div>

        <div className="lp-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <FeatureCard key={f.title} f={f} Icon={Icon} idx={i} />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ f, Icon, idx }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} className={`lp-reveal lp-d${idx} ${vis ? 'lp-vis' : ''}`}>
      <div className="lp-card-hover" style={{ background: 'rgba(13,14,19,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '28px', height: '100%', transition: 'all 0.35s ease' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}40`; e.currentTarget.style.boxShadow = `0 16px 50px rgba(0,0,0,0.5), 0 0 30px ${f.color}10`; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = ''; }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: `${f.color}15`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} style={{ color: f.color }} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 800, color: f.color }}>{f.stat}</div>
            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, letterSpacing: '0.08em' }}>{f.statLabel}</div>
          </div>
        </div>
        <h3 style={{ color: 'white', fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{f.title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
      </div>
    </div>
  );
}

// ─── Section: Dashboard Preview ───────────────────────────────────────────────
function DashboardSection({ onLaunch }) {
  const [lRef, lVis] = useReveal();
  const [rRef, rVis] = useReveal();

  const portfolioPath = 'M 0,90 C 30,80 50,85 80,65 S 120,45 150,55 S 200,30 230,35 S 270,20 300,18';
  const pnlBars = [
    { day: 'Mon', v: 42, pos: true }, { day: 'Tue', v: -18, pos: false }, { day: 'Wed', v: 67, pos: true },
    { day: 'Thu', v: 31, pos: true }, { day: 'Fri', v: -12, pos: false }, { day: 'Sat', v: 88, pos: true }, { day: 'Sun', v: 54, pos: true },
  ];

  return (
    <section id="dashboard" style={{ background: '#070709', padding: '110px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,215,0,0.15),transparent)' }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
        <div className="lp-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

          {/* Left: text */}
          <div ref={lRef} className={`lp-reveal-l ${lVis ? 'lp-vis' : ''}`}>
            <div style={{ color: '#ffd700', fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 16 }}>DASHBOARD & WALLET</div>
            <h2 style={{ fontSize: 'clamp(1.9rem,3.5vw,2.8rem)', fontWeight: 800, color: 'white', marginBottom: 18, lineHeight: 1.2 }}>
              Full Portfolio<br />
              <span style={{ background: 'linear-gradient(135deg,#ffd700,#ff9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Control Center</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>
              Monitor your entire portfolio in real time. Track open positions across all modules, analyze P&L history, manage your USDT wallet, and view advanced analytics — all in one place.
            </p>

            {[
              { icon: Wallet, label: 'USDT Wallet', desc: 'Deposit, withdraw, and track balance with full transaction history.' },
              { icon: BarChart2, label: 'Analytics & Charts', desc: 'Equity curve, daily P&L bar chart, win rate donut, and fear & greed gauge.' },
              { icon: LineChart, label: 'Trade History', desc: 'Complete log of every trade — open time, close price, P&L, ROE, and module.' },
              { icon: Target, label: 'Open Positions', desc: 'Live P&L, ROE%, liquidation price distance, and one-click close across all markets.' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Icon size={16} style={{ color: '#ffd700' }} />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, lineHeight: 1.55 }}>{desc}</div>
                </div>
              </div>
            ))}

            <button onClick={onLaunch}
              style={{ marginTop: 10, padding: '13px 28px', background: 'linear-gradient(135deg,#b8860b,#ffd700)', border: 'none', borderRadius: 10, color: '#000', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(255,215,0,0.28)', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(255,215,0,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,215,0,0.28)'; }}>
              <Zap size={15} /> Open Dashboard
            </button>
          </div>

          {/* Right: mock dashboard */}
          <div ref={rRef} className={`lp-reveal-r ${rVis ? 'lp-vis' : ''}`}>
            <div style={{ background: 'rgba(10,12,16,0.98)', border: '1px solid rgba(255,215,0,0.12)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.8)', animation: 'lpGlow 5s ease-in-out infinite, lpFloat 9s ease-in-out infinite' }}>
              {/* Header */}
              <div style={{ padding: '12px 18px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffd700', animation: 'lpBlink 2.5s ease-in-out infinite' }} />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.1em' }}>DASHBOARD · PORTFOLIO OVERVIEW</span>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
                {[['Balance','$12,480.00','rgba(255,255,255,0.7)'],['Equity','$14,322.50','#10b981'],['Open P&L','+$1,842.50','#10b981'],['Positions','4 Active','#ffd700']].map(([l,v,c]) => (
                  <div key={l} style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                    <div style={{ color: c, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Equity chart */}
              <div style={{ padding: '14px 18px 6px' }}>
                <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 9, letterSpacing: '0.1em', marginBottom: 6 }}>EQUITY CURVE</div>
                <div style={{ background: '#080a0d', borderRadius: 8, overflow: 'hidden', height: 80 }}>
                  <svg width="100%" height="80" viewBox="0 0 300 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffd700" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#ffd700" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={portfolioPath + ' L 300,80 L 0,80 Z'} fill="url(#eqFill)" />
                    <path d={portfolioPath} fill="none" stroke="#ffd700" strokeWidth="1.5"
                      style={{ strokeDasharray: 700, strokeDashoffset: 700, animation: 'lpChartDraw 2.5s ease forwards 0.5s' }} />
                  </svg>
                </div>
              </div>

              {/* P&L bars */}
              <div style={{ padding: '6px 18px 14px' }}>
                <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 9, letterSpacing: '0.1em', marginBottom: 8 }}>DAILY P&L</div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 50 }}>
                  {pnlBars.map(b => (
                    <div key={b.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{ width: '100%', height: `${Math.abs(b.v) * 0.45}px`, background: b.pos ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.7)', borderRadius: '3px 3px 0 0', minHeight: 4 }} />
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 8 }}>{b.day.slice(0,1)}</span>
                    </div>
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

// ─── Section: Investor Vision ─────────────────────────────────────────────────
function InvestorSection() {
  const [ref, vis] = useReveal();

  const pillars = [
    { icon: Layers, color: '#4361ee', title: 'Unified Multi-Market', desc: 'One platform, three distinct trading experiences. Crypto futures, forex/commodities, and simplified trading — all under one premium brand.' },
    { icon: Star, color: '#ffd700', title: 'Investor-Grade UI/UX', desc: 'Cinematic dark luxury design with glassmorphism, live animations, real market data, and professional terminal interfaces.' },
    { icon: Target, color: '#10b981', title: 'Validated Prototype', desc: 'Fully functional demo with real price feeds, simulated execution, persistent wallet state, and complete trading lifecycle.' },
    { icon: Award, color: '#e63946', title: 'Scalable Architecture', desc: 'Built for rapid backend integration. Add real execution, KYC, custody, and risk management to convert demo into production.' },
    { icon: Users, color: '#06d6a0', title: 'Multi-Segment Market', desc: 'Serves retail traders, institutions, and gaming-adjacent users through purpose-designed UX modes for each audience.' },
    { icon: Lock, color: '#b8860b', title: 'Production Ready', desc: 'Vite + React 18 + Tailwind. Clean component architecture, context-based state, real-time data layer, ready for deployment.' },
  ];

  return (
    <section id="vision" style={{ background: '#050507', padding: '110px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.04) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,215,0,0.2),transparent)' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', position: 'relative', zIndex: 1 }}>
        <div ref={ref} className={`lp-reveal ${vis ? 'lp-vis' : ''}`} style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ color: '#ffd700', fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>INVESTOR VISION</div>
          <h2 style={{ fontSize: 'clamp(1.9rem,3.8vw,3rem)', fontWeight: 800, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
            Built for Validation,<br />
            <span style={{ background: 'linear-gradient(135deg,#ffd700,#ff9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Designed for Scale.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 16.5, maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            Plus Trade is a next-generation all-in-one trading concept. A fully realized product demo built to impress investors, validate the market, and demonstrate technical execution capability.
          </p>
        </div>

        <div className="lp-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return <InvestorCard key={p.title} p={p} Icon={Icon} idx={i} />;
          })}
        </div>

        {/* Tech stack bar */}
        <TechStackBar />
      </div>
    </section>
  );
}

function InvestorCard({ p, Icon, idx }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} className={`lp-reveal lp-d${idx} ${vis ? 'lp-vis' : ''}`}>
      <div className="lp-card-hover" style={{ background: 'rgba(13,14,19,0.96)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 14, padding: '24px', height: '100%', transition: 'all 0.3s ease' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = `${p.color}35`; e.currentTarget.style.boxShadow = `0 16px 50px rgba(0,0,0,0.5), 0 0 25px ${p.color}0d`; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)'; e.currentTarget.style.boxShadow = ''; }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: `${p.color}14`, border: `1px solid ${p.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon size={18} style={{ color: p.color }} />
        </div>
        <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15.5, marginBottom: 9 }}>{p.title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.65 }}>{p.desc}</p>
      </div>
    </div>
  );
}

function TechStackBar() {
  const [ref, vis] = useReveal();
  const stack = ['React 18', 'Vite', 'Tailwind CSS', 'Recharts', 'Binance WS', 'TwelveData API', 'TradingView', 'lucide-react'];
  return (
    <div ref={ref} className={`lp-reveal lp-d3 ${vis ? 'lp-vis' : ''}`} style={{ marginTop: 48, padding: '24px 28px', background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.1)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', flexShrink: 0 }}>Tech Stack</span>
      <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {stack.map(t => (
          <span key={t} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 500 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Final CTA ───────────────────────────────────────────────────────
function CTASection({ onEnter }) {
  const [ref, vis] = useReveal();
  return (
    <section id="cta" style={{ background: '#070709', padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.055) 0%, transparent 65%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,215,0,0.25),transparent)' }} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div ref={ref} className={`lp-reveal ${vis ? 'lp-vis' : ''}`}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.22)', borderRadius: 100, padding: '5px 16px', marginBottom: 30 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'lpBlink 1.5s ease-in-out infinite' }} />
            <span style={{ color: '#ffd700', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em' }}>PLATFORM IS LIVE</span>
          </div>

          <h2 style={{ fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 22 }}>
            Ready to Experience<br />
            <span style={{ background: 'linear-gradient(135deg,#ffd700,#ff9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Plus Trade?</span>
          </h2>

          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 42px' }}>
            Enter the full demo platform. Explore all three trading modules, open positions, track P&L, manage your wallet — all with a real market data experience.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onEnter}
              style={{ padding: '15px 34px', background: 'linear-gradient(135deg,#b8860b,#ffd700,#b8860b)', backgroundSize: '200% 100%', border: 'none', borderRadius: 12, color: '#000', fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, boxShadow: '0 6px 32px rgba(255,215,0,0.35)', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 50px rgba(255,215,0,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 32px rgba(255,215,0,0.35)'; }}>
              <Zap size={17} /> Enter Plus Trade
            </button>
            <button onClick={onEnter}
              style={{ padding: '15px 32px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = ''; }}>
              View Trading Demo <ArrowRight size={16} />
            </button>
          </div>

          <p style={{ marginTop: 28, color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
            Demo Platform · No real funds · Investor presentation mode
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ onEnter }) {
  return (
    <footer style={{ background: '#030304', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <Logo />
        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, textAlign: 'center' }}>
          © 2026 Plus Trade · Demo Platform · Not financial advice · No real funds involved
        </div>
        <button onClick={onEnter}
          style={{ background: 'none', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 8, padding: '8px 18px', color: 'rgba(255,215,0,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,215,0,0.5)'; e.currentTarget.style.color = '#ffd700'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,215,0,0.2)'; e.currentTarget.style.color = 'rgba(255,215,0,0.7)'; }}>
          Launch App <ArrowRight size={13} />
        </button>
      </div>
    </footer>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function LandingPage({ onEnter }) {
  const tickers = useTicker();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background: '#050507', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar onEnter={onEnter} scrolled={scrolled} />
      <HeroSection onLaunch={onEnter} onExplore={scrollToProducts} tickers={tickers} />
      <TickerBar tickers={tickers} />
      <ProductTourSection onLaunch={onEnter} />
      <FeaturesSection onLaunch={onEnter} />
      <DashboardSection onLaunch={onEnter} />
      <InvestorSection />
      <CTASection onEnter={onEnter} />
      <Footer onEnter={onEnter} />
    </div>
  );
}
