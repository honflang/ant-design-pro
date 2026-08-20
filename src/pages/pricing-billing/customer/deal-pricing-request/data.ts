export type DealPricingRequestType =
  | 'NEW_AGREEMENT'
  | 'RENEWAL'
  | 'TEMPORARY_PROMOTION'
  | 'SPECIAL_WAIVER';

export type DealPricingRequestReason =
  | 'COMPETITIVE_PRESSURE'
  | 'STRATEGIC_CUSTOMER'
  | 'EXPECTED_TOTAL_RETURN'
  | 'RELATIONSHIP_RETENTION'
  | 'CROSS_SELL_OPPORTUNITY';

export type BenchmarkSource = 'TARIFF' | 'PROMOTION';
export type RequestedPriceType = 'AMOUNT' | 'RATE' | 'DISCOUNT' | 'WAIVER';
export type DealPricingRequestStatus =
  | 'DRAFT'
  | 'SIMULATED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface DealPricingPriceDetail {
  id: string;
  feeItem: string;
  chargeService: string;
  tariffItemCode: string;
  pricingModel: 'FLAT' | 'RATE' | 'TIERED';
  chargeBasis: string;
  baselinePrice: number;
  requestedPriceType: RequestedPriceType;
  requestedPrice?: number;
  currency: string;
  mockAnnualVolume: number;
  remarks?: string;
}

export interface DealPricingSimulation {
  simulatedAt: string;
  baselineAnnualizedFee: number;
  requestedAnnualizedFee: number;
  estimatedRevenueImpact: number;
  estimatedTotalRelationshipReturn: number;
  requestedDiscountPercent: number;
  thresholdStatus: 'WITHIN_THRESHOLD' | 'REQUIRES_JUSTIFICATION';
}

export interface DealPricingRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerSegment: string;
  relationshipManager: string;
  requestType: DealPricingRequestType;
  requestReason: DealPricingRequestReason;
  reasonDescription?: string;
  benchmarkSource: BenchmarkSource;
  benchmarkPlan: string;
  market: string;
  currency: string;
  effectiveStartDate: string;
  effectiveEndDate?: string;
  ecrPricingRequested: boolean;
  ecrReason?: string;
  ecrReference?: string;
  priceDetails: DealPricingPriceDetail[];
  simulation?: DealPricingSimulation;
  status: DealPricingRequestStatus;
  requestedBy: string;
  requestedAt: string;
}

export interface DealPricingRequestFormValues {
  customerId: string;
  requestType: DealPricingRequestType;
  requestReason: DealPricingRequestReason;
  reasonDescription?: string;
  benchmarkSource: BenchmarkSource;
  benchmarkPlan: string;
  market: string;
  currency: string;
  effectiveStartDate: string;
  effectiveEndDate?: string;
  ecrPricingRequested: boolean;
  ecrReason?: string;
  ecrReference?: string;
}
