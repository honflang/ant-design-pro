import type { Request, Response } from 'express';

export type CatalogNodeType = 'PRODUCT' | 'SERVICE_GROUP' | 'SERVICE';
export type CatalogStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type BillingUnit = 'PER_MONTH' | 'PER_TRANSACTION' | 'PER_ACCOUNT' | 'PER_DOCUMENT';

export interface CatalogNode {
  id: string;
  code: string;
  name: string;
  nodeType: CatalogNodeType;
  parentId?: string;
  description?: string;
  status: CatalogStatus;
  supportedMarkets: string[];
  supportedCurrencies: string[];
  pricingEnabled: boolean;
  billingEnabled: boolean;
  billingUnit?: BillingUnit;
  taxCategory?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  updatedBy: string;
  updatedAt: string;
}

const nowIso = () => new Date().toISOString();

const MARKETS = ['Singapore', 'Hong Kong', 'China', 'Japan', 'Australia'];
const CURRENCIES = ['SGD', 'HKD', 'CNY', 'JPY', 'AUD'];

let catalogNodes: CatalogNode[] = [
  {
    id: 'P-001',
    code: 'CASH-MGMT',
    name: 'Cash Management',
    nodeType: 'PRODUCT',
    description: 'Core account, liquidity and reporting services for corporate clients.',
    status: 'ACTIVE',
    supportedMarkets: MARKETS,
    supportedCurrencies: CURRENCIES,
    pricingEnabled: true,
    billingEnabled: true,
    effectiveFrom: '2025-01-01',
    updatedBy: 'Product Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'SG-001',
    code: 'CASH-ACCOUNT',
    name: 'Account Services',
    nodeType: 'SERVICE_GROUP',
    parentId: 'P-001',
    description: 'Day-to-day account servicing and reporting.',
    status: 'ACTIVE',
    supportedMarkets: MARKETS,
    supportedCurrencies: CURRENCIES,
    pricingEnabled: true,
    billingEnabled: true,
    effectiveFrom: '2025-01-01',
    updatedBy: 'Product Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'S-001',
    code: 'ACCOUNT-MAINT',
    name: 'Account Maintenance',
    nodeType: 'SERVICE',
    parentId: 'SG-001',
    description: 'Maintenance of operating and collection accounts.',
    status: 'ACTIVE',
    supportedMarkets: MARKETS,
    supportedCurrencies: CURRENCIES,
    pricingEnabled: true,
    billingEnabled: true,
    billingUnit: 'PER_ACCOUNT',
    taxCategory: 'BANKING-SERVICE',
    effectiveFrom: '2025-01-01',
    updatedBy: 'Product Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'S-002',
    code: 'ACCOUNT-REPORTING',
    name: 'Account Reporting',
    nodeType: 'SERVICE',
    parentId: 'SG-001',
    description: 'Statements and account reporting services.',
    status: 'ACTIVE',
    supportedMarkets: MARKETS,
    supportedCurrencies: CURRENCIES,
    pricingEnabled: true,
    billingEnabled: true,
    billingUnit: 'PER_DOCUMENT',
    taxCategory: 'BANKING-SERVICE',
    effectiveFrom: '2025-01-01',
    updatedBy: 'Product Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'SG-002',
    code: 'CASH-LIQUIDITY',
    name: 'Liquidity Services',
    nodeType: 'SERVICE_GROUP',
    parentId: 'P-001',
    description: 'Liquidity and operating balance management.',
    status: 'ACTIVE',
    supportedMarkets: ['Singapore', 'Hong Kong', 'Australia'],
    supportedCurrencies: ['SGD', 'HKD', 'AUD'],
    pricingEnabled: true,
    billingEnabled: true,
    effectiveFrom: '2025-01-01',
    updatedBy: 'Product Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'S-003',
    code: 'BALANCE-MGMT',
    name: 'Operating Balance Management',
    nodeType: 'SERVICE',
    parentId: 'SG-002',
    description: 'Advisory service for operating balances.',
    status: 'DRAFT',
    supportedMarkets: ['Singapore', 'Hong Kong', 'Australia'],
    supportedCurrencies: ['SGD', 'HKD', 'AUD'],
    pricingEnabled: true,
    billingEnabled: false,
    effectiveFrom: '2026-09-01',
    updatedBy: 'Product Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'P-002',
    code: 'TRADE-FIN',
    name: 'Trade Finance',
    nodeType: 'PRODUCT',
    description: 'Trade instruments and documentary services.',
    status: 'ACTIVE',
    supportedMarkets: MARKETS,
    supportedCurrencies: CURRENCIES,
    pricingEnabled: true,
    billingEnabled: true,
    effectiveFrom: '2025-01-01',
    updatedBy: 'Product Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'SG-003',
    code: 'TRADE-SERVICES',
    name: 'Trade Services',
    nodeType: 'SERVICE_GROUP',
    parentId: 'P-002',
    description: 'Documentary trade and guarantee services.',
    status: 'ACTIVE',
    supportedMarkets: MARKETS,
    supportedCurrencies: CURRENCIES,
    pricingEnabled: true,
    billingEnabled: true,
    effectiveFrom: '2025-01-01',
    updatedBy: 'Product Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'S-004',
    code: 'LETTER-CREDIT',
    name: 'Letter of Credit',
    nodeType: 'SERVICE',
    parentId: 'SG-003',
    description: 'Issuance and advising of letters of credit.',
    status: 'ACTIVE',
    supportedMarkets: MARKETS,
    supportedCurrencies: CURRENCIES,
    pricingEnabled: true,
    billingEnabled: true,
    billingUnit: 'PER_DOCUMENT',
    taxCategory: 'TRADE-FEE',
    effectiveFrom: '2025-01-01',
    updatedBy: 'Product Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'P-003',
    code: 'FX-SERVICES',
    name: 'FX Services',
    nodeType: 'PRODUCT',
    description: 'Foreign exchange conversion and related services.',
    status: 'ACTIVE',
    supportedMarkets: MARKETS,
    supportedCurrencies: CURRENCIES,
    pricingEnabled: true,
    billingEnabled: true,
    effectiveFrom: '2025-01-01',
    updatedBy: 'Product Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'SG-004',
    code: 'FOREIGN-EXCHANGE',
    name: 'Foreign Exchange',
    nodeType: 'SERVICE_GROUP',
    parentId: 'P-003',
    description: 'Spot and forward foreign exchange services.',
    status: 'ACTIVE',
    supportedMarkets: MARKETS,
    supportedCurrencies: CURRENCIES,
    pricingEnabled: true,
    billingEnabled: true,
    effectiveFrom: '2025-01-01',
    updatedBy: 'Product Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'S-005',
    code: 'FX-CONVERSION',
    name: 'FX Conversion',
    nodeType: 'SERVICE',
    parentId: 'SG-004',
    description: 'Currency conversion for cross-border transactions.',
    status: 'ACTIVE',
    supportedMarkets: MARKETS,
    supportedCurrencies: CURRENCIES,
    pricingEnabled: true,
    billingEnabled: true,
    billingUnit: 'PER_TRANSACTION',
    taxCategory: 'FX-FEE',
    effectiveFrom: '2025-01-01',
    updatedBy: 'Product Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'P-004',
    code: 'DEPOSIT-SERVICES',
    name: 'Deposit Services',
    nodeType: 'PRODUCT',
    description: 'Deposit and account investment services.',
    status: 'DRAFT',
    supportedMarkets: ['Singapore', 'Hong Kong', 'Japan'],
    supportedCurrencies: ['SGD', 'HKD', 'JPY'],
    pricingEnabled: true,
    billingEnabled: false,
    effectiveFrom: '2026-10-01',
    updatedBy: 'Product Administration',
    updatedAt: nowIso(),
  },
];

