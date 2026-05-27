import React, { useState } from 'react';
import { ArrowRight, Shield, Zap, Globe, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FEATURES = [
  { icon: Zap, text: 'Lightning-fast execution' },
  { icon: Shield, text: 'Military-grade security' },
  { icon: Globe, text: 'Global markets access' },
  { icon: TrendingUp, text: 'Advanced analytics' },
];

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1200));
    login(email);
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0a' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(255,215,0,0.04) 0%, transparent 70%), radial-gradient(ellipse at 70% 20%, rgba(255,140,0,0.03) 0%, transparent 60%)',
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)'
        }} />

        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,215,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #b8860b, #ffd700)' }}>
            <span className="text-black font-black text-lg">P</span>
          </div>
          <div>
            <div className="text-gradient-gold font-bold text-xl tracking-widest">PLUS TRADE</div>
            <div className="text-white/30 text-xs tracking-wider">PREMIUM TRADING PLATFORM</div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <div className="mb-6">
            <div className="badge-gold mb-4">INSTITUTIONAL GRADE</div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Trade with{' '}
              <span className="text-gradient-gold">precision.</span>
              <br />
              Win with{' '}
              <span className="text-gradient-gold">confidence.</span>
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
                style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.1)' }}>
                <div className="text-gradient-gold font-bold text-lg">{stat.value}</div>
                <div className="text-white/40 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,215,0,0.1)' }}>
                  <Icon size={12} className="text-yellow-400" />
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
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.02) 0%, transparent 70%)' }} />

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #b8860b, #ffd700)' }}>
              <span className="text-black font-black text-lg">P</span>
            </div>
            <div className="text-gradient-gold font-bold text-xl tracking-widest">PLUS TRADE</div>
          </div>

          <div className="card-premium rounded-2xl p-8"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255,215,0,0.05)' }}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-gradient-gold font-bold text-2xl mb-2">Welcome Back</div>
              <p className="text-white/40 text-sm">Enter your email to access the platform</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-dark text-base"
                  style={{ padding: '0.875rem 1rem', fontSize: '0.9rem' }}
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-xs mt-2">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-3.5 rounded-xl text-base flex items-center justify-center gap-2"
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
        </div>
      </div>
    </div>
  );
}
