import { CheckCircleOutlined, ControlOutlined, DollarCircleOutlined, EyeOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProCard, ProTable, StatisticCard } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Button, Col, Drawer, Dropdown, Form, Input, Modal, Row, Select, Space, Tag, Typography } from 'antd';
import React, { useState } from 'react';

const { Text } = Typography;

type RuleRecord = {
  id: string;
  priority: string;
  name: string;
  code: string;
  product: string;
  market: string;
  scope: string;
  pricePoint: string;
  adjustmentType: string;
  adjustmentValue: string;
  effectiveFrom: string;
  effectiveTo: string;
  approvalStatus: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  updatedBy: string;
  updatedAt: string;
};

const initialData: RuleRecord[] = [
  {
    id: 'RULE-001',
    priority: 'P1',
    name: 'Cash Management Base',
    code: 'CM-BASE-01',
    product: 'Cash Management',
    market: 'Singapore',
    scope: 'ENTERPRISE',
    pricePoint: 'SG-CM-STD-01',
    adjustmentType: 'STANDARD',
    adjustmentValue: '0%',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    approvalStatus: 'AUTO_APPROVED',
    status: 'ACTIVE',
    updatedBy: 'Liam Tan',
    updatedAt: '2026-08-11',
  },
  {
    id: 'RULE-021',
    priority: 'P2',
    name: 'SME FX Surcharge',
    code: 'FX-SME-02',
    product: 'FX Services',
    market: 'Singapore',
    scope: 'SEGMENT',
    pricePoint: 'SG-FX-SME-02',
    adjustmentType: 'SURCHARGE',
    adjustmentValue: '+0.05%',
    effectiveFrom: '2026-02-01',
    effectiveTo: '2026-11-30',
    approvalStatus: 'APPROVED',
    status: 'ACTIVE',
    updatedBy: 'Avery Chan',
    updatedAt: '2026-08-10',
  },
  {
    id: 'RULE-107',
    priority: 'P3',
    name: 'VIP Client Group Discount',
    code: 'VIP-GRP-07',
    product: 'Trade Finance',
    market: 'Hong Kong',
    scope: 'CLIENT_GROUP',
    pricePoint: 'HK-TF-VIP-20',
    adjustmentType: 'DISCOUNT',
    adjustmentValue: '-8%',
    effectiveFrom: '2026-03-01',
    effectiveTo: '2026-12-31',
    approvalStatus: 'PENDING_L1',
    status: 'ACTIVE',
    updatedBy: 'Mia Ng',
    updatedAt: '2026-08-09',
  },
  {
    id: 'RULE-402',
    priority: 'P4',
    name: 'ACME Strategic Deal',
    code: 'ACME-STR-02',
    product: 'Liquidity Management',
    market: 'Australia',
    scope: 'INDIVIDUAL',
    pricePoint: 'AU-LQ-IND-15',
    adjustmentType: 'DISCOUNT',
    adjustmentValue: '-15%',
    effectiveFrom: '2026-04-01',
    effectiveTo: '2026-09-30',
    approvalStatus: 'APPROVED',
    status: 'ACTIVE',
    updatedBy: 'Noah Carter',
    updatedAt: '2026-08-08',
  },
];

const scopeColors = {
  ENTERPRISE: 'gold',
  SEGMENT: 'blue',
  CLIENT_GROUP: 'purple',
  INDIVIDUAL: 'green',
};

const statusColors = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  PENDING: 'processing',
};

const approvalColors = {
  AUTO_APPROVED: 'success',
  APPROVED: 'blue',
  PENDING_L1: 'warning',
  REJECTED: 'error',
};