const getChildren = (parentId?: string) => catalogNodes.filter((node) => node.parentId === parentId);

const getDescendantIds = (parentId: string): string[] =>
  getChildren(parentId).flatMap((child) => [child.id, ...getDescendantIds(child.id)]);

const getAncestorIds = (nodeId: string): string[] => {
  const node = catalogNodes.find((item) => item.id === nodeId);
  return node?.parentId ? [node.parentId, ...getAncestorIds(node.parentId)] : [];
};

const childNodeType = (parentType?: CatalogNodeType): CatalogNodeType => {
  if (!parentType) return 'PRODUCT';
  if (parentType === 'PRODUCT') return 'SERVICE_GROUP';
  return 'SERVICE';
};

function getCatalogNodes(req: Request, res: Response) {
  const { nodeType, parentId, status, market, pricingEnabled, billingEnabled, keyword } =
    req.query as Record<string, string>;

  const hasFilter = Boolean(nodeType || parentId || status || market || pricingEnabled || billingEnabled || keyword);
  if (!hasFilter) {
    return res.json({ success: true, data: catalogNodes, total: catalogNodes.length });
  }

  const kw = keyword?.toLowerCase();
  const matches = catalogNodes.filter((node) => {
    if (nodeType && node.nodeType !== nodeType) return false;
    if (parentId && node.parentId !== parentId) return false;
    if (status && node.status !== status) return false;
    if (market && !node.supportedMarkets.includes(market)) return false;
    if (pricingEnabled && String(node.pricingEnabled) !== pricingEnabled) return false;
    if (billingEnabled && String(node.billingEnabled) !== billingEnabled) return false;
    if (kw && ![node.code, node.name, node.description ?? ''].some((value) => value.toLowerCase().includes(kw))) {
      return false;
    }
    return true;
  });

  // Keep the full ancestor path of every match so hierarchy context is preserved.
  const visibleIds = new Set(matches.flatMap((node) => [node.id, ...getAncestorIds(node.id)]));
  const data = catalogNodes.filter((node) => visibleIds.has(node.id));

  return res.json({ success: true, data, total: data.length });
}

