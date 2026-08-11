import type { Request, Response } from 'express';

export interface TaxRule {
  id: string;
  jurisdiction: string;
  taxType: string;
  taxName: string;
  taxCode: string;
  productService: string;
  applicability: string;
  customerType: string;
  customerTaxStatus: string;
  serviceLocation: string;
  customerLocation: string;
  rate: number;
  taxTreatment: string;
  calculationMethod: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'ACTIVE' | 'INACTIVE';
  currency: string;
  taxAuthority: string;
  updatedBy: string;
  updatedAt: string;
}

let taxRules: TaxRule[] = [
  // Singapore
  {
    id: 'sg-gst-001',
    jurisdiction: 'Singapore',
    taxType: 'GST',
    taxName: 'Goods and Services Tax',
    taxCode: 'SG-GST-9',
    productService: 'Cash Management',
    applicability: 'Taxable Banking Services',
    customerType: 'Corporate',
    customerTaxStatus: 'Taxable',
    serviceLocation: 'Singapore',
    customerLocation: 'Singapore',
    rate: 9,
    taxTreatment: 'Tax Exclusive',
    calculationMethod: 'Tax Exclusive',
    effectiveFrom: '2024-01-01',
    status: 'ACTIVE',
    currency: 'SGD',
    taxAuthority: 'Inland Revenue Authority of Singapore (IRAS)',
    updatedBy: 'system.admin',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'sg-wht-001',
    jurisdiction: 'Singapore',
    taxType: 'WHT',
    taxName: 'Withholding Tax on Cross-border Services',
    taxCode: 'SG-WHT-10',
    productService: 'FX Services',
    applicability: 'Cross-border Services',
    customerType: 'Corporate',
    customerTaxStatus: 'Taxable',
    serviceLocation: 'Singapore',
    customerLocation: 'Overseas',
    rate: 10,
    taxTreatment: 'Tax Exclusive',
    calculationMethod: 'Tax Exclusive',
    effectiveFrom: '2026-01-01',
    status: 'ACTIVE',
    currency: 'SGD',
    taxAuthority: 'Inland Revenue Authority of Singapore (IRAS)',
    updatedBy: 'system.admin',
    updatedAt: '2025-12-01T00:00:00Z',
  },
  {
    id: 'sg-gst-002',
    jurisdiction: 'Singapore',
    taxType: 'GST',
    taxName: 'GST - Trade Finance',
    taxCode: 'SG-GST-TF',
    productService: 'Trade Finance',
    applicability: 'Taxable Banking Services',
    customerType: 'Corporate',
    customerTaxStatus: 'Taxable',
    serviceLocation: 'Singapore',
    customerLocation: 'Singapore',
    rate: 9,
    taxTreatment: 'Tax Exclusive',
    calculationMethod: 'Tax Exclusive',
    effectiveFrom: '2024-01-01',
    status: 'ACTIVE',
    currency: 'SGD',
    taxAuthority: 'Inland Revenue Authority of Singapore (IRAS)',
    updatedBy: 'ops.team',
    updatedAt: '2024-03-15T00:00:00Z',
  },
  // Hong Kong
  {
    id: 'hk-wht-001',
    jurisdiction: 'Hong Kong',
    taxType: 'WHT',
    taxName: 'Profits Tax - Service Fee WHT',
    taxCode: 'HK-WHT-15',
    productService: 'Advisory Services',
    applicability: 'Cross-border Payment to Non-residents',
    customerType: 'Corporate',
    customerTaxStatus: 'Taxable',
    serviceLocation: 'Hong Kong',
    customerLocation: 'Overseas',
    rate: 15,
    taxTreatment: 'Tax Exclusive',
    calculationMethod: 'Tax Exclusive',
    effectiveFrom: '2023-04-01',
    status: 'ACTIVE',
    currency: 'HKD',
    taxAuthority: 'Inland Revenue Department (IRD)',
    updatedBy: 'hk.compliance',
    updatedAt: '2023-04-01T00:00:00Z',
  },
  {
    id: 'hk-exempt-001',
    jurisdiction: 'Hong Kong',
    taxType: 'VAT',
    taxName: 'Indirect Tax - Exempt',
    taxCode: 'HK-EXEMPT',
    productService: 'Cash Management',
    applicability: 'Financial Services - General Exemption',
    customerType: 'Corporate',
    customerTaxStatus: 'Exempt',
    serviceLocation: 'Hong Kong',
    customerLocation: 'Hong Kong',
    rate: 0,
    taxTreatment: 'Tax Exempt',
    calculationMethod: 'Exempt',
    effectiveFrom: '2020-01-01',
    status: 'ACTIVE',
    currency: 'HKD',
    taxAuthority: 'Inland Revenue Department (IRD)',
    updatedBy: 'system.admin',
    updatedAt: '2020-01-01T00:00:00Z',
  },
  // China
  {
    id: 'cn-vat-001',
    jurisdiction: 'China',
    taxType: 'VAT',
    taxName: 'Value Added Tax - Financial Services',
    taxCode: 'CN-VAT-6',
    productService: 'Cash Management',
    applicability: 'Taxable Financial Services',
    customerType: 'Corporate',
    customerTaxStatus: 'Taxable',
    serviceLocation: 'China',
    customerLocation: 'China',
    rate: 6,
    taxTreatment: 'Tax Exclusive',
    calculationMethod: 'Tax Exclusive',
    effectiveFrom: '2019-04-01',
    status: 'ACTIVE',
    currency: 'CNY',
    taxAuthority: 'State Taxation Administration (STA)',
    updatedBy: 'cn.tax.team',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cn-vat-002',
    jurisdiction: 'China',
    taxType: 'VAT',
    taxName: 'VAT - Trade Finance',
    taxCode: 'CN-VAT-TF-6',
    productService: 'Trade Finance',
    applicability: 'Taxable Financial Services',
    customerType: 'Corporate',
    customerTaxStatus: 'Taxable',
    serviceLocation: 'China',
    customerLocation: 'China',
    rate: 6,
    taxTreatment: 'Tax Exclusive',
    calculationMethod: 'Tax Exclusive',
    effectiveFrom: '2019-04-01',
    status: 'ACTIVE',
    currency: 'CNY',
    taxAuthority: 'State Taxation Administration (STA)',
    updatedBy: 'cn.tax.team',
    updatedAt: '2023-06-01T00:00:00Z',
  },
  {
    id: 'cn-wht-001',
    jurisdiction: 'China',
    taxType: 'WHT',
    taxName: 'Enterprise Income Tax WHT',
    taxCode: 'CN-EIT-WHT-10',
    productService: 'FX Services',
    applicability: 'Cross-border Service Payments',
    customerType: 'Corporate',
    customerTaxStatus: 'Taxable',
    serviceLocation: 'China',
    customerLocation: 'Overseas',
    rate: 10,
    taxTreatment: 'Tax Exclusive',
    calculationMethod: 'Tax Exclusive',
    effectiveFrom: '2018-01-01',
    status: 'ACTIVE',
    currency: 'CNY',
    taxAuthority: 'State Taxation Administration (STA)',
    updatedBy: 'cn.tax.team',
    updatedAt: '2022-01-01T00:00:00Z',
  },
  // Japan
  {
    id: 'jp-ct-001',
    jurisdiction: 'Japan',
    taxType: 'Consumption Tax',
    taxName: 'Consumption Tax - Banking Services',
    taxCode: 'JP-CT-10',
    productService: 'Cash Management',
    applicability: 'Taxable Domestic Services',
    customerType: 'Corporate',
    customerTaxStatus: 'Taxable',
    serviceLocation: 'Japan',
    customerLocation: 'Japan',
    rate: 10,
    taxTreatment: 'Tax Exclusive',
    calculationMethod: 'Tax Exclusive',
    effectiveFrom: '2019-10-01',
    status: 'ACTIVE',
    currency: 'JPY',
    taxAuthority: 'National Tax Agency (NTA)',
    updatedBy: 'jp.compliance',
    updatedAt: '2019-10-01T00:00:00Z',
  },
  {
    id: 'jp-ct-002',
    jurisdiction: 'Japan',
    taxType: 'Consumption Tax',
    taxName: 'Consumption Tax - Trade Finance',
    taxCode: 'JP-CT-TF-10',
    productService: 'Trade Finance',
    applicability: 'Taxable Domestic Services',
    customerType: 'Corporate',
    customerTaxStatus: 'Taxable',
    serviceLocation: 'Japan',
    customerLocation: 'Japan',
    rate: 10,
    taxTreatment: 'Tax Exclusive',
    calculationMethod: 'Tax Exclusive',
    effectiveFrom: '2019-10-01',
    status: 'ACTIVE',
    currency: 'JPY',
    taxAuthority: 'National Tax Agency (NTA)',
    updatedBy: 'jp.compliance',
    updatedAt: '2023-04-01T00:00:00Z',
  },
  {
    id: 'jp-ct-003',
    jurisdiction: 'Japan',
    taxType: 'Consumption Tax',
    taxName: 'Consumption Tax - Export Zero Rated',
    taxCode: 'JP-CT-ZERO',
    productService: 'FX Services',
    applicability: 'Zero Rated Export Services',
    customerType: 'Corporate',
    customerTaxStatus: 'Taxable',
    serviceLocation: 'Japan',
    customerLocation: 'Overseas',
    rate: 0,
    taxTreatment: 'Zero Rated',
    calculationMethod: 'Zero Rated',
    effectiveFrom: '2019-10-01',
    status: 'ACTIVE',
    currency: 'JPY',
    taxAuthority: 'National Tax Agency (NTA)',
    updatedBy: 'jp.compliance',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  // Australia
  {
    id: 'au-gst-001',
    jurisdiction: 'Australia',
    taxType: 'GST',
    taxName: 'Goods and Services Tax',
    taxCode: 'AU-GST-10',
    productService: 'Cash Management',
    applicability: 'Taxable Financial Supplies',
    customerType: 'Corporate',
    customerTaxStatus: 'Taxable',
    serviceLocation: 'Australia',
    customerLocation: 'Australia',
    rate: 10,
    taxTreatment: 'Tax Exclusive',
    calculationMethod: 'Tax Exclusive',
    effectiveFrom: '2000-07-01',
    status: 'ACTIVE',
    currency: 'AUD',
    taxAuthority: 'Australian Taxation Office (ATO)',
    updatedBy: 'au.tax.team',
    updatedAt: '2023-07-01T00:00:00Z',
  },
  {
    id: 'au-gst-002',
    jurisdiction: 'Australia',
    taxType: 'GST',
    taxName: 'GST - Input Taxed Financial Supplies',
    taxCode: 'AU-GST-INPUT-TAXED',
    productService: 'Trade Finance',
    applicability: 'Input Taxed Financial Supplies',
    customerType: 'Corporate',
    customerTaxStatus: 'Taxable',
    serviceLocation: 'Australia',
    customerLocation: 'Australia',
    rate: 0,
    taxTreatment: 'Tax Exempt',
    calculationMethod: 'Input Taxed',
    effectiveFrom: '2000-07-01',
    status: 'ACTIVE',
    currency: 'AUD',
    taxAuthority: 'Australian Taxation Office (ATO)',
    updatedBy: 'au.tax.team',
    updatedAt: '2022-07-01T00:00:00Z',
  },
  {
    id: 'au-wht-001',
    jurisdiction: 'Australia',
    taxType: 'WHT',
    taxName: 'Interest WHT - Non-resident',
    taxCode: 'AU-IWT-10',
    productService: 'Deposit Services',
    applicability: 'Interest Paid to Non-residents',
    customerType: 'Corporate',
    customerTaxStatus: 'Taxable',
    serviceLocation: 'Australia',
    customerLocation: 'Overseas',
    rate: 10,
    taxTreatment: 'Tax Exclusive',
    calculationMethod: 'Tax Exclusive',
    effectiveFrom: '2010-01-01',
    status: 'INACTIVE',
    currency: 'AUD',
    taxAuthority: 'Australian Taxation Office (ATO)',
    updatedBy: 'au.tax.team',
    updatedAt: '2023-01-01T00:00:00Z',
  },
];

function getTaxRules(req: Request, res: Response) {
  const { jurisdiction, taxType, status, keyword } = req.query as Record<string, string>;
  let data = [...taxRules];

  if (jurisdiction) data = data.filter((r) => r.jurisdiction === jurisdiction);
  if (taxType) data = data.filter((r) => r.taxType === taxType);
  if (status) data = data.filter((r) => r.status === status);
  if (keyword) {
    const kw = keyword.toLowerCase();
    data = data.filter(
      (r) =>
        r.taxName.toLowerCase().includes(kw) ||
        r.taxCode.toLowerCase().includes(kw) ||
        r.productService.toLowerCase().includes(kw),
    );
  }

  return res.json({ success: true, data });
}

function addTaxRule(req: Request, res: Response) {
  const body = req.body as Omit<TaxRule, 'id' | 'updatedAt' | 'updatedBy'>;
  const newRule: TaxRule = {
    ...body,
    id: `rule-${Date.now()}`,
    updatedBy: 'current.user',
    updatedAt: new Date().toISOString(),
  };
  taxRules.unshift(newRule);
  return res.json({ success: true, data: newRule });
}

function updateTaxRule(req: Request, res: Response) {
  const { id } = req.params;
  const body = req.body as Partial<TaxRule>;
  taxRules = taxRules.map((r) =>
    r.id === id ? { ...r, ...body, id, updatedBy: 'current.user', updatedAt: new Date().toISOString() } : r,
  );
  const updated = taxRules.find((r) => r.id === id);
  return res.json({ success: true, data: updated });
}

function toggleStatus(req: Request, res: Response) {
  const { id } = req.params;
  taxRules = taxRules.map((r) =>
    r.id === id
      ? { ...r, status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', updatedAt: new Date().toISOString() }
      : r,
  );
  const updated = taxRules.find((r) => r.id === id);
  return res.json({ success: true, data: updated });
}

export default {
  'GET /api/regional/tax-rules': getTaxRules,
  'POST /api/regional/tax-rules': addTaxRule,
  'PUT /api/regional/tax-rules/:id': updateTaxRule,
  'PATCH /api/regional/tax-rules/:id/toggle-status': toggleStatus,
};
