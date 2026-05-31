// ─────────────────────────────────────────────────────────────────────────────
// Affiliate CRM mock data — deterministic seeded generators.
// Replace data-fetch calls with real API endpoints in production.
// ─────────────────────────────────────────────────────────────────────────────

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ['Omar', 'Sarah', 'Muhammad', 'Ahmed', 'Fatima', 'Raj', 'James', 'Layla', 'Yusuf', 'Elena', 'Hassan', 'Priya', 'Diego', 'Hana', 'Viktor', 'Mei', 'Nadia', 'Carlos'];
const LAST  = ['Hassan', 'Williams', 'Khan', 'Al-Rashid', 'Nour', 'Patel', 'Turner', 'Mansour', 'Ibrahim', 'Ivanova', 'Osei', 'Sharma', 'Reyes', 'Tanaka', 'Petrov', 'Li', 'Saleh', 'Mendez'];
const COUNTRIES = ['UAE', 'United Kingdom', 'Pakistan', 'Saudi Arabia', 'Egypt', 'India', 'Germany', 'Jordan', 'Nigeria', 'Malaysia', 'Turkey', 'Singapore', 'South Africa', 'Bangladesh', 'Ghana'];
const FLAGS = { UAE: '🇦🇪', 'United Kingdom': '🇬🇧', Pakistan: '🇵🇰', 'Saudi Arabia': '🇸🇦', Egypt: '🇪🇬', India: '🇮🇳', Germany: '🇩🇪', Jordan: '🇯🇴', Nigeria: '🇳🇬', Malaysia: '🇲🇾', Turkey: '🇹🇷', Singapore: '🇸🇬', 'South Africa': '🇿🇦', Bangladesh: '🇧🇩', Ghana: '🇬🇭' };
const DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'proton.me'];
const CAMPAIGN_NAMES = ['Social Media', 'YouTube Channel', 'Telegram Group', 'Email Newsletter', 'WhatsApp Network', 'Website Banner'];
const PAY_METHODS = ['USDT TRC20', 'USDT ERC20', 'Bank Transfer', 'Credit Card'];
const SYMBOLS_MAP = {
  crypto: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'DOGE/USDT'],
  forex:  ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'OIL/USD', 'GBP/JPY'],
  simple: ['BTC', 'ETH', 'EUR/USD', 'XAU/USD'],
};
const PRODUCTS = ['crypto', 'forex', 'simple'];
const REBATE_RATE = { crypto: 5, forex: 6, simple: 3 };
const CLIENT_STATUSES  = ['active', 'active', 'active', 'active', 'active', 'active', 'dormant', 'dormant', 'inactive', 'suspended'];
const ACTIVITY_STATUSES = ['active', 'active', 'active', 'active', 'dormant', 'dormant', 'inactive'];
const DEPOSIT_STATUSES  = ['completed', 'completed', 'completed', 'completed', 'processing', 'pending'];
const REBATE_STATUSES   = ['paid', 'paid', 'paid', 'approved', 'pending'];

function daysAgo(n) {
  const d = new Date(2025, 4, 31); // anchor to May 31 2025 for determinism
  d.setDate(d.getDate() - n);
  return d;
}
function fmtDate(d) { return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
function fmtDT(d)   { return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
function fmtMon(d)  { return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }); }

export function getFlag(country) { return FLAGS[country] || '🌐'; }

// ── Affiliate profile ─────────────────────────────────────────────────────────
export const AFFILIATE_PROFILE = {
  name: 'Ehsan Khan',
  email: 'affiliate@gmail.com',
  partnerId: 'AFF-2024-0847',
  commissionPlan: 'Standard IB',
  tier: 'Gold Partner',
  rebateRates: { crypto: '$5/lot', forex: '$6/lot', simple: '$3/lot' },
  paymentMethod: 'USDT TRC20',
  walletAddress: 'TGmx3kpQ7nR9wAuX2BsdYe8Lv4CfJ1hDpR9',
  payoutSchedule: 'Monthly (1st of each month)',
  registeredDate: '15 Jan 2024',
  referralCode: 'EHSAN2024',
  referralLink: 'https://plustrade.io/ref/EHSAN2024',
};

