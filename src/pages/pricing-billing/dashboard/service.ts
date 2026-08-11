import { request } from '@umijs/max';
import type {
  DashboardSummary,
  PendingApproval,
  RecentBillingRun,
  RevenueByMarket,
} from './data';

export async function queryDashboardSummary(): Promise<DashboardSummary> {
  return request('/api/dashboard/summary');
}

export async function queryRevenueByMarket(): Promise<RevenueByMarket[]> {
  return request('/api/dashboard/revenue-by-market');
}

export async function queryRecentBillingRuns(): Promise<RecentBillingRun[]> {
  return request('/api/dashboard/recent-billing');
}

export async function queryPendingApprovals(): Promise<PendingApproval[]> {
  return request('/api/dashboard/pending-approvals');
}
