import { EyeOutlined, MoreOutlined, UserOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProCard, ProDescriptions, ProForm, ProFormTextArea, ProTable, StatisticCard } from '@ant-design/pro-components';
import { history, useIntl } from '@umijs/max';
import { App, Button, Drawer, Dropdown, Space, Tag, Typography } from 'antd';
import React, { useState } from 'react';

const { Text } = Typography;

type PerformanceStatus = 'ON_TRACK' | 'AT_RISK' | 'UNDER_PERFORMING';

type ClientRecord = {
  id: string;
  name: string;
  market: string;
  segment: string;
  rmName: string;
  mtdRevenue: string;
  ytdRevenue: string;
  activeDeals: number;
  productCount: number;
  outstandingInvoices: number;
  status: PerformanceStatus;
};

type RecommendationStatus = 'PENDING' | 'ACCEPTED' | 'IGNORED';

type Recommendation = {
  id: string;
  type: string;
  potentialBenefit: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  rationale: string;
  status: RecommendationStatus;
};

const clients: ClientRecord[] = [
  { id: 'CUST-001', name: 'ACME Corp', market: 'Singapore', segment: 'Corporate', rmName: 'Avery Chan', mtdRevenue: 'SGD 1.2M', ytdRevenue: 'SGD 8.8M', activeDeals: 4, productCount: 3, outstandingInvoices: 2, status: 'ON_TRACK' },
  { id: 'CUST-002', name: 'Northwind Ltd', market: 'Hong Kong', segment: 'Financial Institution', rmName: 'Liam Tan', mtdRevenue: 'HKD 0.9M', ytdRevenue: 'HKD 7.2M', activeDeals: 2, productCount: 2, outstandingInvoices: 1, status: 'AT_RISK' },
  { id: 'CUST-003', name: 'Mizuho Japan', market: 'Japan', segment: 'Corporate', rmName: 'Mio Kato', mtdRevenue: 'JPY 1.6M', ytdRevenue: 'JPY 10.5M', activeDeals: 5, productCount: 4, outstandingInvoices: 3, status: 'UNDER_PERFORMING' },
  { id: 'CUST-004', name: 'BlueOcean China', market: 'China', segment: 'Corporate', rmName: 'Chen Yu', mtdRevenue: 'CNY 1.1M', ytdRevenue: 'CNY 6.9M', activeDeals: 3, productCount: 4, outstandingInvoices: 1, status: 'ON_TRACK' },
  { id: 'CUST-005', name: 'Koala Mining AU', market: 'Australia', segment: 'SME', rmName: 'Noah Carter', mtdRevenue: 'AUD 0.5M', ytdRevenue: 'AUD 3.6M', activeDeals: 2, productCount: 2, outstandingInvoices: 2, status: 'AT_RISK' },
];

const statusColors = {
  ON_TRACK: 'success',
  AT_RISK: 'warning',
  UNDER_PERFORMING: 'error',
};

