import {
  CheckCircleFilled,
  ClockCircleFilled,
  ExclamationCircleFilled,
  MoreOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { Line } from '@ant-design/plots';
import { useQuery } from '@tanstack/react-query';
import { createStyles } from 'antd-style';
import { Button, Dropdown, Skeleton, Space, Steps, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { history, useIntl } from '@umijs/max';
import React, { useEffect, useMemo, useState } from 'react';
import type {
  DashboardResponse,
  PendingApproval,
  RecentBillingRun,
  RevenueByMarket,
} from './data';
import {
  queryDashboardSummary,
  queryPendingApprovals,
  queryRecentBillingRuns,
  queryRevenueByMarket,
} from './service';

const { Text } = Typography;

const useStyles = createStyles(({ token }) => ({
  marketGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: token.marginSM,
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    },
  },
  marketCard: {
    cursor: 'pointer',
    borderRadius: token.borderRadius,
    border: `1px solid ${token.colorBorderSecondary}`,
    padding: token.paddingSM,
    background:
      'linear-gradient(120deg, rgba(246,250,255,0.95) 0%, rgba(255,255,255,0.95) 100%)',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: token.colorPrimary,
      boxShadow: token.boxShadowSecondary,
      transform: 'translateY(-1px)',
    },
  },
  marketMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: token.marginXXS,
  },
  architectureWrap: {
    border: `1px dashed ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadius,
    background:
      'linear-gradient(120deg, rgba(248,250,252,0.95) 0%, rgba(240,246,255,0.95) 100%)',
    padding: token.paddingLG,
  },
}));

const STATUS_COLOR_MAP: Record<RecentBillingRun['status'], string> = {
  COMPLETED: 'success',
  IN_PROGRESS: 'processing',
  FAILED: 'error',
};

const URGENCY_COLOR_MAP: Record<PendingApproval['urgency'], string> = {
  HIGH: 'red',
  MEDIUM: 'gold',
  LOW: 'blue',
};

const URGENCY_RANK: Record<PendingApproval['urgency'], number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

const MARKET_STATUS_COLOR_MAP: Record<string, string> = {
  NORMAL: 'green',
  ATTENTION: 'gold',
  ALERT: 'red',
};

const MARKET_FLAGS: Record<string, string> = {
  Singapore: 'SG',
  'Hong Kong': 'HK',
  China: 'CN',
  Japan: 'JP',
  Australia: 'AU',
};

function useAnimatedNumber(value: number, duration = 900) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let startTime = 0;

    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(Math.round(value * progress));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return displayValue;
}

const Dashboard: React.FC = () => {
  const { styles } = useStyles();
  const intl = useIntl();
  const [messageApi, contextHolder] = message.useMessage();

  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  const { isLoading, isFetching, data, refetch } = useQuery<DashboardResponse>({
    queryKey: ['pricing-billing-dashboard'],
    queryFn: async () => {
      const [summary, revenueByMarket, recentBilling, pendingApprovals] =
        await Promise.all([
          queryDashboardSummary(),
          queryRevenueByMarket(),
          queryRecentBillingRuns(),
          queryPendingApprovals(),
        ]);

      return {
        summary,
        revenueByMarket,
        recentBilling,
        pendingApprovals,
      };
    },
  });

  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  const summary = data?.summary;
  const revenueByMarket = data?.revenueByMarket ?? [];
  const recentBilling = data?.recentBilling ?? [];
  const pendingApprovals = useMemo(
    () =>
      [...(data?.pendingApprovals ?? [])].sort(
        (a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency],
      ),
    [data?.pendingApprovals],
  );

  const apacMarkets = useAnimatedNumber(summary?.apacMarkets ?? 0);
  const activeClients = useAnimatedNumber(summary?.activeClients ?? 0);
  const products = useAnimatedNumber(summary?.products ?? 0);
  const monthlyBillingAmount = useAnimatedNumber(summary?.monthlyBillingAmount ?? 0);
  const pendingApprovalsCount = useAnimatedNumber(summary?.pendingApprovals ?? 0);

  const marketCoverage = useMemo(() => {
    const map = new Map<string, RevenueByMarket>();

    revenueByMarket.forEach((item) => {
      map.set(item.market, item);
    });

    return Array.from(map.values());
  }, [revenueByMarket]);

  const lineConfig = useMemo(
    () => ({
      data: revenueByMarket,
      xField: 'date',
      yField: 'amount',
      seriesField: 'market',
      smooth: true,
      legend: { position: 'top' as const },
      xAxis: {
        tickCount: 6,
      },
      yAxis: {
        label: {
          formatter: (value: string) => `${Math.round(Number(value) / 1000)}k`,
        },
      },
      tooltip: {
        formatter: (datum: RevenueByMarket) => ({
          name: datum.market,
          value: `SGD ${datum.amount.toLocaleString('en-US')}`,
        }),
      },
      animation: {
        appear: {
          animation: 'path-in',
          duration: 900,
        },
      },
      colorField: 'market',
    }),
    [revenueByMarket],
  );

  const recentBillingColumns: ProColumns<RecentBillingRun>[] = [
    {
      title: t('pages.dashboard.col.market'),
      dataIndex: 'market',
      width: 120,
    },
    {
      title: t('pages.dashboard.col.billingCycle'),
      dataIndex: 'billingCycle',
      width: 120,
    },
    {
      title: t('pages.dashboard.col.totalAmount'),
      dataIndex: 'totalAmount',
      width: 170,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (_, record) =>
        `SGD ${record.totalAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      title: t('pages.dashboard.col.status'),
      dataIndex: 'status',
      width: 130,
      filters: [
        {
          text: t('pages.dashboard.status.completed'),
          value: 'COMPLETED',
        },
        {
          text: t('pages.dashboard.status.inProgress'),
          value: 'IN_PROGRESS',
        },
        {
          text: t('pages.dashboard.status.failed'),
          value: 'FAILED',
        },
      ],
      onFilter: (value, record) => record.status === value,
      render: (_, record) => {
        const textMap: Record<RecentBillingRun['status'], string> = {
          COMPLETED: t('pages.dashboard.status.completed'),
          IN_PROGRESS: t('pages.dashboard.status.inProgress'),
          FAILED: t('pages.dashboard.status.failed'),
        };

        return <Tag color={STATUS_COLOR_MAP[record.status]}>{textMap[record.status]}</Tag>;
      },
    },
    {
      title: t('pages.dashboard.col.completedAt'),
      dataIndex: 'completedAt',
      width: 180,
      sorter: (a, b) => dayjs(a.completedAt).valueOf() - dayjs(b.completedAt).valueOf(),
      render: (_, record) => dayjs(record.completedAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('pages.dashboard.col.actions'),
      key: 'actions',
      width: 64,
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            label: t('pages.dashboard.action.viewDetails'),
          },
        ];

        if (record.status === 'COMPLETED') {
          items.push({ key: 'rerun', label: t('pages.dashboard.action.rerun') });
        }
        if (record.status === 'IN_PROGRESS') {
          items.push({ key: 'cancel', label: t('pages.dashboard.action.cancel') });
        }
        if (record.status === 'FAILED') {
          items.push({ key: 'retry', label: t('pages.dashboard.action.retry') });
        }

        return (
          <Dropdown
            menu={{
              items,
              onClick: ({ key }) => {
                messageApi.info(`${key.toUpperCase()}: ${record.id}`);
              },
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const pendingApprovalColumns: ProColumns<PendingApproval>[] = [
    {
      title: t('pages.dashboard.col.type'),
      dataIndex: 'type',
      width: 140,
      filters: [
        { text: 'PRICE_CHANGE', value: 'PRICE_CHANGE' },
        { text: 'DEAL', value: 'DEAL' },
        { text: 'WAIVER', value: 'WAIVER' },
      ],
      onFilter: (value, record) => record.type === value,
      render: (_, record) => <Tag>{record.type}</Tag>,
    },
    {
      title: t('pages.dashboard.col.subject'),
      dataIndex: 'subject',
      ellipsis: true,
    },
    {
      title: t('pages.dashboard.col.requestedBy'),
      dataIndex: 'requestedBy',
      width: 130,
    },
    {
      title: t('pages.dashboard.col.urgency'),
      dataIndex: 'urgency',
      width: 120,
      sorter: (a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency],
      render: (_, record) => {
        const textMap: Record<PendingApproval['urgency'], string> = {
          HIGH: t('pages.dashboard.urgency.high'),
          MEDIUM: t('pages.dashboard.urgency.medium'),
          LOW: t('pages.dashboard.urgency.low'),
        };

        return <Tag color={URGENCY_COLOR_MAP[record.urgency]}>{textMap[record.urgency]}</Tag>;
      },
    },
    {
      title: t('pages.dashboard.col.actions'),
      key: 'actions',
      width: 64,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'approve',
                label: t('pages.dashboard.action.approve'),
              },
              {
                key: 'reject',
                label: t('pages.dashboard.action.reject'),
              },
              {
                key: 'info',
                label: t('pages.dashboard.action.requestMoreInfo'),
              },
            ],
            onClick: ({ key }) => {
              messageApi.info(`${key.toUpperCase()}: ${record.id}`);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const exportDashboard = () => {
    if (!data) {
      return;
    }

    const payload = {
      generatedAt: new Date().toISOString(),
      ...data,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pricing-billing-dashboard.json';
    link.click();
    URL.revokeObjectURL(url);

    messageApi.success(t('pages.dashboard.msg.exported'));
  };

  const marketStatusText = (status?: string) => {
    if (status === 'ALERT') {
      return t('pages.dashboard.market.status.alert');
    }
    if (status === 'ATTENTION') {
      return t('pages.dashboard.market.status.attention');
    }
    return t('pages.dashboard.market.status.normal');
  };

  const statItems = [
    {
      title: t('pages.dashboard.stat.markets'),
      value: apacMarkets,
      icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
    },
    {
      title: t('pages.dashboard.stat.clients'),
      value: activeClients,
      icon: <CheckCircleFilled style={{ color: '#1677ff' }} />,
    },
    {
      title: t('pages.dashboard.stat.products'),
      value: products,
      icon: <ClockCircleFilled style={{ color: '#13c2c2' }} />,
    },
    {
      title: t('pages.dashboard.stat.monthlyBilling'),
      value: `SGD ${monthlyBillingAmount.toLocaleString('en-US')}`,
      icon: <CheckCircleFilled style={{ color: '#389e0d' }} />,
    },
    {
      title: t('pages.dashboard.stat.pendingApprovals'),
      value: pendingApprovalsCount,
      icon: <ExclamationCircleFilled style={{ color: '#faad14' }} />,
    },
  ];

  return (
    <PageContainer
      title={t('pages.dashboard.title')}
      subTitle={t('pages.dashboard.subTitle')}
      extra={[
        <Button
          key="refresh"
          icon={<ReloadOutlined spin={isFetching} />}
          onClick={() => refetch()}
        >
          {t('pages.dashboard.refresh')}
        </Button>,
        <Button key="export" onClick={exportDashboard}>
          {t('pages.dashboard.export')}
        </Button>,
      ]}
    >
      {contextHolder}
      {isLoading || !summary ? (
        <Skeleton active paragraph={{ rows: 12 }} />
      ) : (
        <>
          <StatisticCard.Group direction="row">
            {statItems.map((item) => (
              <StatisticCard
                key={item.title}
                statistic={{
                  title: item.title,
                  value: item.value,
                  suffix: item.icon,
                }}
              />
            ))}
          </StatisticCard.Group>

          <ProCard gutter={[16, 16]} style={{ marginTop: 16 }} wrap>
            <ProCard title={t('pages.dashboard.section.marketCoverage')} colSpan={{ xs: 24, xl: 10 }}>
              <div className={styles.marketGrid}>
                {marketCoverage.map((market) => (
                  <Dropdown
                    key={market.market}
                    trigger={['contextMenu']}
                    menu={{
                      items: [
                        {
                          key: 'pricing',
                          label: t('pages.dashboard.quick.pricing'),
                        },
                        {
                          key: 'billing',
                          label: t('pages.dashboard.quick.billing'),
                        },
                        {
                          key: 'tax',
                          label: t('pages.dashboard.quick.tax'),
                        },
                      ],
                      onClick: ({ key }) => {
                        const pathMap: Record<string, string> = {
                          pricing: '/pricing-billing/pricing',
                          billing: '/pricing-billing/billing',
                          tax: '/pricing-billing/regional/tax',
                        };
                        history.push(pathMap[key]);
                      },
                    }}
                  >
                    <button
                      type="button"
                      className={styles.marketCard}
                      onClick={() => history.push('/pricing-billing/regional/tax')}
                      style={{ textAlign: 'left', width: '100%' }}
                    >
                      <div className={styles.marketMeta}>
                        <Space>
                          <Text strong>{MARKET_FLAGS[market.market]}</Text>
                          <Text>{market.market}</Text>
                        </Space>
                        <Tag color={MARKET_STATUS_COLOR_MAP[market.status || 'NORMAL']}>
                          {marketStatusText(market.status)}
                        </Tag>
                      </div>
                      <Text type="secondary">
                        SGD {market.amount.toLocaleString('en-US')} ({market.changePercent}%)
                      </Text>
                    </button>
                  </Dropdown>
                ))}
              </div>
            </ProCard>
            <ProCard
              title={t('pages.dashboard.section.revenueSummary')}
              colSpan={{ xs: 24, xl: 14 }}
            >
              <Line {...lineConfig} height={280} />
            </ProCard>
          </ProCard>

          <ProCard gutter={[16, 16]} style={{ marginTop: 16 }} wrap>
            <ProCard title={t('pages.dashboard.section.recentBilling')} colSpan={{ xs: 24, xl: 12 }}>
              <ProTable<RecentBillingRun>
                rowKey="id"
                search={false}
                options={false}
                pagination={false}
                dataSource={recentBilling}
                columns={recentBillingColumns}
                onRow={(record) => ({
                  onClick: () => history.push(`/pricing-billing/billing/run/${record.id}`),
                })}
                locale={{
                  emptyText: t('pages.dashboard.table.empty'),
                }}
              />
            </ProCard>
            <ProCard
              title={t('pages.dashboard.section.pendingApprovals')}
              colSpan={{ xs: 24, xl: 12 }}
            >
              <ProTable<PendingApproval>
                rowKey="id"
                search={false}
                options={false}
                pagination={false}
                dataSource={pendingApprovals}
                columns={pendingApprovalColumns}
                onRow={(record) => ({
                  onClick: () => history.push(`/pricing-billing/approvals/${record.id}`),
                })}
                locale={{
                  emptyText: t('pages.dashboard.table.empty'),
                }}
              />
            </ProCard>
          </ProCard>

          <ProCard
            title={t('pages.dashboard.section.architecture')}
            style={{ marginTop: 16 }}
            styles={{ body: { padding: 16 } }}
          >
            <div className={styles.architectureWrap}>
              <Steps
                current={100}
                responsive
                items={[
                  {
                    title: (
                      <a onClick={() => history.push('/pricing-billing/pricing')}>
                        {t('pages.dashboard.arch.step.pricing')}
                      </a>
                    ),
                  },
                  {
                    title: (
                      <a onClick={() => history.push('/pricing-billing/billing')}>
                        {t('pages.dashboard.arch.step.billing')}
                      </a>
                    ),
                  },
                  {
                    title: (
                      <a onClick={() => history.push('/pricing-billing/regional/tax')}>
                        {t('pages.dashboard.arch.step.tax')}
                      </a>
                    ),
                  },
                  {
                    title: (
                      <a onClick={() => history.push('/pricing-billing/billing/invoice')}>
                        {t('pages.dashboard.arch.step.invoice')}
                      </a>
                    ),
                  },
                  {
                    title: t('pages.dashboard.arch.step.delivery'),
                  },
                ]}
              />
            </div>
          </ProCard>
        </>
      )}
    </PageContainer>
  );
};

export default Dashboard;
