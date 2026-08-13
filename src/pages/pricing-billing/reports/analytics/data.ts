export type ReportType =
  | 'REVENUE_SUMMARY'
  | 'PRICING_EXECUTION'
  | 'INVOICE_SUMMARY'
  | 'DEAL_PERFORMANCE'
  | 'TAX_REPORT'
  | 'CAPACITY_PLANNING';

export type GroupByType = 'MARKET' | 'PRODUCT' | 'SEGMENT' | 'RM';

export type ReportFormat = 'EXCEL' | 'PDF' | 'CSV';

export type ReportStatus = 'READY' | 'RUNNING' | 'FAILED';

export interface ReportRequest {
  reportType: ReportType;
  period: string;
  market?: string;
  product?: string;
  segment?: string;
  groupBy?: GroupByType;
  currency: string;
  format: ReportFormat;
}

export interface ReportPreviewRow {
  id: string;
  market: string;
  product: string;
  segment?: string;
  clientCount: number;
  volume: number;
  revenue: number;
  currency: string;
  yoyChange: number;
  momChange?: number;
  notes?: string;
}

export interface ReportInsightSummary {
  topMarketContributor: string;
  topProductContributor: string;
  largestYoyIncrease: string;
  potentialCapacitySignal: string;
}

export interface ReportRecord {
  id: string;
  reportType: ReportType;
  period: string;
  marketScope: string;
  format: ReportFormat;
  generatedBy: string;
  generatedAt: string;
  status: ReportStatus;
  request: ReportRequest;
  generationTimeSeconds: number;
}

export interface ReportPreviewResponse {
  success: boolean;
  data: {
    report: ReportRecord;
    rows: ReportPreviewRow[];
    insights: ReportInsightSummary;
  };
}

export interface ReportHistoryResponse {
  success: boolean;
  data: ReportRecord[];
  total: number;
}

export interface ReportGenerateResponse {
  success: boolean;
  data: ReportRecord;
}

export interface ReportOverview {
  reportsGeneratedMtd: number;
  mostUsedReportType: ReportType;
  averageGenerationSeconds: number;
  downloadCountMtd: number;
  openReportTemplates: number;
}

export interface ReportOverviewResponse {
  success: boolean;
  data: ReportOverview;
}

export interface ReportDownloadResponse {
  success: boolean;
  data: {
    fileName: string;
    mimeType: string;
    content: string;
  };
}

export const REPORT_TYPE_OPTIONS: Array<{ label: string; value: ReportType }> = [
  { label: 'Revenue Summary', value: 'REVENUE_SUMMARY' },
  { label: 'Pricing Execution', value: 'PRICING_EXECUTION' },
  { label: 'Invoice Summary', value: 'INVOICE_SUMMARY' },
  { label: 'Deal Performance', value: 'DEAL_PERFORMANCE' },
  { label: 'Tax Report', value: 'TAX_REPORT' },
  { label: 'Capacity Planning', value: 'CAPACITY_PLANNING' },
];

export const GROUP_BY_OPTIONS: Array<{ label: string; value: GroupByType }> = [
  { label: 'Market', value: 'MARKET' },
  { label: 'Product', value: 'PRODUCT' },
  { label: 'Segment', value: 'SEGMENT' },
  { label: 'RM', value: 'RM' },
];

export const FORMAT_OPTIONS: Array<{ label: string; value: ReportFormat }> = [
  { label: 'Excel', value: 'EXCEL' },
  { label: 'PDF', value: 'PDF' },
  { label: 'CSV', value: 'CSV' },
];

export const MARKET_OPTIONS = ['SG', 'HK', 'CN', 'JP', 'AU'];

export const PRODUCT_OPTIONS = [
  'Cash Management',
  'Trade Finance',
  'FX Services',
  'Deposit Services',
  'Liquidity Management',
];

export const SEGMENT_OPTIONS = ['Corporate', 'Institutional', 'SME', 'FI'];

export const CURRENCY_OPTIONS = ['USD', 'SGD', 'HKD', 'CNY', 'JPY', 'AUD'];

export const REPORT_TYPE_LABEL: Record<ReportType, string> = {
  REVENUE_SUMMARY: 'Revenue Summary',
  PRICING_EXECUTION: 'Pricing Execution',
  INVOICE_SUMMARY: 'Invoice Summary',
  DEAL_PERFORMANCE: 'Deal Performance',
  TAX_REPORT: 'Tax Report',
  CAPACITY_PLANNING: 'Capacity Planning',
};
