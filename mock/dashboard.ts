import type { Request, Response } from 'express';

type DashboardSummary = {
  apacMarkets: number;
  activeClients: number;
  products: number;
  monthlyBillingAmount: number;
  pendingApprovals: number;
};

type RevenueByMarket = {
  date: string;
  market: 'Singapore' | 'Hong Kong' | 'China' | 'Japan' | 'Australia';
  currency: 'SGD';
  amount: number;
  trend: 'up' | 'down' | 'flat';
  changePercent: number;
  status: 'NORMAL' | 'ATTENTION' | 'ALERT';
};

type RecentBillingRun = {
  id: string;
  market: string;
  billingCycle: string;
  totalAmount: number;
  currency: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  completedAt: string;
};

type PendingApproval = {
  id: string;
  type: 'PRICE_CHANGE' | 'DEAL' | 'WAIVER';
  subject: string;
  requestedBy: string;
  requestedAt: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
};

const summary: DashboardSummary = {
  apacMarkets: 5,
  activeClients: 120,
  products: 8,
  monthlyBillingAmount: 2_400_000,
  pendingApprovals: 3,
};

const markets: Array<RevenueByMarket['market']> = [
  'Singapore',
  'Hong Kong',
  'China',
  'Japan',
  'Australia',
];

const marketBaseAmount: Record<RevenueByMarket['market'], number> = {
  Singapore: 105000,
  'Hong Kong': 92000,
  China: 88000,
  Japan: 79000,
  Australia: 73000,
};

const marketStatus: Record<RevenueByMarket['market'], RevenueByMarket['status']> = {
  Singapore: 'NORMAL',
  'Hong Kong': 'NORMAL',
  China: 'ATTENTION',
  Japan: 'NORMAL',
  Australia: 'ALERT',
};

function createRevenueSeries(): RevenueByMarket[] {
  const result: RevenueByMarket[] = [];
  const today = new Date('2026-08-11T00:00:00.000Z');

  for (let i = 29; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - i);

    markets.forEach((market, index) => {
      const base = marketBaseAmount[market];
      const wave = Math.sin((29 - i + index) / 3) * 5000;
      const amount = Math.round(base + wave + (index + 1) * 350);
      const changePercent = Number(((wave / base) * 100).toFixed(2));
      const trend: RevenueByMarket['trend'] =
        changePercent > 0.4 ? 'up' : changePercent < -0.4 ? 'down' : 'flat';

      result.push({
        date: date.toISOString().slice(0, 10),
        market,
        currency: 'SGD',
        amount,
        trend,
        changePercent,
        status: marketStatus[market],
      });
    });
  }

  return result;
}

const recentBilling: RecentBillingRun[] = [
  {
    id: 'RUN-2026-08-001',
    market: 'Singapore',
    billingCycle: '2026-07',
    totalAmount: 456200,
    currency: 'SGD',
    status: 'COMPLETED',
    completedAt: '2026-08-10T09:12:00Z',
  },
  {
    id: 'RUN-2026-08-002',
    market: 'Hong Kong',
    billingCycle: '2026-07',
    totalAmount: 398300,
    currency: 'SGD',
    status: 'IN_PROGRESS',
    completedAt: '2026-08-10T08:40:00Z',
  },
  {
    id: 'RUN-2026-08-003',
    market: 'China',
    billingCycle: '2026-07',
    totalAmount: 371100,
    currency: 'SGD',
    status: 'FAILED',
    completedAt: '2026-08-09T16:15:00Z',
  },
  {
    id: 'RUN-2026-08-004',
    market: 'Japan',
    billingCycle: '2026-07',
    totalAmount: 342980,
    currency: 'SGD',
    status: 'COMPLETED',
    completedAt: '2026-08-09T13:07:00Z',
  },
  {
    id: 'RUN-2026-08-005',
    market: 'Australia',
    billingCycle: '2026-07',
    totalAmount: 318450,
    currency: 'SGD',
    status: 'COMPLETED',
    completedAt: '2026-08-09T09:51:00Z',
  },
];

const pendingApprovals: PendingApproval[] = [
  {
    id: 'APR-10017',
    type: 'PRICE_CHANGE',
    subject: 'SG Cash Management Tiered Fee Update',
    requestedBy: 'Liam Tan',
    requestedAt: '2026-08-11T01:20:00Z',
    urgency: 'HIGH',
  },
  {
    id: 'APR-10018',
    type: 'DEAL',
    subject: 'HK Trade Finance Bundle Discount',
    requestedBy: 'Avery Chan',
    requestedAt: '2026-08-10T14:45:00Z',
    urgency: 'MEDIUM',
  },
  {
    id: 'APR-10019',
    type: 'WAIVER',
    subject: 'JP Advisory Waiver for Strategic Client',
    requestedBy: 'Mio Kato',
    requestedAt: '2026-08-10T10:32:00Z',
    urgency: 'LOW',
  },
  {
    id: 'APR-10020',
    type: 'PRICE_CHANGE',
    subject: 'CN FX Spread Threshold Revision',
    requestedBy: 'Chen Yu',
    requestedAt: '2026-08-10T08:12:00Z',
    urgency: 'HIGH',
  },
  {
    id: 'APR-10021',
    type: 'DEAL',
    subject: 'AU Deposits Introductory Pricing Extension',
    requestedBy: 'Noah Carter',
    requestedAt: '2026-08-09T22:05:00Z',
    urgency: 'MEDIUM',
  },
];

export default {
  'GET /api/dashboard/summary': (_req: Request, res: Response) => {
    res.json(summary);
  },
  'GET /api/dashboard/revenue-by-market': (_req: Request, res: Response) => {
    res.json(createRevenueSeries());
  },
  'GET /api/dashboard/recent-billing': (_req: Request, res: Response) => {
    res.json(recentBilling.slice(0, 5));
  },
  'GET /api/dashboard/pending-approvals': (_req: Request, res: Response) => {
    const urgencyRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    const sorted = [...pendingApprovals].sort(
      (a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency],
    );
    res.json(sorted.slice(0, 10));
  },
};