// ── Clients (18) ──────────────────────────────────────────────────────────────
export const CLIENTS = (() => {
  const r = rng(9991234);
  const list = [];
  for (let i = 0; i < 18; i++) {
    const first   = FIRST[i % FIRST.length];
    const last    = LAST[i % LAST.length];
    const country = COUNTRIES[Math.floor(r() * COUNTRIES.length)];
    const deposits = Math.round(r() * 46000 + 2000);
    const monthlyDeposit = Math.round(r() * 12000 + 500);
    const lots    = +(r() * 115 + 5).toFixed(1);
    const rebate  = Math.round(lots * (REBATE_RATE.crypto * 0.4 + REBATE_RATE.forex * 0.4 + REBATE_RATE.simple * 0.2));
    const regDays = Math.floor(r() * 400 + 10);
    const lastTrade = Math.floor(r() * 20);
    const status = CLIENT_STATUSES[Math.floor(r() * CLIENT_STATUSES.length)];
    const activity = lastTrade < 3 ? 'active' : lastTrade < 10 ? 'dormant' : 'inactive';
    list.push({
      id: 'CLI-' + (100 + i).toString(),
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase().replace('-','').replace("'",'').replace(' ','')}@${DOMAINS[Math.floor(r() * DOMAINS.length)]}`,
      country,
      flag: getFlag(country),
      registeredDate: fmtDate(daysAgo(regDays)),
      regDays,
      accountStatus: status,
      activityStatus: status === 'active' ? activity : 'inactive',
      totalDeposits: deposits,
      monthlyNetDeposit: monthlyDeposit,
      totalLots: lots,
      totalRebate: rebate,
      lastTradeDate: lastTrade === 0 ? 'Today' : fmtDate(daysAgo(lastTrade)),
      lastTradeDays: lastTrade,
      kycStatus: r() > 0.2 ? 'verified' : 'pending',
      campaign: CAMPAIGN_NAMES[Math.floor(r() * CAMPAIGN_NAMES.length)],
    });
  }
  return list;
})();

// ── Deposits (35 — no withdrawals) ───────────────────────────────────────────
export const DEPOSITS = (() => {
  const r = rng(7776543);
  const list = [];
  for (let i = 0; i < 35; i++) {
    const client = CLIENTS[Math.floor(r() * CLIENTS.length)];
    const amount  = Math.round(r() * 14000 + 200);
    const dayAge  = Math.floor(r() * 90);
    const d = daysAgo(dayAge);
    list.push({
      id: 'DEP-' + (60000 + i).toString(),
      clientId: client.id,
      clientName: client.name,
      country: client.country,
      flag: client.flag,
      date: fmtDT(d),
      ts: d.getTime(),
      amount,
      currency: 'USDT',
      paymentMethod: PAY_METHODS[Math.floor(r() * PAY_METHODS.length)],
      status: DEPOSIT_STATUSES[Math.floor(r() * DEPOSIT_STATUSES.length)],
      campaign: client.campaign,
    });
  }
  return list.sort((a, b) => b.ts - a.ts);
})();

// ── Rebates (60) ─────────────────────────────────────────────────────────────
export const REBATES = (() => {
  const r = rng(4448822);
  const list = [];
  for (let i = 0; i < 60; i++) {
    const client  = CLIENTS[Math.floor(r() * CLIENTS.length)];
    const product = PRODUCTS[Math.floor(r() * PRODUCTS.length)];
    const symbols = SYMBOLS_MAP[product];
    const symbol  = symbols[Math.floor(r() * symbols.length)];
    const lots    = +(r() * 4.5 + 0.1).toFixed(2);
    const rate    = REBATE_RATE[product];
    const amount  = +(lots * rate).toFixed(2);
    const dayAge  = Math.floor(r() * 60);
    const d = daysAgo(dayAge);
    list.push({
      id: 'REB-' + (80000 + i).toString(),
      clientId: client.id,
      clientName: client.name,
      symbol,
      product,
      lots,
      rebateRate: rate,
      rebateAmount: amount,
      tradeDate: fmtDate(d),
      ts: d.getTime(),
      status: REBATE_STATUSES[Math.floor(r() * REBATE_STATUSES.length)],
    });
  }
  return list.sort((a, b) => b.ts - a.ts);
})();

// ── Trade / lot records (45) ──────────────────────────────────────────────────
export const TRADE_LOTS = (() => {
  const r = rng(3335599);
  const list = [];
  for (let i = 0; i < 45; i++) {
    const client  = CLIENTS[Math.floor(r() * CLIENTS.length)];
    const product = PRODUCTS[Math.floor(r() * PRODUCTS.length)];
    const symbols = SYMBOLS_MAP[product];
    const symbol  = symbols[Math.floor(r() * symbols.length)];
    const lots    = +(r() * 4 + 0.05).toFixed(2);
    const entryPrice = product === 'crypto' && symbol.includes('BTC') ? 60000 + r() * 10000
                     : product === 'forex'  && symbol.includes('XAU') ? 2300 + r() * 200
                     : 1 + r() * 150;
    const volume = +(lots * entryPrice).toFixed(2);
    const openDays  = Math.floor(r() * 55 + 1);
    const durHours  = Math.floor(r() * 48 + 1);
    const openD  = daysAgo(openDays);
    const closeD = new Date(openD.getTime() + durHours * 3600000);
    const rebateGen = +(lots * REBATE_RATE[product]).toFixed(2);
    list.push({
      id: 'TRD-' + (20000 + i).toString(),
      clientId: client.id,
      clientName: client.name,
      product,
      symbol,
      direction: r() > 0.5 ? 'buy' : 'sell',
      lots,
      volume,
      openTime: fmtDT(openD),
      closeTime: fmtDT(closeD),
      ts: openD.getTime(),
      rebateGenerated: rebateGen,
    });
  }
  return list.sort((a, b) => b.ts - a.ts);
})();

// ── Payouts (12 months) ───────────────────────────────────────────────────────
export const PAYOUTS = (() => {
  const r = rng(1112233);
  const months = ['May 2025','Apr 2025','Mar 2025','Feb 2025','Jan 2025','Dec 2024','Nov 2024','Oct 2024','Sep 2024','Aug 2024','Jul 2024','Jun 2024'];
  return months.map((period, i) => {
    const rebate = Math.round(r() * 600 + 120);
    const adj    = Math.round((r() - 0.5) * 40);
    const final  = rebate + adj;
    const status = i === 0 ? 'pending' : i === 1 ? 'approved' : 'paid';
    const d = daysAgo(i * 30 + (i === 0 ? 0 : 15));
    return {
      id: 'PAY-' + (9000 + i).toString(),
      period,
      rebateAmount: rebate,
      adjustments: adj,
      finalAmount: final,
      status,
      paymentDate: status === 'paid' ? fmtDate(d) : status === 'approved' ? 'Scheduled 1 Jun 2025' : 'Pending',
    };
  });
})();

// ── Campaigns (6) ─────────────────────────────────────────────────────────────
export const CAMPAIGNS = (() => {
  const r = rng(5556677);
  return CAMPAIGN_NAMES.map((name, i) => {
    const clicks = Math.floor(r() * 3000 + 200);
    const regs   = Math.floor(clicks * (r() * 0.08 + 0.03));
    const deps   = Math.floor(regs * (r() * 0.6 + 0.3));
    const depAmt = Math.round(deps * (r() * 8000 + 2000));
    const convRate = +(regs / clicks * 100).toFixed(1);
    const rebs   = Math.round(deps * (r() * 180 + 60));
    const code   = name.replace(/\s+/g, '').substring(0, 6).toUpperCase() + (i + 1);
    return {
      id: 'CAMP-' + (i + 1),
      name,
      link: `https://plustrade.io/ref/EHSAN2024?utm_source=${code}`,
      code,
      clicks,
      registrations: regs,
      depositors: deps,
      depositAmount: depAmt,
      conversionRate: convRate,
      rebatesGenerated: rebs,
    };
  });
})();

