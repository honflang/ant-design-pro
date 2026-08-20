import type { Request, Response } from 'express';

export type JurisdictionTaxNodeType = 'JURISDICTION' | 'TAX_DEFINITION';
export type JurisdictionTaxStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type TaxTreatment =
  | 'TAX_EXCLUSIVE'
  | 'TAX_INCLUSIVE'
  | 'TAX_EXEMPT'
  | 'ZERO_RATED'
  | 'INPUT_TAXED'
  | 'OUT_OF_SCOPE';

export interface JurisdictionTaxNode {
  id: string;
  code: string;
  name: string;
  nodeType: JurisdictionTaxNodeType;
  parentId?: string;
  description?: string;
  status: JurisdictionTaxStatus;
  taxAuthority?: string;
  defaultCurrency?: string;
  taxType?: string;
  defaultRate?: number;
  defaultTaxTreatment?: TaxTreatment;
  effectiveFrom: string;
  effectiveTo?: string;
  updatedBy: string;
  updatedAt: string;
}

const nowIso = () => new Date().toISOString();

let jurisdictionTaxNodes: JurisdictionTaxNode[] = [
  {
    id: 'J-SG',
    code: 'SG',
    name: 'Singapore',
    nodeType: 'JURISDICTION',
    description: 'Singapore jurisdiction under IRAS oversight.',
    status: 'ACTIVE',
    taxAuthority: 'Inland Revenue Authority of Singapore (IRAS)',
    defaultCurrency: 'SGD',
    effectiveFrom: '2024-01-01',
    updatedBy: 'Tax Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'T-SG-GST',
    code: 'SG-GST',
    name: 'Goods and Services Tax',
    nodeType: 'TAX_DEFINITION',
    parentId: 'J-SG',
    description: 'Standard GST applied to taxable banking services.',
    status: 'ACTIVE',
    taxType: 'GST',
    defaultRate: 9,
    defaultTaxTreatment: 'TAX_EXCLUSIVE',
    effectiveFrom: '2024-01-01',
    updatedBy: 'Tax Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'T-SG-WHT',
    code: 'SG-WHT',
    name: 'Withholding Tax',
    nodeType: 'TAX_DEFINITION',
    parentId: 'J-SG',
    description: 'Withholding tax on cross-border service fees.',
    status: 'ACTIVE',
    taxType: 'WHT',
    defaultRate: 10,
    defaultTaxTreatment: 'TAX_EXCLUSIVE',
    effectiveFrom: '2026-01-01',
    updatedBy: 'Tax Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'J-HK',
    code: 'HK',
    name: 'Hong Kong',
    nodeType: 'JURISDICTION',
    description: 'Hong Kong jurisdiction under IRD oversight.',
    status: 'ACTIVE',
    taxAuthority: 'Inland Revenue Department (IRD)',
    defaultCurrency: 'HKD',
    effectiveFrom: '2023-04-01',
    updatedBy: 'Tax Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'T-HK-WHT',
    code: 'HK-WHT',
    name: 'Profits Tax Withholding',
    nodeType: 'TAX_DEFINITION',
    parentId: 'J-HK',
    description: 'Withholding on service fees paid to non-residents.',
    status: 'ACTIVE',
    taxType: 'WHT',
    defaultRate: 15,
    defaultTaxTreatment: 'TAX_EXCLUSIVE',
    effectiveFrom: '2023-04-01',
    updatedBy: 'Tax Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'T-HK-EXEMPT',
    code: 'HK-EXEMPT',
    name: 'Exempt Financial Services',
    nodeType: 'TAX_DEFINITION',
    parentId: 'J-HK',
    description: 'Exempt treatment for qualifying financial services.',
    status: 'ACTIVE',
    taxType: 'Other',
    defaultRate: 0,
    defaultTaxTreatment: 'TAX_EXEMPT',
    effectiveFrom: '2023-04-01',
    updatedBy: 'Tax Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'J-CN',
    code: 'CN',
    name: 'China',
    nodeType: 'JURISDICTION',
    description: 'Mainland China jurisdiction under STA oversight.',
    status: 'ACTIVE',
    taxAuthority: 'State Taxation Administration (STA)',
    defaultCurrency: 'CNY',
    effectiveFrom: '2024-01-01',
    updatedBy: 'Tax Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'T-CN-VAT',
    code: 'CN-VAT',
    name: 'Value Added Tax',
    nodeType: 'TAX_DEFINITION',
    parentId: 'J-CN',
    description: 'Standard VAT on taxable banking services.',
    status: 'ACTIVE',
    taxType: 'VAT',
    defaultRate: 6,
    defaultTaxTreatment: 'TAX_EXCLUSIVE',
    effectiveFrom: '2024-01-01',
    updatedBy: 'Tax Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'T-CN-WHT',
    code: 'CN-WHT',
    name: 'Withholding Tax',
    nodeType: 'TAX_DEFINITION',
    parentId: 'J-CN',
    description: 'Withholding tax on cross-border payments.',
    status: 'DRAFT',
    taxType: 'WHT',
    defaultRate: 10,
    defaultTaxTreatment: 'TAX_EXCLUSIVE',
    effectiveFrom: '2026-10-01',
    updatedBy: 'Tax Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'J-JP',
    code: 'JP',
    name: 'Japan',
    nodeType: 'JURISDICTION',
    description: 'Japan jurisdiction under NTA oversight.',
    status: 'ACTIVE',
    taxAuthority: 'National Tax Agency (NTA)',
    defaultCurrency: 'JPY',
    effectiveFrom: '2024-01-01',
    updatedBy: 'Tax Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'T-JP-CT',
    code: 'JP-CT',
    name: 'Consumption Tax',
    nodeType: 'TAX_DEFINITION',
    parentId: 'J-JP',
    description: 'Standard consumption tax on taxable services.',
    status: 'ACTIVE',
    taxType: 'Consumption Tax',
    defaultRate: 10,
    defaultTaxTreatment: 'TAX_EXCLUSIVE',
    effectiveFrom: '2024-01-01',
    updatedBy: 'Tax Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'J-AU',
    code: 'AU',
    name: 'Australia',
    nodeType: 'JURISDICTION',
    description: 'Australia jurisdiction under ATO oversight.',
    status: 'ACTIVE',
    taxAuthority: 'Australian Taxation Office (ATO)',
    defaultCurrency: 'AUD',
    effectiveFrom: '2024-01-01',
    updatedBy: 'Tax Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'T-AU-GST',
    code: 'AU-GST',
    name: 'Goods and Services Tax',
    nodeType: 'TAX_DEFINITION',
    parentId: 'J-AU',
    description: 'Standard GST applied to taxable banking services.',
    status: 'ACTIVE',
    taxType: 'GST',
    defaultRate: 10,
    defaultTaxTreatment: 'TAX_EXCLUSIVE',
    effectiveFrom: '2024-01-01',
    updatedBy: 'Tax Administration',
    updatedAt: nowIso(),
  },
  {
    id: 'T-AU-INPUT-TAXED',
    code: 'AU-INPUT-TAXED',
    name: 'Input Taxed Financial Supplies',
    nodeType: 'TAX_DEFINITION',
    parentId: 'J-AU',
    description: 'Input taxed treatment for qualifying financial supplies.',
    status: 'ACTIVE',
    taxType: 'Other',
    defaultRate: 0,
    defaultTaxTreatment: 'INPUT_TAXED',
    effectiveFrom: '2024-01-01',
    updatedBy: 'Tax Administration',
    updatedAt: nowIso(),
  },
];