function getCatalogNodeById(req: Request, res: Response) {
  const { id } = req.params;
  const record = catalogNodes.find((node) => node.id === id);
  if (!record) {
    return res.status(404).json({ success: false, message: 'Catalog node not found' });
  }
  return res.json({ success: true, data: record });
}

function getCatalogNodeUsage(req: Request, res: Response) {
  const id = req.params.id as string;
  const record = catalogNodes.find((node) => node.id === id);
  if (!record) {
    return res.status(404).json({ success: false, message: 'Catalog node not found' });
  }
  return res.json({
    success: true,
    data: {
      childCount: getChildren(id).length,
      descendantCount: getDescendantIds(id).length,
      basePricePoints: record.pricingEnabled ? 4 : 0,
      regionPricePoints: record.pricingEnabled ? 12 : 0,
      segmentPricePoints: record.pricingEnabled ? 3 : 0,
      groupPricePoints: record.pricingEnabled ? 2 : 0,
      billingReferences: record.billingEnabled ? 6 : 0,
    },
  });
}

function addCatalogNode(req: Request, res: Response) {
  const body = req.body as Partial<CatalogNode>;
  const parent = body.parentId ? catalogNodes.find((node) => node.id === body.parentId) : undefined;
  const newNode: CatalogNode = {
    id: `${childNodeType(parent?.nodeType)}-${Date.now()}`,
    code: body.code ?? '',
    name: body.name ?? '',
    nodeType: childNodeType(parent?.nodeType),
    parentId: body.parentId,
    description: body.description,
    status: body.status ?? 'DRAFT',
    supportedMarkets: body.supportedMarkets ?? [],
    supportedCurrencies: body.supportedCurrencies ?? [],
    pricingEnabled: Boolean(body.pricingEnabled),
    billingEnabled: Boolean(body.billingEnabled),
    billingUnit: body.billingUnit,
    taxCategory: body.taxCategory,
    effectiveFrom: body.effectiveFrom ?? nowIso().slice(0, 10),
    effectiveTo: body.effectiveTo,
    updatedBy: 'current.user',
    updatedAt: nowIso(),
  };
  catalogNodes = [...catalogNodes, newNode];
  return res.json({ success: true, data: newNode });
}

function updateCatalogNode(req: Request, res: Response) {
  const { id } = req.params;
  const body = req.body as Partial<CatalogNode>;
  catalogNodes = catalogNodes.map((node) =>
    node.id === id
      ? { ...node, ...body, id, nodeType: node.nodeType, parentId: node.parentId, updatedBy: 'current.user', updatedAt: nowIso() }
      : node,
  );
  const updated = catalogNodes.find((node) => node.id === id);
  return res.json({ success: true, data: updated });
}

function toggleCatalogNodeStatus(req: Request, res: Response) {
  const id = req.params.id as string;
  const target = catalogNodes.find((node) => node.id === id);
  if (!target) {
    return res.status(404).json({ success: false, message: 'Catalog node not found' });
  }
  const nextStatus: CatalogStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const affectedIds = new Set([id, ...(nextStatus === 'INACTIVE' ? getDescendantIds(id) : [])]);
  catalogNodes = catalogNodes.map((node) =>
    affectedIds.has(node.id)
      ? { ...node, status: node.id === id ? nextStatus : node.status, updatedBy: 'current.user', updatedAt: nowIso() }
      : node,
  );
  const updated = catalogNodes.find((node) => node.id === id);
  return res.json({ success: true, data: updated });
}

export default {
  'GET /api/catalog/nodes': getCatalogNodes,
  'GET /api/catalog/nodes/:id': getCatalogNodeById,
  'GET /api/catalog/nodes/:id/usage': getCatalogNodeUsage,
  'POST /api/catalog/nodes': addCatalogNode,
  'PUT /api/catalog/nodes/:id': updateCatalogNode,
  'PATCH /api/catalog/nodes/:id/status': toggleCatalogNodeStatus,
};
