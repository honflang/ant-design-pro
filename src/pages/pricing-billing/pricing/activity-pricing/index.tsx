import {
  BankOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  GiftOutlined,
  MoreOutlined,
  PlusOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormDatePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
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
  Empty,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Steps,
  Tag,
  Table,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useMemo, useRef, useState } from 'react';
import type {
  ActivityCondition,
  ActivityPricingRule,
  ActivityStatus,
  BenefitType,
  ConditionField,
  ConditionGroup,
  ConditionOperator,
  CustomerScopeType,
  InstitutionScopeType,
  PricingActivity,
} from '../../../../../mock/pricingActivity';

const { Text } = Typography;

const PRODUCT_OPTIONS = [
  'Cash Management',
  'Trade Finance',
  'FX Services',
  'Deposit Services',
  'Liquidity Management',
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
};
const CUSTOMER_SEGMENT_OPTIONS = ['Corporate', 'SME', 'Financial Institution', 'Public Sector'];
const CLIENT_GROUP_OPTIONS = ['APAC Strategic Accounts', 'Global Trade Consortium', 'Public Sector Banking'];
const CUSTOMER_OPTIONS = ['ABC Manufacturing Pte Ltd', 'Global Textiles Holdings', 'Pacific Trading Co'];
const INSTITUTION_REGION_OPTIONS = ['ASEAN', 'Greater China', 'Japan', 'Australia'];
const BRANCH_OPTIONS = ['Japan Branch', 'Singapore Branch', 'Sydney Branch', 'Hong Kong Branch'];
const CURRENCY_OPTIONS = ['SGD', 'HKD', 'CNY', 'JPY', 'AUD', 'USD'];
const UNIT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Per Transaction', value: 'PER_TRANSACTION' },
  { label: 'Per Month', value: 'PER_MONTH' },
  { label: 'Per Account', value: 'PER_ACCOUNT' },
];
const CONDITION_FIELD_OPTIONS: ConditionField[] = ['TRB', 'PRODUCT_COUNT', 'INDUSTRY', 'SEGMENT'];
const CONDITION_OPERATOR_OPTIONS: ConditionOperator[] = ['EQ', 'NE', 'GT', 'GTE', 'LT', 'LTE', 'IN'];
const BENEFIT_TYPE_OPTIONS: BenefitType[] = [
  'FIXED_AMOUNT',
  'PERCENTAGE_DISCOUNT',
  'RATE_DISCOUNT',
  'WAIVER',
  'ECR',
];
const STATUS_COLORS: Record<ActivityStatus, string> = {
  DRAFT: 'default',
  PUBLISHED: 'success',
  INACTIVE: 'error',
};
const BENEFIT_TYPE_COLORS: Record<BenefitType, string> = {
  FIXED_AMOUNT: 'blue',
  PERCENTAGE_DISCOUNT: 'purple',
  RATE_DISCOUNT: 'geekblue',
  WAIVER: 'green',
  ECR: 'orange',
};

const formatMoney = (value?: number, currency = 'SGD') => {
  if (value === undefined || value === null) return '—';
  return `${currency} ${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 4,
  })}`;
};

const formatDate = (value?: string) => (value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : '—');

const getCustomerScopeLabel = (record: PricingActivity) => {
  if (record.customerScope === 'BANK_WIDE') return 'Bank-wide';
  if (record.customerScope === 'SEGMENT') return `SEGMENT: ${record.customerSegment ?? '-'}`;
  if (record.customerScope === 'GROUP') return `GROUP: ${record.clientGroup ?? '-'}`;
  return `CUSTOMER: ${record.customerIds?.length ?? 0} selected`;
};

const getInstitutionScopeLabel = (record: PricingActivity) => {
  if (record.institutionScope === 'BANK_WIDE') return 'Bank-wide';
  if (record.institutionScope === 'REGION') return `REGION: ${record.institutionRegion ?? '-'}`;
  return `BRANCH: ${record.branchIds?.join(', ') ?? '-'}`;
};

type Translate = (id: string, values?: Record<string, string | number>) => string;

