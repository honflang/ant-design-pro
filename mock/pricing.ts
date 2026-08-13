import type { Request, Response } from 'express';

export type PriceType = 'FLAT' | 'TIERED' | 'VOLUME' | 'ECR';
export type PriceCategory = 'STANDARD' | 'NEGOTIATED';
export type PriceStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type FlatUnit = 'PER_MONTH' | 'PER_TRANSACTION' | 'PER_ACCOUNT';
export type PriceDimension = 'BASE' | 'REGION' | 'SEGMENT' | 'GROUP';

export interface PricePointTier {
  tierFrom: number;
  tierTo?: number;
  unit: string;
  rate?: number;
  amount?: number;
}

export interface PricePoint {
  id: string;
  product: string;
  serviceGroup: string;
  service: string;
  dimension?: PriceDimension;
  market?: string;
  segment?: string;
  clientGroup?: string;
  priceType: PriceType;
  currency: string;
  flatAmount?: number;
  flatUnit?: FlatUnit;
  tiers?: PricePointTier[];
  ecrReference?: string;
  ecrRate?: number;
  ecrSpread?: number;
  description?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  category: PriceCategory;
  status: PriceStatus;
  updatedBy: string;
  updatedAt: string;
}

const nowIso = () => new Date().toISOString();

let pricePoints: PricePoint[] = [
  {
    id: 'pp-sg-cm-001',
    product: 'Cash Management',
    serviceGroup: 'Account Services',
    service: 'Account Maintenance',
    market: 'Singapore',
    segment: 'Corporate',
    priceType: 'FLAT',
    currency: 'SGD',
    flatAmount: 50,
    flatUnit: 'PER_MONTH',
    effectiveFrom: '2025-01-01',
    effectiveTo: '2027-12-31',
    category: 'STANDARD',
    status: 'ACTIVE',
    description: 'Standard monthly cash management account fee for corporate clients.',
    updatedBy: 'pricing.ops',
    updatedAt: nowIso(),
  },
  {
    id: 'pp-sg-tf-001',
    product: 'Trade Finance',
    serviceGroup: 'Documentary Trade',
    service: 'Letter of Credit Issuance',
    market: 'Singapore',
    segment: 'Corporate',
    priceType: 'TIERED',
    currency: 'SGD',
    tiers: [
      { tierFrom: 0, tierTo: 999999, unit: 'transaction', rate: 0.3 },
      { tierFrom: 1000000, tierTo: 5000000, unit: 'transaction', rate: 0.2 },
      { tierFrom: 5000001, unit: 'transaction', rate: 0.1 },
    ],
    effectiveFrom: '2025-01-01',
    effectiveTo: '2026-12-31',
    category: 'STANDARD',
    status: 'ACTIVE',
    description: 'Tiered trade finance pricing by transaction volume.',
    updatedBy: 'pricing.ops',
    updatedAt: nowIso(),
  },
  {
    id: 'pp-hk-cm-001',
    product: 'Cash Management',
    serviceGroup: 'Account Services',
    service: 'Account Maintenance',
    market: 'Hong Kong',
    segment: 'Corporate',
    priceType: 'FLAT',
    currency: 'HKD',
    flatAmount: 680,
    flatUnit: 'PER_MONTH',
    effectiveFrom: '2025-02-01',
    effectiveTo: '2027-06-30',
    category: 'STANDARD',
    status: 'ACTIVE',
    description: 'Regional treasury accounts in Hong Kong.',
    updatedBy: 'apac.premier',
    updatedAt: nowIso(),
  },
  {
    id: 'pp-hk-tf-001',
    product: 'Trade Finance',
    serviceGroup: 'Documentary Trade',
    service: 'Trade Document Processing',
    market: 'Hong Kong',
    segment: 'Corporate',
    priceType: 'VOLUME',
    currency: 'HKD',
    flatAmount: 0.08,
    flatUnit: 'PER_TRANSACTION',
    effectiveFrom: '2025-03-01',
    effectiveTo: '2026-11-30',
    category: 'NEGOTIATED',
    status: 'ACTIVE',
    description: 'Volume-based trade processing fee with premium coverage.',
    updatedBy: 'apac.sales',
    updatedAt: nowIso(),
  },
  {
    id: 'pp-cn-dp-001',
    product: 'Deposit Services',
    serviceGroup: 'Term Deposits',
    service: 'Deposit Account Administration',
    market: 'China',
    segment: 'SME',
    priceType: 'FLAT',
    currency: 'CNY',
    flatAmount: 260,
    flatUnit: 'PER_MONTH',
    effectiveFrom: '2025-01-15',
    effectiveTo: '2027-12-31',
    category: 'STANDARD',
    status: 'ACTIVE',
    description: 'Standard deposit service package for SME customers.',
    updatedBy: 'cn.pricing',
    updatedAt: nowIso(),
  },
  {
    id: 'pp-cn-fx-001',
    product: 'FX Services',
    serviceGroup: 'FX Execution',
    service: 'Spot FX Conversion',
    market: 'China',
    segment: 'Corporate',
    priceType: 'TIERED',
    currency: 'CNY',
    tiers: [
      { tierFrom: 0, tierTo: 2000000, unit: 'notional', rate: 0.15 },
      { tierFrom: 2000001, tierTo: 10000000, unit: 'notional', rate: 0.12 },
      { tierFrom: 10000001, unit: 'notional', rate: 0.08 },
    ],
    effectiveFrom: '2025-01-01',
    effectiveTo: '2026-12-31',
    category: 'NEGOTIATED',
    status: 'DRAFT',
    description: 'FX spread pricing for large corporate hedging flows.',
    updatedBy: 'cn.trade',
    updatedAt: nowIso(),
  },
  {
    id: 'pp-jp-cm-001',
    product: 'Cash Management',
    serviceGroup: 'Payments',
    service: 'Domestic Payment Processing',
    market: 'Japan',
    segment: 'Corporate',
    priceType: 'VOLUME',
    currency: 'JPY',
    flatAmount: 120,
    flatUnit: 'PER_TRANSACTION',
    effectiveFrom: '2025-01-01',
    effectiveTo: '2027-06-30',
    category: 'STANDARD',
    status: 'ACTIVE',
    description: 'High-frequency transaction pricing for Japanese corporates.',
    updatedBy: 'jp.operations',
    updatedAt: nowIso(),
  },
  {
    id: 'pp-jp-fx-001',
    product: 'FX Services',
    serviceGroup: 'FX Hedging',
    service: 'Forward Contract Settlement',
    market: 'Japan',
    segment: 'Institutional',
    priceType: 'ECR',
    currency: 'JPY',
    ecrReference: 'JPY TIBOR',
    ecrRate: 1.65,
    ecrSpread: 0.35,
    effectiveFrom: '2024-11-01',
    effectiveTo: '2026-10-31',
    category: 'STANDARD',
    status: 'ACTIVE',
    description: 'Benchmark-based financing spread for corporate hedging.',
    updatedBy: 'jp.risk',
    updatedAt: nowIso(),
  },
  {
    id: 'pp-au-cm-001',
    product: 'Cash Management',
    serviceGroup: 'Liquidity Services',
    service: 'Operating Balance Management',
    market: 'Australia',
    segment: 'Corporate',
    priceType: 'ECR',
    currency: 'AUD',
    ecrReference: 'AONIA + BBSW',
    ecrRate: 2.1,
    ecrSpread: 0.55,
    effectiveFrom: '2025-01-01',
    effectiveTo: '2027-12-31',
    category: 'STANDARD',
    status: 'ACTIVE',
    description: 'Benchmark-based pricing for operating balance account fees.',
    updatedBy: 'au.structured',
    updatedAt: nowIso(),
  },
  {
    id: 'pp-au-tf-001',
    product: 'Trade Finance',
    serviceGroup: 'Documentary Trade',
    service: 'Letter of Credit Issuance',
    market: 'Australia',
    segment: 'SME',
    priceType: 'TIERED',
    currency: 'AUD',
    tiers: [
      { tierFrom: 0, tierTo: 500000, unit: 'transaction', rate: 0.22 },
      { tierFrom: 500001, tierTo: 2000000, unit: 'transaction', rate: 0.17 },
      { tierFrom: 2000001, unit: 'transaction', rate: 0.12 },
    ],
    effectiveFrom: '2025-04-01',
    effectiveTo: '2026-12-31',
    category: 'NEGOTIATED',
    status: 'INACTIVE',
    description: 'SME trade finance tiered rate schedule.',
    updatedBy: 'au.accounts',
    updatedAt: nowIso(),
  },
  {
    id: 'pp-sg-liq-001',
    product: 'Liquidity Management',
    serviceGroup: 'Cash Concentration',
    service: 'Notional Pooling',
    market: 'Singapore',
    segment: 'Institutional',
    priceType: 'FLAT',
    currency: 'SGD',
    flatAmount: 1200,
    flatUnit: 'PER_ACCOUNT',
    effectiveFrom: '2025-01-01',
    effectiveTo: '2027-12-31',
    category: 'STANDARD',
    status: 'ACTIVE',
    description: 'Liquidity management fee for institutional clients.',
    updatedBy: 'treasury.ops',
    updatedAt: nowIso(),
  },
];

