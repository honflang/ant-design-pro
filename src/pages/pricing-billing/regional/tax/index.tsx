import {
  AuditOutlined,
  BankOutlined,
  DownOutlined,
  EyeOutlined,
  GlobalOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { request, useIntl } from '@umijs/max';
import {
  App,
  Badge,
  Button,
  Col,
  Divider,
  Drawer,
  Dropdown,
  InputNumber,
  Row,
  Space,
  Statistic,
  Steps,
  Tag,
  Typography,
} from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import type { TaxRule } from '../../../../../mock/taxConfig';

const { Text } = Typography;

const JURISDICTIONS = ['Singapore', 'Hong Kong', 'China', 'Japan', 'Australia'];
const TAX_TYPES = ['GST', 'VAT', 'WHT', 'Consumption Tax', 'Other'];
const PRODUCTS = [
  'Cash Management',
  'FX Services',
  'Trade Finance',
  'Deposit Services',
  'Advisory Services',
  'Lending',
];
const CUSTOMER_TYPES = [
  'Corporate',
  'Financial Institution',
  'Government',
  'SME',
];
const TAX_STATUS_OPTIONS = ['Taxable', 'Exempt', 'Zero Rated', 'Out of Scope'];
const TAX_TREATMENT_OPTIONS = [
  'Tax Exclusive',
  'Tax Inclusive',
  'Tax Exempt',
  'Zero Rated',
  'Input Taxed',
  'Out of Scope',
];
const CURRENCY_MAP: Record<string, string> = {
  Singapore: 'SGD',
  'Hong Kong': 'HKD',
  China: 'CNY',
  Japan: 'JPY',
  Australia: 'AUD',
};
const AUTHORITY_MAP: Record<string, string> = {
  Singapore: 'Inland Revenue Authority of Singapore (IRAS)',
  'Hong Kong': 'Inland Revenue Department (IRD)',
  China: 'State Taxation Administration (STA)',
  Japan: 'National Tax Agency (NTA)',
  Australia: 'Australian Taxation Office (ATO)',
};

const taxTypeColor: Record<string, string> = {
  GST: 'blue',
  VAT: 'geekblue',
  WHT: 'orange',
  'Consumption Tax': 'purple',
  Other: 'default',
};

// ──────────────────────────────────────────────────────────────────────────────
// Tax Calculation Preview
// ──────────────────────────────────────────────────────────────────────────────
const TaxCalcPreview: React.FC<{ rule: TaxRule }> = ({ rule }) => {
  const intl = useIntl();
  const [billingAmount, setBillingAmount] = useState<number>(10000);

  const taxAmount =
    rule.taxTreatment === 'Tax Exempt' || rule.taxTreatment === 'Zero Rated'
      ? 0
      : Math.round(billingAmount * (rule.rate / 100) * 100) / 100;
  const total =
    rule.taxTreatment === 'Tax Inclusive'
      ? billingAmount
      : billingAmount + taxAmount;
  const { currency } = rule;

  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  return (
    <ProCard
      title={
        <Space>
          <BankOutlined />
          {t('pages.regional.tax.calc.title')}
        </Space>
      }
      style={{ marginTop: 16, border: '1px solid #d9d9d9' }}
      extra={
        <Text type="secondary" style={{ fontSize: 12 }}>
          {t('pages.regional.tax.calc.disclaimer')}
        </Text>
      }
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t('pages.regional.tax.calc.billingAmount', { currency })}
          </Text>
          <div style={{ marginTop: 4 }}>
            <InputNumber
              value={billingAmount}
              onChange={(v) => setBillingAmount(v ?? 0)}
              min={0}
              step={1000}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => Number(v?.replace(/,/g, '') ?? 0)}
              style={{ width: 200 }}
              addonBefore={currency}
            />
          </div>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={6}>
          <Statistic
            title={t('pages.regional.tax.calc.taxType')}
            value={rule.taxType}
            valueStyle={{ fontSize: 18, fontWeight: 600, color: '#1677ff' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title={t('pages.regional.tax.calc.taxRate')}
            value={rule.rate}
            suffix="%"
            valueStyle={{ fontSize: 18, fontWeight: 600, color: '#1677ff' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title={t('pages.regional.tax.calc.taxAmount', { currency })}
            value={taxAmount}
            precision={2}
            valueStyle={{ fontSize: 18, fontWeight: 600, color: '#d48806' }}
            formatter={(v) =>
              `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
            }
          />
        </Col>
        <Col span={6}>
          <Statistic
            title={t('pages.regional.tax.calc.invoiceTotal', { currency })}
            value={total}
            precision={2}
            valueStyle={{ fontSize: 18, fontWeight: 600, color: '#389e0d' }}
            formatter={(v) =>
              `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
            }
          />
        </Col>
      </Row>
      <Divider style={{ margin: '12px 0' }} />
      <Text type="secondary" style={{ fontSize: 11 }}>
        {t('pages.regional.tax.calc.treatmentInfo', {
          treatment: rule.taxTreatment,
          method: rule.calculationMethod,
        })}
        {rule.taxTreatment === 'Tax Inclusive' &&
          t('pages.regional.tax.calc.taxInclusive')}
      </Text>
    </ProCard>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Billing Flow Banner
// ──────────────────────────────────────────────────────────────────────────────
const BillingFlowBanner: React.FC = () => {
  const intl = useIntl();
  const t = (id: string) => intl.formatMessage({ id });

  return (
    <ProCard
      style={{
        marginBottom: 16,
        background: 'linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)',
        border: '1px solid #adc6ff',
      }}
      styles={{ body: { padding: '16px 24px' } }}
    >
      <Row align="middle" gutter={24}>
        <Col flex="auto">
          <Space direction="vertical" size={2}>
            <Space>
              <GlobalOutlined style={{ color: '#1677ff', fontSize: 16 }} />
              <Text strong style={{ color: '#1677ff', fontSize: 14 }}>
                {t('pages.regional.tax.banner.title')}
              </Text>
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('pages.regional.tax.banner.desc')}
            </Text>
          </Space>
        </Col>
        <Col>
          <Steps
            size="small"
            direction="horizontal"
            current={2}
            style={{ minWidth: 500 }}
            items={[
              {
                title: t('pages.regional.tax.banner.step.billing'),
                description: t('pages.regional.tax.banner.step.billingDesc'),
              },
              {
                title: t('pages.regional.tax.banner.step.determination'),
                description: t(
                  'pages.regional.tax.banner.step.determinationDesc',
                ),
              },
              {
                title: t('pages.regional.tax.banner.step.rule'),
                description: t('pages.regional.tax.banner.step.ruleDesc'),
                status: 'process',
              },
              {
                title: t('pages.regional.tax.banner.step.calculation'),
                description: t(
                  'pages.regional.tax.banner.step.calculationDesc',
                ),
              },
              {
                title: t('pages.regional.tax.banner.step.invoice'),
                description: t('pages.regional.tax.banner.step.invoiceDesc'),
              },
            ]}
          />
        </Col>
      </Row>
    </ProCard>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Add / Edit Drawer Form
// ──────────────────────────────────────────────────────────────────────────────
const TaxRuleForm: React.FC<{
  open: boolean;
  editRecord?: TaxRule;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ open, editRecord, onClose, onSuccess }) => {
  const [form] = ProForm.useForm();
  const { message } = App.useApp();
  const intl = useIntl();
  const t = (id: string) => intl.formatMessage({ id });

  const handleFinish = async (values: Record<string, unknown>) => {
    try {
      const jurisdiction = values.jurisdiction as string;
      const payload = {
        ...values,
        currency: CURRENCY_MAP[jurisdiction] ?? 'USD',
        taxAuthority: AUTHORITY_MAP[jurisdiction] ?? '',
        status: values.status ?? 'ACTIVE',
      };

      if (editRecord) {
        await request(`/api/regional/tax-rules/${editRecord.id}`, {
          method: 'PUT',
          data: payload,
        });
        message.success(t('pages.regional.tax.msg.updated'));
      } else {
        await request('/api/regional/tax-rules', {
          method: 'POST',
          data: payload,
        });
        message.success(t('pages.regional.tax.msg.created'));
      }
      onSuccess();
      onClose();
    } catch {
      message.error(t('pages.regional.tax.msg.saveFailed'));
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <AuditOutlined />
          {editRecord
            ? t('pages.regional.tax.form.editTitle')
            : t('pages.regional.tax.form.addTitle')}
        </Space>
      }
      width={680}
      open={open}
      onClose={onClose}
      destroyOnClose
      footer={null}
    >
      <ProForm
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={editRecord}
        submitter={{
          searchConfig: {
            submitText: editRecord
              ? t('pages.regional.tax.form.save')
              : t('pages.regional.tax.form.create'),
          },
          render: (_, doms) => (
            <Space style={{ float: 'right' }}>
              <Button onClick={onClose}>
                {t('pages.regional.tax.form.cancel')}
              </Button>
              {doms[1]}
            </Space>
          ),
        }}
      >
        <ProCard
          title={t('pages.regional.tax.form.section.jurisdiction')}
          style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="jurisdiction"
                label={t('pages.regional.tax.form.country')}
                options={JURISDICTIONS.map((j) => ({ label: j, value: j }))}
                rules={[{ required: true }]}
                placeholder={t('pages.regional.tax.form.selectJurisdiction')}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="taxAuthority"
                label={t('pages.regional.tax.form.taxAuthority')}
                placeholder={t(
                  'pages.regional.tax.form.taxAuthorityPlaceholder',
                )}
              />
            </Col>
          </Row>
        </ProCard>

        <ProCard
          title={t('pages.regional.tax.form.section.definition')}
          style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="taxType"
                label={t('pages.regional.tax.form.taxType')}
                options={TAX_TYPES.map((ty) => ({ label: ty, value: ty }))}
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="taxName"
                label={t('pages.regional.tax.form.taxName')}
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="taxCode"
                label={t('pages.regional.tax.form.taxCode')}
                rules={[{ required: true }]}
                placeholder={t('pages.regional.tax.form.taxCodePlaceholder')}
              />
            </Col>
            <Col span={12}>
              <ProForm.Item
                name="rate"
                label={t('pages.regional.tax.form.rate')}
                rules={[
                  {
                    required: true,
                    message: t('pages.regional.tax.form.rateRequired'),
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  precision={2}
                  style={{ width: '100%' }}
                  addonAfter="%"
                />
              </ProForm.Item>
            </Col>
          </Row>
        </ProCard>

        <ProCard
          title={t('pages.regional.tax.form.section.applicability')}
          style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="productService"
                label={t('pages.regional.tax.form.productService')}
                options={PRODUCTS.map((p) => ({ label: p, value: p }))}
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="customerType"
                label={t('pages.regional.tax.form.customerType')}
                options={CUSTOMER_TYPES.map((c) => ({ label: c, value: c }))}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="customerTaxStatus"
                label={t('pages.regional.tax.form.customerTaxStatus')}
                options={TAX_STATUS_OPTIONS.map((s) => ({
                  label: s,
                  value: s,
                }))}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="applicability"
                label={t('pages.regional.tax.form.applicabilityDesc')}
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="serviceLocation"
                label={t('pages.regional.tax.form.serviceLocation')}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="customerLocation"
                label={t('pages.regional.tax.form.customerLocation')}
              />
            </Col>
          </Row>
        </ProCard>

        <ProCard
          title={t('pages.regional.tax.form.section.treatment')}
          style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="taxTreatment"
                label={t('pages.regional.tax.form.taxTreatment')}
                options={TAX_TREATMENT_OPTIONS.map((o) => ({
                  label: o,
                  value: o,
                }))}
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="calculationMethod"
                label={t('pages.regional.tax.form.calculationMethod')}
                options={TAX_TREATMENT_OPTIONS.map((o) => ({
                  label: o,
                  value: o,
                }))}
                rules={[{ required: true }]}
              />
            </Col>
          </Row>
        </ProCard>

        <ProCard
          title={t('pages.regional.tax.form.section.period')}
          style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormDatePicker
                name="effectiveFrom"
                label={t('pages.regional.tax.form.effectiveFrom')}
                rules={[{ required: true }]}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <ProFormDatePicker
                name="effectiveTo"
                label={t('pages.regional.tax.form.effectiveTo')}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </ProCard>

        <ProCard
          title={t('pages.regional.tax.form.section.status')}
          style={{ border: '1px solid #f0f0f0' }}
        >
          <ProFormSelect
            name="status"
            label={t('pages.regional.tax.form.ruleStatus')}
            initialValue="ACTIVE"
            options={[
              { label: t('pages.regional.tax.status.active'), value: 'ACTIVE' },
              {
                label: t('pages.regional.tax.status.inactive'),
                value: 'INACTIVE',
              },
            ]}
            rules={[{ required: true }]}
          />
        </ProCard>
      </ProForm>
    </Drawer>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────────────────────
const TaxConfigPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message, modal } = App.useApp();
  const intl = useIntl();
  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  const [allRules, setAllRules] = useState<TaxRule[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<TaxRule | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<TaxRule | undefined>();

  const activeCount = allRules.filter((r) => r.status === 'ACTIVE').length;
  const gstVatCount = allRules.filter((r) =>
    ['GST', 'VAT'].includes(r.taxType),
  ).length;
  const whtCount = allRules.filter((r) => r.taxType === 'WHT').length;

  const statusTag = (status: string) =>
    status === 'ACTIVE' ? (
      <Badge
        status="success"
        text={
          <Text style={{ color: '#389e0d', fontWeight: 500 }}>
            {t('pages.regional.tax.status.active')}
          </Text>
        }
      />
    ) : (
      <Badge
        status="default"
        text={
          <Text type="secondary">
            {t('pages.regional.tax.status.inactive')}
          </Text>
        }
      />
    );

  const handleToggleStatus = useCallback(
    (record: TaxRule) => {
      const isActive = record.status === 'ACTIVE';
      modal.confirm({
        title: isActive
          ? t('pages.regional.tax.confirm.disableTitle')
          : t('pages.regional.tax.confirm.enableTitle'),
        content: (
          <Text>
            {isActive
              ? t('pages.regional.tax.confirm.disableContent', {
                  name: record.taxName,
                  jurisdiction: record.jurisdiction,
                })
              : t('pages.regional.tax.confirm.enableContent', {
                  name: record.taxName,
                  jurisdiction: record.jurisdiction,
                })}
          </Text>
        ),
        okText: isActive
          ? t('pages.regional.tax.action.disable')
          : t('pages.regional.tax.action.enable'),
        okType: isActive ? 'danger' : 'primary',
        onOk: async () => {
          try {
            await request(
              `/api/regional/tax-rules/${record.id}/toggle-status`,
              {
                method: 'PATCH',
              },
            );
            message.success(
              isActive
                ? t('pages.regional.tax.msg.disabled')
                : t('pages.regional.tax.msg.enabled'),
            );
            actionRef.current?.reload();
          } catch {
            message.error(t('pages.regional.tax.msg.opFailed'));
          }
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [message, modal, intl],
  );

  const columns: ProColumns<TaxRule>[] = [
    {
      title: t('pages.regional.tax.col.jurisdiction'),
      dataIndex: 'jurisdiction',
      width: 130,
      render: (_, r) => (
        <Space size={4}>
          <GlobalOutlined style={{ color: '#1677ff', fontSize: 12 }} />
          <Text strong style={{ fontSize: 13 }}>
            {r.jurisdiction}
          </Text>
        </Space>
      ),
      filters: JURISDICTIONS.map((j) => ({ text: j, value: j })),
      onFilter: (value, record) => record.jurisdiction === value,
    },
    {
      title: t('pages.regional.tax.col.taxType'),
      dataIndex: 'taxType',
      width: 130,
      render: (_, r) => (
        <Tag color={taxTypeColor[r.taxType] ?? 'default'}>{r.taxType}</Tag>
      ),
      filters: TAX_TYPES.map((ty) => ({ text: ty, value: ty })),
      onFilter: (value, record) => record.taxType === value,
    },
    {
      title: t('pages.regional.tax.col.taxName'),
      dataIndex: 'taxName',
      ellipsis: true,
      render: (_, r) => (
        <Button
          type="link"
          size="small"
          style={{ padding: 0 }}
          onClick={() => {
            setDetailRecord(r);
            setDetailOpen(true);
          }}
        >
          {r.taxName}
        </Button>
      ),
    },
    {
      title: t('pages.regional.tax.col.productService'),
      dataIndex: 'productService',
      width: 150,
      ellipsis: true,
    },
    {
      title: t('pages.regional.tax.col.applicability'),
      dataIndex: 'applicability',
      width: 200,
      ellipsis: true,
    },
    {
      title: t('pages.regional.tax.col.rate'),
      dataIndex: 'rate',
      width: 80,
      align: 'right',
      render: (_, r) => (
        <Text strong style={{ color: r.rate === 0 ? '#8c8c8c' : '#1677ff' }}>
          {r.rate}%
        </Text>
      ),
      sorter: (a, b) => a.rate - b.rate,
    },
    {
      title: t('pages.regional.tax.col.taxTreatment'),
      dataIndex: 'taxTreatment',
      width: 140,
      ellipsis: true,
    },
    {
      title: t('pages.regional.tax.col.effectiveFrom'),
      dataIndex: 'effectiveFrom',
      width: 120,
      valueType: 'date',
      sorter: (a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom),
    },
    {
      title: t('pages.regional.tax.col.effectiveTo'),
      dataIndex: 'effectiveTo',
      width: 110,
      render: (_, r) =>
        r.effectiveTo ? r.effectiveTo : <Text type="secondary">—</Text>,
    },
    {
      title: t('pages.regional.tax.col.status'),
      dataIndex: 'status',
      width: 100,
      render: (_, r) => statusTag(r.status),
      filters: [
        { text: t('pages.regional.tax.status.active'), value: 'ACTIVE' },
        { text: t('pages.regional.tax.status.inactive'), value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('pages.regional.tax.col.updatedBy'),
      dataIndex: 'updatedBy',
      width: 120,
      ellipsis: true,
      render: (_, r) => <Text type="secondary">{r.updatedBy}</Text>,
    },
    {
      title: t('pages.regional.tax.col.updatedAt'),
      dataIndex: 'updatedAt',
      width: 120,
      render: (_, r) => (
        <Text type="secondary">
          {r.updatedAt ? r.updatedAt.substring(0, 10) : '—'}
        </Text>
      ),
    },
    {
      title: t('pages.regional.tax.col.actions'),
      dataIndex: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: t('pages.regional.tax.action.view'),
                onClick: () => {
                  setDetailRecord(record);
                  setDetailOpen(true);
                },
              },
              {
                key: 'edit',
                icon: <AuditOutlined />,
                label: t('pages.regional.tax.action.edit'),
                onClick: () => {
                  setEditRecord(record);
                  setFormOpen(true);
                },
              },
              { type: 'divider' },
              {
                key: 'toggle',
                label:
                  record.status === 'ACTIVE'
                    ? t('pages.regional.tax.action.disable')
                    : t('pages.regional.tax.action.enable'),
                danger: record.status === 'ACTIVE',
                onClick: () => handleToggleStatus(record),
              },
            ],
          }}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer
      title={t('pages.regional.tax.title')}
      subTitle={t('pages.regional.tax.subTitle')}
      extra={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditRecord(undefined);
            setFormOpen(true);
          }}
        >
          {t('pages.regional.tax.addRule')}
        </Button>,
      ]}
    >
      <BillingFlowBanner />

      <StatisticCard.Group style={{ marginBottom: 16 }} direction="row">
        <StatisticCard
          statistic={{
            title: t('pages.regional.tax.stat.jurisdictions'),
            value: 5,
            icon: (
              <div
                style={{
                  background: '#e6f4ff',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}
              >
                <GlobalOutlined style={{ color: '#1677ff', fontSize: 24 }} />
              </div>
            ),
            description: (
              <Text type="secondary" style={{ fontSize: 11 }}>
                SG · HK · CN · JP · AU
              </Text>
            ),
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.regional.tax.stat.activeRules'),
            value: activeCount,
            valueStyle: { color: '#389e0d' },
            icon: (
              <div
                style={{
                  background: '#f6ffed',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}
              >
                <AuditOutlined style={{ color: '#389e0d', fontSize: 24 }} />
              </div>
            ),
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.regional.tax.stat.gstVatRules'),
            value: gstVatCount,
            valueStyle: { color: '#1677ff' },
            icon: (
              <div
                style={{
                  background: '#e6f4ff',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}
              >
                <BankOutlined style={{ color: '#1677ff', fontSize: 24 }} />
              </div>
            ),
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.regional.tax.stat.whtRules'),
            value: whtCount,
            valueStyle: { color: '#d48806' },
            icon: (
              <div
                style={{
                  background: '#fffbe6',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}
              >
                <DownOutlined style={{ color: '#d48806', fontSize: 24 }} />
              </div>
            ),
          }}
        />
      </StatisticCard.Group>

      <ProTable<TaxRule>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        scroll={{ x: 1600 }}
        cardProps={{
          title: (
            <Space>
              <AuditOutlined />
              <span>{t('pages.regional.tax.table.title')}</span>
            </Space>
          ),
          extra: (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('pages.regional.tax.table.total', {
                count: allRules.length,
                jurisdictions: JURISDICTIONS.length,
              })}
            </Text>
          ),
        }}
        request={async (params) => {
          const res = await request<{ success: boolean; data: TaxRule[] }>(
            '/api/regional/tax-rules',
            {
              method: 'GET',
              params: {
                jurisdiction: params.jurisdiction,
                taxType: params.taxType,
                status: params.status,
                keyword: params.keyword,
              },
            },
          );
          setAllRules(res.data ?? []);
          return { data: res.data ?? [], success: res.success };
        }}
        toolbar={{
          search: {
            placeholder: t('pages.regional.tax.table.search'),
            onSearch: () => {
              actionRef.current?.reload();
            },
          },
        }}
        search={{
          labelWidth: 'auto',
          filterType: 'light',
          optionRender: false,
        }}
        form={{ ignoreRules: false }}
        pagination={false}
        options={{ reload: true, density: true, setting: true }}
        columnsState={{
          persistenceKey: 'tax-config-table',
          persistenceType: 'localStorage',
        }}
      />

      <TaxRuleForm
        open={formOpen}
        editRecord={editRecord}
        onClose={() => setFormOpen(false)}
        onSuccess={() => actionRef.current?.reload()}
      />

      {/* Detail Drawer */}
      <Drawer
        title={
          <Space>
            <EyeOutlined />
            {t('pages.regional.tax.detail.title')}
          </Space>
        }
        width={680}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
        extra={
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setDetailOpen(false);
              setEditRecord(detailRecord);
              setFormOpen(true);
            }}
          >
            {t('pages.regional.tax.detail.editRule')}
          </Button>
        }
      >
        {detailRecord && (
          <>
            <ProDescriptions<TaxRule>
              column={2}
              dataSource={detailRecord}
              columns={[
                {
                  title: t('pages.regional.tax.col.jurisdiction'),
                  dataIndex: 'jurisdiction',
                  render: (_, r) => <Text strong>{r.jurisdiction}</Text>,
                },
                {
                  title: t('pages.regional.tax.detail.currency'),
                  dataIndex: 'currency',
                },
                {
                  title: t('pages.regional.tax.detail.taxAuthority'),
                  dataIndex: 'taxAuthority',
                  span: 2,
                  ellipsis: true,
                },
                {
                  title: t('pages.regional.tax.col.taxType'),
                  dataIndex: 'taxType',
                  render: (_, r) => (
                    <Tag color={taxTypeColor[r.taxType] ?? 'default'}>
                      {r.taxType}
                    </Tag>
                  ),
                },
                {
                  title: t('pages.regional.tax.col.taxName'),
                  dataIndex: 'taxName',
                },
                {
                  title: t('pages.regional.tax.detail.taxCode'),
                  dataIndex: 'taxCode',
                  render: (_, r) => <Text code>{r.taxCode}</Text>,
                },
                {
                  title: t('pages.regional.tax.detail.taxRate'),
                  dataIndex: 'rate',
                  render: (_, r) => (
                    <Text strong style={{ color: '#1677ff', fontSize: 16 }}>
                      {r.rate}%
                    </Text>
                  ),
                },
                {
                  title: t('pages.regional.tax.col.applicability'),
                  dataIndex: 'applicability',
                  span: 2,
                },
                {
                  title: t('pages.regional.tax.col.productService'),
                  dataIndex: 'productService',
                },
                {
                  title: t('pages.regional.tax.form.customerType'),
                  dataIndex: 'customerType',
                },
                {
                  title: t('pages.regional.tax.form.customerTaxStatus'),
                  dataIndex: 'customerTaxStatus',
                },
                {
                  title: t('pages.regional.tax.form.serviceLocation'),
                  dataIndex: 'serviceLocation',
                },
                {
                  title: t('pages.regional.tax.form.customerLocation'),
                  dataIndex: 'customerLocation',
                },
                {
                  title: t('pages.regional.tax.col.taxTreatment'),
                  dataIndex: 'taxTreatment',
                },
                {
                  title: t('pages.regional.tax.detail.calculationMethod'),
                  dataIndex: 'calculationMethod',
                },
                {
                  title: t('pages.regional.tax.col.effectiveFrom'),
                  dataIndex: 'effectiveFrom',
                },
                {
                  title: t('pages.regional.tax.col.effectiveTo'),
                  dataIndex: 'effectiveTo',
                  render: (_, r) =>
                    r.effectiveTo ?? <Text type="secondary">—</Text>,
                },
                {
                  title: t('pages.regional.tax.col.status'),
                  dataIndex: 'status',
                  render: (_, r) => statusTag(r.status),
                },
                {
                  title: t('pages.regional.tax.detail.updatedBy'),
                  dataIndex: 'updatedBy',
                },
                {
                  title: t('pages.regional.tax.detail.updatedAt'),
                  dataIndex: 'updatedAt',
                  render: (_, r) => r.updatedAt?.substring(0, 10),
                },
              ]}
            />
            <TaxCalcPreview rule={detailRecord} />
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TaxConfigPage;
