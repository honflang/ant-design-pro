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
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { TaxRule } from '../../../../../mock/taxConfig';
import type { JurisdictionTaxNode } from '../../../../../mock/jurisdictionTax';

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
const TAX_TREATMENT_OPTIONS = [
  'Tax Exclusive',
  'Tax Inclusive',
  'Tax Exempt',
  'Zero Rated',
  'Input Taxed',
  'Out of Scope',
];
const PRODUCT_MESSAGE_IDS: Record<string, string> = {
  'Cash Management': 'pages.regional.tax.product.cashManagement',
  'FX Services': 'pages.regional.tax.product.fxServices',
  'Trade Finance': 'pages.regional.tax.product.tradeFinance',
  'Deposit Services': 'pages.regional.tax.product.depositServices',
  'Advisory Services': 'pages.regional.tax.product.advisoryServices',
  Lending: 'pages.regional.tax.product.lending',
};
const APPLICABILITY_MESSAGE_IDS: Record<string, string> = {
  'Cross-border Payment to Non-residents':
    'pages.regional.tax.applicability.crossBorderPayment',
  'Cross-border Service Payments':
    'pages.regional.tax.applicability.crossBorderServicePayments',
  'Cross-border Services': 'pages.regional.tax.applicability.crossBorderServices',
  'Financial Services - General Exemption':
    'pages.regional.tax.applicability.financialServicesExemption',
  'Input Taxed Financial Supplies':
    'pages.regional.tax.applicability.inputTaxedFinancialSupplies',
  'Interest Paid to Non-residents':
    'pages.regional.tax.applicability.interestPaidToNonResidents',
  'Taxable Banking Services': 'pages.regional.tax.applicability.taxableBankingServices',
  'Taxable Domestic Services': 'pages.regional.tax.applicability.taxableDomesticServices',
  'Taxable Financial Services':
    'pages.regional.tax.applicability.taxableFinancialServices',
  'Taxable Financial Supplies':
    'pages.regional.tax.applicability.taxableFinancialSupplies',
  'Zero Rated Export Services': 'pages.regional.tax.applicability.zeroRatedExportServices',
};
const TAX_TYPE_MESSAGE_IDS: Record<string, string> = {
  GST: 'pages.regional.tax.taxType.gst',
  VAT: 'pages.regional.tax.taxType.vat',
  WHT: 'pages.regional.tax.taxType.wht',
  'Consumption Tax': 'pages.regional.tax.taxType.consumptionTax',
  Other: 'pages.regional.tax.taxType.other',
};
const TAX_TREATMENT_MESSAGE_IDS: Record<string, string> = {
  'Tax Exclusive': 'pages.regional.tax.taxTreatment.taxExclusive',
  'Tax Inclusive': 'pages.regional.tax.taxTreatment.taxInclusive',
  'Tax Exempt': 'pages.regional.tax.taxTreatment.taxExempt',
  'Zero Rated': 'pages.regional.tax.taxTreatment.zeroRated',
  'Input Taxed': 'pages.regional.tax.taxTreatment.inputTaxed',
  'Out of Scope': 'pages.regional.tax.taxTreatment.outOfScope',
};
const CALCULATION_METHOD_MESSAGE_IDS: Record<string, string> = {
  ...TAX_TREATMENT_MESSAGE_IDS,
  Exempt: 'pages.regional.tax.calculationMethod.exempt',
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
  const formatTaxType = (value: string) =>
    TAX_TYPE_MESSAGE_IDS[value] ? t(TAX_TYPE_MESSAGE_IDS[value]) : value;
  const formatTaxTreatment = (value: string) =>
    TAX_TREATMENT_MESSAGE_IDS[value] ? t(TAX_TREATMENT_MESSAGE_IDS[value]) : value;
  const formatCalculationMethod = (value: string) =>
    CALCULATION_METHOD_MESSAGE_IDS[value]
      ? t(CALCULATION_METHOD_MESSAGE_IDS[value])
      : value;

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
            value={formatTaxType(rule.taxType)}
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
          treatment: formatTaxTreatment(rule.taxTreatment),
          method: formatCalculationMethod(rule.calculationMethod),
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
interface MasterDefinitionRow {
  id: string;
  jurisdiction: JurisdictionTaxNode;
  taxDefinition: JurisdictionTaxNode;
}

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
  const formatTaxType = (value: string) =>
    TAX_TYPE_MESSAGE_IDS[value] ? t(TAX_TYPE_MESSAGE_IDS[value]) : value;
  const formatTaxTreatment = (value: string) =>
    TAX_TREATMENT_MESSAGE_IDS[value] ? t(TAX_TREATMENT_MESSAGE_IDS[value]) : value;
  const formatCalculationMethod = (value: string) =>
    CALCULATION_METHOD_MESSAGE_IDS[value]
      ? t(CALCULATION_METHOD_MESSAGE_IDS[value])
      : value;
  const formatProduct = (value: string) =>
    PRODUCT_MESSAGE_IDS[value] ? t(PRODUCT_MESSAGE_IDS[value]) : value;
  const formatApplicability = (value: string) =>
    APPLICABILITY_MESSAGE_IDS[value]
      ? t(APPLICABILITY_MESSAGE_IDS[value])
      : value;

  const [masterNodes, setMasterNodes] = useState<JurisdictionTaxNode[]>([]);
  const [selectedDefinitionId, setSelectedDefinitionId] = useState<string>();
  const [masterQuery, setMasterQuery] = useState({
    jurisdiction: '',
    taxType: '',
    keyword: '',
  });
  const previewValues: Record<string, string> = ProForm.useWatch([], form) ?? {};

  useEffect(() => {
    if (!open) return;
    request<{ success: boolean; data: JurisdictionTaxNode[] }>(
      '/api/regional/jurisdiction-tax/nodes',
      { params: { status: 'ACTIVE' } },
    ).then((res) => setMasterNodes(res.data ?? []));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setMasterQuery({ jurisdiction: '', taxType: '', keyword: '' });
    setSelectedDefinitionId(undefined);
    form.resetFields();

    if (!editRecord) {
      form.setFieldsValue({ status: 'ACTIVE' });
      return;
    }

    const jurisdictionNode = masterNodes.find(
      (node) => node.nodeType === 'JURISDICTION' && node.name === editRecord.jurisdiction,
    );
    const taxDefinitionNode = jurisdictionNode
      ? masterNodes.find(
          (node) =>
            node.parentId === jurisdictionNode.id && node.taxType === editRecord.taxType,
        )
      : undefined;
    form.setFieldsValue({
      ...editRecord,
      taxDefinitionId: taxDefinitionNode?.id,
      defaultRate: taxDefinitionNode?.defaultRate ?? editRecord.rate,
    });
  }, [open, editRecord, masterNodes, form]);

  const masterDefinitionRows = masterNodes
    .filter((node) => node.nodeType === 'TAX_DEFINITION' && node.status === 'ACTIVE')
    .flatMap((taxDefinition) => {
      const jurisdiction = masterNodes.find(
        (node) =>
          node.id === taxDefinition.parentId &&
          node.nodeType === 'JURISDICTION' &&
          node.status === 'ACTIVE',
      );
      return jurisdiction ? [{ id: taxDefinition.id, jurisdiction, taxDefinition }] : [];
    });
  const filteredMasterDefinitionRows = masterDefinitionRows.filter((row) => {
    const keyword = masterQuery.keyword.trim().toLowerCase();
    return (
      (!masterQuery.jurisdiction || row.jurisdiction.id === masterQuery.jurisdiction) &&
      (!masterQuery.taxType || row.taxDefinition.taxType === masterQuery.taxType) &&
      (!keyword ||
        [row.taxDefinition.name, row.taxDefinition.code].some((value) =>
          value.toLowerCase().includes(keyword),
        ))
    );
  });
  const jurisdictionOptions = masterNodes
    .filter((node) => node.nodeType === 'JURISDICTION' && node.status === 'ACTIVE')
    .map((node) => ({ label: node.name, value: node.id }));
  const availableTaxTypes = [...new Set(masterDefinitionRows.map((row) => row.taxDefinition.taxType))];

  const handleMasterDataSelection = (row: MasterDefinitionRow) => {
    const { jurisdiction, taxDefinition } = row;
    setSelectedDefinitionId(taxDefinition.id);
    form.setFieldsValue({
      jurisdiction: jurisdiction.name,
      taxAuthority: jurisdiction.taxAuthority ?? '',
      currency: jurisdiction.defaultCurrency ?? '',
      taxDefinitionId: taxDefinition.id,
      taxType: taxDefinition.taxType ?? '',
      taxName: taxDefinition.name,
      taxCode: taxDefinition.code,
      defaultRate: taxDefinition.defaultRate ?? 0,
      rate: taxDefinition.defaultRate ?? 0,
    });
  };

  const handleFinish = async (values: Record<string, unknown>) => {
    try {
      const selectedRow = masterDefinitionRows.find(
        (row) => row.id === values.taxDefinitionId,
      );
      const { defaultRate: _defaultRate, taxDefinitionId: _taxDefinitionId, ...rest } = values;
      const payload = {
        ...rest,
        jurisdiction: rest.jurisdiction ?? selectedRow?.jurisdiction.name ?? '',
        taxAuthority:
          rest.taxAuthority ?? selectedRow?.jurisdiction.taxAuthority ?? '',
        currency: rest.currency ?? selectedRow?.jurisdiction.defaultCurrency ?? '',
        taxType: rest.taxType ?? selectedRow?.taxDefinition.taxType ?? '',
        taxName: rest.taxName ?? selectedRow?.taxDefinition.name ?? '',
        taxCode: rest.taxCode ?? selectedRow?.taxDefinition.code ?? '',
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
      placement="right"
      size={760}
      open={open}
      onClose={onClose}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onClose}>{t('pages.regional.tax.form.cancel')}</Button>
          <Button type="primary" onClick={() => form.submit()}>
            {editRecord
              ? t('pages.regional.tax.form.save')
              : t('pages.regional.tax.form.create')}
          </Button>
        </Space>
      }
      styles={{ body: { paddingBottom: 24 } }}
    >
      <ProForm
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        submitter={false}
      >
        <ProCard
          title={t('pages.regional.tax.form.section.masterData')}
          style={{
            border: '1px solid #f0f0f0',
            marginBottom: 16,
          }}
        >
          {!editRecord && (
            <>
              <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                {t('pages.regional.tax.form.masterData.description')}
              </Text>
              <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                <Col xs={24} sm={8}>
                  <Select
                    allowClear
                    value={masterQuery.jurisdiction || undefined}
                    placeholder={t('pages.regional.tax.form.masterData.jurisdiction')}
                    options={jurisdictionOptions}
                    onChange={(jurisdiction) =>
                      setMasterQuery((query) => ({ ...query, jurisdiction: jurisdiction ?? '' }))
                    }
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Select
                    allowClear
                    value={masterQuery.taxType || undefined}
                    placeholder={t('pages.regional.tax.form.masterData.taxType')}
                    options={availableTaxTypes.map((taxType) => ({
                      label: formatTaxType(taxType ?? ''),
                      value: taxType,
                    }))}
                    onChange={(taxType) =>
                      setMasterQuery((query) => ({ ...query, taxType: taxType ?? '' }))
                    }
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Input
                    allowClear
                    value={masterQuery.keyword}
                    placeholder={t('pages.regional.tax.form.masterData.keyword')}
                    onChange={(event) =>
                      setMasterQuery((query) => ({ ...query, keyword: event.target.value }))
                    }
                  />
                </Col>
              </Row>
              <Table<MasterDefinitionRow>
                rowKey="id"
                size="small"
                pagination={{ pageSize: 5, size: 'small', showSizeChanger: false }}
                scroll={{ x: 860 }}
                tableLayout="fixed"
                dataSource={filteredMasterDefinitionRows}
                rowSelection={{
                  type: 'radio',
                  selectedRowKeys: selectedDefinitionId ? [selectedDefinitionId] : [],
                  onChange: (_, rows) => {
                    if (rows[0]) handleMasterDataSelection(rows[0]);
                  },
                }}
                onRow={(row) => ({ onClick: () => handleMasterDataSelection(row) })}
                columns={[
                  {
                    title: t('pages.regional.tax.form.masterData.jurisdiction'),
                    render: (_, row) => (
                      <Text strong>{row.jurisdiction.name}</Text>
                    ),
                    width: 110,
                    ellipsis: true,
                  },
                  {
                    title: t('pages.regional.tax.form.taxAuthority'),
                    render: (_, row) => row.jurisdiction.taxAuthority ?? '',
                    width: 180,
                    ellipsis: true,
                  },
                  {
                    title: t('pages.regional.tax.form.currency'),
                    render: (_, row) => row.jurisdiction.defaultCurrency,
                    width: 90,
                  },
                  {
                    title: t('pages.regional.tax.form.taxType'),
                    render: (_, row) => formatTaxType(row.taxDefinition.taxType ?? ''),
                    width: 120,
                    ellipsis: true,
                  },
                  {
                    title: t('pages.regional.tax.form.taxName'),
                    render: (_, row) => row.taxDefinition.name,
                    width: 160,
                    ellipsis: true,
                  },
                  {
                    title: t('pages.regional.tax.form.taxCode'),
                    render: (_, row) => row.taxDefinition.code,
                    width: 110,
                  },
                  {
                    title: t('pages.regional.tax.form.defaultRate'),
                    render: (_, row) => `${row.taxDefinition.defaultRate ?? 0}%`,
                    width: 90,
                  },
                ]}
              />
              <ProFormText
                name="taxDefinitionId"
                hidden
                rules={[{ required: true, message: t('pages.regional.tax.form.masterData.required') }]}
              />
              <Divider style={{ margin: '16px 0' }} />
            </>
          )}
          {editRecord && (
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              {t('pages.regional.tax.form.masterData.readonlyDescription')}
            </Text>
          )}
          <ProFormText name="jurisdiction" hidden />
          <ProFormText name="taxAuthority" hidden />
          <ProFormText name="currency" hidden />
          <ProFormText name="taxType" hidden />
          <ProFormText name="taxName" hidden />
          <ProFormText name="taxCode" hidden />
          <ProFormText name="defaultRate" hidden />
          <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label={t('pages.regional.tax.form.country')}>
              <Text strong>{previewValues.jurisdiction || '-'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('pages.regional.tax.form.currency')}>
              {previewValues.currency || '-'}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('pages.regional.tax.form.taxAuthority')}
              span={2}
            >
              {previewValues.taxAuthority || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('pages.regional.tax.form.taxType')}>
              {previewValues.taxType ? (
                <Tag color={taxTypeColor[previewValues.taxType] ?? 'default'}>
                  {formatTaxType(previewValues.taxType)}
                </Tag>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('pages.regional.tax.form.taxName')}>
              {previewValues.taxName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('pages.regional.tax.form.taxCode')}>
              {previewValues.taxCode ? (
                <Text code>{previewValues.taxCode}</Text>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('pages.regional.tax.form.defaultRate')}>
              {previewValues.defaultRate !== undefined && previewValues.defaultRate !== ''
                ? `${previewValues.defaultRate}%`
                : '-'}
            </Descriptions.Item>
          </Descriptions>
          <Row gutter={16}>
            <Col xs={24} md={8}>
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
          style={{
            border: '1px solid #f0f0f0',
            marginBottom: 16,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <ProFormSelect
                name="productService"
                label={t('pages.regional.tax.form.productService')}
                options={PRODUCTS.map((product) => ({
                  label: formatProduct(product),
                  value: product,
                }))}
                rules={[{ required: true }]}
              />
            </Col>
            <Col xs={24} md={12}>
              <ProFormText
                name="applicability"
                label={t('pages.regional.tax.form.applicabilityDesc')}
                rules={[{ required: true }]}
              />
            </Col>
          </Row>
        </ProCard>

        <ProCard
          title={t('pages.regional.tax.form.section.treatment')}
          style={{
            border: '1px solid #f0f0f0',
            marginBottom: 16,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <ProFormSelect
                name="taxTreatment"
                label={t('pages.regional.tax.form.taxTreatment')}
                options={TAX_TREATMENT_OPTIONS.map((o) => ({
                  label: formatTaxTreatment(o),
                  value: o,
                }))}
                rules={[{ required: true }]}
              />
            </Col>
            <Col xs={24} md={12}>
              <ProFormSelect
                name="calculationMethod"
                label={t('pages.regional.tax.form.calculationMethod')}
                options={TAX_TREATMENT_OPTIONS.map((o) => ({
                  label: formatCalculationMethod(o),
                  value: o,
                }))}
                rules={[{ required: true }]}
              />
            </Col>
          </Row>
        </ProCard>

        <ProCard
          title={t('pages.regional.tax.form.section.period')}
          style={{
            border: '1px solid #f0f0f0',
            marginBottom: 16,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <ProFormDatePicker
                name="effectiveFrom"
                label={t('pages.regional.tax.form.effectiveFrom')}
                rules={[{ required: true }]}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} md={12}>
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
          <Row gutter={16}>
            <Col xs={24} md={8}>
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
            </Col>
          </Row>
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
  const formatTaxType = (value: string) =>
    TAX_TYPE_MESSAGE_IDS[value] ? t(TAX_TYPE_MESSAGE_IDS[value]) : value;
  const formatTaxTreatment = (value: string) =>
    TAX_TREATMENT_MESSAGE_IDS[value] ? t(TAX_TREATMENT_MESSAGE_IDS[value]) : value;
  const formatProduct = (value: string) =>
    PRODUCT_MESSAGE_IDS[value] ? t(PRODUCT_MESSAGE_IDS[value]) : value;
  const formatApplicability = (value: string) =>
    APPLICABILITY_MESSAGE_IDS[value]
      ? t(APPLICABILITY_MESSAGE_IDS[value])
      : value;

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
      filters: JURISDICTIONS.map((jurisdiction) => ({
        text: jurisdiction,
        value: jurisdiction,
      })),
      onFilter: (value, record) => record.jurisdiction === value,
    },
    {
      title: t('pages.regional.tax.col.taxType'),
      dataIndex: 'taxType',
      width: 190,
      ellipsis: true,
      render: (_, r) => (
        <Tooltip title={formatTaxType(r.taxType)}>
          <Tag
            color={taxTypeColor[r.taxType] ?? 'default'}
            style={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {formatTaxType(r.taxType)}
          </Tag>
        </Tooltip>
      ),
      filters: TAX_TYPES.map((ty) => ({ text: formatTaxType(ty), value: ty })),
      onFilter: (value, record) => record.taxType === value,
    },
    {
      title: t('pages.regional.tax.col.taxName'),
      dataIndex: 'taxName',
      width: 260,
      ellipsis: true,
      render: (_, r) => (
        <Tooltip title={r.taxName}>
          <Button
            type="link"
            size="small"
            style={{
              display: 'block',
              overflow: 'hidden',
              padding: 0,
              textAlign: 'left',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
            }}
            onClick={() => {
              setDetailRecord(r);
              setDetailOpen(true);
            }}
          >
            {r.taxName}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: t('pages.regional.tax.col.productService'),
      dataIndex: 'productService',
      width: 150,
      ellipsis: true,
      render: (_, r) => formatProduct(r.productService),
    },
    {
      title: t('pages.regional.tax.col.applicability'),
      dataIndex: 'applicability',
      width: 200,
      ellipsis: true,
      render: (_, r) => formatApplicability(r.applicability),
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
      render: (_, r) => formatTaxTreatment(r.taxTreatment),
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
                              {formatTaxType(r.taxType)}
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
                  render: (_, r) => formatApplicability(r.applicability),
                },
                {
                  title: t('pages.regional.tax.col.productService'),
                  dataIndex: 'productService',
                  render: (_, r) => formatProduct(r.productService),
                },
                {
                  title: t('pages.regional.tax.col.taxTreatment'),
                  dataIndex: 'taxTreatment',
                  render: (_, r) => formatTaxTreatment(r.taxTreatment),
                },
                {
                  title: t('pages.regional.tax.detail.calculationMethod'),
                  dataIndex: 'calculationMethod',
                  render: (_, r) =>
                    t(CALCULATION_METHOD_MESSAGE_IDS[r.calculationMethod] ?? r.calculationMethod),
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
