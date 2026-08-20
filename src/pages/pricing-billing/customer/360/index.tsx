import {
  ArrowLeftOutlined,
  BankOutlined,
  DollarCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  TeamOutlined,
  UnorderedListOutlined,
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
  DatePicker,
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
import type { Dayjs } from 'dayjs';
import { Line } from '@ant-design/plots';
import React, { useEffect, useMemo, useState } from 'react';
import type { BillDetailRecord } from './detailMock';
import { getBillDetails } from './detailMock';
import type { ChargeRecord } from './detailMock';
import { getChargeRecords } from './detailMock';
import type { BillingStatement, Customer360, CustomerInteraction } from './data.d';
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

const formatAmount = (value: number, currency: string) =>
  `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const compact = (value: number) =>
  value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(2)}M`
    : value >= 1_000
      ? `${(value / 1_000).toFixed(0)}K`
      : String(value);

const pdfText = (value: string | number) =>
  String(value)
    .replace(/[\\()]/g, '\\$&')
    .replace(/[^\x20-\x7e]/g, '?');

const createMockInvoicePdf = (
  customer: Customer360,
  statement: BillingStatement,
  template: string,
) => {
  const commands: string[] = [];
  const text = (x: number, y: number, value: string | number, size = 10) => {
    commands.push(`BT /F1 ${size} Tf ${x} ${y} Td (${pdfText(value)}) Tj ET`);
  };
  const line = (x1: number, y1: number, x2: number, y2: number) => {
    commands.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  };
  const amount = (value: number) =>
    `${statement.currency} ${value.toLocaleString('en-US')}`;

  commands.push('0.16 0.25 0.38 rg 0.16 0.25 0.38 RG');
  text(48, 742, `${template} TAX INVOICE`, 20);
  text(48, 720, 'MOCK DOCUMENT - FOR DEMONSTRATION ONLY', 9);
  text(420, 742, 'Invoice No.', 9);
  text(500, 742, statement.id, 9);
  line(48, 708, 564, 708);

  text(48, 684, 'BILL TO', 9);
  text(48, 666, customer.customerName, 12);
  text(48, 648, `Customer ID: ${customer.id}`, 9);
  text(48, 632, `Registration Country: ${customer.identity.registrationCountry}`, 9);
  text(330, 684, 'INVOICE DETAILS', 9);
  text(330, 666, `Bill Date: ${statement.billDate}`, 9);
  text(330, 650, `Payment Due: ${statement.paymentDueDate}`, 9);
  text(330, 634, `Service Period: ${statement.servicePeriodStart} - ${statement.servicePeriodEnd}`, 9);
  text(330, 618, `Currency: ${statement.currency}`, 9);

  line(48, 594, 564, 594);
  text(48, 576, 'DESCRIPTION', 9);
  text(450, 576, 'AMOUNT', 9);
  line(48, 566, 564, 566);

  let y = 544;
  const feeRows = [
    ['Cash Management Fee', statement.cashManagementFee],
    ['Trade Finance Fee', statement.tradeFinanceFee],
    ['Global Markets Transaction Fee', statement.globalMarketsTransactionFee],
    ['Other Fees', statement.otherFees ?? 0],
    [statement.taxLabel, statement.taxAmount],
  ];
  feeRows.forEach(([label, value]) => {
    text(48, y, label, 10);
    text(450, y, amount(Number(value)), 10);
    y -= 20;
  });
  line(48, y + 8, 564, y + 8);
  text(48, y - 12, 'TOTAL AMOUNT DUE', 11);
  text(450, y - 12, amount(statement.totalAmountDue), 11);
  y -= 48;

  text(48, y, 'DETAILS', 9);
  y -= 18;
  statement.details.forEach((detail) => {
    text(48, y, detail.category, 9);
    y -= 16;
    detail.items.forEach((item) => {
      text(64, y, item.name, 9);
      text(450, y, amount(item.amount), 9);
      y -= 15;
    });
  });
  line(48, 92, 564, 92);
  text(48, 74, `Remarks: ${statement.remarks}`, 9);
  text(450, 74, `Status: ${statement.status}`, 9);
  text(48, 48, 'Static mock invoice. Not a tax invoice and not connected to a billing or tax system.', 8);

  const stream = commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}\nendstream`,
  ];
  const header = '%PDF-1.4\n';
  let pdf = header;
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
};

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
  const [detailOpen, setDetailOpen] = useState(Boolean(params.get('customerId')));
  const [activeTab, setActiveTab] = useState('overview');
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingMonth, setBillingMonth] = useState<Dayjs | null>(null);
  const [billingQuickFilter, setBillingQuickFilter] = useState('12');
  const [selectedStatement, setSelectedStatement] = useState<BillingStatement | null>(null);
  const [chargeDetailsOpen, setChargeDetailsOpen] = useState(false);
  const [invoicePreview, setInvoicePreview] = useState<{
    title: string;
    url: string;
  } | null>(null);
  const [interactionType, setInteractionType] = useState('ALL');
  const customer = useMemo(
    () => findCustomerById(customerId) ?? customers[0],
    [customerId],
  );
  const t = (
    id: string,
    defaultMessage = id,
    values?: Record<string, string | number>,
  ) => intl.formatMessage({ id, defaultMessage }, values);
  const enumLabel = (key: string) => t(`pages.customer.360.enum.${key}`);
  const valueTierLabel = (tier: string) =>
    t(`pages.customer.360.valueTier.${tier.toLowerCase().replaceAll(' ', '_')}`);

  useEffect(() => {
    const id = params.get('customerId');
    if (id && id !== customerId) setCustomerId(id);
    if (id) setDetailOpen(true);
  }, [params, customerId]);

  useEffect(
    () => () => {
      if (invoicePreview) URL.revokeObjectURL(invoicePreview.url);
    },
    [invoicePreview],
  );

  const selectCustomer = (id: string) => {
    setCustomerId(id);
    setParams({ customerId: id });
    setActiveTab('overview');
    setBillingOpen(false);
    setSelectedStatement(null);
    setInvoicePreview(null);
    setDetailOpen(true);
  };
  const closeDetail = () => {
    setDetailOpen(false);
    setBillingOpen(false);
    setSelectedStatement(null);
    setInvoicePreview(null);
  };
  const goPricing = () =>
    history.push(
      `/pricing-billing/pricing/simulation?customerId=${customer.id}`,
    );
  const goBilling = () =>
    history.push(`/pricing-billing/billing/invoice?customerId=${customer.id}`);
  const visibleBillingStatements = useMemo(() => {
    const statements = [...customer.billing.statements].sort((a, b) =>
      b.billDate.localeCompare(a.billDate),
    );
    if (billingMonth) {
      return statements.filter((statement) => statement.billDate.startsWith(billingMonth.format('YYYY-MM')));
    }
    if (billingQuickFilter === 'all') return statements;
    return statements.slice(0, Number(billingQuickFilter));
  }, [billingMonth, billingQuickFilter, customer.billing.statements]);

  const previewInvoice = (statement: BillingStatement) => {
    const markets = [customer.identity.registrationCountry, ...customer.operatingMarkets];
    const template = markets.find((market) => ['China', 'Hong Kong', 'Singapore', 'Japan'].includes(market)) ?? 'Default';
    const blob = new Blob([createMockInvoicePdf(customer, statement, template)], { type: 'application/pdf' });
    setInvoicePreview({
      title: `${statement.id} - ${t('pages.customer.360.billingModal.invoicePreview', 'Invoice PDF Preview')}`,
      url: URL.createObjectURL(blob),
    });
  };

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
                <br />
                <Text type="secondary">WeChat: {contact.wechat ?? '-'}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </ProCard>
      <ProCard title={t('pages.customer.360.detail.compliance')}>
        <Row gutter={16}>
          {(['amlRisk', 'blacklist', 'crossBorderTrading', 'fxQualification'] as const).map((key) => {
            const value = customer.compliance[key];
            return (
            <Col key={key} span={12} md={6}>
              <Statistic
                title={t(`pages.customer.360.compliance.${key}`)}
                value={enumLabel(value.toLowerCase())}
              />
              <Tag
                color={
                  key === 'amlRisk'
                    ? value === 'LOW'
                      ? 'success'
                      : value === 'MEDIUM'
                        ? 'warning'
                        : 'error'
                    : value === 'CLEAR' || value === 'ENABLED' || value === 'VALID'
                      ? 'success'
                      : value === 'POTENTIAL_MATCH' || value === 'RESTRICTED' || value === 'EXPIRING_SOON'
                        ? 'warning'
                        : 'error'
                }
              >
                {enumLabel(value.toLowerCase())}
              </Tag>
              {key === 'fxQualification' && customer.compliance.fxQualificationExpiry && (
                <Text type="secondary">Expires: {customer.compliance.fxQualificationExpiry}</Text>
              )}
            </Col>
            );
          })}
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
            <ProDescriptions
              column={2}
              dataSource={customer.banking}
              columns={descriptionColumns(customer.banking, {
                averageDepositBalance: t('pages.customer.360.banking.averageDepositBalance', 'Average Deposit Balance'),
                ftpBenchmark: t('pages.customer.360.banking.ftpBenchmark', 'FTP Benchmark'),
                averageDepositRate: t('pages.customer.360.banking.averageDepositRate', 'Average Deposit Rate'),
                averageLendingRate: t('pages.customer.360.banking.averageLendingRate', 'Average Lending Rate'),
              })}
            />
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
            <ProTable
              rowKey="year"
              search={false}
              options={false}
              pagination={false}
              dataSource={customer.banking.feeHistory}
              columns={[
                { title: t('pages.customer.360.banking.year', 'Year'), dataIndex: 'year' },
                { title: t('pages.customer.360.banking.annualFees', 'Annual Fees'), render: (_, row) => money(row.amount, row.currency) },
              ]}
            />
          </ProCard>
          <ProCard
            title={t('pages.customer.360.detail.crossBorderPayments')}
            style={{ marginTop: 16 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title={t('pages.customer.360.banking.crossBorderAnnualTransactions', 'Annual Transactions')}
                  value={compact(customer.banking.crossBorderAnnualTransactions)}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={t('pages.customer.360.banking.preferredChannel', 'Preferred Channel')}
                  value={customer.banking.preferredChannel}
                />
              </Col>
            </Row>
            <Statistic
              title={t('pages.customer.360.banking.totalTransactionValue')}
              value={money(
                customer.banking.crossBorderTotalValue,
                customer.banking.crossBorderValueCurrency,
              )}
            />
            <Text type="secondary">
              {t('pages.customer.360.banking.peakTransactionPeriod', 'Peak Transaction Period')}:{' '}
              {customer.banking.peakTransactionPeriod}
            </Text>
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
        <Button
          icon={<FileTextOutlined />}
          onClick={() => setBillingOpen(true)}
          style={{ marginTop: 16 }}
        >
          {t('pages.customer.360.action.viewBilling', 'View Billing')}
        </Button>
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
                customizedPricingEnabled: t('pages.customer.360.pricing.customizedPricing', 'Customized Pricing'),
                validUntil: t('pages.customer.360.pricing.validUntil', 'Valid Until'),
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
        <Col span={24}>
          <ProCard title={t('pages.customer.360.detail.productRelationship', 'Product Relationship')}>
            <Space wrap>
              {customer.products
                .filter((product) => product.status === 'ACTIVE')
                .map((product) => (
                  <Tag key={product.name} color="success">
                    {product.name}
                  </Tag>
                ))}
            </Space>
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
        open={detailOpen}
        onCancel={closeDetail}
        footer={null}
        width="min(1400px, calc(100vw - 32px))"
        title={`${customer.customerName} - ${t('pages.customer.360.title')}`}
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
                icon={<TeamOutlined />}
                onClick={() => setActiveTab('relationship')}
              >
                {t('pages.customer.360.action.groupView')}
              </Button>
              <Button icon={<UnorderedListOutlined />} onClick={() => setChargeDetailsOpen(true)}>
                {t('pages.customer.360.action.chargeDetails', 'Charge Details')}
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
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />
        </ProCard>
        <Modal
          title={
            <Space>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => {
                  setBillingOpen(false);
                  setInvoicePreview(null);
                }}
              >
                {t('pages.customer.360.billingModal.backToCustomer', 'Back to Customer 360')}
              </Button>
              <Text strong>
                {customer.customerName} - {t('pages.customer.360.billingModal.title', 'Billing Statements')}
              </Text>
            </Space>
          }
          open={billingOpen}
          onCancel={() => {
            setBillingOpen(false);
            setInvoicePreview(null);
          }}
          footer={null}
          width="100vw"
          centered={false}
          style={{ top: 0, maxWidth: '100vw', paddingBottom: 0 }}
          styles={{
            root: { height: '100vh' },
            body: { height: 'calc(100vh - 72px)', overflow: 'auto', padding: 24 },
          }}
        >
          <Space wrap style={{ marginBottom: 16 }}>
            <DatePicker
              picker="month"
              value={billingMonth}
              placeholder={t('pages.customer.360.billingModal.filterMonth', 'Filter by month')}
              onChange={(value) => {
                setBillingMonth(value);
                setBillingQuickFilter('');
              }}
            />
            {[
              ['3', t('pages.customer.360.billingModal.last3Months', 'Last 3 Months')],
              ['6', t('pages.customer.360.billingModal.last6Months', 'Last 6 Months')],
              ['12', t('pages.customer.360.billingModal.last12Months', 'Last 12 Months')],
              ['all', t('pages.customer.360.enum.all', 'All')],
            ].map(([value, label]) => (
              <Button
                key={value}
                type={!billingMonth && billingQuickFilter === value ? 'primary' : 'default'}
                onClick={() => {
                  setBillingMonth(null);
                  setBillingQuickFilter(value);
                }}
              >
                {label}
              </Button>
            ))}
          </Space>
          <ProTable<BillingStatement>
            rowKey="id"
            search={false}
            options={false}
            pagination={{ pageSize: 6 }}
            scroll={{ x: 1200 }}
            dataSource={visibleBillingStatements}
            columns={[
              { title: t('pages.customer.360.billingModal.billDate', 'Bill Date'), dataIndex: 'billDate', sorter: (a, b) => b.billDate.localeCompare(a.billDate) },
              { title: t('pages.customer.360.billingModal.paymentDueDate', 'Payment Due Date'), dataIndex: 'paymentDueDate' },
              { title: t('pages.customer.360.billingModal.servicePeriod', 'Service Period'), render: (_, row) => `${row.servicePeriodStart} - ${row.servicePeriodEnd}` },
              { title: t('pages.customer.360.billingModal.totalAmountDue', 'Total Amount Due'), dataIndex: 'totalAmountDue', render: (_, row) => money(row.totalAmountDue, row.currency) },
              { title: t('pages.customer.360.billingModal.currency', 'Currency'), dataIndex: 'currency' },
              { title: t('pages.customer.360.billingModal.cashManagementFee', 'Cash Management Fee'), dataIndex: 'cashManagementFee', render: (_, row) => money(row.cashManagementFee, row.currency) },
              { title: t('pages.customer.360.billingModal.tradeFinanceFee', 'Trade Finance Fee'), dataIndex: 'tradeFinanceFee', render: (_, row) => money(row.tradeFinanceFee, row.currency) },
              { title: t('pages.customer.360.billingModal.globalMarketsFee', 'Global Markets Transaction Fee'), dataIndex: 'globalMarketsTransactionFee', render: (_, row) => money(row.globalMarketsTransactionFee, row.currency) },
              { title: t('pages.customer.360.billingModal.taxFee', 'Tax'), dataIndex: 'taxAmount', render: (_, row) => `${money(row.taxAmount, row.currency)} (${row.taxLabel})` },
              { title: t('pages.customer.360.billingModal.remarks', 'Remarks'), dataIndex: 'remarks' },
              { title: t('pages.customer.360.billingModal.status', 'Status'), dataIndex: 'status', render: (_, row) => <Tag color={row.status === 'Paid' ? 'success' : row.status === 'Overdue' ? 'error' : 'processing'}>{enumLabel(row.status.toLowerCase())}</Tag> },
              {
                title: t('pages.customer.360.billingModal.actions', 'Actions'),
                fixed: 'right',
                render: (_, row) => (
                  <Space>
                    <Button type="link" onClick={() => setSelectedStatement(row)}>{t('pages.customer.360.billingModal.billDetails', 'Bill Details')}</Button>
                    <Button type="link" icon={<FileTextOutlined />} onClick={() => previewInvoice(row)}>{t('pages.customer.360.billingModal.issueInvoice', 'Issue Invoice')}</Button>
                  </Space>
                ),
              },
            ]}
          />
        </Modal>
        <Modal
          title={t('pages.customer.360.billingModal.billDetails', 'Bill Details')}
          open={Boolean(selectedStatement)}
          onCancel={() => setSelectedStatement(null)}
          footer={null}
          width={1200}
          destroyOnHidden
        >
          {selectedStatement && (
            <ProTable<BillDetailRecord>
              rowKey="id"
              search={false}
              options={false}
              pagination={false}
              scroll={{ x: 1200 }}
              dataSource={getBillDetails(customer.id, selectedStatement.currency)}
              columns={[
                { title: t('pages.customer.360.billingModal.chargeService', 'Charge Service'), dataIndex: 'charge_service' },
                { title: t('pages.customer.360.billingModal.feeType', 'Fee Type'), dataIndex: 'category' },
                { title: t('pages.customer.360.billingModal.date', 'Date'), dataIndex: 'date' },
                { title: t('pages.customer.360.billingModal.tariffItem', 'Tariff Item'), dataIndex: 'tariff_item' },
                { title: t('pages.customer.360.billingModal.pricingModel', 'Pricing Model'), dataIndex: 'pricing_model', render: (_, row) => enumLabel(row.pricing_model.toLowerCase()) },
                { title: t('pages.customer.360.billingModal.chargeBasis', 'Charge Basis'), dataIndex: 'billing_basis' },
                { title: t('pages.customer.360.billingModal.unitPrice', 'Unit Price'), dataIndex: 'amount', render: (_, row) => (row.pricing_model === 'Rate' ? `${row.amount}%` : formatAmount(row.amount, row.currency)) },
                { title: t('pages.customer.360.billingModal.quantity', 'Quantity'), dataIndex: 'quantity' },
                { title: t('pages.customer.360.billingModal.grossAmount', 'Gross Amount'), dataIndex: 'gross_amount', render: (_, row) => formatAmount(row.gross_amount, row.currency) },
                { title: t('pages.customer.360.billingModal.netAmount', 'Net Amount'), dataIndex: 'net_amount', render: (_, row) => <Text strong>{formatAmount(row.net_amount, row.currency)}</Text> },
                { title: t('pages.customer.360.billingModal.remarks', 'Remarks'), dataIndex: 'remarks', render: (value) => value ?? '-' },
              ]}
            />
          )}
        </Modal>
        <Modal
          title={t('pages.customer.360.action.chargeDetails', 'Charge Details')}
          open={chargeDetailsOpen}
          onCancel={() => setChargeDetailsOpen(false)}
          footer={null}
          width={1500}
          destroyOnHidden
        >
          <ProTable<ChargeRecord>
            rowKey="id"
            search={false}
            options={false}
            pagination={false}
            scroll={{ x: 1200 }}
            dataSource={getChargeRecords(customer.id, customer.totalRevenueCurrency)}
            columns={[
              { title: t('pages.customer.360.chargeDetails.eventType', 'Event Type'), dataIndex: 'event_type' },
              { title: t('pages.customer.360.chargeDetails.eventTime', 'Event Time'), dataIndex: 'event_time' },
              { title: t('pages.customer.360.chargeDetails.serviceCode', 'Service Code'), dataIndex: 'service_code' },
              {
                title: t('pages.customer.360.chargeDetails.tariffItem', 'Tariff Item'),
                render: (_, row) => (
                  <>
                    <Text strong>{row.tariff_item_name}</Text> {row.tariff_item_no}
                  </>
                ),
              },
              { title: t('pages.customer.360.chargeDetails.groupNumber', 'Group Number'), dataIndex: 'group_number', render: (value) => value ?? '-' },
              { title: t('pages.customer.360.chargeDetails.activeAccounts', 'Active Accounts'), dataIndex: 'total_active_account_count', render: (value) => value ?? '-' },
              { title: t('pages.customer.360.chargeDetails.changedAccounts', 'Changed Accounts'), dataIndex: 'total_changed_accounts', render: (value) => value ?? '-' },
            ]}
          />
        </Modal>
        <Modal
          title={invoicePreview?.title}
          open={Boolean(invoicePreview)}
          footer={null}
          width="min(1000px, calc(100vw - 32px))"
          destroyOnHidden
          onCancel={() => setInvoicePreview(null)}
        >
          {invoicePreview && (
            <iframe
              src={invoicePreview.url}
              title={invoicePreview.title}
              style={{ border: 0, height: '70vh', width: '100%' }}
            />
          )}
        </Modal>
      </Modal>
    </PageContainer>
  );
};

export default Customer360Page;