pricePoints = [
  {
    id: 'pp-base-cm-001',
    product: 'Cash Management',
    serviceGroup: 'Account Services',
    service: 'Account Maintenance',
    dimension: 'BASE',
    priceType: 'FLAT',
    currency: 'USD',
    flatAmount: 55,
    flatUnit: 'PER_MONTH',
    effectiveFrom: '2025-01-01',
    effectiveTo: '2027-12-31',
    category: 'STANDARD',
    status: 'ACTIVE',
    description: 'Global default cash management fee before more specific pricing applies.',
    updatedBy: 'global.pricing',
    updatedAt: nowIso(),
  },
  {
    id: 'pp-segment-cm-sme-001',
    product: 'Cash Management',
    serviceGroup: 'Account Services',
    service: 'Account Maintenance',
    dimension: 'SEGMENT',
    segment: 'SME',
    priceType: 'FLAT',
    currency: 'USD',
    flatAmount: 42,
    flatUnit: 'PER_MONTH',
    effectiveFrom: '2025-01-01',
    effectiveTo: '2027-12-31',
    category: 'STANDARD',
    status: 'ACTIVE',
    description: 'SME segment pricing applied after the region check.',
    updatedBy: 'segment.pricing',
    updatedAt: nowIso(),
  },
  {
    id: 'pp-group-tf-apac-001',
    product: 'Trade Finance',
    serviceGroup: 'Documentary Trade',
    service: 'Letter of Credit Issuance',
    dimension: 'GROUP',
    clientGroup: 'APAC Strategic Accounts',
    priceType: 'TIERED',
    currency: 'USD',
    tiers: [
      { tierFrom: 0, tierTo: 999999, unit: 'transaction', rate: 0.18 },
      { tierFrom: 1000000, unit: 'transaction', rate: 0.1 },
    ],
    effectiveFrom: '2025-01-01',
    effectiveTo: '2027-12-31',
    category: 'NEGOTIATED',
    status: 'ACTIVE',
    description: 'Group pricing for APAC strategic relationship accounts.',
    updatedBy: 'relationship.pricing',
    updatedAt: nowIso(),
  },
  ...pricePoints,
];

