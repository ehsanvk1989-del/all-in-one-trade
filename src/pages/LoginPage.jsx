import React, { useState } from 'react';
import { ArrowRight, Shield, Zap, Globe, TrendingUp, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FEATURES = [
  { icon: Zap, text: 'Lightning-fast execution' },
  { icon: Shield, text: 'Military-grade security' },
  { icon: Globe, text: 'Global markets access' },
  { icon: TrendingUp, text: 'Advanced analytics' },
];

// Demo credentials — replace with real authentication in production
const DEMO_CREDENTIALS = {
  email: 'ehsan@gmail.com',
  password: 'ehsan123',
};

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1000));

    if (email.trim().toLowerCase() !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      setLoading(false);
      setError('Invalid email or password. Please try again.');
      return;
    }
    login(email.trim().toLowerCase());
  };


  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0a' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)',
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)'
        }} />

        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-light))' }}>
            <span className="text-white font-black text-lg">P</span>
          </div>
          <div>
            <div className="text-gradient-brand font-bold text-xl tracking-widest">PLUS TRADE</div>
            <div className="text-white/30 text-xs tracking-wider">PREMIUM TRADING PLATFORM</div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <div className="mb-6">
            <div className="badge-brand mb-4">INSTITUTIONAL GRADE</div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Trade with{' '}
              <span className="text-gradient-brand">precision.</span>
              <br />
              Win with{' '}
              <span className="text-gradient-brand">confidence.</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed max-w-md">
              Access global markets with professional-grade tools. Crypto futures, forex,
              commodities — all in one premium platform.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { value: '$2.4B+', label: 'Daily Volume' },
              { value: '150K+', label: 'Active Traders' },
              { value: '99.9%', label: 'Uptime' },
            ].map(stat => (
              <div key={stat.label} className="text-center p-3 rounded-xl"
                style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <div className="text-gradient-brand font-bold text-lg">{stat.value}</div>
                <div className="text-white/40 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(59,130,246,0.1)' }}>
                  <Icon size={12} className="text-brand" />
                </div>
                <span className="text-white/50 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-white/20 text-xs">
          © 2024 Plus Trade. Demo Platform Only. Not financial advice.
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.02) 0%, transparent 70%)' }} />

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-light))' }}>
              <span className="text-white font-black text-lg">P</span>
            </div>
            <div className="text-gradient-brand font-bold text-xl tracking-widest">PLUS TRADE</div>
          </div>

          <div className="card-premium rounded-2xl p-8"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(59,130,246,0.05)' }}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-gradient-brand font-bold text-2xl mb-2">Welcome Back</div>
              <p className="text-white/40 text-sm">Sign in to access the platform</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    className="input-dark text-base"
                    style={{ padding: '0.875rem 1rem 0.875rem 2.6rem', fontSize: '0.9rem' }}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter your password"
                    className="input-dark text-base"
                    style={{ padding: '0.875rem 2.6rem', fontSize: '0.9rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                  style={{ background: 'var(--red-bg)', border: '1px solid rgba(212,67,51,0.2)' }}>
                  <Shield size={13} style={{ color: 'var(--red)', flexShrink: 0 }} />
                  <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-brand w-full py-3.5 rounded-xl text-base flex items-center justify-center gap-2"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    <span>Accessing Platform...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Platform</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-white/20 text-xs">SECURE ACCESS</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-white/25">
              <div className="flex items-center gap-1">
                <Shield size={12} />
                <span>256-bit SSL</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1">
                <Shield size={12} />
                <span>KYC Verified</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1">
                <Shield size={12} />
                <span>2FA Protected</span>
              </div>
            </div>
          </div>

          {/* Demo note */}
          <div className="text-center mt-4 text-white/20 text-xs">
            Demo Platform — No real funds involved
          </div>
          <div className="text-center mt-2">
            <a href="#admin" className="text-xs transition-colors hover:text-white/40" style={{ color: 'rgba(255,255,255,0.18)' }}>
              Admin Console →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
