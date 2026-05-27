import React, { useState } from 'react';
import { Zap, BarChart3, LineChart, ArrowRight, TrendingUp, Shield, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/mockData';

const PLATFORMS = [
  {
    id: 'simple',
    title: 'Simple Trade',
    subtitle: 'PREMIUM TRADING',
    description: 'Experience the thrill of precision trading with a clean, intuitive interface. Place trades on gold, oil, forex, and crypto with luxury-grade execution.',
    icon: Zap,
    features: ['Gold & Commodities', 'Crypto Assets', 'Forex Pairs', '1x–20x Leverage'],
    accentColor: '#e63946',
    accentFrom: '#7f1d1d',
    accentTo: '#e63946',
    glowColor: 'rgba(230,57,70,0.15)',
    borderColor: 'rgba(230,57,70,0.25)',
    tag: 'MOST POPULAR',
    tagBg: 'rgba(230,57,70,0.15)',
    tagColor: '#e63946',
    bgPattern: 'radial-gradient(ellipse at top right, rgba(230,57,70,0.08) 0%, transparent 60%)',
  },
  {
    id: 'crypto',
    title: 'Crypto Futures',
    subtitle: 'FUTURES TERMINAL',
    description: 'Professional crypto futures trading. BTC, ETH, SOL, DOGE with advanced order book, real-time depth, and up to 100x leverage.',
    icon: BarChart3,
    features: ['BTC/ETH/SOL/DOGE', 'Up to 100x Leverage', 'Order Book & Depth', 'Long & Short'],
    accentColor: '#4361ee',
    accentFrom: '#1e3a8a',
    accentTo: '#4361ee',
    glowColor: 'rgba(67,97,238,0.15)',
    borderColor: 'rgba(67,97,238,0.25)',
    tag: 'ADVANCED',
    tagBg: 'rgba(67,97,238,0.15)',
    tagColor: '#4361ee',
    bgPattern: 'radial-gradient(ellipse at top right, rgba(67,97,238,0.08) 0%, transparent 60%)',
  },
  {
    id: 'forex',
    title: 'Forex & Commodities',
    subtitle: 'PROFESSIONAL',
    description: 'Institutional-grade forex and commodities trading. XAU/USD, EUR/USD, GBP/USD and more with TradingView-inspired charts.',
    icon: LineChart,
    features: ['5 Major Pairs', 'Gold & Oil', 'Advanced Charts', 'Pro Order Panel'],
    accentColor: '#06d6a0',
    accentFrom: '#065f46',
    accentTo: '#06d6a0',
    glowColor: 'rgba(6,214,160,0.15)',
    borderColor: 'rgba(6,214,160,0.25)',
    tag: 'INSTITUTIONAL',
    tagBg: 'rgba(6,214,160,0.15)',
    tagColor: '#06d6a0',
    bgPattern: 'radial-gradient(ellipse at top right, rgba(6,214,160,0.08) 0%, transparent 60%)',
  },
];

function PlatformCard({ platform, onEnter, index }) {
  const [hovered, setHovered] = useState(false);
  const Icon = platform.icon;

  return (
    <div
      className="relative flex flex-col rounded-2xl overflow-hidden cursor-pointer animate-fade-in"
      style={{
        animationDelay: `${index * 0.15}s`,
        background: 'linear-gradient(145deg, rgba(22,22,22,0.98), rgba(14,14,14,0.98))',
        border: `1px solid ${hovered ? platform.borderColor : 'rgba(255,255,255,0.06)'}`,
        boxShadow: hovered
          ? `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${platform.glowColor}`
          : '0 4px 30px rgba(0,0,0,0.5)',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onEnter(platform.id)}
    >
      {/* Background pattern */}
      <div className="absolute inset-0" style={{ background: platform.bgPattern }} />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${platform.accentColor}, transparent)`, opacity: hovered ? 1 : 0.3 }} />

      {/* Tag */}
      <div className="absolute top-4 right-4">
        <span className="px-2 py-0.5 rounded text-xs font-bold tracking-wider"
          style={{ background: platform.tagBg, color: platform.tagColor }}>
          {platform.tag}
        </span>
      </div>

      <div className="relative z-10 p-7 flex flex-col flex-1">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: `linear-gradient(135deg, ${platform.accentFrom}, ${platform.accentTo})`,
              boxShadow: `0 0 30px ${platform.glowColor}`,
            }}>
            <Icon size={26} className="text-white" />
          </div>
          <div className="text-xs font-bold tracking-[0.15em] mb-1" style={{ color: platform.accentColor }}>
            {platform.subtitle}
          </div>
          <h3 className="text-2xl font-bold text-white">{platform.title}</h3>
        </div>

        {/* Description */}
        <p className="text-white/50 text-sm leading-relaxed mb-6 flex-1">
          {platform.description}
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 mb-7">
          {platform.features.map(feature => (
            <div key={feature} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: platform.accentColor }} />
              <span className="text-white/50 text-xs">{feature}</span>
            </div>
          ))}
        </div>

        {/* Enter button */}
        <button
          className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300"
          style={{
            background: hovered
              ? `linear-gradient(135deg, ${platform.accentFrom}, ${platform.accentTo})`
              : 'rgba(255,255,255,0.05)',
            color: hovered ? '#fff' : platform.accentColor,
            border: `1px solid ${platform.borderColor}`,
            boxShadow: hovered ? `0 0 20px ${platform.glowColor}` : 'none',
          }}
        >
          <span>Enter {platform.title}</span>
          <ArrowRight size={16} className={`transition-transform duration-300 ${hovered ? 'translate-x-1' : ''}`} />
        </button>
      </div>

      {/* Bottom glow */}
      {hovered && (
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${platform.glowColor}, transparent)`,
          }} />
      )}
    </div>
  );
}

