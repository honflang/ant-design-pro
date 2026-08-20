import type { Request, Response } from 'express';
import type { PriceType } from './pricing';

export type ActivityStatus = 'DRAFT' | 'PUBLISHED' | 'INACTIVE';
export type CustomerScopeType = 'BANK_WIDE' | 'SEGMENT' | 'GROUP' | 'CUSTOMER';
export type InstitutionScopeType = 'BANK_WIDE' | 'REGION' | 'BRANCH';
export type BenefitType = 'FIXED_AMOUNT' | 'PERCENTAGE_DISCOUNT' | 'RATE_DISCOUNT' | 'WAIVER' | 'ECR';
export type ConditionField = 'TRB' | 'PRODUCT_COUNT' | 'INDUSTRY' | 'SEGMENT';
export type ConditionOperator = 'EQ' | 'NE' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'IN';

export interface ActivityCondition {
  field: ConditionField;
  operator: ConditionOperator;
  value: string | number | string[];
}

export interface ConditionGroup {
  operator: 'AND' | 'OR';
  conditions: ActivityCondition[];
}

export interface ActivityPricingRule {
  id: string;
  product: string;
  serviceGroup?: string;
  service?: string;
  feeItem?: string;
  referencePriceType?: PriceType;
  benefitType: BenefitType;
  benefitValue?: number;
  currency?: string;
  unit?: string;
  standardRate?: number;
  promotionalRate?: number;
  ecrReference?: string;
  ecrRate?: number;
  ecrSpread?: number;
  ecrMaxCredit?: number;
  description?: string;
}

export interface PricingActivity {
  id: string;
  activityCode: string;
  activityName: string;
  status: ActivityStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  customerScope: CustomerScopeType;
  customerSegment?: string;
  clientGroup?: string;
  customerIds?: string[];
  institutionScope: InstitutionScopeType;
  institutionRegion?: string;
  branchIds?: string[];
  triggerConditions: ConditionGroup[];
  rules: ActivityPricingRule[];
  updatedBy: string;
  updatedAt: string;
}

const nowIso = () => new Date().toISOString();