const getPricingImpact = (rule: ActivityPricingRule, t: Translate) => {
  const currency = rule.currency ?? 'SGD';
  const unitLabel = rule.unit ? ` / ${t(`pages.pricing.activityPricing.unit.${rule.unit}`)}` : '';

  if (rule.benefitType === 'FIXED_AMOUNT') {
    return {
      standard: rule.standardRate !== undefined ? `${formatMoney(rule.standardRate, currency)}${unitLabel}` : '—',
      benefit: t('pages.pricing.activityPricing.detail.benefit.fixedAmount', {
        value: formatMoney(rule.benefitValue, currency),
      }),
      promotional:
        rule.promotionalRate !== undefined
          ? `${formatMoney(rule.promotionalRate, currency)}${unitLabel}`
          : rule.standardRate !== undefined
            ? `${formatMoney((rule.standardRate ?? 0) - (rule.benefitValue ?? 0), currency)}${unitLabel}`
            : '—',
    };
  }
  if (rule.benefitType === 'PERCENTAGE_DISCOUNT') {
    return {
      standard: rule.standardRate !== undefined ? `${formatMoney(rule.standardRate, currency)}${unitLabel}` : '—',
      benefit: t('pages.pricing.activityPricing.detail.benefit.percentageDiscount', {
        value: rule.benefitValue ?? 0,
      }),
      promotional:
        rule.promotionalRate !== undefined
          ? `${formatMoney(rule.promotionalRate, currency)}${unitLabel}`
          : rule.standardRate !== undefined
            ? `${formatMoney((rule.standardRate ?? 0) * (1 - (rule.benefitValue ?? 0) / 100), currency)}${unitLabel}`
            : '—',
    };
  }
  if (rule.benefitType === 'RATE_DISCOUNT') {
    return {
      standard: rule.standardRate !== undefined ? `${rule.standardRate}%` : '—',
      benefit: t('pages.pricing.activityPricing.benefitType.RATE_DISCOUNT'),
      promotional: rule.promotionalRate !== undefined ? `${rule.promotionalRate}%` : '—',
    };
  }
  if (rule.benefitType === 'WAIVER') {
    return {
      standard: rule.standardRate !== undefined ? `${formatMoney(rule.standardRate, currency)}${unitLabel}` : '—',
      benefit: t('pages.pricing.activityPricing.detail.benefit.waiver'),
      promotional: `${formatMoney(0, currency)}${unitLabel}`,
    };
  }
  return {
    standard: rule.ecrReference ?? '—',
    benefit: t('pages.pricing.activityPricing.detail.benefit.ecr', {
      rate: rule.ecrRate ?? 0,
      spread: rule.ecrSpread ?? 0,
    }),
    promotional:
      rule.ecrMaxCredit !== undefined
        ? t('pages.pricing.activityPricing.detail.benefit.maxCredit', {
            value: formatMoney(rule.ecrMaxCredit, currency),
          })
        : '—',
  };
};

const emptyRule = (): Partial<ActivityPricingRule> => ({ benefitType: 'PERCENTAGE_DISCOUNT', currency: 'SGD' });
const emptyCondition = (): Partial<ActivityCondition> => ({ field: 'TRB', operator: 'GTE' });
const emptyGroup = (): { operator: 'AND'; conditions: Partial<ActivityCondition>[] } => ({
  operator: 'AND',
  conditions: [emptyCondition()],
});