const getChildren = (parentId?: string) =>
  jurisdictionTaxNodes.filter((node) => node.parentId === parentId);

const getAncestorIds = (nodeId: string): string[] => {
  const node = jurisdictionTaxNodes.find((item) => item.id === nodeId);
  return node?.parentId ? [node.parentId, ...getAncestorIds(node.parentId)] : [];
};

function getJurisdictionTaxNodes(req: Request, res: Response) {
  const { nodeType, parentId, status, taxType, keyword } = req.query as Record<string, string>;

  const hasFilter = Boolean(nodeType || parentId || status || taxType || keyword);
  if (!hasFilter) {
    return res.json({ success: true, data: jurisdictionTaxNodes, total: jurisdictionTaxNodes.length });
  }

  const kw = keyword?.toLowerCase();
  const matches = jurisdictionTaxNodes.filter((node) => {
    if (nodeType && node.nodeType !== nodeType) return false;
    if (parentId && node.parentId !== parentId) return false;
    if (status && node.status !== status) return false;
    if (taxType && node.taxType !== taxType) return false;
    if (kw && ![node.code, node.name, node.description ?? ''].some((value) => value.toLowerCase().includes(kw))) {
      return false;
    }
    return true;
  });

  // Keep the full ancestor path of every match so hierarchy context is preserved.
  const visibleIds = new Set(matches.flatMap((node) => [node.id, ...getAncestorIds(node.id)]));
  const data = jurisdictionTaxNodes.filter((node) => visibleIds.has(node.id));

  return res.json({ success: true, data, total: data.length });
}