let activities: PricingActivity[] = [
  {
    id: 'act-2026-001',
    activityCode: 'ACT-2026-001',
    activityName: 'APAC Corporate Cash Management Promotion',
    status: 'PUBLISHED',
    effectiveFrom: '2026-09-01',
    effectiveTo: '2026-12-31',
    customerScope: 'SEGMENT',
    customerSegment: 'Corporate',
    institutionScope: 'REGION',
    institutionRegion: 'ASEAN',
    triggerConditions: [
      {
        operator: 'AND',
        conditions: [
          { field: 'TRB', operator: 'GTE', value: 10000000 },
          { field: 'PRODUCT_COUNT', operator: 'GTE', value: 3 },
        ],
      },
    ],
    rules: [
      {
        id: 'apr-001-1',
        product: 'Cash Management',
        benefitType: 'PERCENTAGE_DISCOUNT',
        benefitValue: 20,
        currency: 'SGD',
        standardRate: 50,
        promotionalRate: 40,
        unit: 'PER_MONTH',
        description: 'Product-level discount for all eligible Cash Management services.',
      },
      {
        id: 'apr-001-2',
        product: 'Trade Finance',
        serviceGroup: 'Documentary Trade',
        benefitType: 'FIXED_AMOUNT',
        benefitValue: 20,
        currency: 'SGD',
        unit: 'PER_MONTH',
        standardRate: 50,
        promotionalRate: 30,
        description: 'Service-group-level discount for all Documentary Trade services.',
      },
      {
        id: 'apr-001-3',
        product: 'Trade Finance',
        serviceGroup: 'Documentary Trade',
        service: 'Letter of Credit Issuance',
        benefitType: 'RATE_DISCOUNT',
        currency: 'SGD',
        standardRate: 0.1,
        promotionalRate: 0.08,
        description: 'Service-level preferential rate for Letter of Credit Issuance.',
      },
      {
        id: 'apr-001-4',
        product: 'Cash Management',
        serviceGroup: 'Account Services',
        service: 'Account Maintenance',
        feeItem: 'Account Maintenance Fee',
        benefitType: 'PERCENTAGE_DISCOUNT',
        benefitValue: 10,
        currency: 'SGD',
        standardRate: 50,
        promotionalRate: 45,
        unit: 'PER_MONTH',
        description: 'Fee-item-level discount for the Account Maintenance Fee.',
      },
    ],
    updatedBy: 'pricing.ops',
    updatedAt: nowIso(),
  },
  {
    id: 'act-2026-002',
    activityCode: 'ACT-2026-002',
    activityName: 'SME Transaction Fee Campaign',
    status: 'DRAFT',
    effectiveFrom: '2026-03-01',
    effectiveTo: '2026-12-31',
    customerScope: 'SEGMENT',
    customerSegment: 'SME',
    institutionScope: 'BANK_WIDE',
    triggerConditions: [],
    rules: [
      {
        id: 'apr-002-1',
        product: 'Cash Management',
        serviceGroup: 'Payments',
        service: 'Cross-border Payment Processing',
        benefitType: 'WAIVER',
        currency: 'SGD',
        standardRate: 15,
        promotionalRate: 0,
        unit: 'PER_TRANSACTION',
        description: 'Cross-border Payment Full Waiver for SME segment customers.',
      },
      {
        id: 'apr-002-2',
        product: 'Cash Management',
        serviceGroup: 'Account Services',
        service: 'Account Maintenance',
        benefitType: 'FIXED_AMOUNT',
        benefitValue: 10,
        currency: 'SGD',
        unit: 'PER_MONTH',
        standardRate: 42,
        promotionalRate: 32,
        description: 'SME account maintenance fixed discount.',
      },
      {
        id: 'apr-002-3',
        product: 'Trade Finance',
        serviceGroup: 'Documentary Trade',
        service: 'Trade Document Processing',
        benefitType: 'PERCENTAGE_DISCOUNT',
        benefitValue: 15,
        currency: 'HKD',
        standardRate: 0.08,
        promotionalRate: 0.068,
        description: 'Trade document processing fee discount for SME clients.',
      },
      {
        id: 'apr-002-4',
        product: 'FX Services',
        serviceGroup: 'FX Execution',
        service: 'Spot FX Conversion',
        benefitType: 'PERCENTAGE_DISCOUNT',
        benefitValue: 5,
        currency: 'CNY',
        standardRate: 0.15,
        promotionalRate: 0.1425,
        description: 'Small spot FX spread reduction for SME campaign participants.',
      },
    ],
    updatedBy: 'sme.pricing',
    updatedAt: nowIso(),
  },
  {
    id: 'act-2026-003',
    activityCode: 'ACT-2026-003',
    activityName: 'APAC Strategic Accounts Promotion',
    status: 'PUBLISHED',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-06-30',
    customerScope: 'GROUP',
    clientGroup: 'APAC Strategic Accounts',
    institutionScope: 'BANK_WIDE',
    triggerConditions: [],
    rules: [
      {
        id: 'apr-003-1',
        product: 'Trade Finance',
        serviceGroup: 'Documentary Trade',
        service: 'Letter of Credit Issuance',
        benefitType: 'RATE_DISCOUNT',
        currency: 'USD',
        standardRate: 0.18,
        promotionalRate: 0.12,
        description: 'Group-level LC issuance rate discount for APAC strategic accounts.',
      },
      {
        id: 'apr-003-2',
        product: 'FX Services',
        serviceGroup: 'FX Execution',
        service: 'Spot FX Conversion',
        benefitType: 'RATE_DISCOUNT',
        currency: 'USD',
        standardRate: 0.15,
        promotionalRate: 0.1,
        description: 'Preferential spot FX spread for strategic relationship accounts.',
      },
      {
        id: 'apr-003-3',
        product: 'Cash Management',
        serviceGroup: 'Liquidity Services',
        service: 'Operating Balance Management',
        benefitType: 'ECR',
        currency: 'AUD',
        ecrReference: 'AONIA + BBSW',
        ecrRate: 2.1,
        ecrSpread: 0.35,
        ecrMaxCredit: 500000,
        standardRate: 0.55,
        promotionalRate: 0.35,
        description: 'ECR credit enhancement on operating balances for strategic accounts.',
      },
      {
        id: 'apr-003-4',
        product: 'Cash Management',
        serviceGroup: 'Account Services',
        service: 'Account Maintenance',
        benefitType: 'FIXED_AMOUNT',
        benefitValue: 15,
        currency: 'USD',
        unit: 'PER_MONTH',
        standardRate: 55,
        promotionalRate: 40,
        description: 'Fixed monthly discount on account maintenance for the group.',
      },
    ],
    updatedBy: 'relationship.pricing',
    updatedAt: nowIso(),
  },
  {
    id: 'act-2026-004',
    activityCode: 'ACT-2026-004',
    activityName: 'Manufacturing Industry Promotion',
    status: 'PUBLISHED',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    customerScope: 'BANK_WIDE',
    institutionScope: 'BANK_WIDE',
    triggerConditions: [
      {
        operator: 'AND',
        conditions: [{ field: 'INDUSTRY', operator: 'EQ', value: 'Manufacturing' }],
      },
    ],
    rules: [
      {
        id: 'apr-004-1',
        product: 'Trade Finance',
        serviceGroup: 'Guarantees',
        service: 'Bank Guarantee Issuance',
        benefitType: 'PERCENTAGE_DISCOUNT',
        benefitValue: 20,
        currency: 'SGD',
        standardRate: 300,
        promotionalRate: 240,
        unit: 'PER_TRANSACTION',
        description: 'Trade Finance 20% Discount for manufacturing industry customers.',
      },
      {
        id: 'apr-004-2',
        product: 'Trade Finance',
        serviceGroup: 'Documentary Trade',
        service: 'Trade Document Processing',
        benefitType: 'PERCENTAGE_DISCOUNT',
        benefitValue: 15,
        currency: 'HKD',
        standardRate: 0.08,
        promotionalRate: 0.068,
        description: 'Document processing fee discount for qualifying manufacturers.',
      },
      {
        id: 'apr-004-3',
        product: 'Trade Finance',
        serviceGroup: 'Documentary Trade',
        service: 'Trade Document Processing',
        feeItem: 'Document Handling Fee',
        benefitType: 'FIXED_AMOUNT',
        benefitValue: 5,
        currency: 'HKD',
        unit: 'PER_TRANSACTION',
        standardRate: 40,
        promotionalRate: 35,
        description: 'Additional fixed discount on document handling fee.',
      },
    ],
    updatedBy: 'industry.pricing',
    updatedAt: nowIso(),
  },
  {
    id: 'act-2026-005',
    activityCode: 'ACT-2026-005',
    activityName: 'Japan Transaction Campaign',
    status: 'PUBLISHED',
    effectiveFrom: '2026-04-01',
    effectiveTo: '2026-09-30',
    customerScope: 'BANK_WIDE',
    institutionScope: 'BRANCH',
    branchIds: ['Japan Branch'],
    triggerConditions: [],
    rules: [
      {
        id: 'apr-005-1',
        product: 'Cash Management',
        serviceGroup: 'Payments',
        service: 'Domestic Payment Processing',
        benefitType: 'FIXED_AMOUNT',
        benefitValue: 30,
        currency: 'JPY',
        unit: 'PER_TRANSACTION',
        standardRate: 120,
        promotionalRate: 90,
        description: 'Payment Fee Fixed Amount Discount for domestic payments processed via Japan Branch.',
      },
      {
        id: 'apr-005-2',
        product: 'Cash Management',
        serviceGroup: 'Payments',
        service: 'Cross-border Payment Processing',
        benefitType: 'FIXED_AMOUNT',
        benefitValue: 50,
        currency: 'JPY',
        unit: 'PER_TRANSACTION',
        standardRate: 180,
        promotionalRate: 130,
        description: 'Cross-border payment fee discount for the Japan transaction campaign.',
      },
      {
        id: 'apr-005-3',
        product: 'FX Services',
        serviceGroup: 'FX Hedging',
        service: 'Forward Contract Settlement',
        benefitType: 'PERCENTAGE_DISCOUNT',
        benefitValue: 10,
        currency: 'JPY',
        standardRate: 1.65,
        promotionalRate: 1.485,
        description: 'Forward contract settlement spread discount.',
      },
    ],
    updatedBy: 'jp.pricing',
    updatedAt: nowIso(),
  },
  {
    id: 'act-2026-006',
    activityCode: 'ACT-2026-006',
    activityName: 'Australia ECR Promotion',
    status: 'INACTIVE',
    effectiveFrom: '2025-07-01',
    effectiveTo: '2026-06-30',
    customerScope: 'BANK_WIDE',
    institutionScope: 'REGION',
    institutionRegion: 'Australia',
    triggerConditions: [],
    rules: [
      {
        id: 'apr-006-1',
        product: 'Cash Management',
        serviceGroup: 'Liquidity Services',
        service: 'Operating Balance Management',
        benefitType: 'ECR',
        currency: 'AUD',
        ecrReference: 'AONIA + BBSW',
        ecrRate: 2.1,
        ecrSpread: 0.35,
        ecrMaxCredit: 1000000,
        standardRate: 0.55,
        promotionalRate: 0.35,
        description: 'Australia ECR promotion enhancing the operating balance credit spread.',
      },
      {
        id: 'apr-006-2',
        product: 'Trade Finance',
        serviceGroup: 'Documentary Trade',
        service: 'Letter of Credit Issuance',
        benefitType: 'RATE_DISCOUNT',
        currency: 'AUD',
        standardRate: 0.22,
        promotionalRate: 0.15,
        description: 'LC issuance rate discount for Australia region trade clients.',
      },
      {
        id: 'apr-006-3',
        product: 'Cash Management',
        serviceGroup: 'Account Services',
        service: 'Account Maintenance',
        benefitType: 'WAIVER',
        currency: 'AUD',
        standardRate: 60,
        promotionalRate: 0,
        unit: 'PER_MONTH',
        description: 'Account maintenance fee fully waived under the (now inactive) promotion.',
      },
    ],
    updatedBy: 'au.pricing',
    updatedAt: nowIso(),
  },
];