const ActivityForm: React.FC<{
  open: boolean;
  editRecord?: PricingActivity;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ open, editRecord, onClose, onSuccess }) => {
  const intl = useIntl();
  const { message } = App.useApp();
  const [form] = ProForm.useForm();
  const t = (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values);

  const customerScope: CustomerScopeType = ProForm.useWatch('customerScope', form) ?? 'BANK_WIDE';
  const institutionScope: InstitutionScopeType = ProForm.useWatch('institutionScope', form) ?? 'BANK_WIDE';

  const handleFinish = async (values: Record<string, any>) => {
    try {
      const payload: Partial<PricingActivity> = {
        ...values,
        effectiveFrom: values.effectiveFrom ? dayjs(values.effectiveFrom).format('YYYY-MM-DD') : undefined,
        effectiveTo: values.effectiveTo ? dayjs(values.effectiveTo).format('YYYY-MM-DD') : undefined,
        customerSegment: values.customerScope === 'SEGMENT' ? values.customerSegment : undefined,
        clientGroup: values.customerScope === 'GROUP' ? values.clientGroup : undefined,
        customerIds: values.customerScope === 'CUSTOMER' ? values.customerIds : undefined,
        institutionRegion: values.institutionScope === 'REGION' ? values.institutionRegion : undefined,
        branchIds: values.institutionScope === 'BRANCH' ? values.branchIds : undefined,
        triggerConditions: (values.triggerConditions ?? [])
          .filter((group: ConditionGroup) => group?.conditions?.length)
          .map((group: ConditionGroup) => ({
            operator: group.operator ?? 'AND',
            conditions: group.conditions.map((condition) => ({
              ...condition,
              value:
                condition.operator === 'IN' && typeof condition.value === 'string'
                  ? condition.value.split(',').map((v) => v.trim())
                  : condition.field === 'TRB' || condition.field === 'PRODUCT_COUNT'
                    ? Number(condition.value)
                    : condition.value,
            })),
          })),
        rules: (values.rules ?? []).map((rule: ActivityPricingRule, index: number) => ({
          ...rule,
          id: editRecord?.rules?.[index]?.id ?? `apr-${Date.now()}-${index}`,
        })),
      };

      if (editRecord) {
        await request(`/api/pricing/activities/${editRecord.id}`, { method: 'PUT', data: payload });
        message.success(t('pages.pricing.activityPricing.msg.updated'));
      } else {
        await request('/api/pricing/activities', { method: 'POST', data: { ...payload, status: 'DRAFT' } });
        message.success(t('pages.pricing.activityPricing.msg.created'));
      }
      onSuccess();
      onClose();
    } catch {
      message.error(t('pages.pricing.activityPricing.msg.failed'));
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <GiftOutlined />
          {editRecord
            ? t('pages.pricing.activityPricing.form.editTitle')
            : t('pages.pricing.activityPricing.form.addTitle')}
        </Space>
      }
      open={open}
      width={820}
      onClose={onClose}
      destroyOnHidden
      footer={null}
    >
      <ProForm
        form={form}
        layout="vertical"
        initialValues={{
          status: 'DRAFT',
          customerScope: 'BANK_WIDE',
          institutionScope: 'BANK_WIDE',
          triggerConditions: [],
          rules: [],
          ...editRecord,
          effectiveFrom: editRecord?.effectiveFrom ? dayjs(editRecord.effectiveFrom) : undefined,
          effectiveTo: editRecord?.effectiveTo ? dayjs(editRecord.effectiveTo) : undefined,
        }}
        onFinish={handleFinish}
        submitter={{
          render: (_, doms) => (
            <Space style={{ float: 'right' }}>
              <Button onClick={onClose}>{t('pages.pricing.activityPricing.form.cancel')}</Button>
              {doms[1]}
            </Space>
          ),
        }}
      >
        <ProCard title={t('pages.pricing.activityPricing.form.section.overview')} style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}>
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="activityCode"
                label={t('pages.pricing.activityPricing.form.activityCode')}
                placeholder="ACT-2026-00X"
                disabled={Boolean(editRecord)}
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="activityName"
                label={t('pages.pricing.activityPricing.form.activityName')}
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={12}>
              <ProFormDatePicker
                name="effectiveFrom"
                label={t('pages.pricing.activityPricing.form.effectiveFrom')}
                rules={[{ required: true }]}
                fieldProps={{ style: { width: '100%' } }}
              />
            </Col>
            <Col span={12}>
              <ProFormDatePicker
                name="effectiveTo"
                label={t('pages.pricing.activityPricing.form.effectiveTo')}
                fieldProps={{ style: { width: '100%' } }}
                rules={[
                  {
                    validator: async (_rule: unknown, value: dayjs.Dayjs) => {
                      const from = form.getFieldValue('effectiveFrom');
                      if (value && from && dayjs(value).isBefore(dayjs(from))) {
                        throw new Error(t('pages.pricing.activityPricing.form.expiryError'));
                      }
                    },
                  },
                ]}
              />
            </Col>
          </Row>
        </ProCard>

        <ProCard title={t('pages.pricing.activityPricing.form.section.customerScope')} style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}>
          <ProFormRadio.Group
            name="customerScope"
            label={t('pages.pricing.activityPricing.form.customerScope')}
            options={[
              { label: t('pages.pricing.activityPricing.scope.bankWide'), value: 'BANK_WIDE' },
              { label: t('pages.pricing.activityPricing.scope.segment'), value: 'SEGMENT' },
              { label: t('pages.pricing.activityPricing.scope.group'), value: 'GROUP' },
              { label: t('pages.pricing.activityPricing.scope.customer'), value: 'CUSTOMER' },
            ]}
          />
          {customerScope === 'SEGMENT' && (
            <ProFormSelect
              name="customerSegment"
              label={t('pages.pricing.activityPricing.form.customerSegment')}
              options={CUSTOMER_SEGMENT_OPTIONS.map((item) => ({ label: item, value: item }))}
              rules={[{ required: true }]}
            />
          )}
          {customerScope === 'GROUP' && (
            <ProFormSelect
              name="clientGroup"
              label={t('pages.pricing.activityPricing.form.clientGroup')}
              options={CLIENT_GROUP_OPTIONS.map((item) => ({ label: item, value: item }))}
              rules={[{ required: true }]}
            />
          )}
          {customerScope === 'CUSTOMER' && (
            <ProFormSelect
              name="customerIds"
              label={t('pages.pricing.activityPricing.form.customerIds')}
              mode="multiple"
              options={CUSTOMER_OPTIONS.map((item) => ({ label: item, value: item }))}
              rules={[{ required: true, type: 'array', min: 1 }]}
            />
          )}
        </ProCard>

        <ProCard title={t('pages.pricing.activityPricing.form.section.institutionScope')} style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}>
          <ProFormRadio.Group
            name="institutionScope"
            label={t('pages.pricing.activityPricing.form.institutionScope')}
            options={[
              { label: t('pages.pricing.activityPricing.scope.bankWide'), value: 'BANK_WIDE' },
              { label: t('pages.pricing.activityPricing.scope.region'), value: 'REGION' },
              { label: t('pages.pricing.activityPricing.scope.branch'), value: 'BRANCH' },
            ]}
          />
          {institutionScope === 'REGION' && (
            <ProFormSelect
              name="institutionRegion"
              label={t('pages.pricing.activityPricing.form.institutionRegion')}
              options={INSTITUTION_REGION_OPTIONS.map((item) => ({ label: item, value: item }))}
              rules={[{ required: true }]}
            />
          )}
          {institutionScope === 'BRANCH' && (
            <ProFormSelect
              name="branchIds"
              label={t('pages.pricing.activityPricing.form.branchIds')}
              mode="multiple"
              options={BRANCH_OPTIONS.map((item) => ({ label: item, value: item }))}
              rules={[{ required: true, type: 'array', min: 1 }]}
            />
          )}
        </ProCard>

        <ProCard title={t('pages.pricing.activityPricing.form.section.trigger')} style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}>
          <Form.List name="triggerConditions">
            {(groupFields, { add: addGroup, remove: removeGroup }) => (
              <>
                {groupFields.map((groupField) => (
                  <ProCard
                    key={groupField.key}
                    size="small"
                    style={{ marginBottom: 12, background: '#fafafa' }}
                    extra={
                      <Space size={4}>
                        <Form.Item name={[groupField.name, 'operator']} noStyle initialValue="AND">
                          <Select
                            size="small"
                            style={{ width: 90 }}
                            options={[
                              { label: 'AND', value: 'AND' },
                              { label: 'OR', value: 'OR' },
                            ]}
                          />
                        </Form.Item>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeGroup(groupField.name)}
                        />
                      </Space>
                    }
                  >
                    <Form.List name={[groupField.name, 'conditions']}>
                      {(conditionFields, { add: addCondition, remove: removeCondition }) => (
                        <>
                          {conditionFields.map((conditionField, conditionIndex) => (
                            <Row gutter={8} key={conditionField.key} style={{ marginBottom: 8 }} align="middle">
                              <Col span={6}>
                                <Form.Item
                                  name={[conditionField.name, 'field']}
                                  rules={[{ required: true, message: t('pages.pricing.activityPricing.form.conditionField') }]}
                                  noStyle
                                >
                                  <Select
                                    placeholder={t('pages.pricing.activityPricing.form.conditionField')}
                                    options={CONDITION_FIELD_OPTIONS.map((item) => ({ label: item, value: item }))}
                                    style={{ width: '100%' }}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={5}>
                                <Form.Item
                                  name={[conditionField.name, 'operator']}
                                  rules={[{ required: true, message: t('pages.pricing.activityPricing.form.conditionOperator') }]}
                                  noStyle
                                >
                                  <Select
                                    placeholder={t('pages.pricing.activityPricing.form.conditionOperator')}
                                    options={CONDITION_OPERATOR_OPTIONS.map((item) => ({ label: item, value: item }))}
                                    style={{ width: '100%' }}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={9}>
                                <Form.Item
                                  name={[conditionField.name, 'value']}
                                  rules={[{ required: true, message: t('pages.pricing.activityPricing.form.conditionValue') }]}
                                  noStyle
                                >
                                  <Input placeholder={t('pages.pricing.activityPricing.form.conditionValue')} />
                                </Form.Item>
                              </Col>
                              <Col span={4}>
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={() => removeCondition(conditionField.name)}
                                />
                              </Col>
                            </Row>
                          ))}
                          <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => addCondition(emptyCondition())}
                          >
                            {t('pages.pricing.activityPricing.form.addCondition')}
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </ProCard>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => addGroup(emptyGroup())}>
                  {t('pages.pricing.activityPricing.form.addConditionGroup')}
                </Button>
              </>
            )}
          </Form.List>
        </ProCard>

        <ProCard title={t('pages.pricing.activityPricing.form.section.rules')} style={{ border: '1px solid #f0f0f0' }}>
          <Form.List name="rules">
            {(ruleFields, { add: addRule, remove: removeRule }) => (
              <>
                {ruleFields.map((ruleField) => (
                  <ProCard key={ruleField.key} size="small" style={{ marginBottom: 12, background: '#fafafa' }}
                    extra={
                      <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeRule(ruleField.name)} />
                    }
                  >
                    <Row gutter={12}>
                      <Col span={8}>
                        <Form.Item name={[ruleField.name, 'product']} label={t('pages.pricing.activityPricing.form.ruleProduct')} rules={[{ required: true }]}>
                          <Select options={PRODUCT_OPTIONS.map((item) => ({ label: item, value: item }))} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item shouldUpdate noStyle>
                          {({ getFieldValue }) => {
                            const product = getFieldValue(['rules', ruleField.name, 'product']);
                            const options = product ? Object.keys(SERVICE_CATALOG[product] ?? {}) : [];
                            return (
                              <Form.Item name={[ruleField.name, 'serviceGroup']} label={t('pages.pricing.activityPricing.form.ruleServiceGroup')}>
                                <Select allowClear disabled={!product} options={options.map((item) => ({ label: item, value: item }))} />
                              </Form.Item>
                            );
                          }}
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item shouldUpdate noStyle>
                          {({ getFieldValue }) => {
                            const product = getFieldValue(['rules', ruleField.name, 'product']);
                            const serviceGroup = getFieldValue(['rules', ruleField.name, 'serviceGroup']);
                            const options = product && serviceGroup ? SERVICE_CATALOG[product]?.[serviceGroup] ?? [] : [];
                            return (
                              <Form.Item name={[ruleField.name, 'service']} label={t('pages.pricing.activityPricing.form.ruleService')}>
                                <Select allowClear disabled={!serviceGroup} options={options.map((item) => ({ label: item, value: item }))} />
                              </Form.Item>
                            );
                          }}
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name={[ruleField.name, 'feeItem']} label={t('pages.pricing.activityPricing.form.ruleFeeItem')}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name={[ruleField.name, 'benefitType']} label={t('pages.pricing.activityPricing.form.benefitType')} rules={[{ required: true }]}>
                          <Select options={BENEFIT_TYPE_OPTIONS.map((item) => ({ label: item, value: item }))} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name={[ruleField.name, 'currency']} label={t('pages.pricing.activityPricing.form.currency')} rules={[{ required: true }]}>
                          <Select options={CURRENCY_OPTIONS.map((item) => ({ label: item, value: item }))} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => {
                        const benefitType: BenefitType = getFieldValue(['rules', ruleField.name, 'benefitType']);
                        return (
                          <Row gutter={12}>
                            {benefitType === 'FIXED_AMOUNT' && (
                              <>
                                <Col span={8}>
                                  <Form.Item name={[ruleField.name, 'benefitValue']} label={t('pages.pricing.activityPricing.form.benefitValue')} rules={[{ required: true }]}>
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                  </Form.Item>
                                </Col>
                                <Col span={8}>
                                  <Form.Item name={[ruleField.name, 'unit']} label={t('pages.pricing.activityPricing.form.unit')} rules={[{ required: true }]}>
                                    <Select options={UNIT_OPTIONS} />
                                  </Form.Item>
                                </Col>
                                <Col span={8}>
                                  <Form.Item name={[ruleField.name, 'standardRate']} label={t('pages.pricing.activityPricing.form.standardRate')}>
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                  </Form.Item>
                                </Col>
                              </>
                            )}
                            {benefitType === 'PERCENTAGE_DISCOUNT' && (
                              <>
                                <Col span={8}>
                                  <Form.Item name={[ruleField.name, 'benefitValue']} label={t('pages.pricing.activityPricing.form.discountPercent')} rules={[{ required: true }]}>
                                    <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                                  </Form.Item>
                                </Col>
                                <Col span={8}>
                                  <Form.Item name={[ruleField.name, 'standardRate']} label={t('pages.pricing.activityPricing.form.standardRate')}>
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                  </Form.Item>
                                </Col>
                                <Col span={8}>
                                  <Form.Item name={[ruleField.name, 'unit']} label={t('pages.pricing.activityPricing.form.unit')}>
                                    <Select allowClear options={UNIT_OPTIONS} />
                                  </Form.Item>
                                </Col>
                              </>
                            )}
                            {benefitType === 'RATE_DISCOUNT' && (
                              <>
                                <Col span={12}>
                                  <Form.Item name={[ruleField.name, 'standardRate']} label={t('pages.pricing.activityPricing.form.standardRate')} rules={[{ required: true }]}>
                                    <InputNumber min={0} style={{ width: '100%' }} addonAfter="%" />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item name={[ruleField.name, 'promotionalRate']} label={t('pages.pricing.activityPricing.form.promotionalRate')} rules={[{ required: true }]}>
                                    <InputNumber min={0} style={{ width: '100%' }} addonAfter="%" />
                                  </Form.Item>
                                </Col>
                              </>
                            )}
                            {benefitType === 'WAIVER' && (
                              <Col span={8}>
                                <Form.Item name={[ruleField.name, 'standardRate']} label={t('pages.pricing.activityPricing.form.standardRate')}>
                                  <InputNumber min={0} style={{ width: '100%' }} />
                                </Form.Item>
                              </Col>
                            )}
                            {benefitType === 'ECR' && (
                              <>
                                <Col span={8}>
                                  <Form.Item name={[ruleField.name, 'ecrReference']} label={t('pages.pricing.activityPricing.form.ecrReference')} rules={[{ required: true }]}>
                                    <Input />
                                  </Form.Item>
                                </Col>
                                <Col span={8}>
                                  <Form.Item name={[ruleField.name, 'ecrRate']} label={t('pages.pricing.activityPricing.form.ecrRate')} rules={[{ required: true }]}>
                                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="%" />
                                  </Form.Item>
                                </Col>
                                <Col span={8}>
                                  <Form.Item name={[ruleField.name, 'ecrSpread']} label={t('pages.pricing.activityPricing.form.ecrSpread')} rules={[{ required: true }]}>
                                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="%" />
                                  </Form.Item>
                                </Col>
                                <Col span={8}>
                                  <Form.Item name={[ruleField.name, 'ecrMaxCredit']} label={t('pages.pricing.activityPricing.form.ecrMaxCredit')}>
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                  </Form.Item>
                                </Col>
                              </>
                            )}
                          </Row>
                        );
                      }}
                    </Form.Item>
                    <Form.Item name={[ruleField.name, 'description']} label={t('pages.pricing.activityPricing.form.description')}>
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </ProCard>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => addRule(emptyRule())}>
                  {t('pages.pricing.activityPricing.form.addRule')}
                </Button>
              </>
            )}
          </Form.List>
        </ProCard>
      </ProForm>
    </Drawer>
  );
};

