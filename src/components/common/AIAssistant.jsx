import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, TrendingUp, TrendingDown, AlertCircle, Minus } from 'lucide-react';

// Inject keyframes once
const STYLES_ID = 'ai-assistant-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(STYLES_ID)) {
  const style = document.createElement('style');
  style.id = STYLES_ID;
  style.textContent = `
    @keyframes aiPanelIn {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)   scale(1);    }
    }
    @keyframes aiBlink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }
    @keyframes aiFadeInsight {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0);   }
    }
    @keyframes aiPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
      50%       { box-shadow: 0 0 0 8px rgba(59,130,246,0);  }
    }
  `;
  document.head.appendChild(style);
}

const ALL_INSIGHTS = [
  {
    id: 1,
    symbol: 'BTC/USD',
    type: 'bullish',
    confidence: 82,
    text: 'Bitcoin broke above the 200-day EMA with strong volume. RSI divergence signals continuation toward $72,000 resistance.',
  },
  {
    id: 2,
    symbol: 'ETH/USD',
    type: 'neutral',
    confidence: 61,
    text: 'Ethereum consolidating in a tight range. Watch for a breakout above $3,600 — increased funding rates suggest cautious longs.',
  },
  {
    id: 3,
    symbol: 'XAU/USD',
    type: 'bullish',
    confidence: 76,
    text: 'Gold forming a bull flag on the 4H chart. Geopolitical uncertainty and softer USD are supporting the upside move toward $2,380.',
  },
  {
    id: 4,
    symbol: 'OIL/USD',
    type: 'bearish',
    confidence: 69,
    text: 'Crude Oil faces resistance at $80.50. OPEC supply concerns offset by weakening demand from China. Downside bias to $75 likely.',
  },
  {
    id: 5,
    symbol: 'EUR/USD',
    type: 'bearish',
    confidence: 58,
    text: 'EUR/USD rejected at 1.0900 for the third time. ECB dovish rhetoric and strong US jobs data maintain bearish pressure.',
  },
  {
    id: 6,
    symbol: 'SOL/USD',
    type: 'bullish',
    confidence: 73,
    text: 'Solana showing relative strength vs. BTC. Network activity hit a 6-month high; momentum favors continuation above $155.',
  },
  {
    id: 7,
    symbol: 'GBP/USD',
    type: 'warning',
    confidence: 55,
    text: 'Sterling approaching key 1.2750 support. UK inflation data due Thursday — elevated vol expected, tight stops advised.',
  },
  {
    id: 8,
    symbol: 'USD/JPY',
    type: 'warning',
    confidence: 64,
    text: 'USD/JPY at 154.80 — BOJ intervention risk elevated above 155. Reward/risk for longs is unfavorable at current levels.',
  },
  {
    id: 9,
    symbol: 'BTC/USD',
    type: 'bullish',
    confidence: 79,
    text: 'On-chain data shows long-term holders accumulating. Exchange outflows at a 3-month high — classic pre-rally supply squeeze.',
  },
  {
    id: 10,
    symbol: 'XAU/USD',
    type: 'neutral',
    confidence: 60,
    text: 'Gold testing monthly VWAP. Mixed Fed signals creating short-term indecision. Bias stays long above $2,295 structural support.',
  },
];

const TYPE_CONFIG = {
  bullish: {
    color: '#1ea774',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.2)',
    icon: TrendingUp,
    label: 'Bullish',
  },
  bearish: {
    color: '#d44333',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.2)',
    icon: TrendingDown,
    label: 'Bearish',
  },
  warning: {
    color: '#eab308',
    bg: 'rgba(234,179,8,0.1)',
    border: 'rgba(234,179,8,0.2)',
    icon: AlertCircle,
    label: 'Caution',
  },
  neutral: {
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.15)',
    icon: Minus,
    label: 'Neutral',
  },
};

const SENTIMENT_DATA = [
  { symbol: 'BTC', pct: 68, label: 'Bullish', color: '#1ea774' },
  { symbol: 'ETH', pct: 54, label: 'Neutral', color: '#94a3b8' },
  { symbol: 'Gold', pct: 72, label: 'Bullish', color: '#1ea774' },
];