function toQueryString(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  return search.toString();
}

function getActivities(req: Request, res: Response) {
  const { status, customerScope, institutionScope, keyword } = req.query as Record<string, string>;

  let data = [...activities];

  if (status) data = data.filter((item) => item.status === status);
  if (customerScope) data = data.filter((item) => item.customerScope === customerScope);
  if (institutionScope) data = data.filter((item) => item.institutionScope === institutionScope);
  if (keyword) {
    const kw = keyword.toLowerCase();
    data = data.filter((item) => {
      const haystack = [
        item.activityCode,
        item.activityName,
        item.customerSegment,
        item.clientGroup,
        item.institutionRegion,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(kw);
    });
  }

  const query = toQueryString({ status, customerScope, institutionScope, keyword });
  return res.json({
    success: true,
    data,
    total: data.length,
    query,
  });
}

function getActivityById(req: Request, res: Response) {
  const { id } = req.params;
  const record = activities.find((item) => item.id === id);
  if (!record) {
    return res.status(404).json({ success: false, message: 'Activity not found' });
  }
  return res.json({ success: true, data: record });
}

function addActivity(req: Request, res: Response) {
  const body = req.body as Partial<PricingActivity>;
  const newRecord: PricingActivity = {
    ...body,
    id: `act-${Date.now()}`,
    activityCode: body.activityCode ?? `ACT-${Date.now()}`,
    activityName: body.activityName ?? 'Untitled Activity',
    status: body.status ?? 'DRAFT',
    customerScope: body.customerScope ?? 'BANK_WIDE',
    institutionScope: body.institutionScope ?? 'BANK_WIDE',
    triggerConditions: body.triggerConditions ?? [],
    rules: body.rules ?? [],
    updatedBy: 'current.user',
    updatedAt: nowIso(),
  } as PricingActivity;

  activities = [newRecord, ...activities];
  return res.json({ success: true, data: newRecord });
}

function updateActivity(req: Request, res: Response) {
  const { id } = req.params;
  const body = req.body as Partial<PricingActivity>;
  activities = activities.map((item) =>
    item.id === id
      ? { ...item, ...body, id, updatedBy: 'current.user', updatedAt: nowIso() }
      : item,
  );
  const updated = activities.find((item) => item.id === id);
  return res.json({ success: true, data: updated });
}

function updateActivityStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body as { status: ActivityStatus };
  activities = activities.map((item) =>
    item.id === id ? { ...item, status, updatedBy: 'current.user', updatedAt: nowIso() } : item,
  );
  const updated = activities.find((item) => item.id === id);
  return res.json({ success: true, data: updated });
}

export default {
  'GET /api/pricing/activities': getActivities,
  'GET /api/pricing/activities/:id': getActivityById,
  'POST /api/pricing/activities': addActivity,
  'PUT /api/pricing/activities/:id': updateActivity,
  'PATCH /api/pricing/activities/:id/status': updateActivityStatus,
};