const ActivityDetailDrawer: React.FC<{
  open: boolean;
  record?: PricingActivity;
  onClose: () => void;
  onEdit: (record: PricingActivity) => void;
}> = ({ open, record, onClose, onEdit }) => {
  const intl = useIntl();
  const t = (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values);

  if (!record) return null;

  return (
    <Drawer
      title={
        <Space>
          <EyeOutlined />
          {t('pages.pricing.activityPricing.detail.title')}
        </Space>
      }
      size="min(1080px, 92vw)"
      open={open}
      onClose={onClose}
      destroyOnHidden
      extra={
        <Button type="primary" size="small" onClick={() => onEdit(record)}>
          {t('pages.pricing.activityPricing.action.edit')}
        </Button>
      }
    >
      <ProCard title={t('pages.pricing.activityPricing.detail.overview')} style={{ marginBottom: 16 }}>
        <ProDescriptions<PricingActivity>
          column={2}
          dataSource={record}
          columns={[
            { title: t('pages.pricing.activityPricing.col.code'), dataIndex: 'activityCode' },
            { title: t('pages.pricing.activityPricing.col.name'), dataIndex: 'activityName' },
            {
              title: t('pages.pricing.activityPricing.col.status'),
              dataIndex: 'status',
              render: (_, r) => <Tag color={STATUS_COLORS[r.status]}>{r.status}</Tag>,
            },
            {
              title: t('pages.pricing.activityPricing.col.period'),
              dataIndex: 'effectiveFrom',
              render: (_, r) => `${formatDate(r.effectiveFrom)} → ${formatDate(r.effectiveTo)}`,
            },
            {
              title: t('pages.pricing.activityPricing.col.customerScope'),
              dataIndex: 'customerScope',
              render: (_, r) => getCustomerScopeLabel(r),
            },
            {
              title: t('pages.pricing.activityPricing.col.institutionScope'),
              dataIndex: 'institutionScope',
              render: (_, r) => getInstitutionScopeLabel(r),
            },
            { title: t('pages.pricing.activityPricing.col.updatedBy'), dataIndex: 'updatedBy' },
            { title: t('pages.pricing.activityPricing.col.updatedAt'), dataIndex: 'updatedAt', render: (_, r) => r.updatedAt?.substring(0, 10) },
          ]}
        />
      </ProCard>

      <ProCard title={t('pages.pricing.activityPricing.detail.trigger')} style={{ marginBottom: 16 }}>
        {record.triggerConditions.length ? (
          record.triggerConditions.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupIndex > 0 && (
                <div style={{ textAlign: 'center', margin: '8px 0' }}>
                  <Tag color="orange">AND</Tag>
                </div>
              )}
              <ProCard size="small" style={{ border: '1px solid #f0f0f0' }}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  {group.conditions.map((condition, conditionIndex) => (
                    <React.Fragment key={conditionIndex}>
                      {conditionIndex > 0 && (
                        <Tag color={group.operator === 'AND' ? 'blue' : 'purple'}>{group.operator}</Tag>
                      )}
                      <Space wrap>
                        <Tag color="geekblue">{condition.field}</Tag>
                        <Text>{condition.operator}</Text>
                        <Text strong>{Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}</Text>
                      </Space>
                    </React.Fragment>
                  ))}
                </Space>
              </ProCard>
            </React.Fragment>
          ))
        ) : (
          <Empty description={t('pages.pricing.activityPricing.detail.noTrigger')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </ProCard>

      <ProCard title={t('pages.pricing.activityPricing.detail.rules')}>
        <Table<ActivityPricingRule>
          rowKey="id"
          size="small"
          pagination={false}
          tableLayout="fixed"
          scroll={{ x: 1080 }}
          dataSource={record.rules}
          columns={[
            {
              title: t('pages.pricing.activityPricing.detail.ruleScope'),
              key: 'scope',
              width: 320,
              render: (_, rule) => (
                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                  <Text strong>{[rule.product, rule.serviceGroup, rule.service, rule.feeItem].filter(Boolean).join(' / ')}</Text>
                  {rule.description && <Text type="secondary">{rule.description}</Text>}
                </Space>
              ),
            },
            {
              title: t('pages.pricing.activityPricing.form.benefitType'),
              dataIndex: 'benefitType',
              width: 170,
              render: (_, rule) => (
                <Tag color={BENEFIT_TYPE_COLORS[rule.benefitType]}>
                  {t(`pages.pricing.activityPricing.benefitType.${rule.benefitType}`)}
                </Tag>
              ),
            },
            {
              title: t('pages.pricing.activityPricing.detail.impact.standard'),
              key: 'standard',
              width: 195,
              render: (_, rule) => getPricingImpact(rule, t).standard,
            },
            {
              title: t('pages.pricing.activityPricing.detail.impact.benefit'),
              key: 'benefit',
              width: 195,
              render: (_, rule) => getPricingImpact(rule, t).benefit,
            },
            {
              title: t('pages.pricing.activityPricing.detail.impact.promotional'),
              key: 'promotional',
              width: 200,
              render: (_, rule) => <Text strong style={{ color: '#389e0d' }}>{getPricingImpact(rule, t).promotional}</Text>,
            },
          ]}
        />
      </ProCard>
    </Drawer>
  );
};

const ActivityPricingPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message, modal } = App.useApp();
  const intl = useIntl();
  const t = (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values);

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<PricingActivity | undefined>();
  const [detailRecord, setDetailRecord] = useState<PricingActivity | undefined>();
  const [summary, setSummary] = useState({ total: 0, draft: 0, published: 0, inactive: 0 });

  const handleChangeStatus = (record: PricingActivity, nextStatus: ActivityStatus) => {
    const isDisable = nextStatus === 'INACTIVE';
    modal.confirm({
      title: isDisable
        ? t('pages.pricing.activityPricing.confirm.disableTitle')
        : t('pages.pricing.activityPricing.confirm.publishTitle'),
      content: isDisable
        ? t('pages.pricing.activityPricing.confirm.disableContent', { name: record.activityName })
        : t('pages.pricing.activityPricing.confirm.publishContent', { name: record.activityName }),
      okType: isDisable ? 'danger' : 'primary',
      onOk: async () => {
        try {
          await request(`/api/pricing/activities/${record.id}/status`, {
            method: 'PATCH',
            data: { status: nextStatus },
          });
          message.success(
            isDisable ? t('pages.pricing.activityPricing.msg.disabled') : t('pages.pricing.activityPricing.msg.published'),
          );
          actionRef.current?.reload();
        } catch {
          message.error(t('pages.pricing.activityPricing.msg.failed'));
        }
      },
    });
  };

  const columns: ProColumns<PricingActivity>[] = useMemo(
    () => [
      { title: t('pages.pricing.activityPricing.col.code'), dataIndex: 'activityCode', width: 140, copyable: true },
      { title: t('pages.pricing.activityPricing.col.name'), dataIndex: 'activityName', width: 240, ellipsis: true, hideInSearch: true },
      {
        title: t('pages.pricing.activityPricing.col.status'),
        dataIndex: 'status',
        width: 110,
        valueType: 'select',
        valueEnum: {
          DRAFT: { text: 'Draft', status: 'Default' },
          PUBLISHED: { text: 'Published', status: 'Success' },
          INACTIVE: { text: 'Inactive', status: 'Error' },
        },
        render: (_, r) => <Tag color={STATUS_COLORS[r.status]}>{r.status}</Tag>,
      },
      {
        title: t('pages.pricing.activityPricing.col.period'),
        dataIndex: 'effectiveFrom',
        hideInSearch: true,
        width: 240,
        ellipsis: true,
        render: (_, r) => `${formatDate(r.effectiveFrom)} → ${formatDate(r.effectiveTo)}`,
      },
      {
        title: t('pages.pricing.activityPricing.col.customerScope'),
        dataIndex: 'customerScope',
        width: 160,
        valueType: 'select',
        valueEnum: {
          BANK_WIDE: { text: 'Bank-wide' },
          SEGMENT: { text: 'Segment' },
          GROUP: { text: 'Group' },
          CUSTOMER: { text: 'Customer' },
        },
        render: (_, r) => getCustomerScopeLabel(r),
      },
      {
        title: t('pages.pricing.activityPricing.col.institutionScope'),
        dataIndex: 'institutionScope',
        width: 160,
        valueType: 'select',
        valueEnum: {
          BANK_WIDE: { text: 'Bank-wide' },
          REGION: { text: 'Region' },
          BRANCH: { text: 'Branch' },
        },
        render: (_, r) => getInstitutionScopeLabel(r),
      },
      {
        title: t('pages.pricing.activityPricing.col.rules'),
        dataIndex: 'rules',
        hideInSearch: true,
        width: 100,
        render: (_, r) => `${r.rules.length} Rules`,
      },
      { title: t('pages.pricing.activityPricing.col.updatedAt'), dataIndex: 'updatedAt', hideInSearch: true, valueType: 'dateTime', width: 160 },
      { title: t('pages.pricing.activityPricing.col.keyword'), dataIndex: 'keyword', hideInTable: true },
      {
        title: t('pages.pricing.activityPricing.col.actions'),
        dataIndex: 'actions',
        hideInSearch: true,
        fixed: 'right',
        width: 80,
        render: (_, record) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  label: t('pages.pricing.activityPricing.action.view'),
                  icon: <EyeOutlined />,
                  onClick: () => {
                    setDetailRecord(record);
                    setDetailOpen(true);
                  },
                },
                {
                  key: 'edit',
                  label: t('pages.pricing.activityPricing.action.edit'),
                  icon: <EditOutlined />,
                  onClick: () => {
                    setEditRecord(record);
                    setFormOpen(true);
                  },
                },
                { type: 'divider' },
                record.status === 'DRAFT' && {
                  key: 'publish',
                  label: t('pages.pricing.activityPricing.action.publish'),
                  icon: <CheckCircleOutlined />,
                  onClick: () => handleChangeStatus(record, 'PUBLISHED'),
                },
                record.status === 'PUBLISHED' && {
                  key: 'disable',
                  label: t('pages.pricing.activityPricing.action.disable'),
                  danger: true,
                  icon: <StopOutlined />,
                  onClick: () => handleChangeStatus(record, 'INACTIVE'),
                },
              ].filter(Boolean) as any,
            }}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        ),
      },
    ],
    [t],
  );

  return (
    <PageContainer title={t('pages.pricing.activityPricing.title')} subTitle={t('pages.pricing.activityPricing.subTitle')}>
      <ProCard style={{ marginBottom: 16, background: 'linear-gradient(135deg, #fff7e6 0%, #f6ffed 100%)', border: '1px solid #ffe7ba' }}>
        <Text strong style={{ color: '#d4380d', fontSize: 15 }}>
          {t('pages.pricing.activityPricing.flow.title')}
        </Text>
        <div style={{ marginTop: 8 }}>
          <Steps
            size="small"
            current={100}
            items={[
              { title: t('pages.pricing.activityPricing.flow.priceBook') },
              { title: t('pages.pricing.activityPricing.flow.activityPricing') },
              { title: t('pages.pricing.activityPricing.flow.pricingRule') },
              { title: t('pages.pricing.activityPricing.flow.promotionalPrice') },
              { title: t('pages.pricing.activityPricing.flow.billing') },
            ]}
          />
        </div>
      </ProCard>

      <StatisticCard.Group style={{ marginBottom: 16 }} direction="row">
        <StatisticCard statistic={{ title: t('pages.pricing.activityPricing.stat.total'), value: summary.total }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.pricing.activityPricing.stat.draft'), value: summary.draft }} />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{ title: t('pages.pricing.activityPricing.stat.published'), value: summary.published, valueStyle: { color: '#389e0d' } }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{ title: t('pages.pricing.activityPricing.stat.inactive'), value: summary.inactive, valueStyle: { color: '#cf1322' } }}
        />
      </StatisticCard.Group>

      <ProTable<PricingActivity>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        scroll={{ x: 1100 }}
        cardProps={{
          title: (
            <Space>
              <BankOutlined />
              <span>{t('pages.pricing.activityPricing.table.title')}</span>
            </Space>
          ),
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditRecord(undefined);
              setFormOpen(true);
            }}
          >
            {t('pages.pricing.activityPricing.createActivity')}
          </Button>,
        ]}
        request={async (params) => {
          const res = await request<{ success: boolean; data: PricingActivity[] }>('/api/pricing/activities', {
            method: 'GET',
            params: {
              status: params.status,
              customerScope: params.customerScope,
              institutionScope: params.institutionScope,
              keyword: params.keyword,
            },
          });
          const data = res.data ?? [];
          setSummary({
            total: data.length,
            draft: data.filter((item) => item.status === 'DRAFT').length,
            published: data.filter((item) => item.status === 'PUBLISHED').length,
            inactive: data.filter((item) => item.status === 'INACTIVE').length,
          });
          return { data, success: res.success };
        }}
      />

      <ActivityForm
        open={formOpen}
        editRecord={editRecord}
        onClose={() => setFormOpen(false)}
        onSuccess={() => actionRef.current?.reload()}
      />
      <ActivityDetailDrawer
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

export default ActivityPricingPage;
