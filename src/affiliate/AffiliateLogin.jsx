import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, Eye, EyeOff, Users, TrendingUp, DollarSign, Globe } from 'lucide-react';

const CREDENTIALS = { email: 'affiliate@gmail.com', password: 'affiliate1234' };

const FEATURES = [
  { icon: TrendingUp, text: 'Real-time performance analytics' },
  { icon: Users,      text: 'Complete client management CRM' },
  { icon: DollarSign, text: 'Rebate & commission tracking' },
  { icon: Globe,      text: 'Multi-campaign referral tools' },
];

export default function AffiliateLogin({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 900));
    if (email.trim().toLowerCase() === CREDENTIALS.email && password === CREDENTIALS.password) {
      sessionStorage.setItem('pt_affiliate_authed', '1');
      onSuccess();
    } else {
      setLoading(false);
      setError('Invalid partner credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0a' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(16,185,129,0.04) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)' }}>
            <span className="text-white font-black text-lg">P</span>
          </div>
          <div>
            <div className="font-bold text-xl tracking-widest" style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PLUS TRADE</div>
            <div className="text-white/30 text-xs tracking-wider">PARTNER PORTAL</div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
              GOLD PARTNER PROGRAM
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Grow your{' '}
              <span style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>network.</span>
              <br />
              Earn with{' '}
              <span style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>every trade.</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed max-w-md">
              Track your referred clients, monitor rebates in real-time, and manage your commissions — all in one powerful partner dashboard.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { value: '$6/lot', label: 'Max Rebate' },
              { value: 'Monthly', label: 'Payouts' },
              { value: '24/7', label: 'Support' },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}>
                <div className="font-bold text-lg" style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.12)' }}>
                  <Icon size={12} style={{ color: '#10B981' }} />
                </div>
                <span className="text-white/50 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/20 text-xs">
          © 2025 Plus Trade. Partner Program. Demo environment.
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.02) 0%, transparent 70%)' }} />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)' }}>
              <span className="text-white font-black text-lg">P</span>
            </div>
            <div className="font-bold text-xl tracking-widest" style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PLUS TRADE</div>
          </div>

          <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(16,185,129,0.04)' }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10B981' }} /> Partner Portal
              </div>
              <div className="font-bold text-2xl mb-1" style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Welcome Back
              </div>
              <p className="text-white/40 text-sm">Sign in to your affiliate dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Partner Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-4)' }} />
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="affiliate@example.com" className="input-dark text-sm w-full"
                    style={{ padding: '0.875rem 1rem 0.875rem 2.6rem' }} autoFocus />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-4)' }} />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter your password" className="input-dark text-sm w-full"
                    style={{ padding: '0.875rem 2.6rem' }} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--text-3)' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', color: '#fff', opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /><span>Signing in…</span></>
                ) : (
                  <><span>Access Partner Dashboard</span><ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 text-center" style={{ borderTop: '1px solid var(--border-0)' }}>
              <span className="text-xs" style={{ color: 'var(--text-4)' }}>Not a partner yet? Contact your account manager.</span>
            </div>
          </div>

          <div className="text-center mt-4">
            <a href="#" onClick={e => { e.preventDefault(); window.location.hash = ''; }}
              className="text-xs transition-colors" style={{ color: 'var(--text-4)' }}>
              ← Back to Plus Trade
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
