import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';

const ADMIN_CREDENTIALS = { email: 'admin@gmail.com', password: 'admin123' };

export default function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter both email and password'); return; }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 900));
    if (email.trim().toLowerCase() === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      onSuccess();
    } else {
      setLoading(false);
      setError('Invalid administrator credentials. Access denied.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute rounded-full" style={{ width: 600, height: 600, top: -200, left: -100, background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute rounded-full" style={{ width: 600, height: 600, bottom: -200, right: -100, background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)' }}>
              <span className="text-white font-black text-lg">P</span>
            </div>
            <div>
              <div className="text-gradient-brand font-bold text-xl tracking-widest">PLUS TRADE</div>
              <div className="text-xs tracking-wider" style={{ color: 'var(--text-3)' }}>ADMIN CONSOLE</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', boxShadow: '0 24px 70px rgba(0,0,0,0.7)' }}>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={18} style={{ color: 'var(--brand)' }} />
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-1)' }}>Administrator Login</h1>
          </div>
          <p className="text-sm mb-7" style={{ color: 'var(--text-3)' }}>Restricted access — authorised personnel only</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Admin Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-4)' }} />
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="admin@plustrade.io" className="input-dark text-sm" style={{ padding: '0.8rem 1rem 0.8rem 2.6rem' }} autoFocus />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-4)' }} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter password" className="input-dark text-sm" style={{ padding: '0.8rem 2.6rem' }} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--text-3)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: 'var(--red-bg)', border: '1px solid rgba(212,67,51,0.2)' }}>
                <AlertTriangle size={14} style={{ color: 'var(--red)', flexShrink: 0 }} />
                <span className="text-xs" style={{ color: 'var(--red)' }}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-brand w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /><span>Authenticating…</span></>
              ) : (
                <><span>Access Console</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 flex items-center justify-center gap-2" style={{ borderTop: '1px solid var(--border-0)' }}>
            <ShieldCheck size={12} style={{ color: 'var(--text-4)' }} />
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>Protected by enterprise-grade security</span>
          </div>
        </div>

        <div className="text-center mt-5">
          <a href="#" className="text-xs transition-colors" style={{ color: 'var(--text-4)' }}
            onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>
            ← Back to Plus Trade platform
          </a>
        </div>
      </div>
    </div>
  );
}