// ── Computed summary ──────────────────────────────────────────────────────────
export function getAffiliateSummary() {
  const completedDeposits = DEPOSITS.filter(d => d.status === 'completed');
  const totalDeposits   = completedDeposits.reduce((s, d) => s + d.amount, 0);
  const now = new Date(2025, 4, 31);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const weekStart  = new Date(now.getTime() - 7 * 86400000).getTime();
  const monthlyDeposits = completedDeposits.filter(d => d.ts >= monthStart).reduce((s, d) => s + d.amount, 0);
  const totalRebates    = REBATES.reduce((s, r) => s + r.rebateAmount, 0);
  const thisWeekRebates = REBATES.filter(r => r.ts >= weekStart).reduce((s, r) => s + r.rebateAmount, 0);
  const thisMonthRebates = REBATES.filter(r => r.ts >= monthStart).reduce((s, r) => s + r.rebateAmount, 0);
  const paidRebates     = REBATES.filter(r => r.status === 'paid').reduce((s, r) => s + r.rebateAmount, 0);
  const pendingRebates  = REBATES.filter(r => r.status !== 'paid').reduce((s, r) => s + r.rebateAmount, 0);
  const totalLots       = TRADE_LOTS.reduce((s, t) => s + t.lots, 0);
  const activeClients   = CLIENTS.filter(c => c.activityStatus === 'active').length;
  const pendingPayout   = PAYOUTS.filter(p => p.status !== 'paid').reduce((s, p) => s + p.finalAmount, 0);
  const paidCommissions = PAYOUTS.filter(p => p.status === 'paid').reduce((s, p) => s + p.finalAmount, 0);
  return {
    totalClients: CLIENTS.length, activeClients,
    totalDeposits, monthlyDeposits,
    totalRebates, thisWeekRebates, thisMonthRebates,
    paidRebates, pendingRebates,
    totalLots: +totalLots.toFixed(1),
    pendingPayout, paidCommissions,
  };
}

