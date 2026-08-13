import {
  EyeOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard, ProTable, StatisticCard } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  App,
  Button,
  Col,
  Descriptions,
  Drawer,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import React, { useMemo, useState } from 'react';

const { Text } = Typography;

type SimulationStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED';

type SimulationRecord = {
  id: string;
  client: string;
  market: string;
  products: string;
  discount: string;
  baseRevenue: string;
  adjustedRevenue: string;
  margin: string;
  status: SimulationStatus;
  createdBy: string;
  createdAt: string;
};

const initialSummaries: SimulationRecord[] = [
  {
    id: 'SIM-001',
    client: 'ACME Corp',
    market: 'Singapore',
    products: 'Cash + Trade + FX',
    discount: '-15%',
    baseRevenue: 'SGD 12,500',
    adjustedRevenue: 'SGD 10,625',
    margin: '68%',
    status: 'DRAFT',
    createdBy: 'Avery Chan',
    createdAt: '2026-08-10',
  },
  {
    id: 'SIM-002',
    client: 'Northwind Ltd',
    market: 'Hong Kong',
    products: 'Trade + FX',
    discount: '-10%',
    baseRevenue: 'HKD 8,900',
    adjustedRevenue: 'HKD 8,010',
    margin: '71%',
    status: 'SUBMITTED',
    createdBy: 'Liam Tan',
    createdAt: '2026-08-09',
  },
  {
    id: 'SIM-003',
    client: 'Mizuho Japan',
    market: 'Japan',
    products: 'Cash + FX',
    discount: '-20%',
    baseRevenue: 'JPY 18,200',
    adjustedRevenue: 'JPY 14,560',
    margin: '64%',
    status: 'APPROVED',
    createdBy: 'Mio Kato',
    createdAt: '2026-08-08',
  },
];

const statusColors = { DRAFT: 'default', SUBMITTED: 'processing', APPROVED: 'success' };

const marketCurrencyMap: Record<string, string> = {
  Singapore: 'SGD',
  'Hong Kong': 'HKD',
  China: 'CNY',
  Japan: 'JPY',
  Australia: 'AUD',
};

const productShortMap: Record<string, string> = {
  'Cash Management': 'Cash',
  'Trade Finance': 'Trade',
  'FX Services': 'FX',
};

const formatAmount = (currency: string, amount: number) =>
  `${currency} ${Math.round(amount).toLocaleString('en-US')}`;

