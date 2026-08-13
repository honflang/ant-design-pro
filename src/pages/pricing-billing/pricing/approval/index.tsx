import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { PageContainer, ProCard, ProTable, StatisticCard } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Button, Drawer, Dropdown, Form, Input, Modal, Space, Tag, Typography } from 'antd';
import React, { useState } from 'react';

const { Text } = Typography;

type ApprovalStatus = 'AUTO_APPROVED' | 'PENDING' | 'REJECTED' | 'APPROVED';

type ApprovalRecord = {
  id: string;
  subject: string;
  client: string;
  product: string;
  market: string;
  requestedDiscount: string;
  threshold: string;
  thresholdCheck: string;
  requiredLevel: string;
  status: ApprovalStatus;
  currentApprover: string;
  requestedBy: string;
  requestedAt: string;
  comment?: string;
};

const initialRequests: ApprovalRecord[] = [
  { id: 'REQ-001', subject: 'Discount -8% for ACME Corp', client: 'ACME Corp', product: 'Cash Management', market: 'Singapore', requestedDiscount: '-8%', threshold: '-10%', thresholdCheck: 'Within', requiredLevel: 'AUTO', status: 'AUTO_APPROVED', currentApprover: 'System', requestedBy: 'Avery Chan', requestedAt: '2026-08-10' },
  { id: 'REQ-002', subject: 'Discount -15% for Northwind', client: 'Northwind Ltd', product: 'Trade Finance', market: 'Hong Kong', requestedDiscount: '-15%', threshold: '-10%', thresholdCheck: 'Exceeded', requiredLevel: 'L1', status: 'PENDING', currentApprover: 'Liam Tan', requestedBy: 'Mia Ng', requestedAt: '2026-08-09' },
  { id: 'REQ-003', subject: 'Discount -25% for Mizuho', client: 'Mizuho Japan', product: 'FX Services', market: 'Japan', requestedDiscount: '-25%', threshold: '-20%', thresholdCheck: 'Exceeded', requiredLevel: 'L2', status: 'PENDING', currentApprover: 'Mio Kato', requestedBy: 'Riku Sato', requestedAt: '2026-08-08' },
  { id: 'REQ-005', subject: 'Discount -22% for Sydney Finance', client: 'Sydney Finance', product: 'Liquidity', market: 'Australia', requestedDiscount: '-22%', threshold: '-20%', thresholdCheck: 'Exceeded', requiredLevel: 'CFO', status: 'REJECTED', currentApprover: 'CFO Office', requestedBy: 'Noah Carter', requestedAt: '2026-08-06' },
];

const statusColors = {
  AUTO_APPROVED: 'success',
  PENDING: 'processing',
  REJECTED: 'error',
  APPROVED: 'blue',
};