export default function MainSelectionPage() {
  const { setCurrentPage, user, wallet, getMetrics } = useApp();
  const metrics = getMetrics();

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero Section */}
      <div className="relative px-6 pt-8 pb-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-5"
            style={{ background: 'radial-gradient(circle, #ffd700, transparent)' }} />
        </div>

        <div className="relative z-10 text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.15)' }}>
            <span className="text-yellow-400 text-xs font-semibold tracking-wider">CHOOSE YOUR MARKET</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Welcome back,{' '}
            <span className="text-gradient-gold capitalize">
              {user?.name || 'Trader'}
            </span>
          </h1>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            Select your trading module and start executing premium trades across global markets
          </p>
        </div>

        {/* Quick stats row */}
        <div className="flex justify-center gap-6 mb-10 flex-wrap">
          {[
            { label: 'Balance', value: `$${formatCurrency(metrics.balance)}`, color: 'text-white' },
            { label: 'Equity', value: `$${formatCurrency(metrics.equity)}`, color: 'text-white' },
            { label: 'Open Trades', value: metrics.openPositions, color: 'text-yellow-400' },
            { label: "Today's P&L", value: `${metrics.pnl >= 0 ? '+' : ''}$${formatCurrency(metrics.pnl)}`, color: metrics.pnl >= 0 ? 'text-emerald-400' : 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className={`font-bold text-lg font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-white/30 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {PLATFORMS.map((platform, idx) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              onEnter={setCurrentPage}
              index={idx}
            />
          ))}
        </div>
      </div>

      {/* Quick Access Bar */}
      <div className="px-6 pb-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, desc: 'Overview & analytics' },
            { id: 'wallet', label: 'Wallet', icon: Shield, desc: 'Funds & deposits' },
            { id: 'positions', label: 'Positions', icon: Globe, desc: 'Open trades' },
            { id: 'history', label: 'History', icon: BarChart3, desc: 'Past trades' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className="flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 text-left"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,215,0,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,215,0,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,215,0,0.08)' }}>
                  <Icon size={15} className="text-yellow-400" />
                </div>
                <div>
                  <div className="text-white/80 text-sm font-medium">{item.label}</div>
                  <div className="text-white/30 text-xs">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
