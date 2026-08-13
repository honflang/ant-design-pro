import type { Request, Response } from 'express';
import type {
  ReportGenerateResponse,
  ReportHistoryResponse,
  ReportOverviewResponse,
  ReportPreviewResponse,
  ReportPreviewRow,
  ReportRecord,
  ReportRequest,
  ReportType,
} from '../src/pages/pricing-billing/reports/analytics/data';
import { REPORT_TYPE_LABEL } from '../src/pages/pricing-billing/reports/analytics/data';

const BASE_ROWS: ReportPreviewRow[] = [
  {
    id: 'row-sg-cash',
    market: 'SG',
    product: 'Cash Management',
    segment: 'Corporate',
    clientCount: 64,
    volume: 12850,
    revenue: 2450000,
    currency: 'USD',
    yoyChange: 8.4,
    momChange: 2.1,
    notes: 'Strong fee collection from transaction banking.',
  },
  {
    id: 'row-sg-fx',
    market: 'SG',
    product: 'FX Services',
    segment: 'Institutional',
    clientCount: 22,
    volume: 9860,
    revenue: 1980000,
    currency: 'USD',
    yoyChange: 12.7,
    momChange: 3.4,
    notes: 'Hedging demand increased around rate volatility.',
  },
  {
    id: 'row-hk-trade',
    market: 'HK',
    product: 'Trade Finance',
    segment: 'Corporate',
    clientCount: 55,
    volume: 11620,
    revenue: 2130000,
    currency: 'USD',
    yoyChange: 6.3,
    momChange: 1.2,
    notes: 'Cross-border deal flow remains stable.',
  },
  {
    id: 'row-hk-liq',
    market: 'HK',
    product: 'Liquidity Management',
    segment: 'FI',
    clientCount: 18,
    volume: 7230,
    revenue: 1290000,
    currency: 'USD',
    yoyChange: 9.1,
    momChange: 2.8,
    notes: 'Higher utilization from custody-linked clients.',
  },
  {
    id: 'row-cn-cash',
    market: 'CN',
    product: 'Cash Management',
    segment: 'SME',
    clientCount: 88,
    volume: 15670,
    revenue: 2620000,
    currency: 'USD',
    yoyChange: 7.8,
    momChange: 2.3,
    notes: 'SME portfolio expansion in manufacturing clusters.',
  },
  {
    id: 'row-cn-fx',
    market: 'CN',
    product: 'FX Services',
    segment: 'Corporate',
    clientCount: 31,
    volume: 8420,
    revenue: 1760000,
    currency: 'USD',
    yoyChange: 5.2,
    momChange: 1.4,
    notes: 'Pipeline sensitive to policy cycle timing.',
  },
  {
    id: 'row-jp-deposit',
    market: 'JP',
    product: 'Deposit Services',
    segment: 'Corporate',
    clientCount: 49,
    volume: 10980,
    revenue: 2010000,
    currency: 'USD',
    yoyChange: 4.9,
    momChange: 0.9,
    notes: 'Large clients moving to consolidated account structures.',
  },
  {
    id: 'row-jp-trade',
    market: 'JP',
    product: 'Trade Finance',
    segment: 'Institutional',
    clientCount: 26,
    volume: 7310,
    revenue: 1410000,
    currency: 'USD',
    yoyChange: 10.2,
    momChange: 2.7,
    notes: 'Supply chain financing shifted to shorter-tenor products.',
  },
  {
    id: 'row-au-cash',
    market: 'AU',
    product: 'Cash Management',
    segment: 'Corporate',
    clientCount: 52,
    volume: 9430,
    revenue: 1870000,
    currency: 'USD',
    yoyChange: 11.3,
    momChange: 3.9,
    notes: 'High growth from energy and infrastructure clients.',
  },
  {
    id: 'row-au-liq',
    market: 'AU',
    product: 'Liquidity Management',
    segment: 'FI',
    clientCount: 16,
    volume: 5170,
    revenue: 1020000,
    currency: 'USD',
    yoyChange: 14.6,
    momChange: 4.5,
    notes: 'Clear capacity pressure in service operations.',
  },
];