const RulesPage: React.FC = () => {
  const { message } = App.useApp();
  const intl = useIntl();
  const t = (id: string, defaultMessage: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id, defaultMessage }, values);
  const [form] = Form.useForm();
  const [rules, setRules] = useState<RuleRecord[]>(initialData);
  const [detail, setDetail] = useState<RuleRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<RuleRecord | null>(null);

  const handleSave = async () => {
    const values = await form.validateFields();
    const now = new Date().toISOString().slice(0, 10);

    if (editRecord) {
      setRules((prev) =>
        prev.map((item) =>
          item.id === editRecord.id
            ? {
                ...item,
                ...values,
                updatedAt: now,
                updatedBy: 'Current User',
              }
            : item,
        ),
      );
      message.success(t('pages.pricing.rules.msg.updated', 'Rule updated successfully'));
    } else {
      const record: RuleRecord = {
        id: `RULE-${Date.now()}`,
        approvalStatus: 'PENDING_L1',
        status: 'ACTIVE',
        updatedBy: 'Current User',
        updatedAt: now,
        ...values,
      };
      setRules((prev) => [record, ...prev]);
      message.success(t('pages.pricing.rules.msg.created', 'Rule created successfully'));
    }

    setFormOpen(false);
    setEditRecord(null);
    form.resetFields();
  };

  const toggleStatus = (record: RuleRecord) => {
    const nextStatus = record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setRules((prev) =>
      prev.map((item) => (item.id === record.id ? { ...item, status: nextStatus } : item)),
    );
    message.success(
      nextStatus === 'ACTIVE'
        ? t('pages.pricing.rules.msg.enabled', 'Rule enabled')
        : t('pages.pricing.rules.msg.disabled', 'Rule disabled'),
    );
  };

  const columns = [
    { title: t('pages.pricing.rules.col.priority', 'Priority'), dataIndex: 'priority', width: 80 },
    { title: t('pages.pricing.rules.col.ruleName', 'Rule Name'), dataIndex: 'name', width: 180 },
    { title: t('pages.pricing.rules.col.ruleCode', 'Rule Code'), dataIndex: 'code', width: 140 },
    { title: t('pages.pricing.rules.col.product', 'Product'), dataIndex: 'product', width: 150 },
    { title: t('pages.pricing.rules.col.market', 'Market'), dataIndex: 'market', width: 120 },
    {
      title: t('pages.pricing.rules.col.scope', 'Scope'),
      dataIndex: 'scope',
      width: 130,
      render: (_: unknown, row: RuleRecord) => (
        <Tag color={scopeColors[row.scope as keyof typeof scopeColors]}>{row.scope}</Tag>
      ),
    },
    { title: t('pages.pricing.rules.col.pricePoint', 'Price Point'), dataIndex: 'pricePoint', width: 170 },
    {
      title: t('pages.pricing.rules.col.adjustment', 'Adjustment'),
      dataIndex: 'adjustmentValue',
      width: 120,
    },
    {
      title: t('pages.pricing.rules.col.approvalStatus', 'Approval Status'),
      dataIndex: 'approvalStatus',
      width: 140,
      render: (_: unknown, row: RuleRecord) => (
        <Tag color={approvalColors[row.approvalStatus as keyof typeof approvalColors]}>
          {row.approvalStatus}
        </Tag>
      ),
    },
    {
      title: t('pages.pricing.rules.col.status', 'Status'),
      dataIndex: 'status',
      width: 110,
      render: (_: unknown, row: RuleRecord) => (
        <Tag color={statusColors[row.status as keyof typeof statusColors]}>{row.status}</Tag>
      ),
    },
    { title: t('pages.pricing.rules.col.updatedBy', 'Updated By'), dataIndex: 'updatedBy', width: 130 },
    { title: t('pages.pricing.rules.col.updatedAt', 'Updated At'), dataIndex: 'updatedAt', width: 110 },
    {
      title: t('pages.pricing.rules.col.actions', 'Actions'),
      width: 110,
      render: (_: unknown, row: RuleRecord) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: t('pages.pricing.rules.action.view', 'View'),
                icon: <EyeOutlined />,
                onClick: () => setDetail(row),
              },
              {
                key: 'edit',
                label: t('pages.pricing.rules.action.edit', 'Edit'),
                icon: <ControlOutlined />,
                onClick: () => {
                  setEditRecord(row);
                  form.setFieldsValue(row);
                  setFormOpen(true);
                },
              },
              {
                key: 'toggle',
                label:
                  row.status === 'ACTIVE'
                    ? t('pages.pricing.rules.action.disable', 'Disable')
                    : t('pages.pricing.rules.action.enable', 'Enable'),
                onClick: () => toggleStatus(row),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer
      title={t('pages.pricing.rules.title', 'Pricing Rules')}
      subTitle={t(
        'pages.pricing.rules.subtitle',
        'Define hierarchy-based pricing rules and adjustments',
      )}
      extra={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditRecord(null);
            form.resetFields();
            setFormOpen(true);
          }}
        >
          {t('pages.pricing.rules.action.addRule', 'Add Rule')}
        </Button>,
      ]}
    >
      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard
          statistic={{
            title: t('pages.pricing.rules.stat.total', 'Total Rules'),
            value: rules.length,
            icon: <DollarCircleOutlined />,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.pricing.rules.stat.enterprise', 'Enterprise'),
            value: rules.filter((item) => item.scope === 'ENTERPRISE').length,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.pricing.rules.stat.segment', 'Segment'),
            value: rules.filter((item) => item.scope === 'SEGMENT').length,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.pricing.rules.stat.clientIndividual', 'Client / Individual'),
            value: rules.filter((item) => ['CLIENT_GROUP', 'INDIVIDUAL'].includes(item.scope)).length,
          }}
        />
      </StatisticCard.Group>

      <ProCard style={{ marginBottom: 16, background: 'linear-gradient(135deg, #f0f5ff 0%, #f6ffed 100%)', border: '1px solid #d6e4ff' }}>
        <Row align="middle">
          <Col span={24}>
            <Space direction="vertical" size={8}>
              <Text strong style={{ color: '#1d39c4' }}>
                {t('pages.pricing.rules.hierarchy.title', 'Rule Hierarchy')}
              </Text>
              <Space wrap>
                <Tag color="gold">{t('pages.pricing.rules.hierarchy.p1', 'P1 Enterprise')}</Tag>
                <Tag color="blue">{t('pages.pricing.rules.hierarchy.p2', 'P2 Segment')}</Tag>
                <Tag color="purple">{t('pages.pricing.rules.hierarchy.p3', 'P3 Group')}</Tag>
                <Tag color="green">{t('pages.pricing.rules.hierarchy.p4', 'P4 Individual')}</Tag>
              </Space>
            </Space>
          </Col>
        </Row>
      </ProCard>

      <ProCard>
        <ProTable
          rowKey="id"
          dataSource={rules}
          columns={columns}
          pagination={{ pageSize: 10 }}
          search={{ labelWidth: 'auto' }}
          options={{ reload: true }}
          toolbar={{
            search: {
              placeholder: t(
                'pages.pricing.rules.search.placeholder',
                'Search by name, rule code or product',
              ),
              onSearch: () => undefined,
            },
          }}
        />
      </ProCard>

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        width={640}
        title={
          <Space>
            <EyeOutlined /> {detail?.name}
          </Space>
        }
      >
        {detail && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <ProCard title={t('pages.pricing.rules.detail.ruleDetails', 'Rule Details')} size="small">
              <Text>
                {t('pages.pricing.rules.col.priority', 'Priority')}: {detail.priority}
              </Text>
              <br />
              <Text>
                {t('pages.pricing.rules.col.scope', 'Scope')}: {detail.scope}
              </Text>
              <br />
              <Text>
                {t('pages.pricing.rules.col.pricePoint', 'Price Point')}: {detail.pricePoint}
              </Text>
              <br />
              <Text>
                {t('pages.pricing.rules.col.adjustment', 'Adjustment')}: {detail.adjustmentType}{' '}
                {detail.adjustmentValue}
              </Text>
              <br />
              <Text>
                {t('pages.pricing.rules.detail.effective', 'Effective')}: {detail.effectiveFrom} ~{' '}
                {detail.effectiveTo}
              </Text>
            </ProCard>
            <ProCard
              title={t('pages.pricing.rules.detail.approvalSummary', 'Approval Summary')}
              size="small"
            >
              <Tag
                icon={<CheckCircleOutlined />}
                color={approvalColors[detail.approvalStatus as keyof typeof approvalColors]}
              >
                {detail.approvalStatus}
              </Tag>
            </ProCard>
          </Space>
        )}
      </Drawer>

      <Modal
        title={
          editRecord
            ? t('pages.pricing.rules.form.editTitle', 'Edit Rule')
            : t('pages.pricing.rules.form.addTitle', 'Add Rule')
        }
        open={formOpen}
        onOk={handleSave}
        onCancel={() => {
          setFormOpen(false);
          setEditRecord(null);
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ priority: 'P2', scope: 'SEGMENT' }}>
          <Form.Item
            name="name"
            label={t('pages.pricing.rules.col.ruleName', 'Rule Name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label={t('pages.pricing.rules.col.ruleCode', 'Rule Code')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="priority" label={t('pages.pricing.rules.col.priority', 'Priority')} rules={[{ required: true }]}>
            <Select options={['P1', 'P2', 'P3', 'P4'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item name="market" label={t('pages.pricing.rules.col.market', 'Market')} rules={[{ required: true }]}>
            <Select
              options={['Singapore', 'Hong Kong', 'China', 'Japan', 'Australia'].map((value) => ({
                label: value,
                value,
              }))}
            />
          </Form.Item>
          <Form.Item name="product" label={t('pages.pricing.rules.col.product', 'Product')} rules={[{ required: true }]}>
            <Select
              options={['Cash Management', 'Trade Finance', 'FX Services', 'Liquidity Management'].map((value) => ({
                label: value,
                value,
              }))}
            />
          </Form.Item>
          <Form.Item name="scope" label={t('pages.pricing.rules.col.scope', 'Scope')} rules={[{ required: true }]}>
            <Select
              options={['ENTERPRISE', 'SEGMENT', 'CLIENT_GROUP', 'INDIVIDUAL'].map((value) => ({
                label: value,
                value,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="pricePoint"
            label={t('pages.pricing.rules.col.pricePoint', 'Price Point')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="adjustmentType"
            label={t('pages.pricing.rules.form.adjustmentType', 'Adjustment Type')}
            rules={[{ required: true }]}
          >
            <Select
              options={['STANDARD', 'DISCOUNT', 'SURCHARGE', 'REBATE', 'WAIVER'].map((value) => ({
                label: value,
                value,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="adjustmentValue"
            label={t('pages.pricing.rules.form.adjustmentValue', 'Adjustment Value')}
            rules={[{ required: true }]}
          >
            <Input placeholder="-10%" />
          </Form.Item>
          <Form.Item name="effectiveFrom" label={t('pages.pricing.rules.col.effectiveFrom', 'Effective From')} rules={[{ required: true }]}>
            <Input placeholder="2026-01-01" />
          </Form.Item>
          <Form.Item name="effectiveTo" label={t('pages.pricing.rules.col.effectiveTo', 'Effective To')} rules={[{ required: true }]}>
            <Input placeholder="2026-12-31" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default RulesPage;