// Pick 4 random insights from the full pool
function pickInsights() {
  const shuffled = [...ALL_INSIGHTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

function InsightCard({ insight, animKey }) {
  const cfg = TYPE_CONFIG[insight.type] || TYPE_CONFIG.neutral;
  const Icon = cfg.icon;

  return (
    <div
      key={animKey}
      style={{
        background: 'rgba(17,17,17,0.9)',
        border: `1px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: 10,
        padding: '12px 14px',
        animation: 'aiFadeInsight 0.4s ease forwards',
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Type badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 4,
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              color: cfg.color,
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <Icon size={10} strokeWidth={2.5} />
            {cfg.label}
          </span>
          {/* Symbol */}
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#3B82F6',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.03em',
            }}
          >
            {insight.symbol}
          </span>
        </div>
        {/* Confidence */}
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
            Confidence
          </span>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: insight.confidence >= 70 ? '#1ea774' : insight.confidence >= 55 ? '#eab308' : '#94a3b8',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {insight.confidence}%
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div
        style={{
          height: 2,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 1,
          marginBottom: 10,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${insight.confidence}%`,
            background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`,
            borderRadius: 1,
            transition: 'width 0.6s ease',
          }}
        />
      </div>

      {/* Text */}
      <p
        style={{
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.6,
          fontWeight: 400,
        }}
      >
        {insight.text}
      </p>
    </div>
  );
}

function SentimentBar({ symbol, pct, label, color }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#f5f5f5',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {symbol}
        </span>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {pct}% <span style={{ opacity: 0.7 }}>{label}</span>
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}60, ${color})`,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [insights, setInsights] = useState(() => pickInsights());
  const [animKey, setAnimKey] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    intervalRef.current = setInterval(() => {
      setInsights(pickInsights());
      setAnimKey(k => k + 1);
    }, 7000);
    return () => clearInterval(intervalRef.current);
  }, [open]);

  return (
    <>
      {/* Panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(1.5rem + 56px + 12px)',
            left: '1.5rem',
            width: 400,
            height: 500,
            zIndex: 50,
            background: '#0a0a0a',
            border: '1px solid rgba(59,130,246,0.14)',
            borderRadius: 16,
            boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'aiPanelIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'linear-gradient(135deg, rgba(26,22,8,0.9), rgba(14,14,14,0.9))',
              flexShrink: 0,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: 'linear-gradient(135deg, #6D28D9, #3B82F6 50%, #6D28D9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 14px rgba(59,130,246,0.25)',
                  }}
                >
                  <Sparkles size={15} color="#000" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '0.01em',
                      }}
                    >
                      Plus AI
                    </span>
                    {/* Live indicator */}
                    <div className="flex items-center gap-1">
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: '#1ea774',
                          animation: 'aiBlink 1.4s ease-in-out infinite',
                        }}
                      />
                      <span style={{ fontSize: '0.625rem', color: '#1ea774', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Live Analysis
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500, letterSpacing: '0.03em', marginTop: 1 }}>
                    Market Intelligence
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                }}
                aria-label="Close AI Assistant"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {/* Insights label */}
            <div className="flex items-center justify-between mb-1">
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                AI Insights · Refreshes every 7s
              </span>
            </div>

            {/* Insight cards */}
            {insights.map((insight, i) => (
              <InsightCard key={`${animKey}-${insight.id}`} insight={insight} animKey={`${animKey}-${i}`} />
            ))}

            {/* Market Sentiment section */}
            <div
              style={{
                marginTop: 4,
                background: 'rgba(17,17,17,0.8)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 10,
                padding: '14px',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Market Sentiment
                </span>
                <span
                  style={{
                    fontSize: '0.625rem',
                    color: 'rgba(59,130,246,0.6)',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}
                >
                  LIVE
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {SENTIMENT_DATA.map(s => (
                  <SentimentBar key={s.symbol} {...s} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '1.5rem',
          zIndex: 50,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: open
            ? 'linear-gradient(135deg, #6D28D9, #3B82F6 50%, #6D28D9)'
            : 'linear-gradient(135deg, #6D28D9, #3B82F6 50%, #6D28D9)',
          backgroundSize: '200% 200%',
          backgroundPosition: open ? 'right center' : 'left center',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          boxShadow: open
            ? '0 0 30px rgba(59,130,246,0.5), 0 8px 24px rgba(0,0,0,0.5)'
            : '0 0 20px rgba(59,130,246,0.3), 0 6px 20px rgba(0,0,0,0.5)',
          transition: 'all 0.25s ease',
          animation: !open ? 'aiPulse 2.5s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
          e.currentTarget.style.boxShadow = '0 0 36px rgba(59,130,246,0.6), 0 10px 28px rgba(0,0,0,0.6)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = open
            ? '0 0 30px rgba(59,130,246,0.5), 0 8px 24px rgba(0,0,0,0.5)'
            : '0 0 20px rgba(59,130,246,0.3), 0 6px 20px rgba(0,0,0,0.5)';
        }}
        aria-label="Toggle AI Assistant"
      >
        <Sparkles size={18} color="#000" strokeWidth={2.2} />
        <span
          style={{
            fontSize: '0.5625rem',
            fontWeight: 800,
            color: '#000',
            letterSpacing: '0.06em',
            lineHeight: 1,
          }}
        >
          AI
        </span>
      </button>
    </>
  );
}