const nowIso = () => new Date().toISOString();

const defaultRequest: ReportRequest = {
  reportType: 'REVENUE_SUMMARY',
  period: '2026-08',
  market: 'ALL',
  product: 'ALL',
  segment: 'ALL',
  groupBy: 'MARKET',
  currency: 'USD',
  format: 'EXCEL',
};

let reportSequence = 1007;
let downloadCountMtd = 91;

let reportHistory: ReportRecord[] = [
  {
    id: 'RPT-2026-1001',
    reportType: 'REVENUE_SUMMARY',
    period: '2026-08',
    marketScope: 'SG/HK/CN/JP/AU',
    format: 'EXCEL',
    generatedBy: 'Avery Chan',
    generatedAt: '2026-08-10T10:42:00Z',
    status: 'READY',
    generationTimeSeconds: 12,
    request: {
      ...defaultRequest,
      reportType: 'REVENUE_SUMMARY',
      format: 'EXCEL',
      groupBy: 'MARKET',
    },
  },
  {
    id: 'RPT-2026-1002',
    reportType: 'PRICING_EXECUTION',
    period: '2026-08',
    marketScope: 'SG/HK/CN',
    format: 'PDF',
    generatedBy: 'Liam Tan',
    generatedAt: '2026-08-10T09:30:00Z',
    status: 'READY',
    generationTimeSeconds: 9,
    request: {
      ...defaultRequest,
      reportType: 'PRICING_EXECUTION',
      market: 'SG,HK,CN',
      groupBy: 'PRODUCT',
      format: 'PDF',
    },
  },
  {
    id: 'RPT-2026-1003',
    reportType: 'INVOICE_SUMMARY',
    period: '2026-08',
    marketScope: 'JP/AU',
    format: 'CSV',
    generatedBy: 'Mio Kato',
    generatedAt: '2026-08-09T18:05:00Z',
    status: 'READY',
    generationTimeSeconds: 11,
    request: {
      ...defaultRequest,
      reportType: 'INVOICE_SUMMARY',
      market: 'JP,AU',
      groupBy: 'SEGMENT',
      format: 'CSV',
    },
  },
  {
    id: 'RPT-2026-1004',
    reportType: 'DEAL_PERFORMANCE',
    period: '2026-08',
    marketScope: 'HK/CN/JP',
    format: 'PDF',
    generatedBy: 'Noah Wong',
    generatedAt: '2026-08-09T14:10:00Z',
    status: 'READY',
    generationTimeSeconds: 10,
    request: {
      ...defaultRequest,
      reportType: 'DEAL_PERFORMANCE',
      market: 'HK,CN,JP',
      format: 'PDF',
      groupBy: 'MARKET',
    },
  },
  {
    id: 'RPT-2026-1005',
    reportType: 'TAX_REPORT',
    period: '2026-08',
    marketScope: 'SG/HK/CN/JP/AU',
    format: 'EXCEL',
    generatedBy: 'Sophie Wu',
    generatedAt: '2026-08-08T11:20:00Z',
    status: 'READY',
    generationTimeSeconds: 13,
    request: {
      ...defaultRequest,
      reportType: 'TAX_REPORT',
      format: 'EXCEL',
      groupBy: 'MARKET',
    },
  },
  {
    id: 'RPT-2026-1006',
    reportType: 'CAPACITY_PLANNING',
    period: '2026-08',
    marketScope: 'SG/CN/AU',
    format: 'PDF',
    generatedBy: 'Emma Li',
    generatedAt: '2026-08-08T08:40:00Z',
    status: 'READY',
    generationTimeSeconds: 16,
    request: {
      ...defaultRequest,
      reportType: 'CAPACITY_PLANNING',
      market: 'SG,CN,AU',
      format: 'PDF',
      groupBy: 'PRODUCT',
    },
  },
];

