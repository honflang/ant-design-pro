export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type CustomerSegment =
  | 'Strategic Corporate'
  | 'Large Corporate'
  | 'Corporate'
  | 'SME'
  | 'Financial Institution';

export type CustomerValueTier = 'VIP Core' | 'VIP' | 'Core' | 'Growth' | 'Standard';

export interface CustomerIdentity {
  customerId: string;
  customerName: string;
  unifiedSocialCreditCode?: string;
  businessRegistrationNumber?: string;
  registrationCountry: string;
  registrationPlace: string;
  operatingAddress: string;
  industry: string;
  industryCode: string;
  foreignOwnership: string;
}

export interface CustomerContact {
  name: string;
  role: 'PRIMARY' | 'FINANCE' | 'OPERATIONS' | 'LEGAL';
  mobile: string;
  email: string;
  wechat?: string;
}

export interface ComplianceProfile {
  amlRisk: RiskLevel;
  blacklist: 'CLEAR' | 'POTENTIAL_MATCH' | 'CONFIRMED';
  crossBorderTrading: 'ENABLED' | 'RESTRICTED' | 'DISABLED';
  fxQualification: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
  fxQualificationExpiry?: string;
}

export interface DepositLoanData {
  month: string;
  deposit: number;
  loan: number;
}

export interface BankingRelationship {
  depositBalance: number;
  depositBalanceCurrency: string;
  loanBalance: number;
  loanBalanceCurrency: string;
  loanUtilization: number;
  averageDepositBalance: number;
  ftpBenchmark: string;
  averageDepositRate: string;
  averageLendingRate: string;
  depositLoanTrend: DepositLoanData[];

  settlementTransactions: number;
  intermediaryServices: number;
  annualFees: number;
  annualFeesCurrency: string;
  feeDiscount: string;
  feeHistory: { year: string; amount: number; currency: string }[];

  crossBorderAnnualTransactions: number;
  crossBorderTotalValue: number;
  crossBorderValueCurrency: string;
  preferredChannel: string;
  peakTransactionPeriod: string;
  crossBorderRoutes: { from: string; to: string }[];

  grossRevenue: number;
  operatingCost: number;
  creditCost: number;
  economicCapitalCost: number;
  riskAdjustedContribution: number;
  contributionCurrency: string;
}

export type BillingStatementStatus = 'Issued' | 'Paid' | 'Overdue';

export interface BillingStatementDetail {
  category: string;
  items: { name: string; amount: number }[];
}

export interface BillingStatement {
  id: string;
  billDate: string;
  paymentDueDate: string;
  servicePeriodStart: string;
  servicePeriodEnd: string;
  totalAmountDue: number;
  currency: string;
  cashManagementFee: number;
  tradeFinanceFee: number;
  globalMarketsTransactionFee: number;
  otherFees?: number;
  taxAmount: number;
  taxLabel: string;
  remarks: string;
  status: BillingStatementStatus;
  details: BillingStatementDetail[];
}

export interface BillingProfile {
  statements: BillingStatement[];
}

export interface CustomerValue {
  relationshipHealth: number;
  revenueGrowth: string;
  productPenetration: number;
  customerValueTier: CustomerValueTier;
  riskLevel: RiskLevel;

  annualRevenue: number;
  annualRevenueCurrency: string;
  bankingRelationshipYears: number;
  operatingCountries: number;
  productsHeld: number;

  recency: string;
  frequency: string;
  monetary: string;
  rfmRating: number;
  rfmLabel: string;

  revenueContribution: { month: string; revenue: number; cost: number; contribution: number; riskAdjusted: number }[];
}

export interface PricingProfile {
  interestRateSensitivity: string;
  feeSensitivity: string;
  priceElasticity: string;
  acceptableFeeThreshold: string;

  customizedPricingEnabled: boolean;
  pricingPackage: string;
  discount: string;
  validUntil: string;

  historicalNegotiation: HistoricalNegotiation[];
}

export interface HistoricalNegotiation {
  date: string;
  product: string;
  requestedPrice: string;
  approvedPrice: string;
  discount: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
}

export interface RiskProfile {
  creditRating: string;
  probabilityOfDefault: string;
  riskMitigation: string;
  economicCapital: number;
  economicCapitalCurrency: string;
  riskAdjustedReturn: string;
  riskAdjustedCustomerValue: number;
  riskAdjustedCustomerValueCurrency: string;
}

export interface CustomerInteraction {
  id: string;
  date: string;
  type: 'MARKETING' | 'RM' | 'CUSTOMER_SERVICE' | 'PRICING' | 'BILLING' | 'COMPLAINT';
  title: string;
  description: string;
}

export interface CustomerRelationship {
  beneficialOwner: string;
  ownerRole: string;
  parentCompany: string;
  subsidiaries: { name: string; location: string; exposure: number }[];
  groupCreditExposure: number;
  groupCreditLimit: number;
  groupCreditCurrency: string;
}

export interface CustomerProduct {
  name: string;
  status: 'ACTIVE' | 'OPPORTUNITY';
}

export interface CustomerOpportunity {
  product: string;
  score: number;
  estimatedRevenue: number;
  estimatedRevenueCurrency: string;
}

export interface ExternalIntelligence {
  financialHealth: string;
  industryOutlook: string;
  companyRegistration: string;
  publicSentiment: string;
  latestUpdate: string;
}

export interface Customer360 {
  id: string;
  customerName: string;
  customerType: string;
  status: CustomerStatus;
  segment: CustomerSegment;
  operatingMarkets: string[];
  relationshipManager: string;
  customerSince: number;

  totalRevenue: number;
  totalRevenueCurrency: string;
  totalRevenueYoY: string;
  riskAdjustedProfit: number;
  riskAdjustedProfitCurrency: string;
  annualTransactions: number;

  identity: CustomerIdentity;
  contacts: CustomerContact[];
  compliance: ComplianceProfile;
  banking: BankingRelationship;
  billing: BillingProfile;
  value: CustomerValue;
  pricing: PricingProfile;
  risk: RiskProfile;
  interactions: CustomerInteraction[];
  relationships: CustomerRelationship;
  products: CustomerProduct[];
  opportunities: CustomerOpportunity[];
  externalIntelligence: ExternalIntelligence;
}
