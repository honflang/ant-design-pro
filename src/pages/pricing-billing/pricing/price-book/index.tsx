import {
  BankOutlined,
  CreditCardOutlined,
  DollarCircleOutlined,
  EyeOutlined,
  GlobalOutlined,
  MoreOutlined,
  PlusOutlined,
  SwapOutlined,
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
  ProFormTextArea,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { request, useIntl } from '@umijs/max';
import {
  App,
  Button,
  Col,
  Drawer,
  Dropdown,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
  Tabs,
  Table,
  Tag,
  Steps,
  Typography,
} from 'antd';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import type {
  PriceDimension,
  PricePoint,
  PricePointTier,
  PriceStatus,
  PriceType,
} from '../../../../../mock/pricing';

const { Text } = Typography;

const PRODUCT_OPTIONS = [
  'Cash Management',
  'Trade Finance',
  'FX Services',
  'Deposit Services',
  'Liquidity Management',
  'Treasury Services',
];
const SERVICE_CATALOG: Record<string, Record<string, string[]>> = {
  'Cash Management': {
    'Account Services': ['Account Maintenance', 'Account Reporting'],
    Payments: ['Domestic Payment Processing', 'Cross-border Payment Processing'],
    'Liquidity Services': ['Operating Balance Management'],
  },
  'Trade Finance': {
    'Documentary Trade': ['Letter of Credit Issuance', 'Trade Document Processing'],
    Guarantees: ['Bank Guarantee Issuance'],
  },
  'FX Services': {
    'FX Execution': ['Spot FX Conversion'],
    'FX Hedging': ['Forward Contract Settlement'],
  },
  'Deposit Services': {
    'Term Deposits': ['Deposit Account Administration'],
  },
  'Liquidity Management': {
    'Cash Concentration': ['Notional Pooling', 'Physical Sweeping'],
  },
  'Treasury Services': {
    'Investment Services': ['Short-term Investment Placement'],
  },
};
const REGION_OPTIONS = ['Singapore', 'Hong Kong', 'China', 'Japan', 'Australia'];
const SEGMENT_OPTIONS = ['Corporate', 'SME', 'Institutional'];
const GROUP_OPTIONS = ['APAC Strategic Accounts', 'Global Trade Consortium', 'Public Sector Banking'];
const CATEGORY_OPTIONS = ['STANDARD', 'NEGOTIATED'];
const STATUS_OPTIONS: PriceStatus[] = ['DRAFT', 'ACTIVE', 'INACTIVE'];
const PRICE_TYPE_OPTIONS: PriceType[] = ['FLAT', 'TIERED', 'VOLUME', 'ECR'];
const CURRENCY_OPTIONS = ['SGD', 'HKD', 'CNY', 'JPY', 'AUD'];
const FLAT_UNITS = ['PER_MONTH', 'PER_TRANSACTION', 'PER_ACCOUNT'];

type PriceBookTreeNode = Partial<PricePoint> & {
  id: string;
  nodeType: 'PRODUCT' | 'SERVICE_GROUP' | 'PRICE_POINT';
  children?: PriceBookTreeNode[];
};

const toPriceBookTree = (records: PricePoint[]): PriceBookTreeNode[] => {
  const products = new Map<string, PricePoint[]>();
  records.forEach((record) => products.set(record.product, [...(products.get(record.product) ?? []), record]));

  return Array.from(products, ([product, productPricePoints]) => {
    const serviceGroups = new Map<string, PricePoint[]>();
    productPricePoints
      .filter((pricePoint) => pricePoint.serviceGroup)
      .forEach((pricePoint) => {
        const serviceGroup = pricePoint.serviceGroup as string;
        serviceGroups.set(serviceGroup, [...(serviceGroups.get(serviceGroup) ?? []), pricePoint]);
      });

    return {
      id: `product-${product}`,
      nodeType: 'PRODUCT',
      product,
      children: [
        ...productPricePoints
          .filter((pricePoint) => !pricePoint.serviceGroup)
          .map((pricePoint) => ({ ...pricePoint, nodeType: 'PRICE_POINT' as const })),
        ...Array.from(serviceGroups, ([serviceGroup, serviceGroupPricePoints]) => ({
          id: `service-group-${product}-${serviceGroup}`,
          nodeType: 'SERVICE_GROUP' as const,
          product,
          serviceGroup,
          children: serviceGroupPricePoints.map((pricePoint) => ({
            ...pricePoint,
            nodeType: 'PRICE_POINT' as const,
          })),
        })),
      ],
    };
  });
};

const DIMENSION_TABS: { key: PriceDimension; labelId: string }[] = [
  { key: 'BASE', labelId: 'pages.pricing.priceBook.tab.base' },
  { key: 'REGION', labelId: 'pages.pricing.priceBook.tab.region' },
  { key: 'SEGMENT', labelId: 'pages.pricing.priceBook.tab.segment' },
  { key: 'GROUP', labelId: 'pages.pricing.priceBook.tab.group' },
];

const priceTypeColors: Record<PriceType, string> = {
  FLAT: 'blue',
  TIERED: 'purple',
  VOLUME: 'green',
  ECR: 'orange',
};

const statusColors: Record<PriceStatus, string> = {
  DRAFT: 'default',
  ACTIVE: 'success',
  INACTIVE: 'error',
};

const formatMoney = (value?: number, currency = 'SGD') => {
  if (value === undefined || value === null) return '—';
  return `${currency} ${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

const getPricingPreview = (record: PricePoint) => {
  const monthlyVolume = 1200;
  const rate = record.tiers?.[0]?.rate ?? record.ecrSpread ?? 0.12;
  const base = record.priceType === 'ECR' ? 100000 : monthlyVolume;

  if (record.priceType === 'TIERED' && record.tiers?.length) {
    const charge = record.tiers.reduce((total, tier) => {
      const lower = tier.tierFrom ?? 0;
      const upper = tier.tierTo ?? Number.MAX_SAFE_INTEGER;
      const range = Math.min(upper, 1200) - lower;
      return total + Math.max(range, 0) * (tier.rate ?? 0) * 10;
    }, 0);

    return {
      monthlyVolume: '1,200 transactions',
      pricingType: 'TIERED',
      estimatedCharge: `${record.currency} ${charge.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      basis: 'Tier 1 + Tier 2 blended',
      unit: record.currency,
    };
  }

  if (record.priceType === 'VOLUME') {
    const charge = base * (rate + 0.02);
    return {
      monthlyVolume: '1,200 transactions',
      pricingType: 'VOLUME',
      estimatedCharge: `${record.currency} ${charge.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      basis: 'Volume-based fee schedule',
      unit: record.currency,
    };
  }

  if (record.priceType === 'ECR') {
    const charge = (record.ecrRate ?? 0) + (record.ecrSpread ?? 0) * 1000;
    return {
      monthlyVolume: '1,200 transactions',
      pricingType: 'ECR',
      estimatedCharge: `${record.currency} ${charge.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      basis: `${record.ecrReference ?? 'Reference rate'} + spread`,
      unit: record.currency,
    };
  }

  return {
    monthlyVolume: '1,200 transactions',
    pricingType: 'FLAT',
    estimatedCharge: `${record.currency} ${(record.flatAmount ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    basis: 'Flat monthly fee',
    unit: record.currency,
  };
};

const PriceBookForm: React.FC<{
  open: boolean;
  editRecord?: PricePoint;
  dimension: PriceDimension;
  target?: string;
  initialServiceScope?: Partial<Pick<PricePoint, 'product' | 'serviceGroup' | 'service' | 'feeItem'>>;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ open, editRecord, dimension, target, initialServiceScope, onClose, onSuccess }) => {
  const intl = useIntl();
  const { message } = App.useApp();
  const [form] = ProForm.useForm();

  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  const priceType = ProForm.useWatch('priceType', form);
  const selectedProduct = ProForm.useWatch('product', form);
  const selectedServiceGroup = ProForm.useWatch('serviceGroup', form);
  const serviceGroupOptions = selectedProduct ? Object.keys(SERVICE_CATALOG[selectedProduct] ?? {}) : [];
  const serviceOptions = selectedProduct && selectedServiceGroup
    ? SERVICE_CATALOG[selectedProduct]?.[selectedServiceGroup] ?? []
    : [];

  const handleFinish = async (values: Record<string, unknown>) => {
    const payload = {
      ...values,
      dimension,
      status: values.status ?? 'DRAFT',
      category: values.category ?? 'STANDARD',
      market: dimension === 'REGION' ? target : undefined,
      product: values.product ?? 'Cash Management',
      segment: dimension === 'SEGMENT' ? target : undefined,
      clientGroup: dimension === 'GROUP' ? target : undefined,
      priceType: values.priceType ?? 'FLAT',
      currency: values.currency ?? 'SGD',
      effectiveFrom: values.effectiveFrom,
      effectiveTo: values.effectiveTo,
    };

    try {
      if (editRecord) {
        await request(`/api/pricing/price-points/${editRecord.id}`, {
          method: 'PUT',
          data: payload,
        });
        message.success(t('pages.pricing.priceBook.msg.updated'));
      } else {
        await request('/api/pricing/price-points', {
          method: 'POST',
          data: payload,
        });
        message.success(t('pages.pricing.priceBook.msg.created'));
      }
      onSuccess();
      onClose();
    } catch {
      message.error(t('pages.pricing.priceBook.msg.failed'));
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <BankOutlined />
          {editRecord
            ? t('pages.pricing.priceBook.form.editTitle')
            : t('pages.pricing.priceBook.form.addTitle')}
        </Space>
      }
      open={open}
      size={720}
      onClose={onClose}
      destroyOnHidden
      footer={null}
    >
      <ProForm
        form={form}
        initialValues={{ ...initialServiceScope, ...editRecord }}
        layout="vertical"
        onFinish={handleFinish}
        submitter={{
          render: (_, doms) => (
            <Space style={{ float: 'right' }}>
              <Button onClick={onClose}>{t('pages.pricing.priceBook.form.cancel')}</Button>
              {doms[1]}
            </Space>
          ),
        }}
      >
        <ProCard
          title={t('pages.pricing.priceBook.form.section.scope')}
          style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="product"
                label={t('pages.pricing.priceBook.form.product')}
                options={PRODUCT_OPTIONS.map((item) => ({ label: item, value: item }))}
                rules={[{ required: true }]}
                disabled={Boolean(editRecord)}
                fieldProps={{
                  onChange: () => form.setFieldsValue({ serviceGroup: undefined, service: undefined }),
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="serviceGroup"
                label={t('pages.pricing.priceBook.form.serviceGroup')}
                options={serviceGroupOptions.map((item) => ({ label: item, value: item }))}
                disabled={!selectedProduct || Boolean(editRecord)}
                fieldProps={{
                  onChange: () => form.setFieldsValue({ service: undefined, feeItem: undefined }),
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="service"
                label={t('pages.pricing.priceBook.form.service')}
                options={serviceOptions.map((item) => ({ label: item, value: item }))}
                disabled={!selectedServiceGroup || Boolean(editRecord)}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="feeItem"
                label={t('pages.pricing.priceBook.form.feeItem')}
                disabled={!selectedServiceGroup || Boolean(editRecord)}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="dimension"
                label={t('pages.pricing.priceBook.form.dimension')}
                initialValue={dimension}
                fieldProps={{ value: dimension, readOnly: true }}
              />
            </Col>
            {dimension === 'REGION' && (
              <Col span={12}>
                <ProFormText
                  name="market"
                  label={t('pages.pricing.priceBook.form.region')}
                  initialValue={target}
                  fieldProps={{ value: target, readOnly: true }}
                />
              </Col>
            )}
            {dimension === 'SEGMENT' && (
              <Col span={12}>
                <ProFormText
                  name="segment"
                  label={t('pages.pricing.priceBook.form.segment')}
                  initialValue={target}
                  fieldProps={{ value: target, readOnly: true }}
                />
              </Col>
            )}
            {dimension === 'GROUP' && (
              <Col span={12}>
                <ProFormText
                  name="clientGroup"
                  label={t('pages.pricing.priceBook.form.clientGroup')}
                  initialValue={target}
                  fieldProps={{ value: target, readOnly: true }}
                />
              </Col>
            )}
            <Col span={12}>
              <ProFormSelect
                name="category"
                label={t('pages.pricing.priceBook.form.category')}
                options={CATEGORY_OPTIONS.map((item) => ({ label: item, value: item }))}
                rules={[{ required: true }]}
              />
            </Col>
          </Row>
        </ProCard>

        <ProCard
          title={t('pages.pricing.priceBook.form.section.definition')}
          style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="priceType"
                label={t('pages.pricing.priceBook.form.priceType')}
                options={PRICE_TYPE_OPTIONS.map((item) => ({ label: item, value: item }))}
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="currency"
                label={t('pages.pricing.priceBook.form.currency')}
                options={CURRENCY_OPTIONS.map((item) => ({ label: item, value: item }))}
                rules={[{ required: true }]}
              />
            </Col>

            {priceType === 'FLAT' && (
              <>
                <Col span={12}>
                  <ProForm.Item
                    name="flatAmount"
                    label={t('pages.pricing.priceBook.form.flatAmount')}
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </ProForm.Item>
                </Col>
                <Col span={12}>
                  <ProFormSelect
                    name="flatUnit"
                    label={t('pages.pricing.priceBook.form.flatUnit')}
                    options={FLAT_UNITS.map((item) => ({ label: item, value: item }))}
                    rules={[{ required: true }]}
                  />
                </Col>
              </>
            )}

            {priceType === 'TIERED' && (
              <Col span={24}>
                <ProFormTextArea
                  name="description"
                  label={t('pages.pricing.priceBook.form.tierRules')}
                  placeholder={t('pages.pricing.priceBook.form.tierRulesPlaceholder')}
                  rules={[{ required: true, min: 5 }]}
                />
              </Col>
            )}

            {priceType === 'VOLUME' && (
              <>
                <Col span={12}>
                  <ProForm.Item
                    name="flatAmount"
                    label={t('pages.pricing.priceBook.form.unitAmount')}
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                  </ProForm.Item>
                </Col>
                <Col span={12}>
                  <ProFormSelect
                    name="flatUnit"
                    label={t('pages.pricing.priceBook.form.volumeUnit')}
                    options={FLAT_UNITS.map((item) => ({ label: item, value: item }))}
                    rules={[{ required: true }]}
                  />
                </Col>
              </>
            )}

            {priceType === 'ECR' && (
              <>
                <Col span={12}>
                  <ProFormText
                    name="ecrReference"
                    label={t('pages.pricing.priceBook.form.ecrReference')}
                    rules={[{ required: true }]}
                  />
                </Col>
                <Col span={12}>
                  <ProForm.Item
                    name="ecrRate"
                    label={t('pages.pricing.priceBook.form.ecrRate')}
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                  </ProForm.Item>
                </Col>
                <Col span={12}>
                  <ProForm.Item
                    name="ecrSpread"
                    label={t('pages.pricing.priceBook.form.ecrSpread')}
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                  </ProForm.Item>
                </Col>
              </>
            )}
          </Row>
        </ProCard>

        <ProCard
          title={t('pages.pricing.priceBook.form.section.period')}
          style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormDatePicker
                name="effectiveFrom"
                label={t('pages.pricing.priceBook.form.effectiveFrom')}
                rules={[{ required: true }]}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <ProFormDatePicker
                name="effectiveTo"
                label={t('pages.pricing.priceBook.form.effectiveTo')}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </ProCard>

        <ProCard
          title={t('pages.pricing.priceBook.form.section.status')}
          style={{ border: '1px solid #f0f0f0' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="status"
                label={t('pages.pricing.priceBook.form.status')}
                options={STATUS_OPTIONS.map((item) => ({ label: item, value: item }))}
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={12}>
              <ProFormTextArea
                name="description"
                label={t('pages.pricing.priceBook.form.description')}
                placeholder={t('pages.pricing.priceBook.form.descriptionPlaceholder')}
              />
            </Col>
          </Row>
        </ProCard>
      </ProForm>
    </Drawer>
  );
};

const PriceBookDetailDrawer: React.FC<{
  open: boolean;
  record?: PricePoint;
  onClose: () => void;
  onEdit: (record: PricePoint) => void;
}> = ({ open, record, onClose, onEdit }) => {
  const intl = useIntl();
  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  if (!record) return null;

  const preview = getPricingPreview(record);

  return (
    <Drawer
      title={
        <Space>
          <EyeOutlined />
          {t('pages.pricing.priceBook.detail.title')}
        </Space>
      }
      size={760}
      open={open}
      onClose={onClose}
      destroyOnHidden
      extra={
        <Button type="primary" size="small" onClick={() => onEdit(record)}>
          {t('pages.pricing.priceBook.action.edit')}
        </Button>
      }
    >
      <ProDescriptions<PricePoint>
        column={2}
        dataSource={record}
        columns={[
          { title: t('pages.pricing.priceBook.col.product'), dataIndex: 'product' },
          { title: t('pages.pricing.priceBook.col.serviceGroup'), dataIndex: 'serviceGroup' },
          { title: t('pages.pricing.priceBook.col.service'), dataIndex: 'service' },
          {
            title: t('pages.pricing.priceBook.col.dimension'),
            dataIndex: 'dimension',
            render: (_, r) => r.dimension ?? (r.clientGroup ? 'GROUP' : r.segment && !r.market ? 'SEGMENT' : r.market ? 'REGION' : 'BASE'),
          },
          {
            title: t('pages.pricing.priceBook.col.target'),
            dataIndex: 'target',
            render: (_, r) => r.clientGroup ?? r.segment ?? r.market ?? t('pages.pricing.priceBook.target.all'),
          },
          { title: t('pages.pricing.priceBook.col.priceType'), dataIndex: 'priceType', render: (_, r) => <Tag color={priceTypeColors[r.priceType]}>{r.priceType}</Tag> },
          { title: t('pages.pricing.priceBook.col.currency'), dataIndex: 'currency' },
          { title: t('pages.pricing.priceBook.col.category'), dataIndex: 'category' },
          { title: t('pages.pricing.priceBook.col.rateAmount'), dataIndex: 'flatAmount', render: (_, r) => r.priceType === 'FLAT' ? formatMoney(r.flatAmount, r.currency) : r.priceType === 'ECR' ? `${r.ecrRate ?? 0}% + ${r.ecrSpread ?? 0}%` : 'Tier / Volume schedule' },
          { title: t('pages.pricing.priceBook.col.status'), dataIndex: 'status', render: (_, r) => <Tag color={statusColors[r.status]}>{r.status}</Tag> },
          { title: t('pages.pricing.priceBook.col.effectiveFrom'), dataIndex: 'effectiveFrom' },
          { title: t('pages.pricing.priceBook.col.effectiveTo'), dataIndex: 'effectiveTo', render: (_, r) => r.effectiveTo ?? '—' },
          { title: t('pages.pricing.priceBook.col.updatedBy'), dataIndex: 'updatedBy', span: 2 },
          { title: t('pages.pricing.priceBook.col.updatedAt'), dataIndex: 'updatedAt', render: (_, r) => r.updatedAt?.substring(0, 10) },
        ]}
      />

      {record.priceType === 'TIERED' && record.tiers?.length ? (
        <ProCard title={t('pages.pricing.priceBook.detail.tierPreview')} style={{ marginTop: 16 }}>
          <Table
            size="small"
            pagination={false}
            dataSource={record.tiers}
            columns={[
              { title: 'Tier From', dataIndex: 'tierFrom', key: 'tierFrom' },
              { title: 'Tier To', dataIndex: 'tierTo', key: 'tierTo', render: (_, row: PricePointTier) => row.tierTo ?? '∞' },
              { title: 'Unit', dataIndex: 'unit', key: 'unit' },
              { title: 'Rate', dataIndex: 'rate', key: 'rate', render: (_, row) => `${row.rate ?? 0}%` },
              { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (_, row) => row.amount ?? '—' },
            ]}
          />
        </ProCard>
      ) : null}

      <ProCard title={t('pages.pricing.priceBook.detail.preview.title')} style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title={t('pages.pricing.priceBook.detail.preview.volume')} value={preview.monthlyVolume} />
          </Col>
          <Col span={6}>
            <Statistic title={t('pages.pricing.priceBook.detail.preview.type')} value={preview.pricingType} />
          </Col>
          <Col span={6}>
            <Statistic title={t('pages.pricing.priceBook.detail.preview.charge')} value={preview.estimatedCharge} />
          </Col>
          <Col span={6}>
            <Statistic title={t('pages.pricing.priceBook.detail.preview.basis')} value={preview.basis} />
          </Col>
        </Row>
      </ProCard>
    </Drawer>
  );
};

const PriceBookPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message, modal } = App.useApp();
  const intl = useIntl();
  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [allRecords, setAllRecords] = useState<PricePoint[]>([]);
  const [editRecord, setEditRecord] = useState<PricePoint | undefined>();
  const [detailRecord, setDetailRecord] = useState<PricePoint | undefined>();
  const [activeDimension, setActiveDimension] = useState<PriceDimension>('BASE');
  const [targets, setTargets] = useState<Record<'REGION' | 'SEGMENT' | 'GROUP', string | undefined>>({
    REGION: undefined,
    SEGMENT: undefined,
    GROUP: undefined,
  });
  const [serviceScope, setServiceScope] = useState<
    Partial<Pick<PricePoint, 'product' | 'serviceGroup' | 'service' | 'feeItem'>>
  >({});

  const activeTarget = activeDimension === 'BASE' ? undefined : targets[activeDimension];
  const serviceGroupOptions = serviceScope.product
    ? Object.keys(SERVICE_CATALOG[serviceScope.product] ?? {})
    : [];
  const serviceOptions = serviceScope.product && serviceScope.serviceGroup
    ? SERVICE_CATALOG[serviceScope.product]?.[serviceScope.serviceGroup] ?? []
    : [];
  const canManageCurrentScope = Boolean(
    serviceScope.product &&
      (activeDimension === 'BASE' || activeTarget),
  );
  const isPricePointNode = (record: PricePoint) =>
    (record as Partial<PriceBookTreeNode>).nodeType === 'PRICE_POINT';

  const summary = useMemo(() => {
    const activeCount = allRecords.filter((item) => item.status === 'ACTIVE').length;
    const standardCount = allRecords.filter((item) => item.category === 'STANDARD').length;
    const negotiatedCount = allRecords.filter((item) => item.category === 'NEGOTIATED').length;
    return {
      products: new Set(allRecords.map((item) => item.product)).size,
      activePoints: activeCount,
      regions: new Set(allRecords.map((item) => item.market).filter(Boolean)).size,
      standardNegotiated: `${standardCount} / ${negotiatedCount}`,
    };
  }, [allRecords]);

  const handleToggleStatus = useCallback(
    (record: PricePoint) => {
      const isActive = record.status === 'ACTIVE';
      modal.confirm({
        title: isActive
          ? t('pages.pricing.priceBook.confirm.disableTitle')
          : t('pages.pricing.priceBook.confirm.enableTitle'),
        content: isActive
          ? t('pages.pricing.priceBook.confirm.disableContent', { product: record.product })
          : t('pages.pricing.priceBook.confirm.enableContent', { product: record.product }),
        okText: isActive
          ? t('pages.pricing.priceBook.action.disable')
          : t('pages.pricing.priceBook.action.enable'),
        okType: isActive ? 'danger' : 'primary',
        onOk: async () => {
          try {
            await request(`/api/pricing/price-points/${record.id}/status`, {
              method: 'PATCH',
            });
            message.success(
              isActive
                ? t('pages.pricing.priceBook.msg.disabled')
                : t('pages.pricing.priceBook.msg.enabled'),
            );
            actionRef.current?.reload();
          } catch {
            message.error(t('pages.pricing.priceBook.msg.failed'));
          }
        },
      });
    },
    [intl, message, modal, t],
  );

  const columns: ProColumns<PricePoint>[] = [
    {
      title: t('pages.pricing.priceBook.col.hierarchy'),
      dataIndex: 'product',
      width: 300,
      render: (_, r) => (
        !isPricePointNode(r) && r.serviceGroup ? <Text strong>{r.serviceGroup}</Text> : !isPricePointNode(r) ? <Space size={4}>
          <BankOutlined style={{ color: '#1677ff', fontSize: 12 }} />
          <Text strong>{r.product}</Text>
        </Space> : <Text>{[r.serviceGroup, r.service, r.feeItem].filter(Boolean).join(' / ') || r.product}</Text>
      ),
      filters: PRODUCT_OPTIONS.map((item) => ({ text: item, value: item })),
      onFilter: (value, record) => record.product === value,
    },
    {
      title: t('pages.pricing.priceBook.col.dimension'),
      dataIndex: 'dimension',
      width: 130,
      render: (_, r) => (
        isPricePointNode(r) ? <Tag color="geekblue">
          {r.dimension ?? (r.clientGroup ? 'GROUP' : r.segment && !r.market ? 'SEGMENT' : r.market ? 'REGION' : 'BASE')}
        </Tag> : null
      ),
    },
    {
      title: t('pages.pricing.priceBook.col.priceType'),
      dataIndex: 'priceType',
      width: 120,
      render: (_, r) => isPricePointNode(r) ? <Tag color={priceTypeColors[r.priceType]}>{r.priceType}</Tag> : null,
      filters: PRICE_TYPE_OPTIONS.map((item) => ({ text: item, value: item })),
      onFilter: (value, record) => record.priceType === value,
    },
    {
      title: t('pages.pricing.priceBook.col.currency'),
      dataIndex: 'currency',
      width: 90,
    },
    {
      title: t('pages.pricing.priceBook.col.rateAmount'),
      dataIndex: 'flatAmount',
      width: 180,
      render: (_, r) => {
        if (!isPricePointNode(r)) return null;
        if (r.priceType === 'FLAT') return formatMoney(r.flatAmount, r.currency);
        if (r.priceType === 'VOLUME') return `${formatMoney(r.flatAmount, r.currency)} / txn`;
        if (r.priceType === 'ECR') return `${r.ecrRate ?? 0}% + ${r.ecrSpread ?? 0}%`;
        return r.tiers?.map((tier) => `${tier.rate ?? 0}%`).join(' / ') || '—';
      },
    },
    {
      title: t('pages.pricing.priceBook.col.category'),
      dataIndex: 'category',
      width: 130,
      render: (_, r) => (
        isPricePointNode(r) ? <Tag color={r.category === 'STANDARD' ? 'blue' : 'gold'}>{r.category}</Tag> : null
      ),
      filters: CATEGORY_OPTIONS.map((item) => ({ text: item, value: item })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: t('pages.pricing.priceBook.col.status'),
      dataIndex: 'status',
      width: 110,
      render: (_, r) => isPricePointNode(r) ? <Tag color={statusColors[r.status]}>{r.status}</Tag> : null,
      filters: STATUS_OPTIONS.map((item) => ({ text: item, value: item })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('pages.pricing.priceBook.col.actions'),
      dataIndex: 'actions',
      width: 90,
      fixed: 'right',
      render: (_, record) => isPricePointNode(record) ? (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: t('pages.pricing.priceBook.action.view'),
                icon: <EyeOutlined />,
                onClick: () => {
                  setDetailRecord(record);
                  setDetailOpen(true);
                },
              },
              {
                key: 'edit',
                label: t('pages.pricing.priceBook.action.edit'),
                icon: <CreditCardOutlined />,
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
                    ? t('pages.pricing.priceBook.action.disable')
                    : t('pages.pricing.priceBook.action.enable'),
                danger: record.status === 'ACTIVE',
                onClick: () => handleToggleStatus(record),
              },
            ],
          }}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      ) : null,
    },
  ];

  return (
    <PageContainer
      title={t('pages.pricing.priceBook.title')}
      subTitle={t('pages.pricing.priceBook.subTitle')}
      extra={[
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          disabled={!canManageCurrentScope}
          onClick={() => {
            setEditRecord(undefined);
            setFormOpen(true);
          }}
        >
          {t('pages.pricing.priceBook.addPricePoint')}
        </Button>,
      ]}
    >
      <ProCard style={{ marginBottom: 16, background: 'linear-gradient(135deg, #f0f5ff 0%, #f6ffed 100%)', border: '1px solid #d6e4ff' }}>
        <Row align="middle" gutter={24}>
          <Col flex="auto">
            <Text strong style={{ color: '#1d39c4', fontSize: 15 }}>
              {t('pages.pricing.priceBook.flow.title')}
            </Text>
            <div style={{ marginTop: 8 }}>
              <Steps
                size="small"
                current={100}
                items={[
                  { title: t('pages.pricing.priceBook.flow.priceBook') },
                  { title: t('pages.pricing.priceBook.flow.pricingRule') },
                  { title: t('pages.pricing.priceBook.flow.dealPricing') },
                  { title: t('pages.pricing.priceBook.flow.billing') },
                  { title: t('pages.pricing.priceBook.flow.invoice') },
                ]}
              />
            </div>
          </Col>
        </Row>
      </ProCard>

      <StatisticCard.Group style={{ marginBottom: 16 }} direction="row">
        <StatisticCard
          statistic={{
            title: t('pages.pricing.priceBook.stat.products'),
            value: summary.products,
            icon: <div style={{ background: '#e6f4ff', borderRadius: 8, padding: '8px 10px' }}><BankOutlined style={{ color: '#1677ff', fontSize: 24 }} /></div>,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.pricing.priceBook.stat.activePoints'),
            value: summary.activePoints,
            valueStyle: { color: '#389e0d' },
            icon: <div style={{ background: '#f6ffed', borderRadius: 8, padding: '8px 10px' }}><DollarCircleOutlined style={{ color: '#389e0d', fontSize: 24 }} /></div>,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.pricing.priceBook.stat.regions'),
            value: summary.regions,
            icon: <div style={{ background: '#f0f5ff', borderRadius: 8, padding: '8px 10px' }}><GlobalOutlined style={{ color: '#597ef7', fontSize: 24 }} /></div>,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.pricing.priceBook.stat.standardNegotiated'),
            value: summary.standardNegotiated,
            icon: <div style={{ background: '#fff7e6', borderRadius: 8, padding: '8px 10px' }}><SwapOutlined style={{ color: '#d48806', fontSize: 24 }} /></div>,
          }}
        />
      </StatisticCard.Group>

      <ProCard style={{ marginBottom: 16 }}>
        <Tabs
          activeKey={activeDimension}
          onChange={(key) => {
            setActiveDimension(key as PriceDimension);
            setEditRecord(undefined);
            actionRef.current?.reload();
          }}
          items={DIMENSION_TABS.map(({ key, labelId }) => ({
            key,
            label: t(labelId),
          }))}
        />
        {activeDimension !== 'BASE' ? (
          <Row gutter={16} align="middle" style={{ paddingBottom: 16 }}>
            <Col flex="none">
              <Text strong>{t(`pages.pricing.priceBook.target.${activeDimension.toLowerCase()}`)}</Text>
            </Col>
            <Col flex="320px">
              <Select
                value={activeTarget}
                onChange={(value: string) => {
                  setTargets((current) => ({ ...current, [activeDimension]: value }));
                  actionRef.current?.reload();
                }}
                style={{ width: '100%' }}
                options={(activeDimension === 'REGION'
                  ? REGION_OPTIONS
                  : activeDimension === 'SEGMENT'
                    ? SEGMENT_OPTIONS
                    : GROUP_OPTIONS
                ).map((item) => ({ label: item, value: item }))}
                placeholder={t('pages.pricing.priceBook.target.placeholder')}
              />
            </Col>
          </Row>
        ) : null}
        <Row gutter={16} align="middle" style={{ paddingTop: activeDimension === 'BASE' ? 0 : 8 }}>
          <Col flex="280px">
            <Select
              allowClear
              value={serviceScope.product}
              onChange={(product) => {
                setServiceScope({ product });
                actionRef.current?.reload();
              }}
              style={{ width: '100%' }}
              options={PRODUCT_OPTIONS.map((item) => ({ label: item, value: item }))}
              placeholder={t('pages.pricing.priceBook.scope.productPlaceholder')}
            />
          </Col>
          <Col flex="280px">
            <Select
              allowClear
              disabled={!serviceScope.product}
              value={serviceScope.serviceGroup}
              onChange={(serviceGroup) => {
                setServiceScope((current) => ({ ...current, serviceGroup, service: undefined }));
                actionRef.current?.reload();
              }}
              style={{ width: '100%' }}
              options={serviceGroupOptions.map((item) => ({ label: item, value: item }))}
              placeholder={t('pages.pricing.priceBook.scope.serviceGroupPlaceholder')}
            />
          </Col>
          <Col flex="280px">
            <Select
              allowClear
              disabled={!serviceScope.serviceGroup}
              value={serviceScope.service}
              onChange={(service) => {
                setServiceScope((current) => ({ ...current, service }));
                actionRef.current?.reload();
              }}
              style={{ width: '100%' }}
              options={serviceOptions.map((item) => ({ label: item, value: item }))}
              placeholder={t('pages.pricing.priceBook.scope.servicePlaceholder')}
            />
          </Col>
        </Row>
      </ProCard>

      <ProTable<PricePoint>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        scroll={{ x: 1100 }}
        cardProps={{
          title: (
            <Space>
              <BankOutlined />
              <span>{t('pages.pricing.priceBook.table.title')}</span>
            </Space>
          ),
          extra: (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('pages.pricing.priceBook.table.total', { count: allRecords.length })}
            </Text>
          ),
        }}
        request={async (params) => {
          const res = await request<{ success: boolean; data: PricePoint[] }>(
            '/api/pricing/price-points',
            {
              method: 'GET',
              params: {
                dimension: activeDimension,
                product: serviceScope.product,
                serviceGroup: serviceScope.serviceGroup,
                service: serviceScope.service,
                market: activeDimension === 'REGION' ? activeTarget : undefined,
                segment: activeDimension === 'SEGMENT' ? activeTarget : undefined,
                clientGroup: activeDimension === 'GROUP' ? activeTarget : undefined,
                priceType: params.priceType,
                status: params.status,
                keyword: params.keyword,
              },
            },
          );
          const records = activeDimension !== 'BASE' && !activeTarget ? [] : res.data ?? [];
          setAllRecords(records);
          return {
            data: toPriceBookTree(records) as unknown as PricePoint[],
            success: res.success,
          };
        }}
        toolbar={{
          search: {
            placeholder: t('pages.pricing.priceBook.table.search'),
            onSearch: () => actionRef.current?.reload(),
          },
        }}
        search={{
          labelWidth: 'auto',
          filterType: 'light',
          optionRender: false,
        }}
        pagination={false}
        expandable={{ defaultExpandAllRows: true }}
        options={{ reload: true, density: true, setting: true }}
      />

      <PriceBookForm
        open={formOpen}
        editRecord={editRecord}
        dimension={activeDimension}
        target={activeTarget}
        initialServiceScope={serviceScope}
        onClose={() => setFormOpen(false)}
        onSuccess={() => actionRef.current?.reload()}
      />

      <PriceBookDetailDrawer
        open={detailOpen}
        record={detailRecord}
        onClose={() => setDetailOpen(false)}
        onEdit={(record) => {
          setDetailOpen(false);
          setEditRecord(record);
          setFormOpen(true);
        }}
      />
    </PageContainer>
  );
};

export default PriceBookPage;