const reportRowsMap: Record<string, ReportPreviewRow[]> = {};

const resolveMarketScope = (market?: string) => {
  if (!market || market === 'ALL') {
    return 'SG/HK/CN/JP/AU';
  }
  return market.replace(/,/g, '/');
};

const withReportTypeShape = (
  rows: ReportPreviewRow[],
  reportType: ReportType,
): ReportPreviewRow[] => {
  return rows.map((row) => {
    if (reportType === 'TAX_REPORT') {
      return {
        ...row,
        notes: `Effective tax treatment coverage for ${row.market}`,
      };
    }
    if (reportType === 'CAPACITY_PLANNING') {
      return {
        ...row,
        notes: `Capacity load ${Math.min(95, 55 + Math.round(row.volume / 300))}%`,
      };
    }
    if (reportType === 'PRICING_EXECUTION') {
      return {
        ...row,
        notes: `Rule execution consistency ${Math.min(99, 88 + Math.round(row.yoyChange / 2))}%`,
      };
    }
    return row;
  });
};

const buildRows = (request: ReportRequest): ReportPreviewRow[] => {
  const marketSet = request.market && request.market !== 'ALL'
    ? new Set(request.market.split(',').map((item) => item.trim()))
    : null;

  const productSet = request.product && request.product !== 'ALL'
    ? new Set(request.product.split(',').map((item) => item.trim()))
    : null;

  const segmentSet = request.segment && request.segment !== 'ALL'
    ? new Set(request.segment.split(',').map((item) => item.trim()))
    : null;

  const filtered = BASE_ROWS.filter((row) => {
    if (marketSet && !marketSet.has(row.market)) return false;
    if (productSet && !productSet.has(row.product)) return false;
    if (segmentSet && row.segment && !segmentSet.has(row.segment)) return false;
    return true;
  }).map((row) => ({ ...row, currency: request.currency || row.currency }));

  return withReportTypeShape(filtered, request.reportType);
};

const computeInsights = (rows: ReportPreviewRow[]) => {
  const byMarket = rows.reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.market] = (accumulator[row.market] || 0) + row.revenue;
    return accumulator;
  }, {});

  const byProduct = rows.reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.product] = (accumulator[row.product] || 0) + row.revenue;
    return accumulator;
  }, {});

  const topMarket = Object.entries(byMarket).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';
  const topProduct = Object.entries(byProduct).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';
  const largestYoy = rows
    .slice()
    .sort((a, b) => b.yoyChange - a.yoyChange)[0];

  const highLoad = rows
    .filter((row) => row.notes?.toLowerCase().includes('capacity'))
    .slice(0, 1)[0];

  return {
    topMarketContributor: topMarket,
    topProductContributor: topProduct,
    largestYoyIncrease: largestYoy
      ? `${largestYoy.market} ${largestYoy.product} (${largestYoy.yoyChange.toFixed(1)}%)`
      : 'N/A',
    potentialCapacitySignal: highLoad
      ? `${highLoad.market} ${highLoad.product} requires operational buffer.`
      : 'AU Liquidity Management trending above expected workload.',
  };
};

const updateOverview = (): ReportOverviewResponse => {
  const totalSeconds = reportHistory.reduce(
    (sum, report) => sum + report.generationTimeSeconds,
    0,
  );
  const countsByType = reportHistory.reduce<Record<ReportType, number>>((accumulator, report) => {
    accumulator[report.reportType] = (accumulator[report.reportType] || 0) + 1;
    return accumulator;
  }, {
    REVENUE_SUMMARY: 0,
    PRICING_EXECUTION: 0,
    INVOICE_SUMMARY: 0,
    DEAL_PERFORMANCE: 0,
    TAX_REPORT: 0,
    CAPACITY_PLANNING: 0,
  });

  const mostUsed = Object.entries(countsByType).sort((a, b) => b[1] - a[1])[0]?.[0] as ReportType;

  return {
    success: true,
    data: {
      reportsGeneratedMtd: reportHistory.length,
      mostUsedReportType: mostUsed,
      averageGenerationSeconds: reportHistory.length
        ? Number((totalSeconds / reportHistory.length).toFixed(1))
        : 0,
      downloadCountMtd: downloadCountMtd,
      openReportTemplates: 7,
    },
  };
};

