import {
  BankOutlined,
  DollarCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProDescriptions,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { history, useIntl, useSearchParams } from '@umijs/max';
import {
  App,
  Button,
  Card,
  Col,
  Modal,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Tabs,
  Timeline,
  Tree,
  Typography,
} from 'antd';
import { Line } from '@ant-design/plots';
import React, { useEffect, useMemo, useState } from 'react';
import type { Customer360, CustomerInteraction } from './data.d';
import {
  type BillDetailRecord,
  getBillDetails,
  type ChargeRecord,
  getChargeRecords,
} from './detailMock';
import { customers, findCustomerById } from './mock';

const { Text, Title } = Typography;

const money = (value: number, currency: string) => {
  const divisor =
    value >= 1_000_000_000
      ? 1_000_000_000
      : value >= 1_000_000
        ? 1_000_000
        : 1_000;
  const suffix =
    divisor === 1_000_000_000 ? 'B' : divisor === 1_000_000 ? 'M' : 'K';
  return `${currency} ${(value / divisor).toFixed(value % divisor === 0 ? 0 : 2)}${suffix}`;
};

const compact = (value: number) =>
  value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(2)}M`
    : value >= 1_000
      ? `${(value / 1_000).toFixed(0)}K`
      : String(value);

const riskTag = (risk: string, label = risk) => (
  <Tag
    color={risk === 'LOW' ? 'success' : risk === 'MEDIUM' ? 'warning' : 'error'}
  >
    {label}
  </Tag>
);

const Customer360Page: React.FC = () => {
  const intl = useIntl();
  const { message } = App.useApp();
  const [params, setParams] = useSearchParams();
  const [customerId, setCustomerId] = useState(
    params.get('customerId') ?? customers[0].id,
  );
  const [modalOpen, setModalOpen] = useState(Boolean(params.get('customerId')));
  const [detailModal, setDetailModal] = useState<'bill' | 'charge' | null>(
    null,
  );
  const [interactionType, setInteractionType] = useState('ALL');
  const customer = useMemo(
    () => findCustomerById(customerId) ?? customers[0],
    [customerId],
  );
  const t = (id: string) => intl.formatMessage({ id });
  const enumLabel = (key: string) => t(`pages.customer.360.enum.${key}`);
  const valueTierLabel = (tier: string) =>
    t(`pages.customer.360.valueTier.${tier.toLowerCase().replaceAll(' ', '_')}`);

  useEffect(() => {
    const id = params.get('customerId');
    if (id && id !== customerId) setCustomerId(id);
  }, [params, customerId]);

  const selectCustomer = (id: string) => {
    setCustomerId(id);
    setParams({ customerId: id });
    setModalOpen(true);
  };
  const goPricing = () =>
    history.push(
      `/pricing-billing/pricing/simulation?customerId=${customer.id}`,
    );
  const goBilling = () =>
    history.push(`/pricing-billing/billing/invoice?customerId=${customer.id}`);
  const billDetails = useMemo(
    () => getBillDetails(customer.id, customer.totalRevenueCurrency),
    [customer],
  );
  const chargeRecords = useMemo(
    () => getChargeRecords(customer.id, customer.totalRevenueCurrency),
    [customer],
  );

  const searchColumns: ProColumns<Customer360>[] = [
    {
      title: t('pages.customer.360.search.keyword'),
      dataIndex: 'keyword',
      hideInTable: true,
    },
    {
      title: t('pages.customer.360.col.id'),
      dataIndex: 'id',
      search: false,
      width: 150,
      render: (_, row) => (
        <Button type="link" onClick={() => selectCustomer(row.id)}>
          {row.id}
        </Button>
      ),
    },
    {
      title: t('pages.customer.360.col.name'),
      dataIndex: 'customerName',
      search: false,
      width: 220,
    },
    {
      title: t('pages.customer.360.field.registrationNo'),
      dataIndex: ['identity', 'unifiedSocialCreditCode'],
      search: false,
      width: 220,
    },
    {
      title: t('pages.customer.360.field.industryCode'),
      dataIndex: ['identity', 'industryCode'],
      search: false,
      width: 120,
    },
    {
      title: t('pages.customer.360.col.segment'),
      dataIndex: 'segment',
      search: false,
      width: 170,
    },
    {
      title: t('pages.customer.360.col.rmName'),
      dataIndex: 'relationshipManager',
      search: false,
      width: 140,
    },
    {
      title: t('pages.customer.360.col.actions'),
      valueType: 'option',
      render: (_, row) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => selectCustomer(row.id)}
        >
          {t('pages.customer.360.action.view360')}
        </Button>
      ),
    },
  ];

  const revenueData = customer.value.revenueContribution.flatMap((item) => [
    { month: item.month, value: item.revenue, type: t('pages.customer.360.chart.revenue') },
    { month: item.month, value: item.cost, type: t('pages.customer.360.chart.cost') },
    { month: item.month, value: item.contribution, type: t('pages.customer.360.chart.contribution') },
    {
      month: item.month,
      value: item.riskAdjusted,
      type: t('pages.customer.360.chart.riskAdjustedContribution'),
    },
  ]);
  const depositData = customer.banking.depositLoanTrend.flatMap((item) => [
    { month: item.month, value: item.deposit, type: t('pages.customer.360.chart.depositBalance') },
    { month: item.month, value: item.loan, type: t('pages.customer.360.chart.loanBalance') },
  ]);
  const descriptionColumns = (data: object, labels: Record<string, string>) =>
    Object.keys(labels).map((key) => ({
      title: labels[key],
      dataIndex: key,
      render: () => String((data as Record<string, unknown>)[key] ?? '-'),
    }));

  const overview = (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={24} lg={12}>
          <ProCard title={t('pages.customer.360.detail.health')}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title={t('pages.customer.360.health.relationshipHealth')}
                  value={`${customer.value.relationshipHealth} / 100`}
                />
                <Progress
                  percent={customer.value.relationshipHealth}
                  size="small"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={t('pages.customer.360.health.revenueGrowth')}
                  value={customer.value.revenueGrowth}
                  valueStyle={{ color: '#389e0d' }}
                />
                <Statistic
                  title={t('pages.customer.360.health.productPenetration')}
                  value={`${customer.value.productPenetration}%`}
                />
              </Col>
            </Row>
            <Space direction="vertical" style={{ marginTop: 16 }}>
              {riskTag(
                customer.value.riskLevel,
                enumLabel(customer.value.riskLevel.toLowerCase()),
              )}
              <Text>{valueTierLabel(customer.value.customerValueTier)}</Text>
            </Space>
          </ProCard>
        </Col>
        <Col span={24} lg={12}>
          <ProCard title={t('pages.customer.360.detail.businessSummary')}>
            <ProDescriptions
              column={2}
              dataSource={{
                industry: customer.identity.industry,
                revenue: money(
                  customer.value.annualRevenue,
                  customer.value.annualRevenueCurrency,
                ),
                years: `${customer.value.bankingRelationshipYears} ${t('pages.customer.360.duration.years')}`,
                countries: customer.value.operatingCountries,
                products: customer.value.productsHeld,
                rm: customer.relationshipManager,
              }}
              columns={descriptionColumns(
                {
                  industry: customer.identity.industry,
                  revenue: money(
                    customer.value.annualRevenue,
                    customer.value.annualRevenueCurrency,
                  ),
                  years: `${customer.value.bankingRelationshipYears} ${t('pages.customer.360.duration.years')}`,
                  countries: customer.value.operatingCountries,
                  products: customer.value.productsHeld,
                  rm: customer.relationshipManager,
                },
                {
                  industry: t('pages.customer.360.business.industry'),
                  revenue: t('pages.customer.360.business.annualRevenue'),
                  years: t('pages.customer.360.business.bankingRelationship'),
                  countries: t(
                    'pages.customer.360.business.operatingCountries',
                  ),
                  products: t('pages.customer.360.business.productsHeld'),
                  rm: t('pages.customer.360.business.relationshipManager'),
                },
              )}
            />
          </ProCard>
        </Col>
      </Row>
      <ProCard title={t('pages.customer.360.detail.revenueContribution')}>
        <Line
          height={280}
          data={revenueData}
          xField="month"
          yField="value"
          colorField="type"
          tooltip
        />
      </ProCard>
      <Row gutter={[16, 16]}>
        <Col span={24} lg={12}>
          <ProCard title={t('pages.customer.360.detail.productPortfolio')}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {customer.products.map((product) => (
                <Row key={product.name} justify="space-between">
                  <Text>{product.name}</Text>
                  <Tag
                    color={product.status === 'ACTIVE' ? 'success' : 'warning'}
                  >
                    {enumLabel(product.status.toLowerCase())}
                  </Tag>
                </Row>
              ))}
            </Space>
          </ProCard>
        </Col>
        <Col span={24} lg={12}>
          <ProCard title={t('pages.customer.360.detail.recentActivities')}>
            <Timeline
              items={customer.interactions.slice(0, 5).map((item) => ({
                label: item.date,
                children: (
                  <>
                    <Text strong>{item.title}</Text>
                    <br />
                    <Text type="secondary">{item.description}</Text>
                  </>
                ),
              }))}
            />
          </ProCard>
        </Col>
      </Row>
    </Space>
  );

  const identity = (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <ProCard title={t('pages.customer.360.detail.basicIdentity')}>
        <ProDescriptions
          column={2}
          dataSource={customer.identity}
          columns={descriptionColumns(customer.identity, {
            customerId: t('pages.customer.360.header.customerId'),
            customerName: t('pages.customer.360.field.name'),
            unifiedSocialCreditCode: t(
              'pages.customer.360.field.registrationNo',
            ),
            businessRegistrationNumber: t(
              'pages.customer.360.field.businessRegistrationNumber',
            ),
            registrationCountry: t('pages.customer.360.header.registration'),
            registrationPlace: t('pages.customer.360.field.registrationPlace'),
            operatingAddress: t('pages.customer.360.field.operatingAddress'),
            industry: t('pages.customer.360.business.industry'),
            industryCode: t('pages.customer.360.field.industryCode'),
            foreignOwnership: t('pages.customer.360.field.foreignOwnership'),
          })}
        />
      </ProCard>
      <ProCard title={t('pages.customer.360.detail.contacts')}>
        <Row gutter={[16, 16]}>
          {customer.contacts.map((contact) => (
            <Col key={contact.email} span={24} md={8}>
              <Card size="small" title={contact.name}>
                <Tag color="blue">{enumLabel(contact.role.toLowerCase())}</Tag>
                <br />
                <Text>{contact.mobile}</Text>
                <br />
                <Text>{contact.email}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </ProCard>
      <ProCard title={t('pages.customer.360.detail.compliance')}>
        <Row gutter={16}>
          {Object.entries(customer.compliance).map(([key, value]) => (
            <Col key={key} span={12} md={6}>
              <Statistic
                title={t(`pages.customer.360.compliance.${key}`)}
                value={enumLabel(value.toLowerCase())}
              />
              {key === 'amlRisk' && riskTag(value, enumLabel(value.toLowerCase()))}
            </Col>
          ))}
        </Row>
      </ProCard>
    </Space>
  );

  const banking = (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={24} lg={12}>
          <ProCard title={t('pages.customer.360.detail.depositsLoans')}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title={t('pages.customer.360.banking.depositBalance')}
                  value={money(
                    customer.banking.depositBalance,
                    customer.banking.depositBalanceCurrency,
                  )}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={t('pages.customer.360.banking.loanBalance')}
                  value={money(
                    customer.banking.loanBalance,
                    customer.banking.loanBalanceCurrency,
                  )}
                />
              </Col>
            </Row>
            <Progress percent={customer.banking.loanUtilization} />
            <Line
              height={240}
              data={depositData}
              xField="month"
              yField="value"
              colorField="type"
              tooltip
            />
          </ProCard>
        </Col>
        <Col span={24} lg={12}>
          <ProCard title={t('pages.customer.360.detail.transactionBanking')}>
            <Row gutter={[16, 16]}>
              {[
                [
                  'settlementTransactions',
                  compact(customer.banking.settlementTransactions),
                ],
                ['intermediaryServices', customer.banking.intermediaryServices],
                [
                  'annualFees',
                  money(
                    customer.banking.annualFees,
                    customer.banking.annualFeesCurrency,
                  ),
                ],
                ['feeDiscount', customer.banking.feeDiscount],
              ].map(([key, value]) => (
                <Col key={key} span={12}>
                  <Statistic
                    title={t(`pages.customer.360.banking.${key}`)}
                    value={value}
                  />
                </Col>
              ))}
            </Row>
          </ProCard>
          <ProCard
            title={t('pages.customer.360.detail.crossBorderPayments')}
            style={{ marginTop: 16 }}
          >
            <Statistic
              title={t('pages.customer.360.banking.totalTransactionValue')}
              value={money(
                customer.banking.crossBorderTotalValue,
                customer.banking.crossBorderValueCurrency,
              )}
            />
            <Space wrap>
              {customer.banking.crossBorderRoutes.map((route) => (
                <Tag key={`${route.from}-${route.to}`}>
                  {route.from} → {route.to}
                </Tag>
              ))}
            </Space>
          </ProCard>
        </Col>
      </Row>
      <ProCard title={t('pages.customer.360.detail.contribution')}>
        <Row gutter={16}>
          {[
            ['grossRevenue', customer.banking.grossRevenue],
            ['operatingCost', customer.banking.operatingCost],
            ['creditCost', customer.banking.creditCost],
            ['economicCapitalCost', customer.banking.economicCapitalCost],
            [
              'riskAdjustedContribution',
              customer.banking.riskAdjustedContribution,
            ],
          ].map(([key, value]) => (
            <Col key={key} span={24} md={4}>
              <Statistic
                title={t(`pages.customer.360.banking.${key}`)}
                value={money(
                  Number(value),
                  customer.banking.contributionCurrency,
                )}
              />
            </Col>
          ))}
        </Row>
      </ProCard>
    </Space>
  );

  const pricing = (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={24} lg={12}>
          <ProCard title={t('pages.customer.360.detail.rfmValue')}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title={t('pages.customer.360.rfm.recency')}
                  value={customer.value.recency}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={t('pages.customer.360.rfm.frequency')}
                  value={customer.value.frequency}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={t('pages.customer.360.rfm.monetary')}
                  value={customer.value.monetary}
                />
              </Col>
            </Row>
            <Text strong style={{ fontSize: 18 }}>
              {'★'.repeat(customer.value.rfmRating)}
            </Text>{' '}
            <Tag color="gold">
              {valueTierLabel(customer.value.customerValueTier)}
            </Tag>
          </ProCard>
        </Col>
        <Col span={24} lg={12}>
          <ProCard title={t('pages.customer.360.detail.pricingSensitivity')}>
            <ProDescriptions
              column={2}
              dataSource={customer.pricing}
              columns={descriptionColumns(customer.pricing, {
                interestRateSensitivity: t(
                  'pages.customer.360.pricing.interestRateSensitivity',
                ),
                feeSensitivity: t('pages.customer.360.pricing.feeSensitivity'),
                priceElasticity: t(
                  'pages.customer.360.pricing.priceElasticity',
                ),
                acceptableFeeThreshold: t(
                  'pages.customer.360.pricing.acceptableFeeThreshold',
                ),
                pricingPackage: t('pages.customer.360.pricing.pricingPackage'),
                discount: t('pages.customer.360.pricing.discount'),
              })}
            />
          </ProCard>
        </Col>
      </Row>
      <ProCard title={t('pages.customer.360.detail.historicalNegotiation')}>
        <ProTable
          rowKey="date"
          search={false}
          options={false}
          pagination={false}
          dataSource={customer.pricing.historicalNegotiation}
          columns={[
            {
              title: t('pages.customer.360.negotiation.date'),
              dataIndex: 'date',
            },
            {
              title: t('pages.customer.360.negotiation.product'),
              dataIndex: 'product',
            },
            {
              title: t('pages.customer.360.negotiation.requestedPrice'),
              dataIndex: 'requestedPrice',
            },
            {
              title: t('pages.customer.360.negotiation.approvedPrice'),
              dataIndex: 'approvedPrice',
            },
            {
              title: t('pages.customer.360.negotiation.discount'),
              dataIndex: 'discount',
            },
            {
              title: t('pages.customer.360.negotiation.status'),
              dataIndex: 'status',
              render: (_, row) => enumLabel(String(row.status).toLowerCase()),
            },
          ]}
        />
      </ProCard>
      <ProCard
        title={t('pages.customer.360.detail.riskValue')}
        extra={
          <Button
            type="primary"
            icon={<DollarCircleOutlined />}
            onClick={goPricing}
          >
            {t('pages.customer.360.action.openPricingSimulation')}
          </Button>
        }
      >
        <Row gutter={16}>
          {[
            ['creditRating', customer.risk.creditRating],
            ['probabilityOfDefault', customer.risk.probabilityOfDefault],
            ['riskMitigation', customer.risk.riskMitigation],
            [
              'economicCapital',
              money(
                customer.risk.economicCapital,
                customer.risk.economicCapitalCurrency,
              ),
            ],
            ['riskAdjustedReturn', customer.risk.riskAdjustedReturn],
            [
              'riskAdjustedCustomerValue',
              money(
                customer.risk.riskAdjustedCustomerValue,
                customer.risk.riskAdjustedCustomerValueCurrency,
              ),
            ],
          ].map(([key, value]) => (
            <Col key={key} span={12} md={4}>
              <Statistic
                title={t(`pages.customer.360.risk.${key}`)}
                value={value}
              />
            </Col>
          ))}
        </Row>
      </ProCard>
    </Space>
  );

  const filteredInteractions = customer.interactions.filter(
    (item) => interactionType === 'ALL' || item.type === interactionType,
  );
  const interaction = (
    <ProCard
      title={t('pages.customer.360.detail.interaction')}
      extra={
        <Space wrap>
          {[
            'ALL',
            'MARKETING',
            'RM',
            'CUSTOMER_SERVICE',
            'PRICING',
            'BILLING',
            'COMPLAINT',
          ].map((type) => (
            <Button
              key={type}
              size="small"
              type={interactionType === type ? 'primary' : 'default'}
              onClick={() => setInteractionType(type)}
            >
              {enumLabel(type.toLowerCase())}
            </Button>
          ))}
        </Space>
      }
    >
      <Timeline
        items={filteredInteractions.map((item: CustomerInteraction) => ({
          label: item.date,
          children: (
            <>
              <Text strong>
                {item.title} <Tag>{enumLabel(item.type.toLowerCase())}</Tag>
              </Text>
              <br />
              <Text type="secondary">{item.description}</Text>
            </>
          ),
        }))}
      />
    </ProCard>
  );

  const treeData = [
    {
      title: customer.relationships.beneficialOwner,
      key: 'owner',
      children: [
        {
          title: customer.relationships.parentCompany,
          key: 'parent',
          children: customer.relationships.subsidiaries.map((item) => ({
            title: `${item.name} (${item.location})`,
            key: item.name,
          })),
        },
      ],
    },
  ];
  const relationship = (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={24} lg={12}>
          <ProCard title={t('pages.customer.360.detail.groupStructure')}>
            <Tree treeData={treeData} defaultExpandAll />
          </ProCard>
        </Col>
        <Col span={24} lg={12}>
          <ProCard title={t('pages.customer.360.detail.groupExposure')}>
            <Statistic
              title={t('pages.customer.360.relationship.groupCreditExposure')}
              value={money(
                customer.relationships.groupCreditExposure,
                customer.relationships.groupCreditCurrency,
              )}
            />
            <Progress
              percent={Math.round(
                (customer.relationships.groupCreditExposure /
                  customer.relationships.groupCreditLimit) *
                  100,
              )}
            />
          </ProCard>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        {customer.opportunities.map((opportunity) => (
          <Col key={opportunity.product} span={24} md={12}>
            <Card
              size="small"
              title={opportunity.product}
              extra={
                <Button
                  type="primary"
                  size="small"
                  onClick={() =>
                    message.success(
                      t('pages.customer.360.msg.opportunityCreated'),
                    )
                  }
                >
                  {t('pages.customer.360.action.createOpportunity')}
                </Button>
              }
            >
              <Text>
                {t('pages.customer.360.opportunity.score')}: {opportunity.score}
                %
              </Text>
              <br />
              <Text type="success">
                {money(
                  opportunity.estimatedRevenue,
                  opportunity.estimatedRevenueCurrency,
                )}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>
      <ProCard title={t('pages.customer.360.detail.externalIntelligence')}>
        <Row gutter={16}>
          {Object.entries(customer.externalIntelligence).map(([key, value]) => (
            <Col key={key} span={12} md={6}>
              <Statistic
                title={t(`pages.customer.360.externalIntelligence.${key}`)}
                value={value}
              />
            </Col>
          ))}
        </Row>
      </ProCard>
    </Space>
  );

  const tabs = [
    {
      key: 'overview',
      label: t('pages.customer.360.tab.overview'),
      children: overview,
    },
    {
      key: 'identity',
      label: t('pages.customer.360.tab.identity'),
      children: identity,
    },
    {
      key: 'banking',
      label: t('pages.customer.360.tab.banking'),
      children: banking,
    },
    {
      key: 'pricing',
      label: t('pages.customer.360.tab.pricing'),
      children: pricing,
    },
    {
      key: 'interaction',
      label: t('pages.customer.360.tab.interaction'),
      children: interaction,
    },
    {
      key: 'relationship',
      label: t('pages.customer.360.tab.relationship'),
      children: relationship,
    },
  ];

  const formatDetailAmount = (amount: number, currency: string) =>
    `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const billColumns: ProColumns<BillDetailRecord>[] = [
    { title: t('pages.customer.bill.chargeService'), dataIndex: 'charge_service' },
    { title: t('pages.customer.bill.category'), dataIndex: 'category' },
    { title: t('pages.customer.bill.date'), dataIndex: 'date' },
    { title: t('pages.customer.bill.tariffItem'), dataIndex: 'tariff_item' },
    { title: t('pages.customer.bill.pricingModel'), dataIndex: 'pricing_model' },
    { title: t('pages.customer.bill.billingBasis'), dataIndex: 'billing_basis' },
    { title: t('pages.customer.bill.amount'), dataIndex: 'amount', render: (_, row) => row.pricing_model === 'Rate' ? `${row.amount}%` : formatDetailAmount(row.amount, row.currency) },
    { title: t('pages.customer.bill.quantity'), dataIndex: 'quantity' },
    { title: t('pages.customer.bill.grossAmount'), dataIndex: 'gross_amount', render: (_, row) => formatDetailAmount(row.gross_amount, row.currency) },
    { title: t('pages.customer.bill.netAmount'), dataIndex: 'net_amount', render: (_, row) => <Text strong>{formatDetailAmount(row.net_amount, row.currency)}</Text> },
    { title: t('pages.customer.bill.remarks'), dataIndex: 'remarks' },
  ];
  const chargeColumns: ProColumns<ChargeRecord>[] = [
    { title: t('pages.customer.charge.eventType'), dataIndex: 'event_type' },
    { title: t('pages.customer.charge.eventTime'), dataIndex: 'event_time' },
    { title: t('pages.customer.charge.serviceCode'), dataIndex: 'service_code' },
    { title: t('pages.customer.charge.tariffItem'), dataIndex: 'tariff_item_name', render: (_, row) => <><Text strong>{row.tariff_item_name}</Text><br /><Text type="secondary">{row.tariff_item_no}</Text></> },
    { title: t('pages.customer.charge.groupNumber'), dataIndex: 'group_number' },
    { title: t('pages.customer.charge.activeAccounts'), dataIndex: 'total_active_account_count' },
    { title: t('pages.customer.charge.changedAccounts'), dataIndex: 'total_changed_accounts' },
    { title: t('pages.customer.charge.amount'), dataIndex: 'amount', render: (_, row) => <Text strong>{formatDetailAmount(row.amount, row.currency)}</Text> },
  ];

  return (
    <PageContainer
      title={t('pages.customer.360.title')}
      subTitle={t('pages.customer.360.subTitle')}
    >
      <ProCard title={t('pages.customer.360.detail.customerSearch')}>
        <ProTable
          rowKey="id"
          search={{ labelWidth: 'auto' }}
          options={false}
          pagination={{ pageSize: 5 }}
          columns={searchColumns}
          request={async ({ keyword }) => {
            const query = String(keyword ?? '')
              .trim()
              .toLowerCase();
            const data = query
              ? customers.filter((item) =>
                  [
                    item.id,
                    item.customerName,
                    item.identity.unifiedSocialCreditCode,
                    item.identity.businessRegistrationNumber,
                  ].some((value) => value?.toLowerCase().includes(query)),
                )
              : customers;
            return { data, success: true, total: data.length };
          }}
        />
      </ProCard>
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width="min(1400px, calc(100vw - 32px))"
        title={customer.customerName}
        destroyOnHidden
      >
        <ProCard
          style={{ marginTop: 0 }}
          title={
            <Title level={4} style={{ margin: 0 }}>
              {customer.customerName}
            </Title>
          }
          extra={
            <Space>
              <Button icon={<DollarCircleOutlined />} onClick={goPricing}>
                {t('pages.customer.360.action.pricing')}
              </Button>
              <Button icon={<BankOutlined />} onClick={goBilling}>
                {t('pages.customer.360.action.billing')}
              </Button>
              <Button
                icon={<FileTextOutlined />}
                onClick={() => setDetailModal('bill')}
              >
                {t('pages.customer.bill.title')}
              </Button>
              <Button
                icon={<ThunderboltOutlined />}
                onClick={() => setDetailModal('charge')}
              >
                {t('pages.customer.charge.title')}
              </Button>
              <Button
                icon={<TeamOutlined />}
                onClick={() =>
                  document
                    .querySelector<HTMLElement>('.ant-tabs-tab:nth-child(6)')
                    ?.click()
                }
              >
                {t('pages.customer.360.action.groupView')}
              </Button>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            {[
              { key: 'id', value: customer.id },
              { key: 'segment', value: customer.segment },
              {
                key: 'registration',
                value: customer.identity.registrationCountry,
              },
              { key: 'markets', value: customer.operatingMarkets.join(' · ') },
              { key: 'rm', value: customer.relationshipManager },
              { key: 'since', value: customer.customerSince },
              {
                key: 'status',
                value: (
                  <Tag color="success">
                    {enumLabel(customer.status.toLowerCase())}
                  </Tag>
                ),
              },
            ].map((item) => (
              <Col key={item.key} span={24} md={8} lg={6} xl={3}>
                <Text type="secondary">
                  {t(`pages.customer.360.header.${item.key}`)}
                </Text>
                <br />
                <Text strong>{item.value}</Text>
              </Col>
            ))}
          </Row>
        </ProCard>
        <StatisticCard.Group direction="row" style={{ marginTop: 16 }}>
          <StatisticCard
            statistic={{
              title: t('pages.customer.360.kpi.totalRevenue'),
              value: money(
                customer.totalRevenue,
                customer.totalRevenueCurrency,
              ),
              suffix: customer.totalRevenueYoY,
            }}
          />
          <StatisticCard.Divider />
          <StatisticCard
            statistic={{
              title: t('pages.customer.360.kpi.riskAdjustedProfit'),
              value: money(
                customer.riskAdjustedProfit,
                customer.riskAdjustedProfitCurrency,
              ),
            }}
          />
          <StatisticCard.Divider />
          <StatisticCard
            statistic={{
              title: t('pages.customer.360.kpi.depositBalance'),
              value: money(
                customer.banking.depositBalance,
                customer.banking.depositBalanceCurrency,
              ),
            }}
          />
          <StatisticCard.Divider />
          <StatisticCard
            statistic={{
              title: t('pages.customer.360.kpi.loanBalance'),
              value: money(
                customer.banking.loanBalance,
                customer.banking.loanBalanceCurrency,
              ),
            }}
          />
          <StatisticCard.Divider />
          <StatisticCard
            statistic={{
              title: t('pages.customer.360.kpi.annualTransactions'),
              value: compact(customer.annualTransactions),
            }}
          />
          <StatisticCard.Divider />
          <StatisticCard
            statistic={{
              title: t('pages.customer.360.kpi.customerValue'),
              value: valueTierLabel(customer.value.customerValueTier),
            }}
          />
        </StatisticCard.Group>
        <ProCard style={{ marginTop: 16 }}>
          <Tabs items={tabs} />
        </ProCard>
        <Modal
          open={detailModal === 'bill'}
          title={t('pages.customer.bill.title')}
          onCancel={() => setDetailModal(null)}
          footer={null}
          width="min(1400px, calc(100vw - 48px))"
        >
          <ProTable
            rowKey="id"
            search={false}
            options={false}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1400 }}
            dataSource={billDetails}
            columns={billColumns}
          />
        </Modal>
        <Modal
          open={detailModal === 'charge'}
          title={t('pages.customer.charge.title')}
          onCancel={() => setDetailModal(null)}
          footer={null}
          width="min(1200px, calc(100vw - 48px))"
        >
          <ProTable
            rowKey="id"
            search={false}
            options={false}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1100 }}
            dataSource={chargeRecords}
            columns={chargeColumns}
          />
        </Modal>
      </Modal>
    </PageContainer>
  );
};

export default Customer360Page;