function toQueryString(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  return search.toString();
}

function getPricePoints(req: Request, res: Response) {
  const { dimension, product, serviceGroup, service, market, segment, clientGroup, priceType, status, keyword } = req.query as Record<string, string>;

  let data = [...pricePoints];

  const getDimension = (item: PricePoint): PriceDimension =>
    item.dimension ?? (item.clientGroup ? 'GROUP' : item.segment && !item.market ? 'SEGMENT' : item.market ? 'REGION' : 'BASE');

  if (dimension) data = data.filter((item) => getDimension(item) === dimension);
  if (product) data = data.filter((item) => item.product === product);
  if (serviceGroup) data = data.filter((item) => item.serviceGroup === serviceGroup);
  if (service) data = data.filter((item) => item.service === service);
  if (market) data = data.filter((item) => item.market === market);
  if (segment) data = data.filter((item) => item.segment === segment);
  if (clientGroup) data = data.filter((item) => item.clientGroup === clientGroup);
  if (priceType) data = data.filter((item) => item.priceType === priceType);
  if (status) data = data.filter((item) => item.status === status);
  if (keyword) {
    const kw = keyword.toLowerCase();
    data = data.filter((item) => {
      const haystack = [item.product, item.serviceGroup, item.service, item.market, item.segment, item.clientGroup, item.description, item.currency]
        .join(' ')
        .toLowerCase();
      return haystack.includes(kw);
    });
  }

  const query = toQueryString({ dimension, product, serviceGroup, service, market, segment, clientGroup, priceType, status, keyword });
  return res.json({
    success: true,
    data,
    total: data.length,
    query,
  });
}

