// ─────────────────────────────────────────────────────────────────────────────
// Affiliate Admin mock data. Deterministic seeded PRNG – separate from the
// partner-portal data in src/affiliate/. Replace with real API in production.
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

const AFFILIATE_NAMES = [
  'Ehsan Khan', 'Sofia Patel', 'Marcus Ali', 'Layla Nguyen', 'Viktor Petrov',
  'Mei Tanaka', 'Carlos Mendez', 'Nadia Hassan', 'Tom Walker', 'Priya Sharma',
  'Diego Garcia', 'Hana Sato',
];

export const TIER_CONFIG = {
  beginner: { label: 'Beginner', minDeposit: 0,      minLots: 0,    rebatePerLot: 2,  bonusPct: 0.5, color: '#94A3B8' },
  level1:   { label: 'Level 1',  minDeposit: 10000,  minLots: 50,   rebatePerLot: 4,  bonusPct: 0.75, color: '#60A5FA' },
  standard: { label: 'Standard', minDeposit: 50000,  minLots: 200,  rebatePerLot: 7,  bonusPct: 1.0, color: '#34D399' },
  premium:  { label: 'Premium',  minDeposit: 100000, minLots: 500,  rebatePerLot: 10, bonusPct: 1.5, color: '#F59E0B' },
  gold:     { label: 'Gold',     minDeposit: 250000, minLots: 1000, rebatePerLot: 15, bonusPct: 2.0, color: '#EAB308' },
};

// distribution: 1 gold, 2 premium, 3 standard, 4 level1, 2 beginner
const TIER_DISTRIBUTION = [
  'gold',
  'premium', 'premium',
  'standard', 'standard', 'standard',
  'level1', 'level1', 'level1', 'level1',
  'beginner', 'beginner',
];