const Customer360Page: React.FC = () => {
  const intl = useIntl();
  const { message } = App.useApp();
  const [detail, setDetail] = useState<ClientRecord | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: 'REC-001',
      type: 'Bundle cross-border payment with FX corridor package',
      potentialBenefit: 'SGD 180k incremental annual revenue',
      priority: 'HIGH',
      rationale: 'Client has stable treasury volume and open pricing headroom',
      status: 'PENDING',
    },
    {
      id: 'REC-002',
      type: 'Move account service tier from P4 to P3 with usage covenant',
      potentialBenefit: 'Reduce leakage by SGD 65k',
      priority: 'MEDIUM',
      rationale: 'Current discount outpaces wallet growth in latest two cycles',
      status: 'PENDING',
    },
  ]);

  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  const pricingRows = [
    {
      product: 'Cash Management',
      baseRate: '0.18%',
      appliedRate: '0.15%',
      adjustment: '-0.03%',
      scope: 'Client Group P3',
      pricePoint: 'PB-SG-CASH-018',
      pricingRule: 'PR-SG-CASH-042',
    },
    {
      product: 'FX Services',
      baseRate: '0.12%',
      appliedRate: '0.10%',
      adjustment: '-0.02%',
      scope: 'Deal Specific',
      pricePoint: 'PB-SG-FX-012',
      pricingRule: 'PR-SG-FX-099',
    },
  ];

  const invoiceRows = [
    { id: 'INV-2026-0811', period: '2026-07', amount: 'SGD 412,000', status: 'ISSUED' },
    { id: 'INV-2026-0806', period: '2026-06', amount: 'SGD 395,000', status: 'PAID' },
  ];

  const alertRows = [
    { id: 'ALERT-1001', type: 'REVENUE_LEAKAGE', severity: 'HIGH', message: 'FX spread below expected band in SG corridor' },
    { id: 'ALERT-1005', type: 'INVOICE_DELAY', severity: 'MEDIUM', message: 'One invoice pending acknowledgement over SLA' },
  ];

  const columns: ProColumns<ClientRecord>[] = [
    { title: t('pages.customer.360.col.id'), dataIndex: 'id' },
    { title: t('pages.customer.360.col.name'), dataIndex: 'name' },
    { title: t('pages.customer.360.col.market'), dataIndex: 'market' },
    { title: t('pages.customer.360.col.segment'), dataIndex: 'segment' },
    { title: t('pages.customer.360.col.rmName'), dataIndex: 'rmName' },
    { title: t('pages.customer.360.col.mtdRevenue'), dataIndex: 'mtdRevenue' },
    { title: t('pages.customer.360.col.ytdRevenue'), dataIndex: 'ytdRevenue' },
    { title: t('pages.customer.360.col.activeDeals'), dataIndex: 'activeDeals' },
    { title: t('pages.customer.360.col.productCount'), dataIndex: 'productCount' },
    { title: t('pages.customer.360.col.outstandingInvoices'), dataIndex: 'outstandingInvoices' },
    {
      title: t('pages.customer.360.col.status'),
      dataIndex: 'status',
      render: (_, row) => <Tag color={statusColors[row.status]}>{t(`pages.customer.360.status.${row.status.toLowerCase()}`)}</Tag>,
    },
    {
      title: t('pages.customer.360.col.actions'),
      render: (_, row) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: t('pages.customer.360.action.view360'), icon: <EyeOutlined />, onClick: () => setDetail(row) },
              {
                key: 'price',
                label: t('pages.customer.360.action.viewPriceBook'),
                icon: <MoreOutlined />,
                onClick: () => history.push('/pricing-billing/pricing/price-book'),
              },
              {
                key: 'rule',
                label: t('pages.customer.360.action.viewPricingRule'),
                icon: <MoreOutlined />,
                onClick: () => history.push('/pricing-billing/pricing/rules'),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const atRiskClients = clients.filter((item) => item.status !== 'ON_TRACK').length;

  return (
    <PageContainer
      title={t('pages.customer.360.title')}
      subTitle={t('pages.customer.360.subTitle')}
      extra={[
        <Button key="view" type="primary" icon={<UserOutlined />} onClick={() => message.info(t('pages.customer.360.msg.overviewOpened'))}>
          {t('pages.customer.360.action.overview')}
        </Button>,
      ]}
    >
      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard statistic={{ title: t('pages.customer.360.stat.totalClients'), value: clients.length }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.customer.360.stat.atRiskClients'), value: atRiskClients }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.customer.360.stat.mtdRevenue'), value: 'SGD 45.3M' }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.customer.360.stat.outstandingInvoices'), value: 21 }} />
      </StatisticCard.Group>

      <ProCard>
        <ProTable
          rowKey="id"
          search={false}
          options={false}
          dataSource={clients}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </ProCard>

      <Drawer open={!!detail} onClose={() => setDetail(null)} width={680} title={`${detail?.name ?? ''} 360`}>
        {detail && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <StatisticCard.Group direction="row">
              <StatisticCard statistic={{ title: t('pages.customer.360.detail.kpi.mtdRevenue'), value: detail.mtdRevenue }} />
              <StatisticCard.Divider />
              <StatisticCard statistic={{ title: t('pages.customer.360.detail.kpi.ytdRevenue'), value: detail.ytdRevenue }} />
              <StatisticCard.Divider />
              <StatisticCard statistic={{ title: t('pages.customer.360.detail.kpi.activeDeals'), value: detail.activeDeals }} />
              <StatisticCard.Divider />
              <StatisticCard statistic={{ title: t('pages.customer.360.detail.kpi.products'), value: detail.productCount }} />
            </StatisticCard.Group>

            <ProDescriptions
              title={t('pages.customer.360.detail.profile')}
              column={2}
              dataSource={detail}
              columns={[
                { title: t('pages.customer.360.col.name'), dataIndex: 'name' },
                { title: t('pages.customer.360.col.market'), dataIndex: 'market' },
                { title: t('pages.customer.360.col.segment'), dataIndex: 'segment' },
                { title: t('pages.customer.360.col.rmName'), dataIndex: 'rmName' },
                {
                  title: t('pages.customer.360.col.status'),
                  render: () => <Tag color={statusColors[detail.status]}>{t(`pages.customer.360.status.${detail.status.toLowerCase()}`)}</Tag>,
                },
              ]}
            />

            <ProCard title={t('pages.customer.360.detail.pricing')} size="small">
              <ProTable
                rowKey="pricePoint"
                search={false}
                options={false}
                dataSource={pricingRows}
                pagination={false}
                columns={[
                  { title: t('pages.customer.360.pricing.product'), dataIndex: 'product' },
                  { title: t('pages.customer.360.pricing.baseRate'), dataIndex: 'baseRate' },
                  { title: t('pages.customer.360.pricing.appliedRate'), dataIndex: 'appliedRate' },
                  { title: t('pages.customer.360.pricing.adjustment'), dataIndex: 'adjustment' },
                  { title: t('pages.customer.360.pricing.scope'), dataIndex: 'scope' },
                  { title: t('pages.customer.360.pricing.pricePoint'), dataIndex: 'pricePoint' },
                  { title: t('pages.customer.360.pricing.pricingRule'), dataIndex: 'pricingRule' },
                ]}
              />
            </ProCard>

            <ProCard title={t('pages.customer.360.detail.invoices')} size="small">
              {invoiceRows.map((item) => (
                <div key={item.id} style={{ marginBottom: 8 }}>
                  <Text strong>{item.id}</Text>
                  <Text type="secondary"> · {item.period} · {item.amount} · {item.status}</Text>
                </div>
              ))}
            </ProCard>

            <ProCard title={t('pages.customer.360.detail.alerts')} size="small">
              {alertRows.map((item) => (
                <div key={item.id} style={{ marginBottom: 8 }}>
                  <Tag color={item.severity === 'HIGH' ? 'red' : 'gold'}>{item.severity}</Tag>
                  <Text strong>{item.id}</Text>
                  <Text type="secondary"> - {item.message}</Text>
                </div>
              ))}
            </ProCard>

            <ProCard title={t('pages.customer.360.detail.recommendation')} size="small">
              {recommendations.map((item) => (
                <div key={item.id} style={{ marginBottom: 12 }}>
                  <div>
                    <Text strong>{item.type}</Text>
                    <Tag style={{ marginInlineStart: 8 }} color={item.priority === 'HIGH' ? 'red' : item.priority === 'MEDIUM' ? 'orange' : 'blue'}>
                      {item.priority}
                    </Tag>
                    <Tag style={{ marginInlineStart: 8 }}>{item.status}</Tag>
                  </div>
                  <Text type="secondary">{item.potentialBenefit}</Text>
                  <br />
                  <Text type="secondary">{item.rationale}</Text>
                  <div>
                    <Button
                      type="link"
                      onClick={() => {
                        setRecommendations((prev) =>
                          prev.map((rec) => (rec.id === item.id ? { ...rec, status: 'ACCEPTED' } : rec)),
                        );
                        message.success(t('pages.customer.360.msg.recommendationAccepted', { id: item.id }));
                      }}
                    >
                      {t('pages.customer.360.action.accept')}
                    </Button>
                    <Button
                      type="link"
                      onClick={() => {
                        setRecommendations((prev) =>
                          prev.map((rec) => (rec.id === item.id ? { ...rec, status: 'IGNORED' } : rec)),
                        );
                        message.info(t('pages.customer.360.msg.recommendationIgnored', { id: item.id }));
                      }}
                    >
                      {t('pages.customer.360.action.ignore')}
                    </Button>
                  </div>
                </div>
              ))}
            </ProCard>

            <ProCard title={t('pages.customer.360.detail.relationshipNote')} size="small">
              <ProForm
                submitter={{ searchConfig: { submitText: t('pages.customer.360.action.addNote') } }}
                onFinish={async () => {
                  message.success(t('pages.customer.360.msg.noteAdded'));
                  return true;
                }}
              >
                <ProFormTextArea
                  name="note"
                  rules={[{ required: true, message: t('pages.customer.360.msg.noteRequired') }]}
                  fieldProps={{ rows: 3 }}
                />
              </ProForm>
            </ProCard>
          </Space>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default Customer360Page;
