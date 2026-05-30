// ─────────────────────────────────────────────────────────────────────────────
// Admin panel mock data. Deterministic seeded generators so the dashboard looks
// consistent across reloads. Replace with real API calls in production.
// ─────────────────────────────────────────────────────────────────────────────

// Tiny seeded PRNG (mulberry32) for stable demo data
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ['Ehsan', 'Sarah', 'Liam', 'Aria', 'Omar', 'Mei', 'Carlos', 'Nadia', 'Viktor', 'Yuki', 'Hassan', 'Elena', 'Tom', 'Priya', 'Diego', 'Fatima', 'Noah', 'Zara', 'Kenji', 'Anya', 'Marcus', 'Layla', 'Ivan', 'Sofia', 'Raj', 'Chloe', 'Mateo', 'Hana', 'Yusuf', 'Lena'];
const LAST = ['Khan', 'Smith', 'Walker', 'Hassan', 'Reed', 'Tanaka', 'Mendez', 'Ali', 'Petrov', 'Sato', 'Ahmed', 'Volkov', 'Nguyen', 'Patel', 'Garcia', 'Haddad', 'Kim', 'Rossi', 'Cohen', 'Müller', 'Silva', 'Yilmaz', 'Novak', 'Costa', 'Sharma', 'Dubois', 'Lopez', 'Ito', 'Said', 'Berg'];
const COUNTRIES = ['United Kingdom', 'United States', 'UAE', 'Germany', 'Japan', 'Singapore', 'Spain', 'Canada', 'Turkey', 'India', 'Brazil', 'France', 'Netherlands', 'Australia'];
const COUNTRY_FLAG = { 'United Kingdom': '🇬🇧', 'United States': '🇺🇸', 'UAE': '🇦🇪', 'Germany': '🇩🇪', 'Japan': '🇯🇵', 'Singapore': '🇸🇬', 'Spain': '🇪🇸', 'Canada': '🇨🇦', 'Turkey': '🇹🇷', 'India': '🇮🇳', 'Brazil': '🇧🇷', 'France': '🇫🇷', 'Netherlands': '🇳🇱', 'Australia': '🇦🇺' };
const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOGE/USDT', 'XAU/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'OIL'];
const NETWORKS = ['TRC20', 'ERC20', 'BEP20'];
const STATUSES = ['active', 'active', 'active', 'active', 'suspended', 'pending'];
const KYC = ['verified', 'verified', 'verified', 'pending', 'rejected'];
const TIERS = ['Standard', 'Premium', 'VIP', 'Institutional'];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function fmtDate(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDateTime(d) {
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function getFlag(country) { return COUNTRY_FLAG[country] || '🌐'; }

// ── Users ──────────────────────────────────────────────────────────────────
export const USERS = (() => {
  const r = rng(20240530);
  const list = [];
  for (let i = 0; i < 48; i++) {
    const first = FIRST[Math.floor(r() * FIRST.length)];
    const last = LAST[Math.floor(r() * LAST.length)];
    const country = COUNTRIES[Math.floor(r() * COUNTRIES.length)];
    const balance = Math.round(r() * 95000 + 500);
    const pnl = Math.round((r() - 0.42) * 28000);
    const status = STATUSES[Math.floor(r() * STATUSES.length)];
    const regDays = Math.floor(r() * 720) + 5;
    list.push({
      id: 'PT' + (100043 + i).toString(),
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${['gmail.com', 'outlook.com', 'proton.me', 'icloud.com'][Math.floor(r() * 4)]}`,
      country,
      tier: TIERS[Math.floor(r() * TIERS.length)],
      status,
      kyc: KYC[Math.floor(r() * KYC.length)],
      balance,
      equity: Math.round(balance + pnl * 0.4),
      pnl,
      totalTrades: Math.floor(r() * 480) + 2,
      winRate: Math.round(r() * 45 + 35),
      registered: fmtDate(daysAgo(regDays)),
      regDays,
      lastLogin: fmtDateTime(daysAgo(Math.floor(r() * 14))),
      lastLoginDays: Math.floor(r() * 14),
      openPositions: Math.floor(r() * 6),
    });
  }
  return list;
})();

// ── Transactions (deposits + withdrawals) ────────────────────────────────────
export const TRANSACTIONS = (() => {
  const r = rng(778812);
  const list = [];
  for (let i = 0; i < 60; i++) {
    const user = USERS[Math.floor(r() * USERS.length)];
    const type = r() > 0.45 ? 'deposit' : 'withdrawal';
    const amount = Math.round(r() * 18000 + 100);
    const statusRoll = r();
    const status = type === 'withdrawal'
      ? (statusRoll > 0.7 ? 'pending' : statusRoll > 0.12 ? 'completed' : 'rejected')
      : (statusRoll > 0.85 ? 'processing' : 'completed');
    const d = daysAgo(Math.floor(r() * 30));
    list.push({
      id: 'TX' + (50219 + i).toString(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      type,
      amount,
      currency: 'USDT',
      network: NETWORKS[Math.floor(r() * NETWORKS.length)],
      status,
      date: fmtDateTime(d),
      ts: d.getTime(),
      txHash: '0x' + Math.floor(r() * 0xffffffffff).toString(16).padStart(10, '0') + '...' + Math.floor(r() * 0xffff).toString(16).padStart(4, '0'),
    });
  }
  return list.sort((a, b) => b.ts - a.ts);
})();

export const DEPOSITS = TRANSACTIONS.filter(t => t.type === 'deposit');
export const WITHDRAWALS = TRANSACTIONS.filter(t => t.type === 'withdrawal');

// ── Trades (closed) ───────────────────────────────────────────────────────────
export const TRADES = (() => {
  const r = rng(443201);
  const list = [];
  for (let i = 0; i < 80; i++) {
    const user = USERS[Math.floor(r() * USERS.length)];
    const symbol = SYMBOLS[Math.floor(r() * SYMBOLS.length)];
    const side = r() > 0.5 ? 'long' : 'short';
    const leverage = [5, 10, 20, 25, 50, 100][Math.floor(r() * 6)];
    const entry = symbol.includes('BTC') ? 60000 + r() * 12000 : symbol.includes('ETH') ? 2400 + r() * 600 : symbol.includes('XAU') ? 2300 + r() * 200 : 1 + r() * 180;
    const pnl = Math.round((r() - 0.45) * 6000);
    const volume = +(r() * 4 + 0.05).toFixed(3);
    const d = daysAgo(Math.floor(r() * 20));
    list.push({
      id: 'TR' + (90817 + i).toString(),
      userId: user.id,
      userName: user.name,
      symbol,
      side,
      leverage,
      volume,
      entry: +entry.toFixed(2),
      exit: +(entry * (1 + (r() - 0.5) * 0.04)).toFixed(2),
      pnl,
      module: symbol.includes('USDT') ? 'crypto' : (symbol === 'XAU/USD' || symbol === 'OIL') ? 'forex' : 'forex',
      status: 'closed',
      date: fmtDateTime(d),
      ts: d.getTime(),
    });
  }
  return list.sort((a, b) => b.ts - a.ts);
})();

// ── Open positions ────────────────────────────────────────────────────────────
export const POSITIONS = (() => {
  const r = rng(91200);
  const list = [];
  for (let i = 0; i < 34; i++) {
    const user = USERS[Math.floor(r() * USERS.length)];
    const symbol = SYMBOLS[Math.floor(r() * SYMBOLS.length)];
    const side = r() > 0.5 ? 'long' : 'short';
    const leverage = [5, 10, 20, 25, 50, 100][Math.floor(r() * 6)];
    const entry = symbol.includes('BTC') ? 60000 + r() * 12000 : symbol.includes('ETH') ? 2400 + r() * 600 : symbol.includes('XAU') ? 2300 + r() * 200 : 1 + r() * 180;
    const mark = entry * (1 + (r() - 0.5) * 0.03);
    const margin = Math.round(r() * 5000 + 200);
    const pnl = Math.round((mark - entry) / entry * margin * leverage * (side === 'long' ? 1 : -1));
    const liqDist = (r() * 18 + 2);
    list.push({
      id: 'PS' + (33401 + i).toString(),
      userId: user.id,
      userName: user.name,
      symbol,
      side,
      leverage,
      entry: +entry.toFixed(2),
      mark: +mark.toFixed(2),
      margin,
      pnl,
      liqDistance: +liqDist.toFixed(1),
      risk: liqDist < 6 ? 'high' : liqDist < 12 ? 'medium' : 'low',
    });
  }
  return list.sort((a, b) => a.liqDistance - b.liqDistance);
})();

// ── Audit logs ────────────────────────────────────────────────────────────────
const AUDIT_ACTIONS = [
  { action: 'Approved withdrawal', cat: 'finance' },
  { action: 'Rejected withdrawal', cat: 'finance' },
  { action: 'Suspended user account', cat: 'user' },
  { action: 'Reactivated user account', cat: 'user' },
  { action: 'Updated KYC status', cat: 'user' },
  { action: 'Manual balance adjustment', cat: 'finance' },
  { action: 'Force-closed position', cat: 'trading' },
  { action: 'Changed risk limits', cat: 'system' },
  { action: 'Updated platform settings', cat: 'system' },
  { action: 'Exported user report', cat: 'system' },
  { action: 'Logged in', cat: 'auth' },
  { action: 'Adjusted leverage cap', cat: 'system' },
];
export const AUDIT_LOGS = (() => {
  const r = rng(11551);
  const admins = ['admin@gmail.com', 'ops@plustrade.io', 'risk@plustrade.io'];
  const list = [];
  for (let i = 0; i < 40; i++) {
    const a = AUDIT_ACTIONS[Math.floor(r() * AUDIT_ACTIONS.length)];
    const user = USERS[Math.floor(r() * USERS.length)];
    const d = daysAgo(Math.floor(r() * 7));
    d.setHours(Math.floor(r() * 24), Math.floor(r() * 60));
    list.push({
      id: 'LOG' + (7001 + i),
      admin: admins[Math.floor(r() * admins.length)],
      action: a.action,
      category: a.cat,
      target: a.cat === 'system' || a.cat === 'auth' ? '—' : `${user.name} (${user.id})`,
      ip: `${Math.floor(r() * 200 + 20)}.${Math.floor(r() * 255)}.xx.xx`,
      date: fmtDateTime(d),
      ts: d.getTime(),
    });
  }
  return list.sort((a, b) => b.ts - a.ts);
})();

// ── Aggregate platform metrics ────────────────────────────────────────────────
export function getPlatformStats() {
  const totalUsers = USERS.length;
  const activeUsers = USERS.filter(u => u.status === 'active').length;
  const suspendedUsers = USERS.filter(u => u.status === 'suspended').length;
  const pendingKyc = USERS.filter(u => u.kyc === 'pending').length;
  const totalBalance = USERS.reduce((s, u) => s + u.balance, 0);
  const totalEquity = USERS.reduce((s, u) => s + u.equity, 0);
  const totalDeposits = DEPOSITS.filter(d => d.status === 'completed').reduce((s, d) => s + d.amount, 0);
  const totalWithdrawals = WITHDRAWALS.filter(d => d.status === 'completed').reduce((s, d) => s + d.amount, 0);
  const pendingWithdrawals = WITHDRAWALS.filter(d => d.status === 'pending');
  const netFlow = totalDeposits - totalWithdrawals;
  const totalTrades = TRADES.length;
  const totalVolume = TRADES.reduce((s, t) => s + t.volume * t.entry, 0);
  const platformPnl = TRADES.reduce((s, t) => s + t.pnl, 0);
  const openPositions = POSITIONS.length;
  const openExposure = POSITIONS.reduce((s, p) => s + p.margin * p.leverage, 0);
  const highRiskPositions = POSITIONS.filter(p => p.risk === 'high').length;
  const winRate = ((TRADES.filter(t => t.pnl > 0).length / TRADES.length) * 100).toFixed(1);

  return {
    totalUsers, activeUsers, suspendedUsers, pendingKyc,
    totalBalance, totalEquity, totalDeposits, totalWithdrawals, netFlow,
    pendingWithdrawalsCount: pendingWithdrawals.length,
    pendingWithdrawalsAmount: pendingWithdrawals.reduce((s, d) => s + d.amount, 0),
    totalTrades, totalVolume, platformPnl, openPositions, openExposure,
    highRiskPositions, winRate,
  };
}

// 14-day series for charts
export function getSeries() {
  const r = rng(5512);
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = daysAgo(i);
    days.push({
      label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      deposits: Math.round(r() * 60000 + 20000),
      withdrawals: Math.round(r() * 45000 + 10000),
      volume: Math.round(r() * 900000 + 300000),
      newUsers: Math.floor(r() * 18 + 3),
      activeUsers: Math.floor(r() * 120 + 180),
    });
  }
  return days;
}

// Top markets by volume
export function getTopMarkets() {
  const map = {};
  TRADES.forEach(t => {
    if (!map[t.symbol]) map[t.symbol] = { symbol: t.symbol, volume: 0, trades: 0, pnl: 0 };
    map[t.symbol].volume += t.volume * t.entry;
    map[t.symbol].trades += 1;
    map[t.symbol].pnl += t.pnl;
  });
  return Object.values(map).sort((a, b) => b.volume - a.volume);
}

// System / infra status (demo)
export const SYSTEM_SERVICES = [
  { name: 'Trading Engine', status: 'operational', uptime: '99.98%', latency: '12ms' },
  { name: 'Price Feed (WebSocket)', status: 'operational', uptime: '99.95%', latency: '8ms' },
  { name: 'Wallet Service', status: 'operational', uptime: '99.99%', latency: '24ms' },
  { name: 'Authentication', status: 'operational', uptime: '100%', latency: '15ms' },
  { name: 'Order Matching', status: 'degraded', uptime: '99.81%', latency: '47ms' },
  { name: 'KYC Provider', status: 'operational', uptime: '99.90%', latency: '210ms' },
  { name: 'Notification Service', status: 'operational', uptime: '99.93%', latency: '32ms' },
  { name: 'Database Cluster', status: 'operational', uptime: '99.99%', latency: '4ms' },
];

export function formatMoney(n) {
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(2);
}

export function formatFull(n) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
