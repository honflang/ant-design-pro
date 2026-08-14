import type { Customer360 } from './data.d';

const formatM = (value: number, currency: string) =>
  `${currency} ${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 2)}M`;

const months = [
  '2025-09',
  '2025-10',
  '2025-11',
  '2025-12',
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
];

const baseRevenueContribution = [
  { revenue: 380_000, cost: 100_000 },
  { revenue: 390_000, cost: 102_000 },
  { revenue: 385_000, cost: 99_000 },
  { revenue: 410_000, cost: 108_000 },
  { revenue: 405_000, cost: 105_000 },
  { revenue: 420_000, cost: 110_000 },
  { revenue: 430_000, cost: 112_000 },
  { revenue: 450_000, cost: 118_000 },
  { revenue: 470_000, cost: 122_000 },
  { revenue: 490_000, cost: 128_000 },
  { revenue: 510_000, cost: 132_000 },
  { revenue: 525_000, cost: 136_000 },
];

const makeContribution = (multiplier: number) =>
  months.map((month, index) => {
    const item = baseRevenueContribution[index];
    const revenue = Math.round(item.revenue * multiplier);
    const cost = Math.round(item.cost * multiplier);
    const contribution = revenue - cost;
    const riskAdjusted = Math.round(contribution * 0.88);
    return { month, revenue, cost, contribution, riskAdjusted };
  });

const makeDepositLoanTrend = (
  baseDeposit: number,
  baseLoan: number,
): { month: string; deposit: number; loan: number }[] =>
  months.map((month, index) => {
    const variation = 1 + (index - 6) * 0.02;
    return {
      month,
      deposit: Math.round(baseDeposit * variation),
      loan: Math.round(baseLoan * variation),
    };
  });