const ApprovalPage: React.FC = () => {
  const { message } = App.useApp();
  const intl = useIntl();
  const t = (id: string, defaultMessage: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id, defaultMessage }, values);
  const [actionForm] = Form.useForm();
  const [requests, setRequests] = useState<ApprovalRecord[]>(initialRequests);
  const [detail, setDetail] = useState<ApprovalRecord | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [selected, setSelected] = useState<ApprovalRecord | null>(null);
  const [mode, setMode] = useState<'approve' | 'reject'>('approve');

  const openAction = (record: ApprovalRecord, nextMode: 'approve' | 'reject') => {
    setSelected(record);
    setMode(nextMode);
    actionForm.resetFields();
    setActionOpen(true);
  };

  const submitAction = async () => {
    if (!selected) return;
    const values = await actionForm.validateFields();
    const nextStatus: ApprovalStatus = mode === 'approve' ? 'APPROVED' : 'REJECTED';

    setRequests((prev) =>
      prev.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              status: nextStatus,
              currentApprover: 'Completed',
              comment: values.comment,
            }
          : item,
      ),
    );

    setDetail((prev) =>
      prev && prev.id === selected.id
        ? {
            ...prev,
            status: nextStatus,
            currentApprover: 'Completed',
            comment: values.comment,
          }
        : prev,
    );

    message.success(
      mode === 'approve'
        ? t('pages.pricing.approval.msg.approved', 'Request approved')
        : t('pages.pricing.approval.msg.rejected', 'Request rejected'),
    );
    setActionOpen(false);
  };

  const pendingCount = requests.filter((item) => item.status === 'PENDING').length;
  const autoApprovedCount = requests.filter((item) => item.status === 'AUTO_APPROVED').length;
  const approvedCount = requests.filter((item) => item.status === 'APPROVED').length;
  const rejectedCount = requests.filter((item) => item.status === 'REJECTED').length;

  return (
    <PageContainer
      title={t('pages.pricing.approval.title', 'Pricing Approval')}
      subTitle={t(
        'pages.pricing.approval.subtitle',
        'Rule-based workflow with threshold and delegation',
      )}
    >
      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard
          statistic={{
            title: t('pages.pricing.approval.stat.pending', 'Pending Requests'),
            value: pendingCount,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.pricing.approval.stat.autoApproved', 'Auto Approved Today'),
            value: autoApprovedCount,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.pricing.approval.stat.approved', 'Approved Requests'),
            value: approvedCount,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.pricing.approval.stat.rejected', 'Rejected Requests'),
            value: rejectedCount,
          }}
        />
      </StatisticCard.Group>

      <ProCard style={{ marginBottom: 16 }}>
        <Text strong>{t('pages.pricing.approval.threshold.title', 'Threshold Rules')}</Text>
        <Space wrap style={{ marginTop: 8 }}>
          <Tag color="success">{t('pages.pricing.approval.threshold.auto', 'Auto < 10%')}</Tag>
          <Tag color="processing">{t('pages.pricing.approval.threshold.l1', 'L1 10% - 20%')}</Tag>
          <Tag color="warning">{t('pages.pricing.approval.threshold.l2', 'L2 20% - 30%')}</Tag>
          <Tag color="error">{t('pages.pricing.approval.threshold.cfo', 'CFO > 30%')}</Tag>
        </Space>
      </ProCard>

      <ProCard>
        <ProTable
          rowKey="id"
          dataSource={requests}
          columns={[
            { title: t('pages.pricing.approval.col.requestId', 'Request ID'), dataIndex: 'id', width: 110 },
            { title: t('pages.pricing.approval.col.subject', 'Subject'), dataIndex: 'subject', width: 220 },
            { title: t('pages.pricing.approval.col.client', 'Client'), dataIndex: 'client', width: 140 },
            { title: t('pages.pricing.approval.col.market', 'Market'), dataIndex: 'market', width: 120 },
            {
              title: t('pages.pricing.approval.col.requestedDiscount', 'Requested Discount'),
              dataIndex: 'requestedDiscount',
              width: 130,
            },
            { title: t('pages.pricing.approval.col.threshold', 'Threshold %'), dataIndex: 'threshold', width: 110 },
            {
              title: t('pages.pricing.approval.col.thresholdCheck', 'Threshold Check'),
              dataIndex: 'thresholdCheck',
              width: 130,
            },
            { title: t('pages.pricing.approval.col.requiredLevel', 'Required Level'), dataIndex: 'requiredLevel', width: 110 },
            {
              title: t('pages.pricing.approval.col.status', 'Status'),
              dataIndex: 'status',
              render: (_: unknown, row: ApprovalRecord) => (
                <Tag color={statusColors[row.status as keyof typeof statusColors]}>{row.status}</Tag>
              ),
            },
            {
              title: t('pages.pricing.approval.col.actions', 'Actions'),
              width: 110,
              render: (_: unknown, row: ApprovalRecord) => (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'view',
                        label: t('pages.pricing.approval.action.view', 'View'),
                        icon: <EyeOutlined />,
                        onClick: () => setDetail(row),
                      },
                      {
                        key: 'approve',
                        label: t('pages.pricing.approval.action.approve', 'Approve'),
                        icon: <CheckCircleOutlined />,
                        onClick: () => openAction(row, 'approve'),
                      },
                      {
                        key: 'reject',
                        label: t('pages.pricing.approval.action.reject', 'Reject'),
                        icon: <CloseCircleOutlined />,
                        onClick: () => openAction(row, 'reject'),
                      },
                    ],
                  }}
                >
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
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            <ProCard title={t('pages.pricing.approval.detail.context', 'Approval Context')} size="small">
              <p>
                {t('pages.pricing.approval.detail.configuredThreshold', 'Configured Threshold')}: {detail.threshold}
              </p>
              <p>
                {t('pages.pricing.approval.detail.requestedDiscount', 'Requested Discount')}: {detail.requestedDiscount}
              </p>
              <p>{t('pages.pricing.approval.detail.result', 'Result')}: {detail.thresholdCheck}</p>
              <p>
                {t('pages.pricing.approval.detail.routing', 'Routing')}: {detail.requiredLevel}{' '}
                {t('pages.pricing.approval.detail.approvalSuffix', 'Approval')}
              </p>
            </ProCard>
            <ProCard title={t('pages.pricing.approval.detail.history', 'Approval History')} size="small">
              <Text>
                1. {t('pages.pricing.approval.detail.requestedBy', 'Requested by')} {detail.requestedBy}
              </Text>
              <br />
              <Text>
                2. {t('pages.pricing.approval.detail.routedTo', 'Routed to')} {detail.currentApprover}
              </Text>
              <br />
              <Text>
                3. {t('pages.pricing.approval.detail.finalStatus', 'Final Status')}: {detail.status}
              </Text>
              {detail.comment ? (
                <>
                  <br />
                  <Text>
                    4. {t('pages.pricing.approval.detail.comment', 'Comment')}: {detail.comment}
                  </Text>
                </>
              ) : null}
            </ProCard>
          </Space>
        )}
      </Drawer>

      <Modal
        open={actionOpen}
        title={
          mode === 'approve'
            ? t('pages.pricing.approval.modal.approveTitle', 'Approve Request')
            : t('pages.pricing.approval.modal.rejectTitle', 'Reject Request')
        }
        onCancel={() => setActionOpen(false)}
        onOk={submitAction}
        destroyOnClose
      >
        <Form form={actionForm} layout="vertical">
          <Form.Item
            name="comment"
            label={
              mode === 'approve'
                ? t('pages.pricing.approval.modal.approveComment', 'Approve with Comment')
                : t('pages.pricing.approval.modal.rejectReason', 'Reject with Reason')
            }
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ApprovalPage;