const handleOverview = (_req: Request, res: Response) => {
  res.status(200).json(updateOverview());
};

const handleHistory = (_req: Request, res: Response) => {
  const body: ReportHistoryResponse = {
    success: true,
    data: reportHistory,
    total: reportHistory.length,
  };
  res.status(200).json(body);
};

const handleGenerate = (req: Request, res: Response) => {
  const body = (req.body || {}) as Partial<ReportRequest>;
  const reportType = body.reportType ?? 'REVENUE_SUMMARY';

  const requestPayload: ReportRequest = {
    ...defaultRequest,
    ...body,
    reportType,
    period: body.period ?? '2026-08',
    format: body.format ?? 'EXCEL',
    currency: body.currency ?? 'USD',
  };

  const newReport: ReportRecord = {
    id: `RPT-2026-${reportSequence++}`,
    reportType,
    period: requestPayload.period,
    marketScope: resolveMarketScope(requestPayload.market),
    format: requestPayload.format,
    generatedBy: 'Current User',
    generatedAt: nowIso(),
    status: 'READY',
    request: requestPayload,
    generationTimeSeconds: 8 + Math.floor(Math.random() * 9),
  };

  reportHistory = [newReport, ...reportHistory];
  reportRowsMap[newReport.id] = buildRows(requestPayload);

  const response: ReportGenerateResponse = {
    success: true,
    data: newReport,
  };

  res.status(200).json(response);
};

const handlePreview = (req: Request, res: Response) => {
  const reportId = (req.query.reportId as string) || reportHistory[0]?.id;
  const report = reportHistory.find((item) => item.id === reportId);

  if (!report) {
    res.status(404).json({ success: false, message: 'Report not found' });
    return;
  }

  const rows = reportRowsMap[report.id] ?? buildRows(report.request);
  reportRowsMap[report.id] = rows;

  const response: ReportPreviewResponse = {
    success: true,
    data: {
      report,
      rows,
      insights: computeInsights(rows),
    },
  };

  res.status(200).json(response);
};

const handleDownload = (req: Request, res: Response) => {
  const reportId = String(req.params.id);
  const report = reportHistory.find((item) => item.id === reportId);

  if (!report) {
    res.status(404).json({ success: false, message: 'Report not found' });
    return;
  }

  const rows = reportRowsMap[report.id] ?? buildRows(report.request);
  downloadCountMtd += 1;

  const csvHeader = [
    'Market',
    'Product',
    'Segment',
    'Client Count',
    'Volume',
    'Revenue',
    'Currency',
    'YoY Change',
    'MoM Change',
    'Notes',
  ];

  const csvRows = rows.map((row) => [
    row.market,
    row.product,
    row.segment ?? '',
    row.clientCount,
    row.volume,
    row.revenue,
    row.currency,
    row.yoyChange,
    row.momChange ?? '',
    row.notes ?? '',
  ]);

  const content = [csvHeader, ...csvRows]
    .map((line) => line.map((item) => `"${String(item).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  res.status(200).json({
    success: true,
    data: {
      fileName: `${report.id}-${REPORT_TYPE_LABEL[report.reportType].replace(/\s+/g, '-')}.csv`,
      mimeType: 'text/csv;charset=utf-8',
      content,
    },
  });
};

export default {
  'GET /api/reports/overview': handleOverview,
  'GET /api/reports/history': handleHistory,
  'POST /api/reports/generate': handleGenerate,
  'GET /api/reports/preview': handlePreview,
  'GET /api/reports/:id/download': handleDownload,
};