const makeCustomer = (partial: Partial<Customer360> & { id: string; customerName: string }): Customer360 => {
  const currency = partial.totalRevenueCurrency ?? '$';
  const contributionCurrency = partial.riskAdjustedProfitCurrency ?? currency;
  const totalRevenue = partial.totalRevenue ?? 4_820_000;
  const multiplier = totalRevenue / 4_820_000;

  return {
    customerType: 'Corporate',
    status: 'ACTIVE',
    segment: 'Strategic Corporate',
    operatingMarkets: ['China', 'Singapore', 'Hong Kong'],
    relationshipManager: 'Zhang San',
    customerSince: 2014,
    totalRevenue,
    totalRevenueCurrency: currency,
    totalRevenueYoY: '+12.4% YoY',
    riskAdjustedProfit: partial.riskAdjustedProfit ?? 2_310_000,
    riskAdjustedProfitCurrency: contributionCurrency,
    annualTransactions: partial.annualTransactions ?? 1_280_000,

    identity: {
      customerId: partial.id,
      customerName: partial.customerName,
      unifiedSocialCreditCode: '91310000MA1K12345X',
      businessRegistrationNumber: 'BR-2026-000128',
      registrationCountry: 'China',
      registrationPlace: 'Shanghai, China',
      operatingAddress: '88 Century Avenue, Shanghai',
      industry: 'Manufacturing',
      industryCode: 'C31',
      foreignOwnership: '28%',
      ...partial.identity,
    },

    contacts: [
      {
        name: `${partial.customerName.split(' ')[0]} Primary`,
        role: 'PRIMARY',
        mobile: '+86 138 0000 1001',
        email: 'primary@abcglobal.demo',
        wechat: 'abc.primary',
      },
      {
        name: `${partial.customerName.split(' ')[0]} Finance`,
        role: 'FINANCE',
        mobile: '+86 138 0000 1002',
        email: 'finance@abcglobal.demo',
        wechat: 'abc.finance',
      },
      {
        name: `${partial.customerName.split(' ')[0]} Operations`,
        role: 'OPERATIONS',
        mobile: '+86 138 0000 1003',
        email: 'ops@abcglobal.demo',
        wechat: 'abc.ops',
      },
      ...(partial.contacts ?? []),
    ],

    compliance: {
      amlRisk: 'LOW',
      blacklist: 'CLEAR',
      crossBorderTrading: 'ENABLED',
      fxQualification: 'VALID',
      fxQualificationExpiry: '2027-06-30',
      ...partial.compliance,
    },

    banking: {
      depositBalance: 420_000_000,
      depositBalanceCurrency: currency,
      loanBalance: 280_000_000,
      loanBalanceCurrency: currency,
      loanUtilization: 72,
      averageDepositBalance: 380_000_000,
      ftpBenchmark: '3.42%',
      averageDepositRate: '2.81%',
      averageLendingRate: '4.18%',
      depositLoanTrend: makeDepositLoanTrend(420_000_000, 280_000_000),

      settlementTransactions: 1_280_000,
      intermediaryServices: 12,
      annualFees: 820_000,
      annualFeesCurrency: currency,
      feeDiscount: '8.5%',
      feeHistory: [
        { year: '2024', amount: 620_000, currency },
        { year: '2025', amount: 740_000, currency },
        { year: '2026 YTD', amount: 820_000, currency },
      ],

      crossBorderAnnualTransactions: 320_820,
      crossBorderTotalValue: 4_200_000_000,
      crossBorderValueCurrency: currency,
      preferredChannel: 'SWIFT',
      peakTransactionPeriod: '09:00 - 12:00',
      crossBorderRoutes: [
        { from: 'China', to: 'Singapore' },
        { from: 'Singapore', to: 'China' },
        { from: 'Hong Kong', to: 'China' },
        { from: 'Singapore', to: 'Australia' },
      ],

      grossRevenue: 4_820_000,
      operatingCost: 1_280_000,
      creditCost: 420_000,
      economicCapitalCost: 380_000,
      riskAdjustedContribution: 2_310_000,
      contributionCurrency,
      ...partial.banking,
    },

    value: {
      relationshipHealth: 92,
      revenueGrowth: '+12.4%',
      productPenetration: 68,
      customerValueTier: 'VIP Core',
      riskLevel: 'LOW',

      annualRevenue: 8_200_000_000,
      annualRevenueCurrency: currency,
      bankingRelationshipYears: 12,
      operatingCountries: 5,
      productsHeld: 8,

      recency: '3 days ago',
      frequency: '1.28M transactions / year',
      monetary: formatM(2_310_000, contributionCurrency),
      rfmRating: 5,
      rfmLabel: 'VIP Core Customer',

      revenueContribution: makeContribution(multiplier),
      ...partial.value,
    },

    pricing: {
      interestRateSensitivity: 'High',
      feeSensitivity: 'Medium',
      priceElasticity: 'Medium',
      acceptableFeeThreshold: '≤ 12 bps',

      customizedPricingEnabled: true,
      pricingPackage: 'Strategic Corporate Package',
      discount: '8.5%',
      validUntil: '2026-12-31',

      historicalNegotiation: [
        {
          date: '2026-07',
          product: 'FX Fee',
          requestedPrice: '15 bps',
          approvedPrice: '12 bps',
          discount: '20%',
          status: 'APPROVED',
        },
        {
          date: '2026-04',
          product: 'Payment Fee',
          requestedPrice: '10 bps',
          approvedPrice: '9 bps',
          discount: '10%',
          status: 'APPROVED',
        },
      ],
      ...partial.pricing,
    },

    risk: {
      creditRating: 'AA',
      probabilityOfDefault: '0.18%',
      riskMitigation: 'Collateral + Guarantee',
      economicCapital: 18_200_000,
      economicCapitalCurrency: currency,
      riskAdjustedReturn: '13.8%',
      riskAdjustedCustomerValue: 1_840_000,
      riskAdjustedCustomerValueCurrency: contributionCurrency,
      ...partial.risk,
    },

    interactions: [
      {
        id: 'INT-001',
        date: '2026-08-12',
        type: 'PRICING',
        title: 'Pricing Proposal',
        description: 'RM submitted new FX pricing proposal.',
      },
      {
        id: 'INT-002',
        date: '2026-08-10',
        type: 'RM',
        title: 'RM Meeting',
        description: 'Discussed cross-border payment pricing.',
      },
      {
        id: 'INT-003',
        date: '2026-08-05',
        type: 'BILLING',
        title: 'Billing Request',
        description: 'Customer requested monthly billing.',
      },
      {
        id: 'INT-004',
        date: '2026-07-28',
        type: 'MARKETING',
        title: 'Product Recommendation',
        description: 'Trade Finance product recommended.',
      },
      ...(partial.interactions ?? []),
    ],

    relationships: {
      beneficialOwner: 'John Smith',
      ownerRole: 'Actual Owner',
      parentCompany: 'ABC Holdings',
      subsidiaries: [
        { name: 'ABC China', location: 'China', exposure: 320_000_000 },
        { name: 'ABC Hong Kong', location: 'Hong Kong', exposure: 140_000_000 },
        { name: 'ABC Singapore', location: 'Singapore', exposure: 120_000_000 },
      ],
      groupCreditExposure: 680_000_000,
      groupCreditLimit: 800_000_000,
      groupCreditCurrency: currency,
      ...partial.relationships,
    },

    products: [
      { name: 'Cash Management', status: 'ACTIVE' },
      { name: 'FX', status: 'ACTIVE' },
      { name: 'Cross-border Payment', status: 'ACTIVE' },
      { name: 'Trade Finance', status: 'ACTIVE' },
      { name: 'Lending', status: 'ACTIVE' },
      { name: 'Supply Chain Finance', status: 'OPPORTUNITY' },
      { name: 'Interest Rate Hedging', status: 'OPPORTUNITY' },
      ...(partial.products ?? []),
    ],

    opportunities: [
      {
        product: 'Supply Chain Finance',
        score: 82,
        estimatedRevenue: 320_000,
        estimatedRevenueCurrency: contributionCurrency,
      },
      {
        product: 'Interest Rate Hedging',
        score: 64,
        estimatedRevenue: 180_000,
        estimatedRevenueCurrency: contributionCurrency,
      },
      ...(partial.opportunities ?? []),
    ],

    externalIntelligence: {
      financialHealth: 'Stable',
      industryOutlook: 'Positive',
      companyRegistration: 'No Major Change',
      publicSentiment: 'Positive',
      latestUpdate: '2026-08-12',
      ...partial.externalIntelligence,
    },

    ...partial,
  } as Customer360;
};

