import React, { useState, useEffect } from 'react';
import { Zap, BarChart3, LineChart, ArrowRight, TrendingUp, Shield, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/mockData';

const PLATFORMS = [
  {
    id: 'simple',
    title: 'Simple Trade',
    subtitle: 'MULTI-ASSET TRADING',
    description: 'Trade gold, oil, forex pairs, and crypto with a clean execution interface. Fixed spread pricing with 1x–20x leverage across 6 premium instruments.',
    icon: Zap,
    features: ['Gold & Commodities', 'Crypto Assets', 'Forex Pairs', '1x–20x Leverage'],
    tag: 'MOST POPULAR',
    accent: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
    glow: 'rgba(59,130,246,0.45)',
  },
  {
    id: 'crypto',
    title: 'Crypto Futures',
    subtitle: 'FUTURES TERMINAL',
    description: 'Professional crypto futures with live order book, real-time depth chart, and up to 100x leverage. BTC, ETH, SOL, DOGE perpetual contracts.',
    icon: BarChart3,
    features: ['BTC / ETH / SOL / DOGE', 'Up to 100x Leverage', 'Live Order Book', 'Long & Short'],
    tag: 'ADVANCED',
    accent: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
    glow: 'rgba(124,58,237,0.45)',
  },
  {
    id: 'forex',
    title: 'Forex & Commodities',
    subtitle: 'PROFESSIONAL',
    description: 'Institutional-grade forex and commodities with embedded TradingView charts. XAU/USD, EUR/USD, GBP/USD and WTI/USD on a pro terminal.',
    icon: LineChart,
    features: ['5 Major Pairs', 'Gold & Oil', 'TradingView Charts', 'Pro Order Panel'],
    tag: 'INSTITUTIONAL',
    accent: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
    glow: 'rgba(99,102,241,0.45)',
  },
];

// One-time keyframe injection (no external animation deps)
function injectSelectionAnims() {
  if (typeof document === 'undefined' || document.getElementById('msp-anims')) return;
  const s = document.createElement('style');
  s.id = 'msp-anims';
  s.textContent = `
    @keyframes msp-rise   { from{opacity:0;transform:translateY(22px);} to{opacity:1;transform:translateY(0);} }
    @keyframes msp-fade   { from{opacity:0;} to{opacity:1;} }
    @keyframes msp-float  { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-14px) scale(1.04);} }
    @keyframes msp-float2 { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(16px) scale(1.06);} }
    @keyframes msp-spin   { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
    @keyframes msp-shimmer{ 0%{background-position:-160% 0;} 100%{background-position:260% 0;} }
    .msp-rise  { opacity:0; animation: msp-rise .6s cubic-bezier(0.16,1,0.3,1) forwards; }
    .msp-fade  { opacity:0; animation: msp-fade .8s ease forwards; }
  `;
  document.head.appendChild(s);
}

function PlatformCard({ platform, onEnter, index }) {
  const [hovered, setHovered] = useState(false);
  const Icon = platform.icon;

  return (
    <div
      className="msp-rise relative flex flex-col rounded-2xl cursor-pointer h-full"
      style={{
        animationDelay: `${0.18 + index * 0.12}s`,
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-8px) scale(1.015)' : 'translateY(0) scale(1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onEnter(platform.id)}
    >
      {/* Animated gradient glow ring (behind the card) */}
      <div
        className="absolute -inset-px rounded-2xl pointer-events-none"
        style={{
          background: platform.accent,
          opacity: hovered ? 0.9 : 0,
          filter: 'blur(14px)',
          transition: 'opacity 0.4s ease',
          zIndex: 0,
        }}
      />

      {/* Card surface */}
      <div
        className="relative flex flex-col flex-1 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, rgba(24,27,38,0.95), rgba(12,13,19,0.98))',
          border: `1px solid ${hovered ? 'rgba(99,102,241,0.5)' : 'var(--border-1)'}`,
          boxShadow: hovered
            ? `0 24px 60px rgba(0,0,0,0.55), 0 0 40px ${platform.glow}`
            : '0 4px 20px rgba(0,0,0,0.4)',
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
          zIndex: 1,
        }}
      >
        {/* Soft moving gradient sheen on hover */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
            backgroundSize: '220% 100%',
            opacity: hovered ? 1 : 0,
            animation: hovered ? 'msp-shimmer 1.6s ease forwards' : 'none',
            transition: 'opacity 0.3s ease',
          }}
        />
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: platform.accent, opacity: hovered ? 1 : 0.55, transition: 'opacity 0.35s' }} />

        <div className="p-7 flex flex-col flex-1 relative">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
              style={{
                background: hovered ? platform.accent : 'var(--bg-surface)',
                border: '1px solid var(--border-1)',
                boxShadow: hovered ? `0 8px 24px ${platform.glow}` : 'none',
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                transform: hovered ? 'rotate(-4deg) scale(1.05)' : 'none',
              }}
            >
              <Icon size={24} style={{ color: hovered ? '#fff' : 'var(--text-2)', transition: 'color 0.35s' }} strokeWidth={2} />
            </div>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wider"
              style={{
                background: hovered ? platform.accent : 'var(--brand-bg2)',
                color: hovered ? '#fff' : 'var(--brand)',
                border: `1px solid ${hovered ? 'transparent' : 'rgba(99,102,241,0.2)'}`,
                transition: 'all 0.35s ease',
              }}
            >
              {platform.tag}
            </span>
          </div>

          {/* Title block */}
          <div className="mb-4">
            <div className="text-xs font-semibold tracking-widest mb-1.5" style={{ color: 'var(--text-3)' }}>
              {platform.subtitle}
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-1)' }}>{platform.title}</h3>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: 'var(--text-2)' }}>
            {platform.description}
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 mb-7">
            {platform.features.map(feature => (
              <div key={feature} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: platform.accent }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: hovered ? platform.accent : 'var(--bg-surface)',
              color: hovered ? '#fff' : 'var(--brand)',
              border: '1px solid rgba(99,102,241,0.22)',
              boxShadow: hovered ? `0 8px 24px ${platform.glow}` : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <span>Enter {platform.title}</span>
            <ArrowRight size={15} style={{ transform: hovered ? 'translateX(4px)' : 'none', transition: 'transform 0.3s ease' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MainSelectionPage() {
  const { setCurrentPage, user, getMetrics } = useApp();
  const metrics = getMetrics();

  useEffect(() => { injectSelectionAnims(); }, []);

  return (
    <div className="flex-1 overflow-y-auto relative">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: 520, height: 520, top: -160, left: '8%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.16), transparent 70%)',
            filter: 'blur(40px)', animation: 'msp-float 14s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 600, height: 600, top: '20%', right: '4%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)',
            filter: 'blur(50px)', animation: 'msp-float2 18s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 420, height: 420, bottom: -120, left: '40%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.10), transparent 70%)',
            filter: 'blur(45px)', animation: 'msp-float 20s ease-in-out infinite',
          }}
        />
      </div>

      <div className="relative px-6 pt-10 pb-12 max-w-6xl mx-auto">

        {/* Page header — centered */}
        <div className="text-center mb-9 msp-rise" style={{ animationDelay: '0s' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'var(--brand-bg2)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand)', boxShadow: '0 0 8px var(--brand)' }} />
            <span className="text-xs font-bold tracking-wider" style={{ color: 'var(--brand)' }}>CHOOSE YOUR MARKET</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3" style={{ color: 'var(--text-1)' }}>
            Welcome back,{' '}
            <span className="text-gradient-brand capitalize">
              {user?.name || 'Trader'}
            </span>
          </h1>
          <p className="text-base" style={{ color: 'var(--text-2)' }}>
            Select a trading module to access global markets
          </p>
        </div>

        {/* Quick metrics — centered glass bar */}
        <div className="flex justify-center mb-12 msp-rise" style={{ animationDelay: '0.08s' }}>
          <div
            className="inline-flex items-center gap-8 px-7 py-4 rounded-2xl flex-wrap justify-center"
            style={{
              background: 'linear-gradient(165deg, rgba(24,27,38,0.7), rgba(12,13,19,0.7))',
              border: '1px solid var(--border-1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {[
              { label: 'Balance', value: `$${formatCurrency(metrics.balance)}`, highlight: false },
              { label: 'Equity', value: `$${formatCurrency(metrics.equity)}`, highlight: false },
              { label: 'Open Trades', value: String(metrics.openPositions), highlight: true },
              { label: "Today's P&L", value: `${metrics.pnl >= 0 ? '+' : ''}$${formatCurrency(metrics.pnl)}`, highlight: false, pnl: metrics.pnl },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <div className="w-px h-9" style={{ background: 'var(--border-1)' }} />}
                <div className="flex flex-col gap-0.5 items-center">
                  <div className="font-mono font-bold text-lg"
                    style={{ color: stat.pnl !== undefined ? (stat.pnl >= 0 ? 'var(--green)' : 'var(--red)') : stat.highlight ? 'var(--brand-light)' : 'var(--text-1)' }}>
                    {stat.value}
                  </div>
                  <div className="text-xs tracking-wide" style={{ color: 'var(--text-3)' }}>{stat.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Platform Cards — centered grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {PLATFORMS.map((platform, idx) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              onEnter={setCurrentPage}
              index={idx}
            />
          ))}
        </div>

        {/* Quick Access — premium navigation hub */}
        <div className="msp-rise" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="text-xs font-bold tracking-widest" style={{ color: 'var(--text-3)' }}>QUICK ACCESS</div>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, var(--border-1), transparent)' }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, desc: 'Overview & analytics' },
              { id: 'wallet', label: 'Wallet', icon: Shield, desc: 'Funds & deposits' },
              { id: 'positions', label: 'Positions', icon: Globe, desc: 'Open trades' },
              { id: 'history', label: 'History', icon: BarChart3, desc: 'Past trades' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className="group flex items-center gap-3.5 p-4 rounded-xl text-left relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(165deg, rgba(24,27,38,0.8), rgba(12,13,19,0.9))',
                    border: '1px solid var(--border-0)',
                    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4), 0 0 24px rgba(99,102,241,0.18)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-0)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)' }}>
                    <Icon size={16} style={{ color: 'var(--brand)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{item.label}</div>
                    <div className="text-xs" style={{ color: 'var(--text-3)' }}>{item.desc}</div>
                  </div>
                  <ArrowRight
                    size={15}
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ color: 'var(--brand)' }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
