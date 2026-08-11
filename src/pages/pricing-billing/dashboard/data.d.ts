export type DashboardSummary = {
  apacMarkets: number;
  activeClients: number;
  products: number;
  monthlyBillingAmount: number;
  pendingApprovals: number;
};

export type RevenueByMarket = {
  date: string;
  market: 'Singapore' | 'Hong Kong' | 'China' | 'Japan' | 'Australia';
  currency: 'SGD';
  amount: number;
  trend: 'up' | 'down' | 'flat';
  changePercent: number;
  status?: 'NORMAL' | 'ATTENTION' | 'ALERT';
};

export type RecentBillingRun = {
  id: string;
  market: string;
  billingCycle: string;
  totalAmount: number;
  currency: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  completedAt: string;
};

export type PendingApproval = {
  id: string;
  type: 'PRICE_CHANGE' | 'DEAL' | 'WAIVER';
  subject: string;
  requestedBy: string;
  requestedAt: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type DashboardResponse = {
  summary: DashboardSummary;
  revenueByMarket: RevenueByMarket[];
  recentBilling: RecentBillingRun[];
  pendingApprovals: PendingApproval[];
};
