import React, { useState } from 'react';
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
  },
  {
    id: 'crypto',
    title: 'Crypto Futures',
    subtitle: 'FUTURES TERMINAL',
    description: 'Professional crypto futures with live order book, real-time depth chart, and up to 100x leverage. BTC, ETH, SOL, DOGE perpetual contracts.',
    icon: BarChart3,
    features: ['BTC / ETH / SOL / DOGE', 'Up to 100x Leverage', 'Live Order Book', 'Long & Short'],
    tag: 'ADVANCED',
  },
  {
    id: 'forex',
    title: 'Forex & Commodities',
    subtitle: 'PROFESSIONAL',
    description: 'Institutional-grade forex and commodities with embedded TradingView charts. XAU/USD, EUR/USD, GBP/USD and WTI/USD on a pro terminal.',
    icon: LineChart,
    features: ['5 Major Pairs', 'Gold & Oil', 'TradingView Charts', 'Pro Order Panel'],
    tag: 'INSTITUTIONAL',
  },
];

function PlatformCard({ platform, onEnter, index }) {
  const [hovered, setHovered] = useState(false);
  const Icon = platform.icon;

  return (
    <div
      className="relative flex flex-col rounded-xl overflow-hidden cursor-pointer animate-fade-in"
      style={{
        animationDelay: `${index * 0.12}s`,
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'rgba(59,130,246,0.25)' : 'var(--border-0)'}`,
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onEnter(platform.id)}
    >
      {/* Top accent line */}
      <div className="h-px w-full"
        style={{ background: hovered ? 'linear-gradient(90deg, transparent, var(--brand), transparent)' : 'transparent', transition: 'background 0.3s' }} />

      <div className="p-6 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: hovered ? 'var(--brand-bg)' : 'var(--bg-surface)', border: '1px solid var(--border-1)', transition: 'background 0.3s' }}>
            <Icon size={20} style={{ color: hovered ? 'var(--brand-light)' : 'var(--text-2)', transition: 'color 0.3s' }} />
          </div>
          <span className="px-2 py-0.5 rounded text-xs font-bold tracking-wider"
            style={{ background: 'var(--brand-bg2)', color: 'var(--brand)' }}>
            {platform.tag}
          </span>
        </div>

        {/* Title block */}
        <div className="mb-4">
          <div className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>
            {platform.subtitle}
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>{platform.title}</h3>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: 'var(--text-2)' }}>
          {platform.description}
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 mb-6">
          {platform.features.map(feature => (
            <div key={feature} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--brand)' }} />
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            background: hovered ? 'linear-gradient(135deg, var(--brand), var(--brand-light))' : 'var(--bg-surface)',
            color: hovered ? '#fff' : 'var(--brand)',
            border: '1px solid rgba(59,130,246,0.2)',
          }}
        >
          <span>Enter {platform.title}</span>
          <ArrowRight size={14} className={`transition-transform duration-200 ${hovered ? 'translate-x-0.5' : ''}`} />
        </button>
      </div>
    </div>
  );
}

export default function MainSelectionPage() {
  const { setCurrentPage, user, getMetrics } = useApp();
  const metrics = getMetrics();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 pt-7 pb-6">

        {/* Page header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full mb-3"
            style={{ background: 'var(--brand-bg2)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <span className="text-xs font-semibold tracking-wider" style={{ color: 'var(--brand)' }}>CHOOSE YOUR MARKET</span>
          </div>
          <h1 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--text-1)' }}>
            Welcome back,{' '}
            <span className="text-gradient-brand capitalize">
              {user?.name || 'Trader'}
            </span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Select a trading module to access global markets
          </p>
        </div>

        {/* Quick metrics */}
        <div className="flex items-center gap-6 mb-8 flex-wrap">
          {[
            { label: 'Balance', value: `$${formatCurrency(metrics.balance)}`, highlight: false },
            { label: 'Equity', value: `$${formatCurrency(metrics.equity)}`, highlight: false },
            { label: 'Open Trades', value: String(metrics.openPositions), highlight: true },
            { label: "Today's P&L", value: `${metrics.pnl >= 0 ? '+' : ''}$${formatCurrency(metrics.pnl)}`, highlight: false, pnl: metrics.pnl },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col gap-0.5">
              <div className="font-mono font-bold text-base"
                style={{ color: stat.pnl !== undefined ? (stat.pnl >= 0 ? 'var(--green)' : 'var(--red)') : stat.highlight ? 'var(--brand-light)' : 'var(--text-1)' }}>
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-3)' }}>{stat.label}</div>
            </div>
          ))}
          <div className="w-px h-8 hidden sm:block" style={{ background: 'var(--border-1)' }} />
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mb-8">
          {PLATFORMS.map((platform, idx) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              onEnter={setCurrentPage}
              index={idx}
            />
          ))}
        </div>

        {/* Quick Access */}
        <div className="max-w-5xl">
          <div className="text-xs font-semibold tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>QUICK ACCESS</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
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
                  className="flex items-center gap-3 p-3 rounded-lg transition-all duration-150 text-left"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-0)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.borderColor = 'var(--border-1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--bg-card)';
                    e.currentTarget.style.borderColor = 'var(--border-0)';
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--bg-surface)' }}>
                    <Icon size={14} style={{ color: 'var(--brand)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{item.label}</div>
                    <div className="text-xs" style={{ color: 'var(--text-3)' }}>{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
