import { DollarCircleOutlined, EyeOutlined, MoreOutlined, PlayCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { PageContainer, ProCard, ProTable, StatisticCard } from '@ant-design/pro-components';
import { history, useIntl } from '@umijs/max';
import { App, Button, Drawer, Dropdown, Form, Input, Modal, Select, Space, Tag, Typography } from 'antd';
import React, { useState } from 'react';

const { Text } = Typography;

type RunStatus = 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'RECALCULATION';

type RunRecord = {
  id: string;
  market: string;
  billingPeriod: string;
  runType: string;
  totalClients: number;
  totalAmount: string;
  currency: string;
  status: RunStatus;
  startedAt: string;
  completedAt: string;
  createdBy: string;
};

const initialRuns: RunRecord[] = [
  { id: 'RUN-2026-08-001', market: 'Singapore', billingPeriod: '2026-08', runType: 'Regular', totalClients: 18, totalAmount: 'SGD 456,200', currency: 'SGD', status: 'COMPLETED', startedAt: '2026-08-11 09:00', completedAt: '2026-08-11 10:12', createdBy: 'Liam Tan' },
  { id: 'RUN-2026-08-002', market: 'Hong Kong', billingPeriod: '2026-08', runType: 'Backdated', totalClients: 12, totalAmount: 'SGD 398,300', currency: 'SGD', status: 'IN_PROGRESS', startedAt: '2026-08-11 08:40', completedAt: '-', createdBy: 'Avery Chan' },
  { id: 'RUN-2026-08-003', market: 'China', billingPeriod: '2026-08', runType: 'Recalculation', totalClients: 10, totalAmount: 'SGD 371,100', currency: 'SGD', status: 'FAILED', startedAt: '2026-08-10 16:15', completedAt: '2026-08-10 17:03', createdBy: 'Chen Yu' },
];

const statusColors = { COMPLETED: 'success', IN_PROGRESS: 'processing', FAILED: 'error', RECALCULATION: 'warning' };

const BillingRunPage: React.FC = () => {
  const { message } = App.useApp();
  const intl = useIntl();
  const t = (id: string, defaultMessage: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id, defaultMessage }, values);
  const [createForm] = Form.useForm();
  const [recalcForm] = Form.useForm();
  const [runs, setRuns] = useState<RunRecord[]>(initialRuns);
  const [detail, setDetail] = useState<RunRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [recalcOpen, setRecalcOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<RunRecord | null>(null);

  const triggerRun = async () => {
    const values = await createForm.validateFields();
    const now = new Date();
    const id = `RUN-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${Date.now()}`;
    const record: RunRecord = {
      id,
      market: values.market,
      billingPeriod: values.billingPeriod,
      runType: values.runType,
      totalClients: Math.floor(8 + Math.random() * 12),
      totalAmount: `SGD ${Math.round(180000 + Math.random() * 350000).toLocaleString('en-US')}`,
      currency: 'SGD',
      status: 'IN_PROGRESS',
      startedAt: now.toISOString().slice(0, 16).replace('T', ' '),
      completedAt: '-',
      createdBy: 'Current User',
    };
    setRuns((prev) => [record, ...prev]);
    setCreateOpen(false);
    message.success(t('pages.billing.run.msg.triggered', 'Billing run triggered'));
  };

  const recalcRun = async () => {
    const values = await recalcForm.validateFields();
    if (!selectedRun) return;

    setRuns((prev) =>
      prev.map((item) =>
        item.id === selectedRun.id
          ? {
              ...item,
              runType: 'Recalculation',
              status: 'RECALCULATION',
              completedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          : item,
      ),
    );
    message.success(
      t('pages.billing.run.msg.recalculated', 'Recalculation completed: {reason}', {
        reason: values.reason,
      }),
    ); 
    setRecalcOpen(false);
  };

  const completedCount = runs.filter((item) => item.status === 'COMPLETED').length;
  const inProgressCount = runs.filter((item) => item.status === 'IN_PROGRESS').length;
  const monthAmount = runs.reduce((acc, item) => {
    const value = Number(item.totalAmount.replace(/[^\d.]/g, ''));
    return acc + (Number.isNaN(value) ? 0 : value);
  }, 0);

  return (
    <PageContainer
      title={t('pages.billing.run.title', 'Billing Run')}
      subTitle={t('pages.billing.run.subtitle', 'Execute and monitor billing runs across markets')}
      extra={[
        <Button key="trigger" type="primary" icon={<PlayCircleOutlined />} onClick={() => setCreateOpen(true)}>
          {t('pages.billing.run.action.trigger', 'Trigger New Run')}
        </Button>,
        <Button
          key="recalc"
          icon={<SyncOutlined />}
          onClick={() => {
            setSelectedRun(runs[0] ?? null);
            recalcForm.setFieldsValue({ runId: runs[0]?.id });
            setRecalcOpen(true);
          }}
        >
          {t('pages.billing.run.action.recalculate', 'Recalculate')}
        </Button>,
      ]}
    >
      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard
          statistic={{ title: t('pages.billing.run.stat.total', 'Total Runs'), value: runs.length }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{ title: t('pages.billing.run.stat.completed', 'Completed'), value: completedCount }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.billing.run.stat.inProgress', 'In Progress'),
            value: inProgressCount,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.billing.run.stat.monthlyAmount', 'Monthly Amount'),
            value: `SGD ${Math.round(monthAmount).toLocaleString('en-US')}`,
            icon: <DollarCircleOutlined />,
          }}
        />
      </StatisticCard.Group>

      <ProCard>
        <ProTable
          rowKey="id"
          dataSource={runs}
          columns={[
            { title: t('pages.billing.run.col.runId', 'Run ID'), dataIndex: 'id', width: 150 },
            { title: t('pages.billing.run.col.market', 'Market'), dataIndex: 'market', width: 120 },
            {
              title: t('pages.billing.run.col.billingPeriod', 'Billing Period'),
              dataIndex: 'billingPeriod',
              width: 120,
            },
            { title: t('pages.billing.run.col.runType', 'Run Type'), dataIndex: 'runType', width: 130 },
            {
              title: t('pages.billing.run.col.totalClients', 'Total Clients'),
              dataIndex: 'totalClients',
              width: 120,
            },
            { title: t('pages.billing.run.col.amount', 'Amount'), dataIndex: 'totalAmount', width: 140 },
            {
              title: t('pages.billing.run.col.status', 'Status'),
              dataIndex: 'status',
              render: (_: unknown, row: RunRecord) => (
                <Tag color={statusColors[row.status as keyof typeof statusColors]}>{row.status}</Tag>
              ),
            },
            { title: t('pages.billing.run.col.startedAt', 'Started At'), dataIndex: 'startedAt', width: 150 },
            { title: t('pages.billing.run.col.createdBy', 'Created By'), dataIndex: 'createdBy', width: 120 },
            {
              title: t('pages.billing.run.col.actions', 'Actions'),
              width: 110,
              render: (_: unknown, row: RunRecord) => (
                <Dropdown menu={{ items: [
                  {
                    key: 'view',
                    label: t('pages.billing.run.action.view', 'View'),
                    icon: <EyeOutlined />,
                    onClick: () => setDetail(row),
                  },
                  {
                    key: 'recalc',
                    label: t('pages.billing.run.action.recalculate', 'Recalculate'),
                    icon: <SyncOutlined />,
                    onClick: () => {
                      setSelectedRun(row);
                      recalcForm.setFieldsValue({ runId: row.id });
                      setRecalcOpen(true);
                    },
                  },
                  {
                    key: 'invoice',
                    label: t('pages.billing.run.action.generateInvoice', 'Generate Invoice'),
                    onClick: () => {
                      message.success(t('pages.billing.run.msg.invoiceGenerated', 'Invoice generation queued'));
                      history.push('/pricing-billing/billing/invoice');
                    },
                  },
                ] }}>
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              ),
            },
          ]}
          pagination={{ pageSize: 10 }}
        />
      </ProCard>

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        width={620}
        title={
          <Space>
            <EyeOutlined /> {detail?.id}
          </Space>
        }
      >
        {detail && (
          <ProCard title={t('pages.billing.run.detail.summary', 'Run Summary')} size="small">
            <Text>{t('pages.billing.run.col.market', 'Market')}: {detail.market}</Text><br />
            <Text>{t('pages.billing.run.col.billingPeriod', 'Billing Period')}: {detail.billingPeriod}</Text><br />
            <Text>{t('pages.billing.run.col.runType', 'Run Type')}: {detail.runType}</Text><br />
            <Text>{t('pages.billing.run.col.totalClients', 'Total Clients')}: {detail.totalClients}</Text><br />
            <Text>{t('pages.billing.run.col.amount', 'Amount')}: {detail.totalAmount}</Text><br />
            <Text>
              {t('pages.billing.run.col.status', 'Status')}:{' '}
              <Tag color={statusColors[detail.status as keyof typeof statusColors]}>{detail.status}</Tag>
            </Text>
            <br />
            <Text>{t('pages.billing.run.col.startedAt', 'Started At')}: {detail.startedAt}</Text>
          </ProCard>
        )}
      </Drawer>

      <Modal
        open={createOpen}
        title={t('pages.billing.run.modal.triggerTitle', 'Trigger New Run')}
        onCancel={() => setCreateOpen(false)}
        onOk={triggerRun}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" initialValues={{ runType: 'Regular' }}>
          <Form.Item name="market" label={t('pages.billing.run.col.market', 'Market')} rules={[{ required: true }]}>
            <Select options={['Singapore', 'Hong Kong', 'China', 'Japan', 'Australia'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item name="billingPeriod" label={t('pages.billing.run.col.billingPeriod', 'Billing Period')} rules={[{ required: true }]}>
            <Input placeholder="2026-08" />
          </Form.Item>
          <Form.Item name="runType" label={t('pages.billing.run.col.runType', 'Run Type')} rules={[{ required: true }]}>
            <Select options={['Regular', 'Recalculation', 'Backdated'].map((value) => ({ label: value, value }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={recalcOpen}
        title={t('pages.billing.run.modal.recalcTitle', 'Recalculate Billing Run')}
        onCancel={() => setRecalcOpen(false)}
        onOk={recalcRun}
        destroyOnClose
      >
        <Form form={recalcForm} layout="vertical" initialValues={{ includeBackdated: 'Yes' }}>
          <Form.Item name="runId" label={t('pages.billing.run.col.runId', 'Run ID')}>
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="reason"
            label={t('pages.billing.run.modal.reason', 'Reason')}
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="includeBackdated" label={t('pages.billing.run.modal.includeBackdated', 'Include Backdated Transactions')}>
            <Select options={['Yes', 'No'].map((value) => ({ label: value, value }))} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default BillingRunPage;
