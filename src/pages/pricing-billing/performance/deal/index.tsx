import {
  AlertOutlined,
  EyeOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormSelect,
  ProFormTextArea,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Button, Drawer, Dropdown, Modal, Space, Tag } from 'antd';
import React, { useState } from 'react';

type DealStatus =
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'UNDER_REVIEW'
  | 'COMPLETED';

type DealRow = {
  id: string;
  client: string;
  market: string;
  rmName: string;
  products: string;
  dealStartDate: string;
  dealEndDate: string;
  committedRevenue: string;
  achievedRevenueYtd: string;
  targetRevenueYtd: string;
  achievementPercent: number;
  projectedYearEndRevenue: string;
  status: DealStatus;
  primaryGapDriver: string;
  reviewRequestedAt?: string;
};

const initialDealRows: DealRow[] = [
  {
    id: 'DEAL-001',
    client: 'ACME Corp',
    market: 'Singapore',
    rmName: 'Avery Chan',
    products: 'Cash Management',
    dealStartDate: '2025-01-15',
    dealEndDate: '2026-12-31',
    committedRevenue: 'SGD 3.2M',
    achievedRevenueYtd: 'SGD 2.6M',
    targetRevenueYtd: 'SGD 3.0M',
    achievementPercent: 86,
    projectedYearEndRevenue: 'SGD 3.5M',
    status: 'EXPIRING_SOON',
    primaryGapDriver: 'Cross-border payment volume below annual baseline',
  },
  {
    id: 'DEAL-014',
    client: 'Northwind Ltd',
    market: 'Hong Kong',
    rmName: 'Liam Tan',
    products: 'Trade Finance',
    dealStartDate: '2025-03-01',
    dealEndDate: '2026-11-30',
    committedRevenue: 'HKD 2.8M',
    achievedRevenueYtd: 'HKD 2.9M',
    targetRevenueYtd: 'HKD 2.5M',
    achievementPercent: 116,
    projectedYearEndRevenue: 'HKD 3.1M',
    status: 'ACTIVE',
    primaryGapDriver: 'No risk signal detected in latest cycle',
  },
  {
    id: 'DEAL-029',
    client: 'Mizuho Japan',
    market: 'Japan',
    rmName: 'Mio Kato',
    products: 'FX Services',
    dealStartDate: '2025-02-10',
    dealEndDate: '2026-12-20',
    committedRevenue: 'JPY 4.5M',
    achievedRevenueYtd: 'JPY 3.1M',
    targetRevenueYtd: 'JPY 3.7M',
    achievementPercent: 84,
    projectedYearEndRevenue: 'JPY 4.0M',
    status: 'UNDER_REVIEW',
    primaryGapDriver: 'FX margin erosion in strategic corridor',
    reviewRequestedAt: '2026-08-08 14:20',
  },
  {
    id: 'DEAL-034',
    client: 'BlueOcean China',
    market: 'China',
    rmName: 'Chen Yu',
    products: 'Trade Finance',
    dealStartDate: '2025-04-12',
    dealEndDate: '2026-09-15',
    committedRevenue: 'CNY 3.9M',
    achievedRevenueYtd: 'CNY 2.8M',
    targetRevenueYtd: 'CNY 3.3M',
    achievementPercent: 85,
    projectedYearEndRevenue: 'CNY 3.6M',
    status: 'EXPIRING_SOON',
    primaryGapDriver: 'Client wallet share shifts to competitor pricing',
  },
];

const statusColors: Record<DealStatus, string> = {
  ACTIVE: 'success',
  EXPIRING_SOON: 'warning',
  EXPIRED: 'default',
  UNDER_REVIEW: 'processing',
  COMPLETED: 'blue',
};

