export const TIERS = [
  {
    id: 'beginner',
    label: 'Beginner',
    minDeposit: 0,
    minLots: 0,
    rebatePerLot: 2,
    bonusPct: 0.5,
    color: '#94A3B8',
    glow: 'rgba(148,163,184,0.25)',
    bg: 'rgba(148,163,184,0.08)',
    perks: ['Access to referral link', 'Basic dashboard', '$2/lot rebate', 'Monthly payouts'],
  },
  {
    id: 'level1',
    label: 'Level 1',
    minDeposit: 10_000,
    minLots: 50,
    rebatePerLot: 4,
    bonusPct: 0.75,
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.25)',
    bg: 'rgba(59,130,246,0.08)',
    perks: ['Everything in Beginner', '$4/lot rebate', 'Bi-weekly payouts', 'Campaign tracking', 'Email support'],
  },
  {
    id: 'standard',
    label: 'Standard',
    minDeposit: 50_000,
    minLots: 200,
    rebatePerLot: 7,
    bonusPct: 1.0,
    color: '#10B981',
    glow: 'rgba(16,185,129,0.25)',
    bg: 'rgba(16,185,129,0.08)',
    perks: ['Everything in Level 1', '$7/lot rebate', 'Weekly payouts', 'QR code tools', 'Marketing banners', 'Dedicated account manager'],
  },
  {
    id: 'premium',
    label: 'Premium',
    minDeposit: 100_000,
    minLots: 500,
    rebatePerLot: 10,
    bonusPct: 1.5,
    color: '#7C3AED',
    glow: 'rgba(124,58,237,0.25)',
    bg: 'rgba(124,58,237,0.08)',
    perks: ['Everything in Standard', '$10/lot rebate', 'Same-day payouts', 'Co-branded landing pages', 'Priority support', 'Performance bonuses', 'Custom commission plans'],
  },
  {
    id: 'gold',
    label: 'Gold',
    minDeposit: 250_000,
    minLots: 1_000,
    rebatePerLot: 15,
    bonusPct: 2.0,
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.25)',
    bg: 'rgba(245,158,11,0.08)',
    perks: ['Everything in Premium', '$15/lot rebate', 'Instant payouts', 'White-label tools', 'VIP account manager', 'Revenue sharing', 'Sub-affiliate network', 'Quarterly bonus reviews'],
  },
];

export const CURRENT_TIER_ID = 'standard';

export const CURRENT_MONTH_STATS = {
  monthlyDeposit: 72_500,
  monthlyLots: 280,
};

export function getCurrentTier() {
  return TIERS.find(t => t.id === CURRENT_TIER_ID);
}

export function getNextTier() {
  const idx = TIERS.findIndex(t => t.id === CURRENT_TIER_ID);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

export function getTierByDeposit(deposit, lots) {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (deposit >= t.minDeposit && lots >= t.minLots) tier = t;
  }
  return tier;
}

export function getDepositProgress() {
  const next = getNextTier();
  if (!next) return 100;
  const cur = getCurrentTier();
  const range = next.minDeposit - cur.minDeposit;
  const done = CURRENT_MONTH_STATS.monthlyDeposit - cur.minDeposit;
  return Math.min(100, Math.max(0, (done / range) * 100));
}

export function getLotsProgress() {
  const next = getNextTier();
  if (!next) return 100;
  const cur = getCurrentTier();
  const range = next.minLots - cur.minLots;
  const done = CURRENT_MONTH_STATS.monthlyLots - cur.minLots;
  return Math.min(100, Math.max(0, (done / range) * 100));
}

export function calculateEarnings(monthlyDeposit, monthlyLots) {
  const tier = getTierByDeposit(monthlyDeposit, monthlyLots);
  const rebates = monthlyLots * tier.rebatePerLot;
  const depositBonus = monthlyDeposit * (tier.bonusPct / 100);
  return { tier, rebates, depositBonus, total: rebates + depositBonus };
}