const SimulationPage: React.FC = () => {
  const { message } = App.useApp();
  const intl = useIntl();
  const t = (id: string, defaultMessage: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id, defaultMessage }, values);
  const [form] = Form.useForm();
  const [summaries, setSummaries] = useState<SimulationRecord[]>(initialSummaries);
  const [detail, setDetail] = useState<SimulationRecord | null>(null);
  const [result, setResult] = useState<{
    baseRevenue: string;
    adjustedRevenue: string;
    margin: string;
    scenarios: Array<{ label: string; value: string }>;
  }>({
    baseRevenue: 'SGD 12,500',
    adjustedRevenue: 'SGD 10,625',
    margin: '68%',
    scenarios: [
      { label: '-10%', value: 'SGD 11,250' },
      { label: '-15%', value: 'SGD 10,625' },
      { label: '-20%', value: 'SGD 10,000' },
    ],
  });

  const runCurrentSimulation = (values?: {
    client: string;
    market: string;
    products: string[];
    discountPercent: number;
    estimatedTransactions: number;
    expectedDealSize: number;
  }) => {
    const current = values ?? form.getFieldsValue();
    const currency = marketCurrencyMap[current.market] ?? 'SGD';
    const discount = current.discountPercent ?? -15;
    const transactions = current.estimatedTransactions ?? 2400;
    const dealSize = current.expectedDealSize ?? 12500;
    const baseNumber = (transactions / 1000) * dealSize;
    const adjustedNumber = baseNumber * (1 + discount / 100);
    const marginNumber = Math.max(45, Math.min(85, 74 + discount * 0.4));

    const scenarios = [-10, -15, -20].map((value) => ({
      label: `${value}%`,
      value: formatAmount(currency, baseNumber * (1 + value / 100)),
    }));

    const next = {
      baseRevenue: formatAmount(currency, baseNumber),
      adjustedRevenue: formatAmount(currency, adjustedNumber),
      margin: `${marginNumber.toFixed(1)}%`,
      scenarios,
    };

    setResult(next);
    message.success(t('pages.pricing.simulation.msg.ran', 'Simulation completed'));
    return next;
  };

  const appendSimulation = (status: SimulationStatus) => {
    const values = form.getFieldsValue();
    const next = runCurrentSimulation(values);
    const now = new Date();
    const record: SimulationRecord = {
      id: `SIM-${now.getTime()}`,
      client: values.client,
      market: values.market,
      products: (values.products as string[])
        .map((item) => productShortMap[item] ?? item)
        .join(' + '),
      discount: `${values.discountPercent}%`,
      baseRevenue: next.baseRevenue,
      adjustedRevenue: next.adjustedRevenue,
      margin: next.margin,
      status,
      createdBy: 'Current User',
      createdAt: now.toISOString().slice(0, 10),
    };

    setSummaries((prev) => [record, ...prev]);
    message.success(
      status === 'DRAFT'
        ? t('pages.pricing.simulation.msg.saved', 'Saved as draft')
        : t('pages.pricing.simulation.msg.submitted', 'Submitted for approval'),
    );
  };

  const loadSimulation = (record: SimulationRecord) => {
    const products = record.products.split('+').map((item) => item.trim());
    form.setFieldsValue({
      client: record.client,
      market: record.market,
      products: products.map((item) => {
        if (item === 'Cash') return 'Cash Management';
        if (item === 'Trade') return 'Trade Finance';
        if (item === 'FX') return 'FX Services';
        return item;
      }),
      discountPercent: Number(record.discount.replace('%', '')),
    });
    setResult({
      baseRevenue: record.baseRevenue,
      adjustedRevenue: record.adjustedRevenue,
      margin: record.margin,
      scenarios: result.scenarios,
    });
    message.info(t('pages.pricing.simulation.msg.loaded', 'Simulation loaded into setup'));
  };

  const stats = useMemo(() => {
    const draft = summaries.filter((item) => item.status === 'DRAFT').length;
    const submitted = summaries.filter((item) => item.status === 'SUBMITTED').length;
    const discountAvg =
      summaries.reduce((acc, item) => acc + Number(item.discount.replace('%', '')), 0) /
      summaries.length;
    return {
      total: summaries.length,
      draft,
      submitted,
      discountAvg: `${discountAvg.toFixed(1)}%`,
    };
  }, [summaries]);

  return (
    <PageContainer
      title={t('pages.pricing.simulation.title', 'Pricing Simulation')}
      subTitle={t(
        'pages.pricing.simulation.subtitle',
        'Simulate pricing scenarios and assess expected revenue impact',
      )}
      extra={[
        <Button
          key="run"
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={() => runCurrentSimulation()}
        >
          {t('pages.pricing.simulation.action.runSimulation', 'Run Simulation')}
        </Button>,
        <Button key="save" icon={<SaveOutlined />} onClick={() => appendSimulation('DRAFT')}>
          {t('pages.pricing.simulation.action.saveDraft', 'Save Draft')}
        </Button>,
      ]}
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <StatisticCard.Group direction="row">
            <StatisticCard
              statistic={{
                title: t('pages.pricing.simulation.stat.total', 'Total Simulations'),
                value: stats.total,
              }}
            />
            <StatisticCard.Divider />
            <StatisticCard
              statistic={{
                title: t('pages.pricing.simulation.stat.draft', 'Draft Simulations'),
                value: stats.draft,
              }}
            />
            <StatisticCard.Divider />
            <StatisticCard
              statistic={{
                title: t('pages.pricing.simulation.stat.submitted', 'Submitted'),
                value: stats.submitted,
              }}
            />
            <StatisticCard.Divider />
            <StatisticCard
              statistic={{
                title: t('pages.pricing.simulation.stat.averageDiscount', 'Average Discount'),
                value: stats.discountAvg,
              }}
            />
          </StatisticCard.Group>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={10}>
          <ProCard
            title={t('pages.pricing.simulation.section.setup', 'Simulation Setup')}
            style={{ height: '100%' }}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                client: 'ACME Corp',
                market: 'Singapore',
                products: ['Cash Management', 'Trade Finance'],
                discountPercent: -15,
                rebateType: 'Volume Rebate',
                estimatedTransactions: 2400,
                expectedDealSize: 12500,
              }}
            >
              <Form.Item label={t('pages.pricing.simulation.form.client', 'Client')} name="client">
                <Select
                  options={[
                    { value: 'ACME Corp', label: 'ACME Corp' },
                    { value: 'Northwind Ltd', label: 'Northwind Ltd' },
                    { value: 'Mizuho Japan', label: 'Mizuho Japan' },
                  ]}
                />
              </Form.Item>
              <Form.Item label={t('pages.pricing.simulation.form.market', 'Market')} name="market">
                <Select
                  options={[
                    { value: 'Singapore', label: 'Singapore' },
                    { value: 'Hong Kong', label: 'Hong Kong' },
                    { value: 'China', label: 'China' },
                    { value: 'Japan', label: 'Japan' },
                    { value: 'Australia', label: 'Australia' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label={t('pages.pricing.simulation.form.products', 'Products')}
                name="products"
              >
                <Select
                  mode="multiple"
                  options={[
                    { value: 'Cash Management', label: 'Cash Management' },
                    { value: 'Trade Finance', label: 'Trade Finance' },
                    { value: 'FX Services', label: 'FX Services' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label={t('pages.pricing.simulation.form.discountPercent', 'Discount Percent')}
                name="discountPercent"
              >
                <InputNumber min={-30} max={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                label={t('pages.pricing.simulation.form.rebateType', 'Rebate Type')}
                name="rebateType"
              >
                <Select
                  options={[
                    { value: 'Volume Rebate', label: 'Volume Rebate' },
                    { value: 'Instant Discount', label: 'Instant Discount' },
                    { value: 'Waiver', label: 'Waiver' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label={t(
                  'pages.pricing.simulation.form.estimatedTransactions',
                  'Estimated Transactions / Month',
                )}
                name="estimatedTransactions"
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                label={t('pages.pricing.simulation.form.expectedDealSize', 'Expected Deal Size')}
                name="expectedDealSize"
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Space>
                <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => runCurrentSimulation()}>
                  {t('pages.pricing.simulation.action.run', 'Run')}
                </Button>
                <Button icon={<SaveOutlined />} onClick={() => appendSimulation('DRAFT')}>
                  {t('pages.pricing.simulation.action.save', 'Save')}
                </Button>
                <Button icon={<FileTextOutlined />} onClick={() => appendSimulation('SUBMITTED')}>
                  {t('pages.pricing.simulation.action.submit', 'Submit')}
                </Button>
              </Space>
            </Form>
          </ProCard>
        </Col>
        <Col span={14}>
          <ProCard title={t('pages.pricing.simulation.section.results', 'Results')} style={{ height: '100%' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title={t('pages.pricing.simulation.result.baseRevenue', 'Base Revenue')}
                  value={result.baseRevenue}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={t('pages.pricing.simulation.result.adjustedRevenue', 'Adjusted Revenue')}
                  value={result.adjustedRevenue}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={t('pages.pricing.simulation.result.margin', 'Estimated Margin')}
                  value={result.margin}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Text strong>{t('pages.pricing.simulation.result.scenario', 'Scenario Comparison')}</Text>
              <Row gutter={16} style={{ marginTop: 8 }}>
                {result.scenarios.map((item) => (
                  <Col span={8} key={item.label}>
                    <CardMini label={item.label} value={item.value} scenarioLabel={t('pages.pricing.simulation.result.scenarioLabel', 'Scenario')} />
                  </Col>
                ))}
              </Row>
            </div>
          </ProCard>
        </Col>
      </Row>

      <ProCard
        title={t('pages.pricing.simulation.section.history', 'Simulation History')}
        style={{ marginTop: 16 }}
      >
        <ProTable
          rowKey="id"
          dataSource={summaries}
          columns={[
            { title: t('pages.pricing.simulation.col.id', 'Simulation ID'), dataIndex: 'id' },
            { title: t('pages.pricing.simulation.col.client', 'Client'), dataIndex: 'client' },
            { title: t('pages.pricing.simulation.col.market', 'Market'), dataIndex: 'market' },
            { title: t('pages.pricing.simulation.col.products', 'Products'), dataIndex: 'products' },
            { title: t('pages.pricing.simulation.col.discount', 'Discount'), dataIndex: 'discount' },
            {
              title: t('pages.pricing.simulation.col.baseRevenue', 'Base Revenue'),
              dataIndex: 'baseRevenue',
            },
            {
              title: t('pages.pricing.simulation.col.adjustedRevenue', 'Adjusted Revenue'),
              dataIndex: 'adjustedRevenue',
            },
            { title: t('pages.pricing.simulation.col.margin', 'Margin'), dataIndex: 'margin' },
            {
              title: t('pages.pricing.simulation.col.status', 'Status'),
              dataIndex: 'status',
              render: (_: unknown, row: SimulationRecord) => (
                <Tag color={statusColors[row.status]}>{row.status}</Tag>
              ),
            },
            {
              title: t('pages.pricing.simulation.col.createdBy', 'Created By'),
              dataIndex: 'createdBy',
            },
            {
              title: t('pages.pricing.simulation.col.createdAt', 'Created At'),
              dataIndex: 'createdAt',
            },
            {
              title: t('pages.pricing.simulation.col.actions', 'Actions'),
              render: (_: unknown, row: SimulationRecord) => (
                <Space>
                  <Button type="link" onClick={() => setDetail(row)}>
                    {t('pages.pricing.simulation.action.view', 'View')}
                  </Button>
                  <Button type="link" onClick={() => loadSimulation(row)}>
                    {t('pages.pricing.simulation.action.load', 'Load')}
                  </Button>
                  {row.status !== 'SUBMITTED' ? (
                    <Button
                      type="link"
                      onClick={() => {
                        setSummaries((prev) =>
                          prev.map((item) =>
                            item.id === row.id ? { ...item, status: 'SUBMITTED' } : item,
                          ),
                        );
                        message.success(
                          t('pages.pricing.simulation.msg.submitted', 'Submitted for approval'),
                        );
                      }}
                    >
                      {t('pages.pricing.simulation.action.submitApproval', 'Submit for Approval')}
                    </Button>
                  ) : null}
                </Space>
              ),
            },
          ]}
          pagination={{ pageSize: 10 }}
        />
      </ProCard>

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={
          <Space>
            <EyeOutlined /> {detail?.id}
          </Space>
        }
        width={640}
      >
        {detail && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label={t('pages.pricing.simulation.col.client', 'Client')}>
              {detail.client}
            </Descriptions.Item>
            <Descriptions.Item label={t('pages.pricing.simulation.col.market', 'Market')}>
              {detail.market}
            </Descriptions.Item>
            <Descriptions.Item label={t('pages.pricing.simulation.col.products', 'Products')}>
              {detail.products}
            </Descriptions.Item>
            <Descriptions.Item label={t('pages.pricing.simulation.col.discount', 'Discount')}>
              {detail.discount}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('pages.pricing.simulation.col.baseRevenue', 'Base Revenue')}
            >
              {detail.baseRevenue}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('pages.pricing.simulation.col.adjustedRevenue', 'Adjusted Revenue')}
            >
              {detail.adjustedRevenue}
            </Descriptions.Item>
            <Descriptions.Item label={t('pages.pricing.simulation.col.margin', 'Estimated Margin')}>
              {detail.margin}
            </Descriptions.Item>
            <Descriptions.Item label={t('pages.pricing.simulation.col.status', 'Status')}>
              <Tag color={statusColors[detail.status]}>{detail.status}</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </PageContainer>
  );
};

const CardMini: React.FC<{ label: string; value: string; scenarioLabel: string }> = ({
  label,
  value,
  scenarioLabel,
}) => (
  <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 14 }}>
    <Text type="secondary">
      {scenarioLabel} {label}
    </Text>
    <div style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>{value}</div>
  </div>
);

export default SimulationPage;