export const customers: Customer360[] = [
  makeCustomer({
    id: 'CUST-000128',
    customerName: 'ABC Global Holdings',
    customerType: 'Corporate',
    status: 'ACTIVE',
    segment: 'Strategic Corporate',
    operatingMarkets: ['China', 'Singapore', 'Hong Kong'],
    relationshipManager: 'Zhang San',
    customerSince: 2014,
    totalRevenue: 4_820_000,
    totalRevenueCurrency: '$',
    totalRevenueYoY: '+12.4% YoY',
    riskAdjustedProfit: 2_310_000,
    riskAdjustedProfitCurrency: '$',
    annualTransactions: 1_280_000,
  }),
  makeCustomer({
    id: 'CUST-000256',
    customerName: 'Pacific Trading Group',
    customerType: 'Corporate',
    status: 'ACTIVE',
    segment: 'Large Corporate',
    operatingMarkets: ['Singapore', 'Hong Kong'],
    relationshipManager: 'Li Wei',
    customerSince: 2018,
    totalRevenue: 2_160_000,
    totalRevenueCurrency: 'SGD',
    totalRevenueYoY: '+6.8% YoY',
    riskAdjustedProfit: 980_000,
    riskAdjustedProfitCurrency: 'SGD',
    annualTransactions: 640_000,
    identity: {
      customerId: 'CUST-000256',
      customerName: 'Pacific Trading Group',
      unifiedSocialCreditCode: '201912345K',
      businessRegistrationNumber: 'BR-SG-2026-000256',
      registrationCountry: 'Singapore',
      registrationPlace: 'Singapore',
      operatingAddress: '1 Raffles Place, Singapore',
      industry: 'Trading',
      industryCode: 'G46',
      foreignOwnership: '55%',
    },
    compliance: {
      amlRisk: 'MEDIUM',
      blacklist: 'CLEAR',
      crossBorderTrading: 'RESTRICTED',
      fxQualification: 'VALID',
      fxQualificationExpiry: '2026-12-31',
    },
    value: {
      relationshipHealth: 78,
      revenueGrowth: '+6.8%',
      productPenetration: 52,
      customerValueTier: 'VIP',
      riskLevel: 'MEDIUM',
      annualRevenue: 3_200_000_000,
      annualRevenueCurrency: 'SGD',
      bankingRelationshipYears: 8,
      operatingCountries: 2,
      productsHeld: 5,
      recency: '5 days ago',
      frequency: '640K transactions / year',
      monetary: 'SGD 980K contribution',
      rfmRating: 4,
      rfmLabel: 'VIP Customer',
      revenueContribution: makeContribution(2_160_000 / 4_820_000),
    },
    banking: {
      depositBalance: 180_000_000,
      depositBalanceCurrency: 'SGD',
      loanBalance: 120_000_000,
      loanBalanceCurrency: 'SGD',
      loanUtilization: 68,
      averageDepositBalance: 165_000_000,
      ftpBenchmark: 'SORA + 45 bps',
      averageDepositRate: '2.65%',
      averageLendingRate: '4.35%',
      depositLoanTrend: makeDepositLoanTrend(180_000_000, 120_000_000),
      settlementTransactions: 640_000,
      intermediaryServices: 8,
      annualFees: 420_000,
      annualFeesCurrency: 'SGD',
      feeDiscount: '6.0%',
      feeHistory: [
        { year: '2024', amount: 310_000, currency: 'SGD' },
        { year: '2025', amount: 380_000, currency: 'SGD' },
        { year: '2026 YTD', amount: 420_000, currency: 'SGD' },
      ],
      crossBorderAnnualTransactions: 160_000,
      crossBorderTotalValue: 1_800_000_000,
      crossBorderValueCurrency: 'SGD',
      preferredChannel: 'SWIFT',
      peakTransactionPeriod: '10:00 - 14:00',
      crossBorderRoutes: [
        { from: 'Singapore', to: 'Hong Kong' },
        { from: 'Hong Kong', to: 'Singapore' },
        { from: 'Singapore', to: 'China' },
      ],
      grossRevenue: 2_160_000,
      operatingCost: 620_000,
      creditCost: 210_000,
      economicCapitalCost: 180_000,
      riskAdjustedContribution: 980_000,
      contributionCurrency: 'SGD',
    },
    risk: {
      creditRating: 'A',
      probabilityOfDefault: '0.45%',
      riskMitigation: 'Guarantee',
      economicCapital: 9_600_000,
      economicCapitalCurrency: 'SGD',
      riskAdjustedReturn: '11.2%',
      riskAdjustedCustomerValue: 780_000,
      riskAdjustedCustomerValueCurrency: 'SGD',
    },
    relationships: {
      beneficialOwner: 'Li Wei Family',
      ownerRole: 'Actual Owner',
      parentCompany: 'Pacific Trading Group',
      subsidiaries: [
        { name: 'Pacific SG', location: 'Singapore', exposure: 95_000_000 },
        { name: 'Pacific HK', location: 'Hong Kong', exposure: 65_000_000 },
      ],
      groupCreditExposure: 320_000_000,
      groupCreditLimit: 400_000_000,
      groupCreditCurrency: 'SGD',
    },
    pricing: {
      interestRateSensitivity: 'Medium',
      feeSensitivity: 'High',
      priceElasticity: 'Medium',
      acceptableFeeThreshold: '≤ 15 bps',
      customizedPricingEnabled: true,
      pricingPackage: 'Large Corporate Package',
      discount: '6.0%',
      validUntil: '2026-12-31',
      historicalNegotiation: [
        {
          date: '2026-06',
          product: 'Trade Finance Fee',
          requestedPrice: '18 bps',
          approvedPrice: '15 bps',
          discount: '16.7%',
          status: 'APPROVED',
        },
      ],
    },
  }),
  makeCustomer({
    id: 'CUST-000384',
    customerName: 'Sakura Manufacturing Co.',
    customerType: 'Corporate',
    status: 'ACTIVE',
    segment: 'Large Corporate',
    operatingMarkets: ['Japan'],
    relationshipManager: 'Mio Kato',
    customerSince: 2016,
    totalRevenue: 1_840_000,
    totalRevenueCurrency: 'JPY',
    totalRevenueYoY: '+4.2% YoY',
    riskAdjustedProfit: 920_000,
    riskAdjustedProfitCurrency: 'JPY',
    annualTransactions: 420_000,
    identity: {
      customerId: 'CUST-000384',
      customerName: 'Sakura Manufacturing Co.',
      unifiedSocialCreditCode: '0104-01-123456',
      businessRegistrationNumber: 'BR-JP-2026-000384',
      registrationCountry: 'Japan',
      registrationPlace: 'Tokyo, Japan',
      operatingAddress: '2-1 Marunouchi, Tokyo',
      industry: 'Manufacturing',
      industryCode: 'C20',
      foreignOwnership: '12%',
    },
    compliance: {
      amlRisk: 'LOW',
      blacklist: 'CLEAR',
      crossBorderTrading: 'ENABLED',
      fxQualification: 'VALID',
      fxQualificationExpiry: '2027-03-31',
    },
    value: {
      relationshipHealth: 85,
      revenueGrowth: '+4.2%',
      productPenetration: 58,
      customerValueTier: 'Core',
      riskLevel: 'LOW',
      annualRevenue: 5_600_000_000,
      annualRevenueCurrency: 'JPY',
      bankingRelationshipYears: 10,
      operatingCountries: 1,
      productsHeld: 6,
      recency: '7 days ago',
      frequency: '420K transactions / year',
      monetary: 'JPY 920K contribution',
      rfmRating: 3,
      rfmLabel: 'Core Customer',
      revenueContribution: makeContribution(1_840_000 / 4_820_000),
    },
    banking: {
      depositBalance: 92_000_000,
      depositBalanceCurrency: 'JPY',
      loanBalance: 64_000_000,
      loanBalanceCurrency: 'JPY',
      loanUtilization: 58,
      averageDepositBalance: 88_000_000,
      ftpBenchmark: 'TONA + 35 bps',
      averageDepositRate: '0.15%',
      averageLendingRate: '1.25%',
      depositLoanTrend: makeDepositLoanTrend(92_000_000, 64_000_000),
      settlementTransactions: 420_000,
      intermediaryServices: 5,
      annualFees: 310_000,
      annualFeesCurrency: 'JPY',
      feeDiscount: '4.5%',
      feeHistory: [
        { year: '2024', amount: 260_000, currency: 'JPY' },
        { year: '2025', amount: 290_000, currency: 'JPY' },
        { year: '2026 YTD', amount: 310_000, currency: 'JPY' },
      ],
      crossBorderAnnualTransactions: 85_000,
      crossBorderTotalValue: 920_000_000,
      crossBorderValueCurrency: 'JPY',
      preferredChannel: 'SWIFT',
      peakTransactionPeriod: '09:00 - 11:00',
      crossBorderRoutes: [
        { from: 'Japan', to: 'China' },
        { from: 'Japan', to: 'Singapore' },
      ],
      grossRevenue: 1_840_000,
      operatingCost: 480_000,
      creditCost: 160_000,
      economicCapitalCost: 140_000,
      riskAdjustedContribution: 920_000,
      contributionCurrency: 'JPY',
    },
    risk: {
      creditRating: 'AA-',
      probabilityOfDefault: '0.22%',
      riskMitigation: 'Collateral',
      economicCapital: 6_400_000,
      economicCapitalCurrency: 'JPY',
      riskAdjustedReturn: '12.5%',
      riskAdjustedCustomerValue: 730_000,
      riskAdjustedCustomerValueCurrency: 'JPY',
    },
    relationships: {
      beneficialOwner: 'Tanaka Family',
      ownerRole: 'Actual Owner',
      parentCompany: 'Sakura Manufacturing Co.',
      subsidiaries: [
        { name: 'Sakura Tokyo', location: 'Japan', exposure: 48_000_000 },
        { name: 'Sakura Osaka', location: 'Japan', exposure: 32_000_000 },
      ],
      groupCreditExposure: 156_000_000,
      groupCreditLimit: 200_000_000,
      groupCreditCurrency: 'JPY',
    },
    pricing: {
      interestRateSensitivity: 'Low',
      feeSensitivity: 'Medium',
      priceElasticity: 'Low',
      acceptableFeeThreshold: '≤ 18 bps',
      customizedPricingEnabled: false,
      pricingPackage: 'Standard Corporate Package',
      discount: '4.5%',
      validUntil: '2026-12-31',
      historicalNegotiation: [],
    },
  }),
];

export const findCustomerById = (id: string): Customer360 | undefined =>
  customers.find((item) => item.id === id);

export const findCustomerByKeyword = (keyword: string): Customer360[] => {
  const lower = keyword.toLowerCase();
  return customers.filter(
    (item) =>
      item.id.toLowerCase().includes(lower) ||
      item.customerName.toLowerCase().includes(lower) ||
      item.identity.unifiedSocialCreditCode?.toLowerCase().includes(lower) ||
      item.identity.businessRegistrationNumber?.toLowerCase().includes(lower),
  );
};