const COUNTRIES = ['United Kingdom', 'United States', 'UAE', 'Germany', 'Japan', 'Singapore', 'Spain', 'Canada', 'Turkey', 'India'];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function fmtDate(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── 12 Affiliates (seed 8881234) ────────────────────────────────────────────
export const AFFILIATES = (() => {
  const r = rng(8881234);
  return AFFILIATE_NAMES.map((name, i) => {
    const tierId = TIER_DISTRIBUTION[i];
    const tier = TIER_CONFIG[tierId];
    const firstName4 = name.replace(/\s.*/, '').slice(0, 4).toUpperCase();
    const year = 2024;

    const totalClients = Math.floor(r() * 28) + 8; // 8–35
    const activeClients = Math.floor(totalClients * (0.6 + r() * 0.25));

    // monthly deposit based on tier
    const monthlyDepositRanges = {
      beginner: [2000,   8000],
      level1:   [10000,  45000],
      standard: [50000,  90000],
      premium:  [100000, 180000],
      gold:     [250000, 400000],
    };
    const [dMin, dMax] = monthlyDepositRanges[tierId];
    const monthlyDeposit = Math.round((dMin + r() * (dMax - dMin)) / 100) * 100;
    const totalDeposit   = Math.round(monthlyDeposit * (8 + r() * 10));

    const totalLots = Math.round(
      tierId === 'beginner' ? 80  + r() * 120 :
      tierId === 'level1'   ? 150 + r() * 250 :
      tierId === 'standard' ? 300 + r() * 400 :
      tierId === 'premium'  ? 500 + r() * 500 :
      /* gold */               800 + r() * 400
    );
    const totalRebates  = Math.round(totalLots * tier.rebatePerLot);
    const pendingRebates = Math.round(totalRebates * (0.10 + r() * 0.10));
    const paidRebates    = totalRebates - pendingRebates;

    const regDays = Math.floor(r() * (18 * 30)) + 30;
    const statusArr = ['active', 'active', 'active', 'active', 'inactive', 'suspended'];
    const status = statusArr[Math.floor(r() * statusArr.length)];

    return {
      id: `AFF-${String(1000 + i).padStart(4, '0')}`,
      name,
      email: `${name.split(' ')[0].toLowerCase()}.${name.split(' ')[1].toLowerCase()}@${['gmail.com', 'outlook.com', 'proton.me'][Math.floor(r() * 3)]}`,
      country: COUNTRIES[Math.floor(r() * COUNTRIES.length)],
      tier: tierId,
      status,
      regDate: fmtDate(daysAgo(regDays)),
      regDays,
      lastActivity: fmtDate(daysAgo(Math.floor(r() * 30))),
      totalClients,
      activeClients,
      monthlyDeposit,
      totalDeposit,
      totalLots,
      totalRebates,
      pendingRebates,
      paidRebates,
      referralCode: `AFF${firstName4}${year}`,
      campaignCount: Math.floor(r() * 5) + 2,
    };
  });
})();

// ── Affiliate Clients (seed 3334567) ────────────────────────────────────────
const CLIENT_FIRST = ['Alex', 'Jamie', 'Sam', 'Chris', 'Jordan', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Drew', 'Blake', 'Quinn', 'Avery', 'Skylar', 'Logan', 'Reese', 'Finley', 'Emery', 'Parker', 'Rowan'];
const CLIENT_LAST  = ['Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Lee', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Hall', 'Allen', 'Young'];

export const AFFILIATE_CLIENTS = (() => {
  const r = rng(3334567);
  const clients = [];
  let idx = 0;

  AFFILIATES.forEach(aff => {
    for (let c = 0; c < aff.totalClients; c++) {
      const first = CLIENT_FIRST[Math.floor(r() * CLIENT_FIRST.length)];
      const last  = CLIENT_LAST[Math.floor(r() * CLIENT_LAST.length)];
      const name  = `${first} ${last}`;
      const totalDeposits   = Math.round((500 + r() * 14500) / 10) * 10;
      const monthlyDeposit  = Math.round(totalDeposits * (0.05 + r() * 0.10));
      const totalLots       = Math.round(10 + r() * 190);
      const tier = TIER_CONFIG[aff.tier];
      const generatedRebate = Math.round(totalLots * tier.rebatePerLot);
      const status = r() > 0.25 ? 'active' : 'inactive';
      const regDays = Math.floor(r() * aff.regDays);

      clients.push({
        id: `CLT-${String(10000 + idx).padStart(5, '0')}`,
        affiliateId: aff.id,
        affiliateName: aff.name,
        affilTier: aff.tier,
        name,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(r() * 99)}@${['gmail.com', 'yahoo.com', 'hotmail.com'][Math.floor(r() * 3)]}`,
        country: COUNTRIES[Math.floor(r() * COUNTRIES.length)],
        regDate: fmtDate(daysAgo(regDays)),
        totalDeposits,
        monthlyDeposit,
        totalLots,
        generatedRebate,
        status,
      });
      idx++;
    }
  });
  return clients;
})();

// ── Rebate Records (seed 5552233) — 120 records ──────────────────────────────
const PRODUCTS = ['crypto', 'forex', 'simple'];
const SYMBOLS  = ['BTC/USDT', 'ETH/USDT', 'EUR/USD', 'GBP/USD', 'XAU/USD', 'SOL/USDT', 'OIL', 'USD/JPY', 'DOGE/USDT'];
const REBATE_STATUSES = ['paid', 'paid', 'paid', 'approved', 'approved', 'pending', 'pending', 'pending', 'rejected'];

export const AFFILIATE_REBATES = (() => {
  const r = rng(5552233);
  const rebates = [];
  for (let i = 0; i < 120; i++) {
    const aff    = AFFILIATES[Math.floor(r() * AFFILIATES.length)];
    const client = AFFILIATE_CLIENTS.filter(c => c.affiliateId === aff.id);
    const cl     = client.length > 0 ? client[Math.floor(r() * client.length)] : { name: 'Unknown Client' };
    const product = PRODUCTS[Math.floor(r() * PRODUCTS.length)];
    const symbol  = SYMBOLS[Math.floor(r() * SYMBOLS.length)];
    const lots    = Math.round((0.5 + r() * 19.5) * 10) / 10;
    const tier    = TIER_CONFIG[aff.tier];
    const rebateRate   = tier.rebatePerLot;
    const rebateAmount = Math.round(lots * rebateRate * 100) / 100;
    const daysOff = Math.floor(r() * 90);

    rebates.push({
      id: `RBT-${String(10000 + i).padStart(5, '0')}`,
      affiliateId:   aff.id,
      affiliateName: aff.name,
      clientName:    cl.name,
      product,
      symbol,
      lots,
      rebateRate,
      rebateAmount,
      date: fmtDate(daysAgo(daysOff)),
      dateDays: daysOff,
      status: REBATE_STATUSES[Math.floor(r() * REBATE_STATUSES.length)],
    });
  }
  return rebates;
})();

// ── Helper: aggregate stats ──────────────────────────────────────────────────
export function getAffiliateStats() {
  const totalAffiliates  = AFFILIATES.length;
  const activeAffiliates = AFFILIATES.filter(a => a.status === 'active').length;
  const totalClients     = AFFILIATES.reduce((s, a) => s + a.totalClients, 0);
  const activeClients    = AFFILIATES.reduce((s, a) => s + a.activeClients, 0);
  const totalDeposit     = AFFILIATES.reduce((s, a) => s + a.totalDeposit, 0);
  const totalRebates     = AFFILIATES.reduce((s, a) => s + a.totalRebates, 0);
  const pendingRebates   = AFFILIATES.reduce((s, a) => s + a.pendingRebates, 0);
  const paidRebates      = AFFILIATES.reduce((s, a) => s + a.paidRebates, 0);
  const totalLots        = AFFILIATES.reduce((s, a) => s + a.totalLots, 0);
  const avgDeposit       = Math.round(totalDeposit / totalAffiliates);
  return { totalAffiliates, activeAffiliates, totalClients, activeClients, totalDeposit, totalRebates, pendingRebates, paidRebates, totalLots, avgDeposit };
}

// ── Monthly Affiliate Deposits (12 months) ───────────────────────────────────
export function getMonthlyAffiliateDeposits() {
  const r = rng(9901122);
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  return months.map((month, i) => {
    const base = 380000 + i * 22000;
    const deposits = Math.round((base + (r() - 0.5) * 60000) / 1000) * 1000;
    const rebates  = Math.round(deposits * (0.012 + r() * 0.006));
    return { month, label: month, deposits, rebates };
  });
}

// ── Affiliate Growth (12 months) ─────────────────────────────────────────────
export function getAffiliateGrowth() {
  const r = rng(7733441);
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  let total = 4;
  return months.map((month) => {
    const added = Math.floor(r() * 2);
    total += added;
    return { month, label: month, total, new: added };
  });
}

// ── Top Affiliates ────────────────────────────────────────────────────────────
export function getTopAffiliates(n = 10) {
  return [...AFFILIATES].sort((a, b) => b.totalDeposit - a.totalDeposit).slice(0, n);
}

// ── Weekly Rebates (8 weeks) ─────────────────────────────────────────────────
export function getWeeklyRebates() {
  const r = rng(4421100);
  return Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`,
    label: `W${i + 1}`,
    rebates: Math.round((2400 + r() * 2800) / 100) * 100,
    lots: Math.round(200 + r() * 300),
  }));
}

// ── Compact money formatter ───────────────────────────────────────────────────
export function formatMoney(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