// ── 12-month net deposit series ───────────────────────────────────────────────
export function getMonthlyDeposits() {
  const r = rng(2223344);
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(2025, 4 - i, 1);
    months.push({
      label: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
      deposits: Math.round(r() * 35000 + 8000),
    });
  }
  return months;
}

// ── 8-week rebate series ──────────────────────────────────────────────────────
export function getWeeklyRebates() {
  const r = rng(8889900);
  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(2025, 4, 31 - (7 - i) * 7);
    return {
      label: 'W' + (i + 1),
      rebates: +(r() * 500 + 120).toFixed(2),
    };
  });
}

// ── 12-month client growth ────────────────────────────────────────────────────
export function getClientGrowth() {
  const r = rng(4441122);
  let total = 3;
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2025, 4 - (11 - i), 1);
    const newC = Math.floor(r() * 3 + (i > 6 ? 1 : 0));
    total += newC;
    return {
      label: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
      total,
      new: newC,
    };
  });
}

// ── 8-week lots series ────────────────────────────────────────────────────────
export function getWeeklyLots() {
  const r = rng(7772288);
  return Array.from({ length: 8 }, (_, i) => ({
    label: 'W' + (i + 1),
    lots: +(r() * 90 + 15).toFixed(1),
  }));
}

// ── Deposits by country for reports ──────────────────────────────────────────
export function getDepositsByCountry() {
  const map = {};
  CLIENTS.forEach(c => { map[c.country] = (map[c.country] || 0) + c.totalDeposits; });
  return Object.entries(map).map(([country, amount]) => ({ country, flag: getFlag(country), amount }))
    .sort((a, b) => b.amount - a.amount).slice(0, 8);
}

// ── Rebates by product ────────────────────────────────────────────────────────
export function getRebatesByProduct() {
  const map = { crypto: 0, forex: 0, simple: 0 };
  REBATES.forEach(r => { map[r.product] += r.rebateAmount; });
  return Object.entries(map).map(([product, amount]) => ({ product, amount: +amount.toFixed(2) }));
}

// ── Lots by product ───────────────────────────────────────────────────────────
export function getLotsByProduct() {
  const map = { crypto: 0, forex: 0, simple: 0 };
  TRADE_LOTS.forEach(t => { map[t.product] += t.lots; });
  return Object.entries(map).map(([product, lots]) => ({ product, lots: +lots.toFixed(1) }));
}

export function formatMoney(n) {
  const abs = Math.abs(n);
  if (abs >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + n.toFixed(2);
}

export function formatFull(n) {
  return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