function getPricePointById(req: Request, res: Response) {
  const { id } = req.params;
  const record = pricePoints.find((item) => item.id === id);
  if (!record) {
    return res.status(404).json({ success: false, message: 'Price point not found' });
  }
  return res.json({ success: true, data: record });
}

function addPricePoint(req: Request, res: Response) {
  const body = req.body as Partial<PricePoint> & { tierRulesText?: string };
  const newRecord: PricePoint = {
    ...body,
    id: `pp-${Date.now()}`,
    updatedBy: 'current.user',
    updatedAt: nowIso(),
    status: body.status ?? 'DRAFT',
    category: body.category ?? 'STANDARD',
    dimension: body.dimension ?? (body.clientGroup ? 'GROUP' : body.segment && !body.market ? 'SEGMENT' : body.market ? 'REGION' : 'BASE'),
    market: body.market,
    product: body.product ?? 'Cash Management',
    serviceGroup: body.serviceGroup ?? 'Account Services',
    service: body.service ?? 'Account Maintenance',
    segment: body.segment,
    priceType: body.priceType ?? 'FLAT',
    currency: body.currency ?? 'SGD',
  } as PricePoint;

  pricePoints = [newRecord, ...pricePoints];
  return res.json({ success: true, data: newRecord });
}

function updatePricePoint(req: Request, res: Response) {
  const { id } = req.params;
  const body = req.body as Partial<PricePoint>;
  pricePoints = pricePoints.map((item) =>
    item.id === id
      ? { ...item, ...body, id, updatedBy: 'current.user', updatedAt: nowIso() }
      : item,
  );
  const updated = pricePoints.find((item) => item.id === id);
  return res.json({ success: true, data: updated });
}

function togglePricePointStatus(req: Request, res: Response) {
  const { id } = req.params;
  pricePoints = pricePoints.map((item) =>
    item.id === id
      ? { ...item, status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', updatedBy: 'current.user', updatedAt: nowIso() }
      : item,
  );
  const updated = pricePoints.find((item) => item.id === id);
  return res.json({ success: true, data: updated });
}

export default {
  'GET /api/pricing/price-points': getPricePoints,
  'GET /api/pricing/price-points/:id': getPricePointById,
  'POST /api/pricing/price-points': addPricePoint,
  'PUT /api/pricing/price-points/:id': updatePricePoint,
  'PATCH /api/pricing/price-points/:id/status': togglePricePointStatus,
};