function getJurisdictionTaxNodeById(req: Request, res: Response) {
  const { id } = req.params;
  const record = jurisdictionTaxNodes.find((node) => node.id === id);
  if (!record) {
    return res.status(404).json({ success: false, message: 'Jurisdiction tax node not found' });
  }
  return res.json({ success: true, data: record });
}

function addJurisdictionTaxNode(req: Request, res: Response) {
  const body = req.body as Partial<JurisdictionTaxNode>;
  const nodeType: JurisdictionTaxNodeType = body.parentId ? 'TAX_DEFINITION' : 'JURISDICTION';
  const newNode: JurisdictionTaxNode = {
    id: `${nodeType}-${Date.now()}`,
    code: body.code ?? '',
    name: body.name ?? '',
    nodeType,
    parentId: body.parentId,
    description: body.description,
    status: body.status ?? 'DRAFT',
    taxAuthority: body.taxAuthority,
    defaultCurrency: body.defaultCurrency,
    taxType: body.taxType,
    defaultRate: body.defaultRate,
    defaultTaxTreatment: body.defaultTaxTreatment,
    effectiveFrom: body.effectiveFrom ?? nowIso().slice(0, 10),
    effectiveTo: body.effectiveTo,
    updatedBy: 'current.user',
    updatedAt: nowIso(),
  };
  jurisdictionTaxNodes = [...jurisdictionTaxNodes, newNode];
  return res.json({ success: true, data: newNode });
}

function updateJurisdictionTaxNode(req: Request, res: Response) {
  const { id } = req.params;
  const body = req.body as Partial<JurisdictionTaxNode>;
  jurisdictionTaxNodes = jurisdictionTaxNodes.map((node) =>
    node.id === id
      ? { ...node, ...body, id, nodeType: node.nodeType, parentId: node.parentId, updatedBy: 'current.user', updatedAt: nowIso() }
      : node,
  );
  const updated = jurisdictionTaxNodes.find((node) => node.id === id);
  return res.json({ success: true, data: updated });
}

function toggleJurisdictionTaxNodeStatus(req: Request, res: Response) {
  const id = req.params.id as string;
  const target = jurisdictionTaxNodes.find((node) => node.id === id);
  if (!target) {
    return res.status(404).json({ success: false, message: 'Jurisdiction tax node not found' });
  }
  const nextStatus: JurisdictionTaxStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const affectedIds = new Set([id, ...(nextStatus === 'INACTIVE' ? getChildren(id).map((child) => child.id) : [])]);
  jurisdictionTaxNodes = jurisdictionTaxNodes.map((node) =>
    affectedIds.has(node.id)
      ? { ...node, status: node.id === id ? nextStatus : node.status, updatedBy: 'current.user', updatedAt: nowIso() }
      : node,
  );
  const updated = jurisdictionTaxNodes.find((node) => node.id === id);
  return res.json({ success: true, data: updated });
}

export default {
  'GET /api/regional/jurisdiction-tax/nodes': getJurisdictionTaxNodes,
  'GET /api/regional/jurisdiction-tax/nodes/:id': getJurisdictionTaxNodeById,
  'POST /api/regional/jurisdiction-tax/nodes': addJurisdictionTaxNode,
  'PUT /api/regional/jurisdiction-tax/nodes/:id': updateJurisdictionTaxNode,
  'PATCH /api/regional/jurisdiction-tax/nodes/:id/status': toggleJurisdictionTaxNodeStatus,
};
