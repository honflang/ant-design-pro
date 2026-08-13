import {
  AlertOutlined,
  BarChartOutlined,
  EyeOutlined,
  MoreOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormTextArea,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Button, Drawer, Dropdown, Modal, Space, Tag, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

const { Text } = Typography;

type RevenueStatus = 'ON_TRACK' | 'AT_RISK' | 'UNDER_PERFORMING';
type AlertUrgency = 'HIGH' | 'MEDIUM' | 'LOW';
type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

type RevenueRow = {
  id: string;
  client: string;
  market: string;
  product: string;
  contractedAmount: number;
  actualAmount: number;
  currency: 'SGD' | 'HKD' | 'CNY' | 'JPY' | 'AUD';
  status: RevenueStatus;
  dealId: string;
};

type RevenueAlert = {
  id: string;
  client: string;
  alertType: 'VOLUME_BELOW_TARGET' | 'RATE_BELOW_DEAL' | 'REVENUE_LEAKAGE' | 'DEAL_UNDERPERFORMANCE';
  description: string;
  contractedAmount: number;
  actualAmount: number;
  currency: RevenueRow['currency'];
  urgency: AlertUrgency;
  status: AlertStatus;
  detectedAt: string;
  revenueId: string;
  acknowledgedComment?: string;
};

const initialRevenueRows: RevenueRow[] = [
  {
    id: 'REV-001',
    client: 'ACME Corp',
    market: 'Singapore',
    product: 'Cash Management',
    contractedAmount: 1_250_000,
    actualAmount: 1_110_000,
    currency: 'SGD',
    status: 'AT_RISK',
    dealId: 'DEAL-001',
  },
  {
    id: 'REV-002',
    client: 'Northwind Ltd',
    market: 'Hong Kong',
    product: 'Trade Finance',
    contractedAmount: 980_000,
    actualAmount: 1_040_000,
    currency: 'HKD',
    status: 'ON_TRACK',
    dealId: 'DEAL-014',
  },
  {
    id: 'REV-003',
    client: 'Mizuho Japan',
    market: 'Japan',
    product: 'FX Services',
    contractedAmount: 1_640_000,
    actualAmount: 1_420_000,
    currency: 'JPY',
    status: 'AT_RISK',
    dealId: 'DEAL-029',
  },
  {
    id: 'REV-004',
    client: 'BlueOcean China',
    market: 'China',
    product: 'Trade Finance',
    contractedAmount: 860_000,
    actualAmount: 780_000,
    currency: 'CNY',
    status: 'UNDER_PERFORMING',
    dealId: 'DEAL-034',
  },
  {
    id: 'REV-005',
    client: 'Koala Mining AU',
    market: 'Australia',
    product: 'Cash Management',
    contractedAmount: 720_000,
    actualAmount: 745_000,
    currency: 'AUD',
    status: 'ON_TRACK',
    dealId: 'DEAL-041',
  },
];

const initialAlerts: RevenueAlert[] = [
  {
    id: 'ALERT-1001',
    client: 'ACME Corp',
    alertType: 'REVENUE_LEAKAGE',
    description: 'FX spread below target in SG cash flows',
    contractedAmount: 1_250_000,
    actualAmount: 1_110_000,
    currency: 'SGD',
    urgency: 'HIGH',
    status: 'OPEN',
    detectedAt: '2026-08-11',
    revenueId: 'REV-001',
  },
  {
    id: 'ALERT-1002',
    client: 'Mizuho Japan',
    alertType: 'DEAL_UNDERPERFORMANCE',
    description: 'Actual volume misses committed floor in JP corridor',
    contractedAmount: 1_640_000,
    actualAmount: 1_420_000,
    currency: 'JPY',
    urgency: 'MEDIUM',
    status: 'OPEN',
    detectedAt: '2026-08-10',
    revenueId: 'REV-003',
  },
  {
    id: 'ALERT-1007',
    client: 'Northwind Ltd',
    alertType: 'VOLUME_BELOW_TARGET',
    description: 'Volume uplift exceeded planned threshold',
    contractedAmount: 980_000,
    actualAmount: 1_040_000,
    currency: 'HKD',
    urgency: 'LOW',
    status: 'ACKNOWLEDGED',
    detectedAt: '2026-08-10',
    revenueId: 'REV-002',
    acknowledgedComment: 'Observed healthy upside and no control issue.',
  },
];

const statusColors = {
  ON_TRACK: 'success',
  AT_RISK: 'warning',
  UNDER_PERFORMING: 'error',
};

const urgencyColors = {
  HIGH: 'red',
  MEDIUM: 'orange',
  LOW: 'green',
};

const RevenueTrackingPage: React.FC = () => {
  const intl = useIntl();
  const { message } = App.useApp();
  const [revenueRows] = useState(initialRevenueRows);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [detail, setDetail] = useState<RevenueRow | null>(null);
  const [acknowledgeTarget, setAcknowledgeTarget] = useState<RevenueAlert | null>(null);
  const [acknowledgeOpen, setAcknowledgeOpen] = useState(false);

  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  const formatCurrency = (value: number, currency: RevenueRow['currency']) =>
    `${currency} ${value.toLocaleString('en-US')}`;

  const openAcknowledgeModal = (alert: RevenueAlert) => {
    setAcknowledgeTarget(alert);
    setAcknowledgeOpen(true);
  };

  const relatedAlerts = useMemo(
    () => alerts.filter((alert) => alert.revenueId === detail?.id),
    [alerts, detail?.id],
  );

  const activeAlerts = alerts.filter((alert) => alert.status === 'OPEN').length;

  const estimatedLeakage = useMemo(
    () =>
      alerts
        .filter((alert) => alert.status !== 'RESOLVED')
        .reduce(
          (sum, alert) =>
            sum + Math.max(alert.contractedAmount - alert.actualAmount, 0),
          0,
        ),
    [alerts],
  );

  const achievementPercent = useMemo(() => {
    const totalContracted = revenueRows.reduce((sum, item) => sum + item.contractedAmount, 0);
    const totalActual = revenueRows.reduce((sum, item) => sum + item.actualAmount, 0);
    if (totalContracted === 0) {
      return 0;
    }
    return Math.round((totalActual / totalContracted) * 1000) / 10;
  }, [revenueRows]);

  const revenueColumns: ProColumns<RevenueRow>[] = [
    { title: t('pages.performance.revenue.col.client'), dataIndex: 'client' },
    { title: t('pages.performance.revenue.col.market'), dataIndex: 'market' },
    { title: t('pages.performance.revenue.col.product'), dataIndex: 'product' },
    {
      title: t('pages.performance.revenue.col.contractedAmount'),
      dataIndex: 'contractedAmount',
      render: (_, row) => formatCurrency(row.contractedAmount, row.currency),
    },
    {
      title: t('pages.performance.revenue.col.actualAmount'),
      dataIndex: 'actualAmount',
      render: (_, row) => formatCurrency(row.actualAmount, row.currency),
    },
    {
      title: t('pages.performance.revenue.col.varianceAmount'),
      dataIndex: 'varianceAmount',
      render: (_, row) => {
        const variance = row.actualAmount - row.contractedAmount;
        return formatCurrency(variance, row.currency);
      },
    },
    {
      title: t('pages.performance.revenue.col.variancePercent'),
      dataIndex: 'variancePercent',
      render: (_, row) => `${(((row.actualAmount - row.contractedAmount) / row.contractedAmount) * 100).toFixed(1)}%`,
    },
    { title: t('pages.performance.revenue.col.currency'), dataIndex: 'currency' },
    {
      title: t('pages.performance.revenue.col.performanceStatus'),
      dataIndex: 'status',
      render: (_, row) => (
        <Tag color={statusColors[row.status]}>{t(`pages.performance.revenue.status.${row.status.toLowerCase()}`)}</Tag>
      ),
    },
    { title: t('pages.performance.revenue.col.dealId'), dataIndex: 'dealId' },
    {
      title: t('pages.performance.revenue.col.actions'),
      render: (_, row) => {
        const primaryAlert = alerts.find((alert) => alert.revenueId === row.id && alert.status === 'OPEN');
        return (
          <Dropdown
            menu={{
              items: [
                { key: 'view', label: t('pages.performance.revenue.action.view'), icon: <EyeOutlined />, onClick: () => setDetail(row) },
                {
                  key: 'ack',
                  label: t('pages.performance.revenue.action.acknowledge'),
                  icon: <AlertOutlined />,
                  onClick: () => {
                    if (primaryAlert) {
                      openAcknowledgeModal(primaryAlert);
                      return;
                    }
                    message.info(t('pages.performance.revenue.msg.noOpenAlert'));
                  },
                },
              ],
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const alertColumns: ProColumns<RevenueAlert>[] = [
    { title: t('pages.performance.revenue.alertCol.id'), dataIndex: 'id' },
    { title: t('pages.performance.revenue.alertCol.client'), dataIndex: 'client' },
    { title: t('pages.performance.revenue.alertCol.type'), dataIndex: 'alertType' },
    { title: t('pages.performance.revenue.alertCol.description'), dataIndex: 'description' },
    {
      title: t('pages.performance.revenue.alertCol.contracted'),
      dataIndex: 'contractedAmount',
      render: (_, row) => formatCurrency(row.contractedAmount, row.currency),
    },
    {
      title: t('pages.performance.revenue.alertCol.actual'),
      dataIndex: 'actualAmount',
      render: (_, row) => formatCurrency(row.actualAmount, row.currency),
    },
    {
      title: t('pages.performance.revenue.alertCol.variance'),
      dataIndex: 'variance',
      render: (_, row) => formatCurrency(row.actualAmount - row.contractedAmount, row.currency),
    },
    {
      title: t('pages.performance.revenue.alertCol.urgency'),
      dataIndex: 'urgency',
      render: (_, row) => <Tag color={urgencyColors[row.urgency]}>{row.urgency}</Tag>,
    },
    { title: t('pages.performance.revenue.alertCol.status'), dataIndex: 'status' },
    { title: t('pages.performance.revenue.alertCol.detectedAt'), dataIndex: 'detectedAt' },
    {
      title: t('pages.performance.revenue.alertCol.actions'),
      render: (_, row) => (
        <Space size={4}>
          <Button
            type="link"
            onClick={() => {
              const target = revenueRows.find((item) => item.id === row.revenueId);
              if (target) {
                setDetail(target);
              }
            }}
          >
            {t('pages.performance.revenue.action.view')}
          </Button>
          <Button
            type="link"
            disabled={row.status !== 'OPEN'}
            onClick={() => openAcknowledgeModal(row)}
          >
            {t('pages.performance.revenue.action.acknowledge')}
          </Button>
          <Button
            type="link"
            disabled={row.status === 'RESOLVED'}
            onClick={() => {
              setAlerts((prev) =>
                prev.map((item) =>
                  item.id === row.id ? { ...item, status: 'RESOLVED' } : item,
                ),
              );
              message.success(t('pages.performance.revenue.msg.resolved', { id: row.id }));
            }}
          >
            {t('pages.performance.revenue.action.resolve')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title={t('pages.performance.revenue.title')}
      subTitle={t('pages.performance.revenue.subTitle')}
      extra={[
        <Button
          key="analysis"
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={() => message.success(t('pages.performance.revenue.msg.analysisCompleted'))}
        >
          {t('pages.performance.revenue.action.runAnalysis')}
        </Button>,
      ]}
    >
      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard statistic={{ title: t('pages.performance.revenue.stat.mtdRevenue'), value: 'SGD 9.4M' }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.performance.revenue.stat.vsLastMonth'), value: '+8.2%' }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.performance.revenue.stat.activeAlerts'), value: activeAlerts }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.performance.revenue.stat.estimatedLeakage'), value: `SGD ${Math.round(estimatedLeakage / 1000)}k` }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.performance.revenue.stat.dealAchievement'), value: `${achievementPercent}%` }} />
      </StatisticCard.Group>

      <ProCard style={{ marginBottom: 16 }}>
        <Space wrap>
          <Tag icon={<BarChartOutlined />} color="blue">{t('pages.performance.revenue.tag.market')}</Tag>
          <Tag icon={<AlertOutlined />} color="orange">{t('pages.performance.revenue.tag.leakage')}</Tag>
        </Space>
      </ProCard>

      <ProCard title={t('pages.performance.revenue.section.alerts')} style={{ marginBottom: 16 }}>
        <ProTable
          rowKey="id"
          search={false}
          options={false}
          dataSource={alerts}
          columns={alertColumns}
          pagination={{ pageSize: 10 }}
        />
      </ProCard>

      <ProCard title={t('pages.performance.revenue.section.performance')}>
        <ProTable
          rowKey="id"
          search={false}
          options={false}
          dataSource={revenueRows}
          columns={revenueColumns}
          pagination={{ pageSize: 10 }}
        />
      </ProCard>

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        width={680}
        title={
          <Space>
            <EyeOutlined /> {detail?.dealId}
          </Space>
        }
      >
        {detail && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <ProDescriptions
              title={t('pages.performance.revenue.drawer.overview')}
              column={2}
              dataSource={detail}
              columns={[
                { title: t('pages.performance.revenue.col.client'), dataIndex: 'client' },
                { title: t('pages.performance.revenue.col.market'), dataIndex: 'market' },
                { title: t('pages.performance.revenue.col.product'), dataIndex: 'product' },
                { title: t('pages.performance.revenue.col.dealId'), dataIndex: 'dealId' },
                {
                  title: t('pages.performance.revenue.col.contractedAmount'),
                  render: () => formatCurrency(detail.contractedAmount, detail.currency),
                },
                {
                  title: t('pages.performance.revenue.col.actualAmount'),
                  render: () => formatCurrency(detail.actualAmount, detail.currency),
                },
              ]}
            />
            <ProCard title={t('pages.performance.revenue.drawer.leakage')} size="small">
              <Text>{t('pages.performance.revenue.drawer.expected')}: {formatCurrency(detail.contractedAmount, detail.currency)}</Text>
              <br />
              <Text>{t('pages.performance.revenue.drawer.actual')}: {formatCurrency(detail.actualAmount, detail.currency)}</Text>
              <br />
              <Text>
                {t('pages.performance.revenue.drawer.estimated')}: {formatCurrency(Math.max(detail.contractedAmount - detail.actualAmount, 0), detail.currency)}
              </Text>
              <br />
              <Text type="secondary">{t('pages.performance.revenue.drawer.drivers')}</Text>
            </ProCard>
            <ProCard title={t('pages.performance.revenue.drawer.relatedAlerts')} size="small">
              {relatedAlerts.length === 0 ? (
                <Text type="secondary">{t('pages.performance.revenue.msg.noRelatedAlerts')}</Text>
              ) : (
                relatedAlerts.map((alert) => (
                  <div key={alert.id} style={{ marginBottom: 8 }}>
                    <Tag color={urgencyColors[alert.urgency]}>{alert.urgency}</Tag>
                    <Text strong>{alert.id}</Text>
                    <Text type="secondary"> - {alert.description}</Text>
                  </div>
                ))
              )}
            </ProCard>
          </Space>
        )}
      </Drawer>

      <Modal
        title={t('pages.performance.revenue.modal.ackTitle')}
        open={acknowledgeOpen}
        footer={null}
        onCancel={() => {
          setAcknowledgeOpen(false);
          setAcknowledgeTarget(null);
        }}
      >
        <ProForm
          submitter={{
            searchConfig: {
              submitText: t('pages.performance.revenue.action.acknowledge'),
            },
          }}
          onFinish={async (values) => {
            if (!acknowledgeTarget) {
              return false;
            }
            setAlerts((prev) =>
              prev.map((alert) =>
                alert.id === acknowledgeTarget.id
                  ? {
                      ...alert,
                      status: 'ACKNOWLEDGED',
                      acknowledgedComment: values.comment,
                    }
                  : alert,
              ),
            );
            setAcknowledgeOpen(false);
            setAcknowledgeTarget(null);
            message.success(
              t('pages.performance.revenue.msg.acknowledged', {
                id: acknowledgeTarget.id,
              }),
            );
            return true;
          }}
        >
          <ProFormTextArea
            name="comment"
            label={t('pages.performance.revenue.modal.comment')}
            fieldProps={{ rows: 4 }}
            rules={[{ required: true, message: t('pages.performance.revenue.modal.commentRequired') }]}
          />
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default RevenueTrackingPage;