const DealPerformancePage: React.FC = () => {
  const intl = useIntl();
  const { message } = App.useApp();
  const [dealRows, setDealRows] = useState(initialDealRows);
  const [detail, setDetail] = useState<DealRow | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<DealRow | null>(null);

  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  const openReview = (row?: DealRow) => {
    setReviewTarget(row ?? detail ?? dealRows[0]);
    setReviewOpen(true);
  };

  const columns: ProColumns<DealRow>[] = [
    { title: t('pages.performance.deal.col.id'), dataIndex: 'id' },
    { title: t('pages.performance.deal.col.client'), dataIndex: 'client' },
    { title: t('pages.performance.deal.col.market'), dataIndex: 'market' },
    { title: t('pages.performance.deal.col.rmName'), dataIndex: 'rmName' },
    { title: t('pages.performance.deal.col.products'), dataIndex: 'products' },
    {
      title: t('pages.performance.deal.col.dealStartDate'),
      dataIndex: 'dealStartDate',
    },
    {
      title: t('pages.performance.deal.col.dealEndDate'),
      dataIndex: 'dealEndDate',
    },
    {
      title: t('pages.performance.deal.col.committedRevenue'),
      dataIndex: 'committedRevenue',
    },
    {
      title: t('pages.performance.deal.col.achievedRevenueYtd'),
      dataIndex: 'achievedRevenueYtd',
    },
    {
      title: t('pages.performance.deal.col.targetRevenueYtd'),
      dataIndex: 'targetRevenueYtd',
    },
    {
      title: t('pages.performance.deal.col.achievementPercent'),
      dataIndex: 'achievementPercent',
      render: (_, row) => `${row.achievementPercent}%`,
    },
    {
      title: t('pages.performance.deal.col.projectedYearEndRevenue'),
      dataIndex: 'projectedYearEndRevenue',
    },
    {
      title: t('pages.performance.deal.col.status'),
      dataIndex: 'status',
      render: (_, row) => (
        <Tag color={statusColors[row.status]}>
          {t(`pages.performance.deal.status.${row.status.toLowerCase()}`)}
        </Tag>
      ),
    },
    {
      title: t('pages.performance.deal.col.actions'),
      render: (_, row) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: t('pages.performance.deal.action.view'),
                icon: <EyeOutlined />,
                onClick: () => setDetail(row),
              },
              {
                key: 'review',
                label: t('pages.performance.deal.action.requestReview'),
                icon: <AlertOutlined />,
                onClick: () => openReview(row),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const activeDeals = dealRows.filter((item) => item.status === 'ACTIVE').length;
  const expiringDeals = dealRows.filter(
    (item) => item.status === 'EXPIRING_SOON',
  ).length;
  const underReviewDeals = dealRows.filter(
    (item) => item.status === 'UNDER_REVIEW',
  ).length;
  const avgAchievement = Math.round(
    dealRows.reduce((sum, item) => sum + item.achievementPercent, 0) /
      dealRows.length,
  );

  return (
    <PageContainer
      title={t('pages.performance.deal.title')}
      subTitle={t('pages.performance.deal.subTitle')}
      extra={[
        <Button
          key="review"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openReview()}
        >
          {t('pages.performance.deal.action.requestReview')}
        </Button>,
      ]}
    >
      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard
          statistic={{
            title: t('pages.performance.deal.stat.activeDeals'),
            value: activeDeals,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.performance.deal.stat.expiringSoon'),
            value: expiringDeals,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.performance.deal.stat.underReview'),
            value: underReviewDeals,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.performance.deal.stat.avgAchievement'),
            value: `${avgAchievement}%`,
          }}
        />
      </StatisticCard.Group>

      <ProCard>
        <ProTable
          rowKey="id"
          search={false}
          options={false}
          dataSource={dealRows}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </ProCard>

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        width={680}
        title={`${t('pages.performance.deal.drawer.titlePrefix')} ${detail?.id ?? ''}`}
      >
        {detail && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <ProDescriptions
              title={t('pages.performance.deal.drawer.summary')}
              column={2}
              dataSource={detail}
              columns={[
                {
                  title: t('pages.performance.deal.col.client'),
                  dataIndex: 'client',
                },
                {
                  title: t('pages.performance.deal.col.market'),
                  dataIndex: 'market',
                },
                {
                  title: t('pages.performance.deal.col.rmName'),
                  dataIndex: 'rmName',
                },
                {
                  title: t('pages.performance.deal.col.products'),
                  dataIndex: 'products',
                },
                {
                  title: t('pages.performance.deal.col.committedRevenue'),
                  dataIndex: 'committedRevenue',
                },
                {
                  title: t('pages.performance.deal.col.achievedRevenueYtd'),
                  dataIndex: 'achievedRevenueYtd',
                },
                {
                  title: t('pages.performance.deal.col.status'),
                  render: () => (
                    <Tag color={statusColors[detail.status]}>
                      {t(
                        `pages.performance.deal.status.${detail.status.toLowerCase()}`,
                      )}
                    </Tag>
                  ),
                },
              ]}
            />
            <ProCard title={t('pages.performance.deal.drawer.risk')} size="small">
              <p>
                {t('pages.performance.deal.drawer.achievementBand')}:{' '}
                {detail.achievementPercent}%
              </p>
              <p>
                {t('pages.performance.deal.drawer.expiryRisk')}:{' '}
                {detail.status === 'EXPIRING_SOON'
                  ? t('pages.performance.deal.drawer.high')
                  : t('pages.performance.deal.drawer.medium')}
              </p>
              <p>
                {t('pages.performance.deal.drawer.primaryGapDriver')}:{' '}
                {detail.primaryGapDriver}
              </p>
              <p>
                {t('pages.performance.deal.drawer.recommendedAction')}:{' '}
                {detail.status === 'UNDER_REVIEW'
                  ? t('pages.performance.deal.drawer.followUpPricing')
                  : t('pages.performance.deal.drawer.requestReviewAction')}
              </p>
            </ProCard>
          </Space>
        )}
      </Drawer>

      <Modal
        open={reviewOpen}
        onCancel={() => setReviewOpen(false)}
        footer={null}
        title={t('pages.performance.deal.modal.title')}
      >
        <ProForm
          submitter={{
            searchConfig: {
              submitText: t('pages.performance.deal.action.submitReview'),
            },
          }}
          initialValues={{
            reason: t('pages.performance.deal.modal.defaultReason'),
            priority: 'HIGH',
            owner: 'Pricing Ops',
          }}
          onFinish={async () => {
            if (!reviewTarget) {
              return false;
            }
            const reviewAt = new Date()
              .toISOString()
              .slice(0, 16)
              .replace('T', ' ');
            setDealRows((prev) =>
              prev.map((item) =>
                item.id === reviewTarget.id
                  ? {
                      ...item,
                      status: 'UNDER_REVIEW',
                      reviewRequestedAt: reviewAt,
                    }
                  : item,
              ),
            );
            setDetail((prev) =>
              prev && prev.id === reviewTarget.id
                ? { ...prev, status: 'UNDER_REVIEW', reviewRequestedAt: reviewAt }
                : prev,
            );
            setReviewOpen(false);
            message.success(
              t('pages.performance.deal.msg.reviewRequested', {
                id: reviewTarget.id,
              }),
            );
            return true;
          }}
        >
          <ProFormTextArea
            name="reason"
            label={t('pages.performance.deal.modal.reason')}
            fieldProps={{ rows: 4 }}
            rules={[
              {
                required: true,
                message: t('pages.performance.deal.modal.reasonRequired'),
              },
            ]}
          />
          <ProFormSelect
            name="priority"
            label={t('pages.performance.deal.modal.priority')}
            options={[
              { value: 'HIGH', label: t('pages.performance.deal.modal.high') },
              {
                value: 'MEDIUM',
                label: t('pages.performance.deal.modal.medium'),
              },
              { value: 'LOW', label: t('pages.performance.deal.modal.low') },
            ]}
          />
          <ProFormSelect
            name="owner"
            label={t('pages.performance.deal.modal.owner')}
            options={[
              { value: 'Pricing Ops', label: 'Pricing Ops' },
              { value: 'Risk Office', label: 'Risk Office' },
              { value: 'Sales Lead', label: 'Sales Lead' },
            ]}
          />
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default DealPerformancePage;
