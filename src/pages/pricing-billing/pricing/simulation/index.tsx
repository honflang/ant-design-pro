import {
  ArrowRightOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type {
  ProColumns,
  ProDescriptionsItemProps,
  ProFormInstance,
} from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { history, useIntl, useSearchParams } from '@umijs/max';
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import type { Customer360, RiskLevel } from '../../customer/360/data.d';
import { customers, findCustomerById } from '../../customer/360/mock';

const { Text, Title } = Typography;

type SimulationStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
type ScenarioKey =
  | 'BASELINE'
  | 'RELATIONSHIP_INVESTMENT'
  | 'AGGRESSIVE_RETENTION';

type ReviewCycle = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';

// Mock display only: illustrates that pricing references a published market benchmark; not a real data feed or scheduler.
type BenchmarkSource = {
  publisher: string;
  benchmarkName: string;
  effectiveDate: string;
  reviewCycle: ReviewCycle;
  nextReviewDate: string;
};

type SimulationFormValues = {
  customerId: string;
  market: string;
  products: string[];
  discountPercent: number;
  rebateType: string;
  rebateThreshold: number;
  estimatedTransactions: number;
  expectedDealSize: number;
  specialConditions?: string;
};

type SimulationRecord = {
  id: string;
  customerId: string;
  client: string;
  customerSegment: string;
  customerValue: string;
  riskLevel: RiskLevel;
  relationshipHealth: number;
  market: string;
  products: string[];
  discountPercent: number;
  rebateType: string;
  rebateThreshold: number;
  baseRevenue: number;
  adjustedRevenue: number;
  discountAmount: number;
  effectiveDiscountPercent: number;
  estimatedMarginPercent: number;
  riskAdjustedContributionImpact: number;
  pricingThresholdStatus:
    | 'WITHIN_RANGE'
    | 'OUTSIDE_RANGE'
    | 'REQUIRES_JUSTIFICATION';
  complianceWarnings: string[];
  selectedScenario: ScenarioKey;
  estimatedTransactions: number;
  expectedDealSize: number;
  specialConditions?: string;
  customer360Snapshot: {
    capturedAt: string;
    annualRevenue: number;
    riskAdjustedContribution: number;
    depositBalance: number;
    loanBalance: number;
    annualTransactions: number;
    currentDiscountPercent: number;
    acceptableFeeThreshold: string;
    creditRating: string;
    pricingPackage: string;
  };
  benchmarkSource: BenchmarkSource;
  status: SimulationStatus;
  createdBy: string;
  createdAt: string;
};

type SimulationResult = {
  record: SimulationRecord;
  scenarios: Array<{
    key: ScenarioKey;
    label: string;
    discountPercent: number;
    adjustedRevenue: number;
    marginPercent: number;
    contributionImpact: number;
    thresholdStatus: SimulationRecord['pricingThresholdStatus'];
  }>;
};

const marketCurrencyMap: Record<string, string> = {
  Singapore: 'SGD',
  'Hong Kong': 'HKD',
  China: 'CNY',
  Japan: 'JPY',
  Australia: 'AUD',
};

const marketBenchmarkMap: Record<string, BenchmarkSource> = {
  Singapore: {
    publisher: 'MAS',
    benchmarkName: 'SORA Reference Rate',
    effectiveDate: '2026-07-01',
    reviewCycle: 'QUARTERLY',
    nextReviewDate: '2026-10-01',
  },
  'Hong Kong': {
    publisher: 'HKMA',
    benchmarkName: 'HONIA Reference Rate',
    effectiveDate: '2026-06-01',
    reviewCycle: 'MONTHLY',
    nextReviewDate: '2026-09-01',
  },
  China: {
    publisher: 'PBOC',
    benchmarkName: 'LPR (Loan Prime Rate)',
    effectiveDate: '2026-08-01',
    reviewCycle: 'MONTHLY',
    nextReviewDate: '2026-09-20',
  },
  Japan: {
    publisher: 'BOJ',
    benchmarkName: 'TONA Reference Rate',
    effectiveDate: '2026-04-01',
    reviewCycle: 'SEMI_ANNUAL',
    nextReviewDate: '2026-10-01',
  },
  Australia: {
    publisher: 'RBA',
    benchmarkName: 'AONIA Cash Rate',
    effectiveDate: '2026-01-01',
    reviewCycle: 'ANNUAL',
    nextReviewDate: '2027-01-01',
  },
};

const statusColors: Record<SimulationStatus, string> = {
  DRAFT: 'default',
  SUBMITTED: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
};

const productShortMap: Record<string, string> = {
  'Cash Management': 'Cash',
  'Trade Finance': 'Trade',
  'FX Services': 'FX',
  'Cross-border Payment': 'Cross-border Payment',
  Lending: 'Lending',
  'Supply Chain Finance': 'Supply Chain Finance',
  'Interest Rate Hedging': 'Interest Rate Hedging',
};

const parsePercent = (value: string) =>
  Number(value.replace('%', '').replace(/[≤>=]/g, '').trim()) || 0;

const formatAmount = (currency: string, amount: number) =>
  `${currency} ${Math.round(amount).toLocaleString('en-US')}`;

const formatCompactAmount = (currency: string, amount: number) =>
  `${currency} ${(amount / (amount >= 1_000_000 ? 1_000_000 : 1_000)).toFixed(1)}${amount >= 1_000_000 ? 'M' : 'K'}`;

const riskColor = (risk: RiskLevel) =>
  risk === 'LOW' ? 'success' : risk === 'MEDIUM' ? 'warning' : 'error';

const isReviewDue = (nextReviewDate: string) =>
  new Date(nextReviewDate).getTime() <= Date.now();

const getProductsForCustomer = (customer: Customer360) =>
  customer.products.map((product) => product.name);

const getInitialValues = (customer: Customer360): SimulationFormValues => ({
  customerId: customer.id,
  market: customer.operatingMarkets[0],
  products: getProductsForCustomer(customer).filter((product) =>
    ['Cash Management', 'Trade Finance', 'FX Services'].includes(product),
  ),
  discountPercent: -parsePercent(customer.pricing.discount),
  rebateType: 'RELATIONSHIP',
  rebateThreshold: Math.round(customer.annualTransactions / 12),
  estimatedTransactions: Math.round(customer.annualTransactions / 12),
  expectedDealSize: Math.max(
    1000,
    Math.round(customer.totalRevenue / customer.annualTransactions),
  ),
  specialConditions: '',
});

const createSimulation = (
  customer: Customer360,
  values: SimulationFormValues,
  status: SimulationStatus,
  scenario: ScenarioKey,
): SimulationResult => {
  const baseRevenue = values.estimatedTransactions * values.expectedDealSize;
  const rebatePercent =
    values.rebateType === 'VOLUME'
      ? 1.5
      : values.rebateType === 'PRODUCT_BUNDLE'
        ? 1
        : 0;
  const effectiveDiscountPercent =
    Math.abs(values.discountPercent) + rebatePercent;
  const adjustedRevenue = baseRevenue * (1 - effectiveDiscountPercent / 100);
  const riskPenalty =
    customer.value.riskLevel === 'HIGH'
      ? 8
      : customer.value.riskLevel === 'MEDIUM'
        ? 4
        : 1;
  const estimatedMarginPercent = Math.max(
    35,
    Math.min(90, 78 - effectiveDiscountPercent * 0.55 - riskPenalty),
  );
  const baselineDiscount = parsePercent(customer.pricing.discount);
  const thresholdStatus =
    Math.abs(values.discountPercent) <= baselineDiscount + 3
      ? 'WITHIN_RANGE'
      : Math.abs(values.discountPercent) <= baselineDiscount + 8
        ? 'REQUIRES_JUSTIFICATION'
        : 'OUTSIDE_RANGE';
  const complianceWarnings: string[] = [];
  if (
    customer.compliance.crossBorderTrading !== 'ENABLED' &&
    values.market !== customer.identity.registrationCountry
  ) {
    complianceWarnings.push(
      'crossBorderPermission',
    );
  }
  if (
    values.products.includes('FX Services') &&
    customer.compliance.fxQualification !== 'VALID'
  ) {
    complianceWarnings.push(
      'fxQualification',
    );
  }
  const record: SimulationRecord = {
    id: `SIM-${Date.now()}`,
    customerId: customer.id,
    client: customer.customerName,
    customerSegment: customer.segment,
    customerValue: customer.value.customerValueTier,
    riskLevel: customer.value.riskLevel,
    relationshipHealth: customer.value.relationshipHealth,
    market: values.market,
    products: values.products,
    discountPercent: values.discountPercent,
    rebateType: values.rebateType,
    rebateThreshold: values.rebateThreshold,
    baseRevenue,
    adjustedRevenue,
    discountAmount: baseRevenue - adjustedRevenue,
    effectiveDiscountPercent,
    estimatedMarginPercent,
    riskAdjustedContributionImpact: adjustedRevenue - baseRevenue,
    pricingThresholdStatus: thresholdStatus,
    complianceWarnings,
    selectedScenario: scenario,
    estimatedTransactions: values.estimatedTransactions,
    expectedDealSize: values.expectedDealSize,
    specialConditions: values.specialConditions,
    customer360Snapshot: {
      capturedAt: new Date().toISOString(),
      annualRevenue: customer.value.annualRevenue,
      riskAdjustedContribution: customer.banking.riskAdjustedContribution,
      depositBalance: customer.banking.depositBalance,
      loanBalance: customer.banking.loanBalance,
      annualTransactions: customer.annualTransactions,
      currentDiscountPercent: baselineDiscount,
      acceptableFeeThreshold: customer.pricing.acceptableFeeThreshold,
      creditRating: customer.risk.creditRating,
      pricingPackage: customer.pricing.pricingPackage,
    },
    benchmarkSource: marketBenchmarkMap[values.market] ?? marketBenchmarkMap.Singapore,
    status,
    createdBy: 'Current User',
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const scenarios = [
    {
      key: 'BASELINE' as const,
      label: 'baseline',
      discountPercent: -baselineDiscount,
    },
    {
      key: 'RELATIONSHIP_INVESTMENT' as const,
      label: 'relationshipInvestment',
      discountPercent: -Math.max(baselineDiscount, 10),
    },
    {
      key: 'AGGRESSIVE_RETENTION' as const,
      label: 'aggressiveRetention',
      discountPercent: -20,
    },
  ].map((item) => {
    const scenarioRevenue =
      baseRevenue * (1 - Math.abs(item.discountPercent) / 100);
    return {
      ...item,
      adjustedRevenue: scenarioRevenue,
      marginPercent: Math.max(
        35,
        78 - Math.abs(item.discountPercent) * 0.55 - riskPenalty,
      ),
      contributionImpact: scenarioRevenue - baseRevenue,
      thresholdStatus:
        Math.abs(item.discountPercent) <= baselineDiscount + 3
          ? ('WITHIN_RANGE' as const)
          : Math.abs(item.discountPercent) <= baselineDiscount + 8
            ? ('REQUIRES_JUSTIFICATION' as const)
            : ('OUTSIDE_RANGE' as const),
    };
  });
  return { record, scenarios };
};

const initialSummaries: SimulationRecord[] = customers.map(
  (customer, index) => {
    const simulation = createSimulation(
      customer,
      getInitialValues(customer),
      index === 0 ? 'DRAFT' : index === 1 ? 'SUBMITTED' : 'APPROVED',
      index === 0 ? 'RELATIONSHIP_INVESTMENT' : 'BASELINE',
    );
    return {
      ...simulation.record,
      id: `SIM-00${index + 1}`,
      createdBy: ['Avery Chan', 'Liam Tan', 'Mio Kato'][index],
      createdAt: `2026-08-${10 - index}`,
    };
  },
);

const SimulationPage: React.FC = () => {
  const { message } = App.useApp();
  const intl = useIntl();
  const [params, setParams] = useSearchParams();
  const formRef = useRef<ProFormInstance<SimulationFormValues> | undefined>(
    undefined,
  );
  const initialCustomer =
    findCustomerById(params.get('customerId') ?? '') ?? customers[0];
  const [customerId, setCustomerId] = useState(initialCustomer.id);
  const [summaries, setSummaries] =
    useState<SimulationRecord[]>(initialSummaries);
  const [detail, setDetail] = useState<SimulationRecord | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const customer = useMemo(
    () => findCustomerById(customerId) ?? customers[0],
    [customerId],
  );
  const t = (
    id: string,
    defaultMessage: string,
    values?: Record<string, string | number>,
  ) => intl.formatMessage({ id, defaultMessage }, values);

  const updateCustomer = (id: string) => {
    const nextCustomer = findCustomerById(id) ?? customers[0];
    setCustomerId(nextCustomer.id);
    setParams({ customerId: nextCustomer.id });
    formRef.current?.setFieldsValue(getInitialValues(nextCustomer));
    setResult(null);
  };

  const runSimulation = async (
    status: SimulationStatus = 'DRAFT',
    scenario: ScenarioKey = 'RELATIONSHIP_INVESTMENT',
  ) => {
    const values = await formRef.current?.validateFields();
    if (!values) return;
    const simulation = createSimulation(customer, values, status, scenario);
    setResult(simulation);
    if (status !== 'DRAFT' || summaries.length > 0) {
      setSummaries((current) => [simulation.record, ...current]);
    }
    message.success(
      status === 'SUBMITTED'
        ? t('pages.pricing.simulation.msg.submitted', 'Submitted for approval')
        : t('pages.pricing.simulation.msg.ran', 'Simulation completed'),
    );
  };

  const saveDraft = async () => {
    const values = await formRef.current?.validateFields();
    if (!values) return;
    const simulation = createSimulation(
      customer,
      values,
      'DRAFT',
      'RELATIONSHIP_INVESTMENT',
    );
    setResult(simulation);
    setSummaries((current) => [simulation.record, ...current]);
    message.success(t('pages.pricing.simulation.msg.saved', 'Saved as draft'));
  };

  const loadSimulation = (record: SimulationRecord) => {
    updateCustomer(record.customerId);
    formRef.current?.setFieldsValue({
      customerId: record.customerId,
      market: record.market,
      products: record.products,
      discountPercent: record.discountPercent,
      rebateType: record.rebateType,
      rebateThreshold: record.rebateThreshold,
      estimatedTransactions: record.estimatedTransactions,
      expectedDealSize: record.expectedDealSize,
      specialConditions: record.specialConditions,
    });
    message.info(
      t('pages.pricing.simulation.msg.loaded', 'Simulation loaded into setup'),
    );
  };

  const stats = useMemo(() => {
    const total = summaries.length;
    const averageDiscount = total
      ? summaries.reduce(
          (sum, item) => sum + Math.abs(item.effectiveDiscountPercent),
          0,
        ) / total
      : 0;
    return {
      total,
      draft: summaries.filter((item) => item.status === 'DRAFT').length,
      submitted: summaries.filter((item) => item.status === 'SUBMITTED').length,
      averageDiscount: `${averageDiscount.toFixed(1)}%`,
    };
  }, [summaries]);

  const historyColumns: ProColumns<SimulationRecord>[] = [
    {
      title: t('pages.pricing.simulation.col.id', 'Simulation ID'),
      dataIndex: 'id',
      width: 140,
    },
    {
      title: t('pages.pricing.simulation.col.client', 'Client'),
      dataIndex: 'client',
      width: 210,
    },
    { title: t('pages.pricing.simulation.col.segment', 'Segment'), dataIndex: 'customerSegment', search: false },
    {
      title: t('pages.pricing.simulation.col.market', 'Market'),
      dataIndex: 'market',
      search: false,
    },
    {
      title: t('pages.pricing.simulation.col.products', 'Products'),
      dataIndex: 'products',
      render: (_, row) =>
        row.products.map((item) => productShortMap[item] ?? item).join(' + '),
      search: false,
    },
    {
      title: t('pages.pricing.simulation.col.discount', 'Discount'),
      dataIndex: 'discountPercent',
      render: (value) => `${value}%`,
      search: false,
    },
    {
      title: t('pages.pricing.simulation.col.effectiveDiscount', 'Effective Discount'),
      dataIndex: 'effectiveDiscountPercent',
      render: (value) => `${Number(value).toFixed(1)}%`,
      search: false,
    },
    {
      title: t('pages.pricing.simulation.col.baseRevenue', 'Base Revenue'),
      dataIndex: 'baseRevenue',
      render: (value, row) =>
        formatAmount(marketCurrencyMap[row.market] ?? 'USD', Number(value)),
      search: false,
    },
    {
      title: t(
        'pages.pricing.simulation.col.adjustedRevenue',
        'Adjusted Revenue',
      ),
      dataIndex: 'adjustedRevenue',
      render: (value, row) =>
        formatAmount(marketCurrencyMap[row.market] ?? 'USD', Number(value)),
      search: false,
    },
    {
      title: t('pages.pricing.simulation.col.margin', 'Margin'),
      dataIndex: 'estimatedMarginPercent',
      render: (value) => `${Number(value).toFixed(1)}%`,
      search: false,
    },
    {
      title: t('pages.pricing.simulation.col.reviewCycle', 'Review Cycle'),
      dataIndex: ['benchmarkSource', 'reviewCycle'],
      render: (_, row) => (
        <Space size={4}>
          <Tag>
            {t(
              `pages.pricing.simulation.reviewCycle.${row.benchmarkSource.reviewCycle}`,
              row.benchmarkSource.reviewCycle,
            )}
          </Tag>
          {isReviewDue(row.benchmarkSource.nextReviewDate) && (
            <Tag color="warning">
              {t('pages.pricing.simulation.reviewCycle.due', 'Review Due')}
            </Tag>
          )}
        </Space>
      ),
      search: false,
    },
    {
      title: t('pages.pricing.simulation.col.status', 'Status'),
      dataIndex: 'status',
      valueEnum: Object.fromEntries(
        Object.keys(statusColors).map((key) => [
          key,
          { text: t(`pages.pricing.simulation.status.${key}`, key) },
        ]),
      ),
      render: (_, row) => (
        <Tag color={statusColors[row.status]}>
          {t(`pages.pricing.simulation.status.${row.status}`, row.status)}
        </Tag>
      ),
    },
    {
      title: t('pages.pricing.simulation.col.createdBy', 'Created By'),
      dataIndex: 'createdBy',
      search: false,
    },
    {
      title: t('pages.pricing.simulation.col.createdAt', 'Created At'),
      dataIndex: 'createdAt',
      search: false,
    },
    {
      title: t('pages.pricing.simulation.col.actions', 'Actions'),
      valueType: 'option',
      render: (_, row) => [
        <Button key="view" type="link" onClick={() => setDetail(row)}>
          {t('pages.pricing.simulation.action.view', 'View')}
        </Button>,
        <Button key="load" type="link" onClick={() => loadSimulation(row)}>
          {t('pages.pricing.simulation.action.load', 'Load')}
        </Button>,
        row.status !== 'SUBMITTED' && row.status !== 'APPROVED' ? (
          <Button
            key="submit"
            type="link"
            onClick={() => {
              setSummaries((current) =>
                current.map((item) =>
                  item.id === row.id ? { ...item, status: 'SUBMITTED' } : item,
                ),
              );
              message.success(
                t(
                  'pages.pricing.simulation.msg.submitted',
                  'Submitted for approval',
                ),
              );
            }}
          >
            {t(
              'pages.pricing.simulation.action.submitApproval',
              'Submit for Approval',
            )}
          </Button>
        ) : null,
      ],
    },
  ];

  const detailColumns: ProDescriptionsItemProps<SimulationRecord>[] = [
    { title: t('pages.pricing.simulation.form.client', 'Client'), dataIndex: 'client' },
    { title: t('pages.pricing.simulation.detail.customerId', 'Customer ID'), dataIndex: 'customerId' },
    { title: t('pages.pricing.simulation.col.segment', 'Segment'), dataIndex: 'customerSegment' },
    { title: t('pages.pricing.simulation.context.customerValue', 'Customer Value'), dataIndex: 'customerValue' },
    {
      title: t('pages.pricing.simulation.detail.riskLevel', 'Risk Level'),
      dataIndex: 'riskLevel',
      render: (_, row) => (
        <Tag color={riskColor(row.riskLevel)}>
          {t(`pages.pricing.simulation.risk.${row.riskLevel}`, row.riskLevel)}
        </Tag>
      ),
    },
    {
      title: t('pages.pricing.simulation.context.relationshipHealth', 'Relationship Health'),
      dataIndex: 'relationshipHealth',
      render: (value) => `${value}/100`,
    },
    { title: t('pages.pricing.simulation.form.market', 'Market'), dataIndex: 'market' },
    {
      title: t('pages.pricing.simulation.form.products', 'Products'),
      dataIndex: 'products',
      render: (_, row) => row.products.join(' + '),
    },
    {
      title: t('pages.pricing.simulation.result.baseRevenue', 'Base Revenue'),
      dataIndex: 'baseRevenue',
      render: (value, row) =>
        formatAmount(marketCurrencyMap[row.market] ?? 'USD', Number(value)),
    },
    {
      title: t('pages.pricing.simulation.result.adjustedRevenue', 'Adjusted Revenue'),
      dataIndex: 'adjustedRevenue',
      render: (value, row) =>
        formatAmount(marketCurrencyMap[row.market] ?? 'USD', Number(value)),
    },
    {
      title: t('pages.pricing.simulation.result.discountAmount', 'Discount Amount'),
      dataIndex: 'discountAmount',
      render: (value, row) =>
        formatAmount(marketCurrencyMap[row.market] ?? 'USD', Number(value)),
    },
    {
      title: t('pages.pricing.simulation.result.margin', 'Estimated Margin'),
      dataIndex: 'estimatedMarginPercent',
      render: (value) => `${Number(value).toFixed(1)}%`,
    },
    { title: t('pages.pricing.simulation.result.threshold', 'Pricing Threshold'), dataIndex: 'pricingThresholdStatus', render: (value) => t(`pages.pricing.simulation.threshold.${value}`, String(value)) },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, row) => (
        <Tag color={statusColors[row.status]}>
          {t(`pages.pricing.simulation.status.${row.status}`, row.status)}
        </Tag>
      ),
    },
  ];

  return (
    <PageContainer
      title={t('pages.pricing.simulation.title', 'Pricing Simulation')}
      subTitle={t(
        'pages.pricing.simulation.subtitle',
        'Simulate pricing scenarios and assess expected revenue impact',
      )}
      extra={
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => runSimulation('DRAFT')}
          >
            {t(
              'pages.pricing.simulation.action.runSimulation',
              'Run Simulation',
            )}
          </Button>
          <Button icon={<SaveOutlined />} onClick={saveDraft}>
            {t('pages.pricing.simulation.action.saveDraft', 'Save Draft')}
          </Button>
        </Space>
      }
    >
      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard
          statistic={{ title: t('pages.pricing.simulation.stat.total', 'Total Simulations'), value: stats.total }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{ title: t('pages.pricing.simulation.stat.draft', 'Draft Simulations'), value: stats.draft }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{ title: t('pages.pricing.simulation.stat.submitted', 'Submitted Simulations'), value: stats.submitted }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.pricing.simulation.stat.averageDiscount', 'Average Discount'),
            value: stats.averageDiscount,
          }}
        />
      </StatisticCard.Group>

      <ProCard
        title={
          <Space>
            <UserOutlined /> {t('pages.pricing.simulation.context.title', 'Customer 360 Context')}
          </Space>
        }
        extra={
          <Button
            type="link"
            icon={<ArrowRightOutlined />}
            onClick={() =>
              history.push(
                `/pricing-billing/customer/360?customerId=${customer.id}`,
              )
            }
            >
            {t('pages.pricing.simulation.context.view', 'View Customer 360')}
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={6}>
            <Text type="secondary">{t('pages.pricing.simulation.form.client', 'Client')}</Text>
            <Title level={5}>{customer.customerName}</Title>
            <Text>
              {customer.id} · {customer.segment}
            </Text>
          </Col>
          <Col xs={12} md={6} lg={3}>
            <Text type="secondary">{t('pages.pricing.simulation.context.customerValue', 'Customer Value')}</Text>
            <Title level={5}>{customer.value.customerValueTier}</Title>
          </Col>
          <Col xs={12} md={6} lg={3}>
            <Text type="secondary">{t('pages.pricing.simulation.context.riskRating', 'Risk / Rating')}</Text>
            <div>
              <Tag color={riskColor(customer.value.riskLevel)}>
                {t(
                  `pages.pricing.simulation.risk.${customer.value.riskLevel}`,
                  customer.value.riskLevel,
                )}
              </Tag>{' '}
              {customer.risk.creditRating}
            </div>
          </Col>
          <Col xs={12} md={6} lg={3}>
            <Text type="secondary">{t('pages.pricing.simulation.context.relationshipHealth', 'Relationship Health')}</Text>
            <Progress
              percent={customer.value.relationshipHealth}
              size="small"
            />
          </Col>
          <Col xs={12} md={6} lg={3}>
            <Text type="secondary">{t('pages.pricing.simulation.context.annualRevenue', 'Annual Revenue')}</Text>
            <Title level={5}>
              {formatCompactAmount(
                customer.totalRevenueCurrency,
                customer.value.annualRevenue,
              )}
            </Title>
          </Col>
          <Col xs={12} md={6} lg={3}>
            <Text type="secondary">{t('pages.pricing.simulation.context.riskAdjustedContribution', 'Risk-adjusted Contribution')}</Text>
            <Title level={5}>
              {formatCompactAmount(
                customer.banking.contributionCurrency,
                customer.banking.riskAdjustedContribution,
              )}
            </Title>
          </Col>
          <Col xs={12} md={6} lg={3}>
            <Text type="secondary">{t('pages.pricing.simulation.context.depositLoan', 'Deposit / Loan')}</Text>
            <Title level={5}>
              {formatCompactAmount(
                customer.banking.depositBalanceCurrency,
                customer.banking.depositBalance,
              )}{' '}
              /{' '}
              {formatCompactAmount(
                customer.banking.loanBalanceCurrency,
                customer.banking.loanBalance,
              )}
            </Title>
          </Col>
          <Col span={24}>
            <Text type="secondary">{t('pages.pricing.simulation.context.currentPricing', 'Current Pricing')}: </Text>
            {customer.pricing.pricingPackage} · {customer.pricing.discount}{' '}
            discount · {customer.pricing.acceptableFeeThreshold} · Snapshot:
            {t('pages.pricing.simulation.context.snapshot', 'Snapshot')}: 2026-08-12
          </Col>
          <Col span={24}>
            <Text type="secondary">{t('pages.pricing.simulation.context.benchmarkReference', 'Benchmark Reference')}: </Text>
            {(() => {
              const benchmark =
                marketBenchmarkMap[customer.operatingMarkets[0]] ??
                marketBenchmarkMap.Singapore;
              return `${benchmark.publisher} · ${benchmark.benchmarkName} · ${t(
                `pages.pricing.simulation.reviewCycle.${benchmark.reviewCycle}`,
                benchmark.reviewCycle,
              )} · ${t('pages.pricing.simulation.context.nextReview', 'Next Review')}: ${benchmark.nextReviewDate}`;
            })()}
          </Col>
        </Row>
      </ProCard>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <ProCard title={t('pages.pricing.simulation.section.setup', 'Simulation Setup')} style={{ height: '100%' }}>
            <ProForm<SimulationFormValues>
              formRef={formRef}
              initialValues={getInitialValues(customer)}
              submitter={false}
              onValuesChange={(changed) => {
                if (changed.customerId) updateCustomer(changed.customerId);
              }}
            >
              <ProFormSelect
                name="customerId"
                label={t('pages.pricing.simulation.form.client', 'Client')}
                options={customers.map((item) => ({
                  value: item.id,
                  label: `${item.customerName} (${item.id})`,
                }))}
              />
              <ProFormSelect
                name="market"
                label={t('pages.pricing.simulation.form.market', 'Market')}
                options={customer.operatingMarkets.map((market) => ({
                  value: market,
                  label: market,
                }))}
              />
              <ProFormSelect
                name="products"
                label={t('pages.pricing.simulation.form.products', 'Products')}
                mode="multiple"
                options={customer.products.map((product) => ({
                  value: product.name,
                  label: `${product.name} · ${product.status}`,
                }))}
              />
              <Card
                size="small"
                title={t('pages.pricing.simulation.form.pricingParameters', 'Pricing Parameters')}
                style={{ marginBottom: 16 }}
              >
                <ProFormDigit
                  name="discountPercent"
                  label={t('pages.pricing.simulation.form.discountPercent', 'Discount Percent')}
                  min={-30}
                  max={0}
                  fieldProps={{ addonAfter: '%' }}
                />
                <ProFormSelect
                  name="rebateType"
                  label={t('pages.pricing.simulation.form.rebateType', 'Rebate Type')}
                  options={[
                    { value: 'NONE', label: t('pages.pricing.simulation.form.rebate.none', 'None') },
                    { value: 'VOLUME', label: t('pages.pricing.simulation.form.rebate.volume', 'Volume Rebate') },
                    { value: 'RELATIONSHIP', label: t('pages.pricing.simulation.form.rebate.relationship', 'Relationship Rebate') },
                    { value: 'PRODUCT_BUNDLE', label: t('pages.pricing.simulation.form.rebate.bundle', 'Product Bundle') },
                  ]}
                />
                <ProFormDigit
                  name="rebateThreshold"
                  label={t('pages.pricing.simulation.form.rebateThreshold', 'Rebate Threshold')}
                  min={0}
                />
                <ProFormTextArea
                  name="specialConditions"
                  label={t('pages.pricing.simulation.form.specialConditions', 'Special Conditions')}
                  fieldProps={{ rows: 2 }}
                />
              </Card>
              <Card size="small" title={t('pages.pricing.simulation.form.volumeAssumptions', 'Volume Assumptions')}>
                <ProFormDigit
                  name="estimatedTransactions"
                  label={t('pages.pricing.simulation.form.estimatedTransactions', 'Estimated Transactions / Month')}
                  min={0}
                />
                <ProFormDigit
                  name="expectedDealSize"
                  label={t('pages.pricing.simulation.form.expectedDealSize', 'Expected Deal Size')}
                  min={0}
                />
              </Card>
              <Space style={{ marginTop: 16 }} wrap>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => runSimulation('DRAFT')}
                >
                  {t('pages.pricing.simulation.action.runSimulation', 'Run Simulation')}
                </Button>
                <Button icon={<SaveOutlined />} onClick={saveDraft}>
                  {t('pages.pricing.simulation.action.saveDraft', 'Save as Draft')}
                </Button>
                <Button
                  icon={<FileTextOutlined />}
                  onClick={() => runSimulation('SUBMITTED')}
                >
                  {t('pages.pricing.simulation.action.submitApproval', 'Submit for Approval')}
                </Button>
              </Space>
            </ProForm>
          </ProCard>
        </Col>
        <Col xs={24} lg={14}>
          <ProCard title={t('pages.pricing.simulation.section.results', 'Results')} style={{ height: '100%' }}>
            {result ? (
              <>
                {result.record.complianceWarnings.length > 0 && (
                  <Alert
                    type="warning"
                    showIcon
                    title={t('pages.pricing.simulation.result.complianceWarning', 'Customer 360 compliance warning')}
                    description={result.record.complianceWarnings.map((warning) => t(`pages.pricing.simulation.warning.${warning}`, warning)).join(' ')}
                    style={{ marginBottom: 16 }}
                  />
                )}
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Statistic
                      title={t('pages.pricing.simulation.result.baseRevenue', 'Base Revenue')}
                      value={formatAmount(
                        marketCurrencyMap[result.record.market] ?? 'USD',
                        result.record.baseRevenue,
                      )}
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <Statistic
                      title={t('pages.pricing.simulation.result.adjustedRevenue', 'Adjusted Revenue')}
                      value={formatAmount(
                        marketCurrencyMap[result.record.market] ?? 'USD',
                        result.record.adjustedRevenue,
                      )}
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <Statistic
                      title={t('pages.pricing.simulation.result.margin', 'Estimated Margin')}
                      value={`${result.record.estimatedMarginPercent.toFixed(1)}%`}
                    />
                  </Col>
                </Row>
                <Descriptions size="small" column={2} style={{ marginTop: 20 }}>
                  <Descriptions.Item label={t('pages.pricing.simulation.result.discountAmount', 'Discount Amount')}>
                    {formatAmount(
                      marketCurrencyMap[result.record.market] ?? 'USD',
                      result.record.discountAmount,
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('pages.pricing.simulation.result.contributionImpact', 'Risk-adjusted Contribution Impact')}>
                    {formatAmount(
                      marketCurrencyMap[result.record.market] ?? 'USD',
                      result.record.riskAdjustedContributionImpact,
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('pages.pricing.simulation.result.threshold', 'Pricing Threshold')}>
                    <Tag
                      color={
                        result.record.pricingThresholdStatus === 'WITHIN_RANGE'
                          ? 'success'
                          : 'warning'
                      }
                    >
                      {t(
                        `pages.pricing.simulation.threshold.${result.record.pricingThresholdStatus}`,
                        result.record.pricingThresholdStatus,
                      )}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={t('pages.pricing.simulation.result.contextSnapshot', 'Context Snapshot')}>
                    {result.record.customer360Snapshot.capturedAt.slice(0, 10)}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('pages.pricing.simulation.context.benchmarkReference', 'Benchmark Reference')}>
                    {result.record.benchmarkSource.publisher} · {result.record.benchmarkSource.benchmarkName} ·{' '}
                    {t('pages.pricing.simulation.context.nextReview', 'Next Review')}: {result.record.benchmarkSource.nextReviewDate}
                  </Descriptions.Item>
                </Descriptions>
                <Text strong>{t('pages.pricing.simulation.result.scenario', 'Scenario Comparison')}</Text>
                <Row gutter={[12, 12]} style={{ marginTop: 8 }}>
                  {result.scenarios.map((scenario) => (
                    <Col xs={24} md={8} key={scenario.key}>
                      <CardMini
                        scenario={scenario}
                        currency={
                          marketCurrencyMap[result.record.market] ?? 'USD'
                        }
                        selected={
                          result.record.selectedScenario === scenario.key
                        }
                      />
                    </Col>
                  ))}
                </Row>
                <Text
                  type="secondary"
                  style={{ display: 'block', marginTop: 16 }}
                >
                  {t('pages.pricing.simulation.result.mockNote', 'Mock calculation based on Customer 360 snapshot')}
                </Text>
              </>
            ) : (
              <Alert
                type="info"
                showIcon
                title={t('pages.pricing.simulation.result.empty', 'Run a simulation to compare customer-aware pricing scenarios.')}
              />
            )}
          </ProCard>
        </Col>
      </Row>

      <ProCard title={t('pages.pricing.simulation.section.history', 'Simulation History')} style={{ marginTop: 16 }}>
        <ProTable<SimulationRecord>
          rowKey="id"
          dataSource={summaries}
          columns={historyColumns}
          search={{ labelWidth: 'auto' }}
          options={false}
          pagination={{ pageSize: 8 }}
        />
      </ProCard>

      <Drawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={
          <Space>
            <EyeOutlined /> {detail?.id}
          </Space>
        }
        size="large"
      >
        {detail && (
          <>
            <ProDescriptions<SimulationRecord>
              column={2}
              dataSource={detail}
              columns={detailColumns}
            />
            <ProCard
              title={t('pages.pricing.simulation.detail.snapshot', 'Customer 360 Snapshot')}
              size="small"
              style={{ marginTop: 16 }}
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label={t('pages.pricing.simulation.detail.capturedAt', 'Captured At')}>
                  {detail.customer360Snapshot.capturedAt}
                </Descriptions.Item>
                <Descriptions.Item label={t('pages.pricing.simulation.detail.creditRating', 'Credit Rating')}>
                  {detail.customer360Snapshot.creditRating}
                </Descriptions.Item>
                <Descriptions.Item label={t('pages.pricing.simulation.context.annualRevenue', 'Annual Revenue')}>
                  {formatAmount(
                    marketCurrencyMap[detail.market] ?? 'USD',
                    detail.customer360Snapshot.annualRevenue,
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={t('pages.pricing.simulation.context.riskAdjustedContribution', 'Risk-adjusted Contribution')}>
                  {formatAmount(
                    marketCurrencyMap[detail.market] ?? 'USD',
                    detail.customer360Snapshot.riskAdjustedContribution,
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={t('pages.pricing.simulation.detail.depositBalance', 'Deposit Balance')}>
                  {formatAmount(
                    marketCurrencyMap[detail.market] ?? 'USD',
                    detail.customer360Snapshot.depositBalance,
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={t('pages.pricing.simulation.detail.loanBalance', 'Loan Balance')}>
                  {formatAmount(
                    marketCurrencyMap[detail.market] ?? 'USD',
                    detail.customer360Snapshot.loanBalance,
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={t('pages.pricing.simulation.context.benchmarkReference', 'Benchmark Reference')}>
                  {detail.benchmarkSource.publisher} · {detail.benchmarkSource.benchmarkName} ·{' '}
                  {t(
                    `pages.pricing.simulation.reviewCycle.${detail.benchmarkSource.reviewCycle}`,
                    detail.benchmarkSource.reviewCycle,
                  )}{' '}
                  · {t('pages.pricing.simulation.context.nextReview', 'Next Review')}: {detail.benchmarkSource.nextReviewDate}
                </Descriptions.Item>
              </Descriptions>
            </ProCard>
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

const CardMini: React.FC<{
  scenario: SimulationResult['scenarios'][number];
  currency: string;
  selected: boolean;
}> = ({ scenario, currency, selected }) => {
  const intl = useIntl();
  const translate = (id: string, defaultMessage: string) =>
    intl.formatMessage({ id, defaultMessage });
  return (
    <Card
      size="small"
      title={
        <Space>
          {translate(
            `pages.pricing.simulation.scenario.${scenario.label}`,
            scenario.label,
          )}
          {selected && (
            <Tag color="blue">
              {translate('pages.pricing.simulation.scenario.selected', 'Selected')}
            </Tag>
          )}
        </Space>
      }
    >
      <Statistic
        value={formatAmount(currency, scenario.adjustedRevenue)}
        styles={{ content: { fontSize: 18 } }}
      />
      <Text type="secondary">
        {translate('pages.pricing.simulation.scenario.discount', 'Discount')}{' '}
        {scenario.discountPercent}% ·{' '}
        {translate('pages.pricing.simulation.scenario.margin', 'Margin')}{' '}
        {scenario.marginPercent.toFixed(1)}%
      </Text>
      <div style={{ marginTop: 8 }}>
        <Tag
          color={
            scenario.thresholdStatus === 'WITHIN_RANGE' ? 'success' : 'warning'
          }
        >
          {translate(
            `pages.pricing.simulation.threshold.${scenario.thresholdStatus}`,
            scenario.thresholdStatus,
          )}
        </Tag>
      </div>
    </Card>
  );
};

export default SimulationPage;
