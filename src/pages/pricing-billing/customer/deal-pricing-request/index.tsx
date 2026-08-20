import {
  EditOutlined,
  EyeOutlined,
  FileAddOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { history, useIntl } from '@umijs/max';
import {
  Alert,
  App,
  Button,
  Col,
  Drawer,
  Dropdown,
  Form,
  InputNumber,
  Modal,
  Row,
  Space,
  Table,
  Tag,
} from 'antd';
import React, { useMemo, useState } from 'react';
import { customers, findCustomerById } from '../360/mock';
import type {
  BenchmarkSource,
  DealPricingPriceDetail,
  DealPricingRequest,
  DealPricingRequestFormValues,
  DealPricingRequestStatus,
  RequestedPriceType,
} from './data';
import {
  clonePriceDetails,
  initialDealPricingRequests,
  priceDetailOptions,
} from './mock';

const requestStatusColors: Record<DealPricingRequestStatus, string> = {
  DRAFT: 'default',
  SIMULATED: 'blue',
  PENDING_APPROVAL: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
  WITHDRAWN: 'default',
};

const money = (value: number, currency: string) =>
  `${currency} ${value.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;

const isEditable = (request: DealPricingRequest) =>
  request.status === 'DRAFT' || request.status === 'SIMULATED';

const DealPricingRequestPage: React.FC = () => {
  const intl = useIntl();
  const { message } = App.useApp();
  const [form] = Form.useForm<DealPricingRequestFormValues>();
  const [requests, setRequests] = useState(initialDealPricingRequests);
  const [editingRequest, setEditingRequest] =
    useState<DealPricingRequest | null>(null);
  const [detailRequest, setDetailRequest] = useState<DealPricingRequest | null>(
    null,
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [isNewRequest, setIsNewRequest] = useState(false);
  const [priceDetailsOpen, setPriceDetailsOpen] = useState(false);
  const [editingDetails, setEditingDetails] = useState<
    DealPricingPriceDetail[]
  >([]);
  const t = (id: string, defaultMessage = id) =>
    intl.formatMessage({ id, defaultMessage });
  const enumLabel = (group: string, value: string) =>
    t(`pages.dealPricingRequest.enum.${group}.${value.toLowerCase()}`);

  const summary = useMemo(
    () => ({
      draft: requests.filter((request) => request.status === 'DRAFT').length,
      pending: requests.filter(
        (request) => request.status === 'PENDING_APPROVAL',
      ).length,
      approved: requests.filter((request) => request.status === 'APPROVED')
        .length,
      ecr: requests.filter((request) => request.ecrPricingRequested).length,
    }),
    [requests],
  );

  const applyCustomer = (customerId: string) => {
    const customer = findCustomerById(customerId) ?? customers[0];
    form.setFieldsValue({
      customerId: customer.id,
      market: customer.operatingMarkets[0],
      currency: 'USD',
    });
  };

  const openNewRequest = () => {
    const customer = customers[0];
    const draft: DealPricingRequest = {
      id: `DPR-2026-${String(requests.length + 1).padStart(3, '0')}`,
      customerId: customer.id,
      customerName: customer.customerName,
      customerSegment: customer.segment,
      relationshipManager: customer.relationshipManager,
      requestType: 'NEW_AGREEMENT',
      requestReason: 'STRATEGIC_CUSTOMER',
      benchmarkSource: 'TARIFF',
      benchmarkPlan: 'Global Cash Management Tariff 2026',
      market: customer.operatingMarkets[0],
      currency: 'USD',
      effectiveStartDate: '2026-09-01',
      ecrPricingRequested: false,
      priceDetails: [priceDetailOptions()[0]],
      status: 'DRAFT',
      requestedBy: 'Current RM',
      requestedAt: new Date().toISOString(),
    };
    setEditingRequest(draft);
    setEditingDetails(clonePriceDetails(draft.priceDetails));
    form.setFieldsValue(draft);
    setIsNewRequest(true);
    setEditorOpen(true);
  };

  const openEditRequest = (request: DealPricingRequest) => {
    setEditingRequest(request);
    setEditingDetails(clonePriceDetails(request.priceDetails));
    form.setFieldsValue(request);
    setIsNewRequest(false);
    setEditorOpen(true);
  };

  const updateDetail = (
    detailId: string,
    field: keyof DealPricingPriceDetail,
    value: string | number | undefined,
  ) => {
    setEditingDetails((details) =>
      details.map((detail) =>
        detail.id === detailId ? { ...detail, [field]: value } : detail,
      ),
    );
  };

  const addPriceDetail = () => {
    const existing = new Set(editingDetails.map((detail) => detail.id));
    const next = priceDetailOptions().find(
      (detail) => !existing.has(detail.id),
    );
    if (next) setEditingDetails((details) => [...details, next]);
  };

  const createUpdatedRequest = (
    values: DealPricingRequestFormValues,
  ): DealPricingRequest | null => {
    if (!editingRequest) return null;
    const customer = findCustomerById(values.customerId) ?? customers[0];
    return {
      ...editingRequest,
      ...values,
      customerId: customer.id,
      customerName: customer.customerName,
      customerSegment: customer.segment,
      relationshipManager: customer.relationshipManager,
      priceDetails: clonePriceDetails(editingDetails),
    };
  };

  const saveRequest = async () => {
    const values = await form.validateFields();
    const updated = createUpdatedRequest(values);
    if (!updated) return;
    setRequests((current) => {
      const existing = current.some((request) => request.id === updated.id);
      return existing
        ? current.map((request) =>
            request.id === updated.id ? updated : request,
          )
        : [updated, ...current];
    });
    setEditingRequest(updated);
    message.success(t('pages.dealPricingRequest.message.draftSaved'));
  };

  const runSimulation = async () => {
    const values = await form.validateFields();
    if (editingDetails.length === 0) {
      message.error(
        t('pages.dealPricingRequest.validation.priceDetailsRequired'),
      );
      return;
    }
    const updated = createUpdatedRequest(values);
    if (!updated) return;
    const amounts = editingDetails.map((detail) => {
      const baseline = detail.baselinePrice * detail.mockAnnualVolume;
      const requested =
        detail.requestedPriceType === 'DISCOUNT'
          ? baseline * (1 - (detail.requestedPrice ?? 0) / 100)
          : detail.requestedPriceType === 'WAIVER'
            ? 0
            : (detail.requestedPrice ?? detail.baselinePrice) *
              detail.mockAnnualVolume;
      return { baseline, requested };
    });
    const baselineAnnualizedFee = amounts.reduce(
      (total, item) => total + item.baseline,
      0,
    );
    const requestedAnnualizedFee = amounts.reduce(
      (total, item) => total + item.requested,
      0,
    );
    const requestedDiscountPercent = baselineAnnualizedFee
      ? ((baselineAnnualizedFee - requestedAnnualizedFee) /
          baselineAnnualizedFee) *
        100
      : 0;
    const simulated: DealPricingRequest = {
      ...updated,
      status: 'SIMULATED',
      simulation: {
        simulatedAt: new Date().toISOString(),
        baselineAnnualizedFee,
        requestedAnnualizedFee,
        estimatedRevenueImpact: requestedAnnualizedFee - baselineAnnualizedFee,
        estimatedTotalRelationshipReturn:
          (findCustomerById(updated.customerId)?.riskAdjustedProfit ?? 0) +
          requestedAnnualizedFee -
          baselineAnnualizedFee,
        requestedDiscountPercent,
        thresholdStatus:
          requestedDiscountPercent <= 12
            ? 'WITHIN_THRESHOLD'
            : 'REQUIRES_JUSTIFICATION',
      },
    };
    setEditingRequest(simulated);
    setRequests((current) => {
      const existing = current.some((request) => request.id === simulated.id);
      return existing
        ? current.map((request) =>
            request.id === simulated.id ? simulated : request,
          )
        : [simulated, ...current];
    });
    message.success(t('pages.dealPricingRequest.message.simulated'));
  };

  const submitForApproval = () => {
    if (!editingRequest?.simulation) {
      message.error(
        t('pages.dealPricingRequest.validation.simulationRequired'),
      );
      return;
    }
    const submitted = {
      ...editingRequest,
      status: 'PENDING_APPROVAL' as const,
    };
    setRequests((current) =>
      current.map((request) =>
        request.id === submitted.id ? submitted : request,
      ),
    );
    setEditorOpen(false);
    message.success(t('pages.dealPricingRequest.message.submitted'));
    history.push(
      `/pricing-billing/pricing/approval?source=deal-pricing-request&requestId=${submitted.id}`,
    );
  };

  const priceColumns = [
    {
      title: t('pages.dealPricingRequest.priceDetails.feeItem'),
      dataIndex: 'feeItem',
    },
    {
      title: t('pages.dealPricingRequest.priceDetails.service'),
      dataIndex: 'chargeService',
    },
    {
      title: t('pages.dealPricingRequest.priceDetails.tariffItem'),
      dataIndex: 'tariffItemCode',
    },
    {
      title: t('pages.dealPricingRequest.priceDetails.baselinePrice'),
      render: (_: unknown, detail: DealPricingPriceDetail) =>
        money(detail.baselinePrice, detail.currency),
    },
    {
      title: t('pages.dealPricingRequest.priceDetails.requestedPriceType'),
      render: (_: unknown, detail: DealPricingPriceDetail) => (
        <ProFormSelect
          fieldProps={{
            value: detail.requestedPriceType,
            onChange: (value) =>
              updateDetail(detail.id, 'requestedPriceType', value),
          }}
          options={(
            ['AMOUNT', 'RATE', 'DISCOUNT', 'WAIVER'] as RequestedPriceType[]
          ).map((value) => ({
            label: enumLabel('priceType', value),
            value,
          }))}
          noStyle
        />
      ),
    },
    {
      title: t('pages.dealPricingRequest.priceDetails.requestedPrice'),
      render: (_: unknown, detail: DealPricingPriceDetail) => (
        <InputNumber
          disabled={detail.requestedPriceType === 'WAIVER'}
          min={0}
          value={
            detail.requestedPriceType === 'WAIVER' ? 0 : detail.requestedPrice
          }
          onChange={(value) =>
            updateDetail(detail.id, 'requestedPrice', value ?? undefined)
          }
        />
      ),
    },
    {
      title: t('pages.dealPricingRequest.table.actions'),
      render: (_: unknown, detail: DealPricingPriceDetail) => (
        <Button
          danger
          onClick={() =>
            setEditingDetails((details) =>
              details.filter((item) => item.id !== detail.id),
            )
          }
          type="link"
        >
          {t('pages.dealPricingRequest.action.remove')}
        </Button>
      ),
    },
  ];

  const columns: ProColumns<DealPricingRequest>[] = [
    {
      title: t('pages.dealPricingRequest.table.requestId'),
      dataIndex: 'id',
      width: 140,
      copyable: true,
    },
    {
      title: t('pages.dealPricingRequest.table.customerId'),
      dataIndex: 'customerId',
      width: 140,
    },
    {
      title: t('pages.dealPricingRequest.table.customerName'),
      dataIndex: 'customerName',
      width: 190,
    },
    {
      title: t('pages.dealPricingRequest.table.requestType'),
      dataIndex: 'requestType',
      valueType: 'select',
      valueEnum: Object.fromEntries(
        [
          'NEW_AGREEMENT',
          'RENEWAL',
          'TEMPORARY_PROMOTION',
          'SPECIAL_WAIVER',
        ].map((value) => [value, enumLabel('requestType', value)]),
      ),
      width: 170,
    },
    {
      title: t('pages.dealPricingRequest.table.requestReason'),
      dataIndex: 'requestReason',
      search: false,
      renderText: (value) => enumLabel('requestReason', String(value)),
      width: 170,
    },
    {
      title: t('pages.dealPricingRequest.table.benchmarkSource'),
      dataIndex: 'benchmarkSource',
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (['TARIFF', 'PROMOTION'] as BenchmarkSource[]).map((value) => [
          value,
          enumLabel('benchmarkSource', value),
        ]),
      ),
      width: 150,
    },
    {
      title: t('pages.dealPricingRequest.table.ecr'),
      dataIndex: 'ecrPricingRequested',
      valueType: 'select',
      valueEnum: {
        true: t('pages.dealPricingRequest.enum.yes'),
        false: t('pages.dealPricingRequest.enum.no'),
      },
      render: (_, record) => (
        <Tag color={record.ecrPricingRequested ? 'gold' : 'default'}>
          {record.ecrPricingRequested
            ? t('pages.dealPricingRequest.enum.yes')
            : t('pages.dealPricingRequest.enum.no')}
        </Tag>
      ),
      width: 100,
    },
    {
      title: t('pages.dealPricingRequest.table.simulation'),
      search: false,
      render: (_, record) =>
        record.simulation
          ? `${record.simulation.requestedDiscountPercent.toFixed(1)}%`
          : '-',
      width: 120,
    },
    {
      title: t('pages.dealPricingRequest.table.status'),
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: Object.fromEntries(
        Object.keys(requestStatusColors).map((value) => [
          value,
          enumLabel('status', value),
        ]),
      ),
      render: (_, record) => (
        <Tag color={requestStatusColors[record.status]}>
          {enumLabel('status', record.status)}
        </Tag>
      ),
      width: 160,
    },
    {
      title: t('pages.dealPricingRequest.table.requestedAt'),
      dataIndex: 'requestedAt',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
    {
      title: t('pages.dealPricingRequest.table.actions'),
      valueType: 'option',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                icon: <EyeOutlined />,
                key: 'view',
                label: t('pages.dealPricingRequest.action.view'),
                onClick: () => setDetailRequest(record),
              },
              ...(isEditable(record)
                ? [
                    {
                      icon: <EditOutlined />,
                      key: 'edit',
                      label: t('pages.dealPricingRequest.action.edit'),
                      onClick: () => openEditRequest(record),
                    },
                  ]
                : []),
            ],
          }}
          trigger={['hover']}
        >
          <Button icon={<MoreOutlined />} type="text" />
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer title={t('pages.dealPricingRequest.title')}>
      <Row gutter={[16, 16]}>
        <Col sm={12} xl={6} xs={24}>
          <StatisticCard
            statistic={{
              title: t('pages.dealPricingRequest.stat.draft'),
              value: summary.draft,
            }}
          />
        </Col>
        <Col sm={12} xl={6} xs={24}>
          <StatisticCard
            statistic={{
              title: t('pages.dealPricingRequest.stat.pending'),
              value: summary.pending,
            }}
          />
        </Col>
        <Col sm={12} xl={6} xs={24}>
          <StatisticCard
            statistic={{
              title: t('pages.dealPricingRequest.stat.approved'),
              value: summary.approved,
            }}
          />
        </Col>
        <Col sm={12} xl={6} xs={24}>
          <StatisticCard
            statistic={{
              title: t('pages.dealPricingRequest.stat.ecr'),
              value: summary.ecr,
            }}
          />
        </Col>
      </Row>
      <ProCard style={{ marginTop: 16 }}>
        <ProTable<DealPricingRequest>
          columns={columns}
          dataSource={requests}
          headerTitle={t('pages.dealPricingRequest.table.title')}
          rowKey="id"
          scroll={{ x: 1500 }}
          search={{ labelWidth: 'auto' }}
          toolBarRender={() => [
            <Button
              icon={<FileAddOutlined />}
              key="new"
              onClick={openNewRequest}
              type="primary"
            >
              {t('pages.dealPricingRequest.action.new')}
            </Button>,
          ]}
        />
      </ProCard>

      <Modal
        destroyOnHidden
        footer={[
          <Button key="cancel" onClick={() => setEditorOpen(false)}>
            {t('pages.dealPricingRequest.action.cancel')}
          </Button>,
          <Button key="save" onClick={saveRequest}>
            {t('pages.dealPricingRequest.action.saveDraft')}
          </Button>,
          <Button
            icon={<PlayCircleOutlined />}
            key="simulate"
            onClick={runSimulation}
          >
            {t('pages.dealPricingRequest.action.runSimulation')}
          </Button>,
          <Button
            disabled={!editingRequest?.simulation}
            icon={<SendOutlined />}
            key="submit"
            onClick={submitForApproval}
            type="primary"
          >
            {t('pages.dealPricingRequest.action.submit')}
          </Button>,
        ]}
        onCancel={() => setEditorOpen(false)}
        open={editorOpen}
        title={
          isNewRequest
            ? t('pages.dealPricingRequest.modal.newTitle')
            : t('pages.dealPricingRequest.modal.editTitle')
        }
        width={1100}
      >
        <ProForm<DealPricingRequestFormValues>
          form={form}
          layout="horizontal"
          onValuesChange={(changedValues) => {
            if (typeof changedValues.customerId === 'string')
              applyCustomer(changedValues.customerId);
          }}
          submitter={false}
        >
          <ProCard title={t('pages.dealPricingRequest.form.context')}>
            <ProFormSelect
              colProps={{ md: 8 }}
              label={t('pages.dealPricingRequest.form.customer')}
              name="customerId"
              options={customers.map((customer) => ({
                label: `${customer.id} - ${customer.customerName}`,
                value: customer.id,
              }))}
              rules={[{ required: true }]}
            />
            <ProFormSelect
              colProps={{ md: 8 }}
              label={t('pages.dealPricingRequest.form.requestType')}
              name="requestType"
              options={[
                'NEW_AGREEMENT',
                'RENEWAL',
                'TEMPORARY_PROMOTION',
                'SPECIAL_WAIVER',
              ].map((value) => ({
                label: enumLabel('requestType', value),
                value,
              }))}
              rules={[{ required: true }]}
            />
            <ProFormSelect
              colProps={{ md: 8 }}
              label={t('pages.dealPricingRequest.form.requestReason')}
              name="requestReason"
              options={[
                'COMPETITIVE_PRESSURE',
                'STRATEGIC_CUSTOMER',
                'EXPECTED_TOTAL_RETURN',
                'RELATIONSHIP_RETENTION',
                'CROSS_SELL_OPPORTUNITY',
              ].map((value) => ({
                label: enumLabel('requestReason', value),
                value,
              }))}
              rules={[{ required: true }]}
            />
            <ProFormTextArea
              colProps={{ md: 24 }}
              label={t('pages.dealPricingRequest.form.reasonDescription')}
              name="reasonDescription"
            />
          </ProCard>
          <ProCard
            style={{ marginTop: 16 }}
            title={t('pages.dealPricingRequest.form.benchmark')}
          >
            <ProFormSelect
              colProps={{ md: 8 }}
              label={t('pages.dealPricingRequest.form.benchmarkSource')}
              name="benchmarkSource"
              options={(['TARIFF', 'PROMOTION'] as BenchmarkSource[]).map(
                (value) => ({
                  label: enumLabel('benchmarkSource', value),
                  value,
                }),
              )}
              rules={[{ required: true }]}
            />
            <ProFormText
              colProps={{ md: 8 }}
              label={t('pages.dealPricingRequest.form.benchmarkPlan')}
              name="benchmarkPlan"
              rules={[{ required: true }]}
            />
            <ProFormText
              colProps={{ md: 4 }}
              label={t('pages.dealPricingRequest.form.market')}
              name="market"
              rules={[{ required: true }]}
            />
            <ProFormText
              colProps={{ md: 4 }}
              label={t('pages.dealPricingRequest.form.currency')}
              name="currency"
              rules={[{ required: true }]}
            />
            <ProFormText
              colProps={{ md: 12 }}
              label={t('pages.dealPricingRequest.form.effectiveStartDate')}
              name="effectiveStartDate"
              rules={[{ required: true }]}
            />
            <ProFormText
              colProps={{ md: 12 }}
              label={t('pages.dealPricingRequest.form.effectiveEndDate')}
              name="effectiveEndDate"
            />
          </ProCard>
          <ProCard
            style={{ marginTop: 16 }}
            title={t('pages.dealPricingRequest.form.ecr')}
          >
            <ProFormRadio.Group
              colProps={{ md: 8 }}
              label={t('pages.dealPricingRequest.form.ecrRequested')}
              name="ecrPricingRequested"
              options={[
                { label: t('pages.dealPricingRequest.enum.yes'), value: true },
                { label: t('pages.dealPricingRequest.enum.no'), value: false },
              ]}
              rules={[{ required: true }]}
            />
            <ProFormText
              colProps={{ md: 8 }}
              label={t('pages.dealPricingRequest.form.ecrReason')}
              name="ecrReason"
            />
            <ProFormText
              colProps={{ md: 8 }}
              label={t('pages.dealPricingRequest.form.ecrReference')}
              name="ecrReference"
            />
          </ProCard>
        </ProForm>
        <ProCard
          style={{ marginTop: 16 }}
          title={t('pages.dealPricingRequest.form.priceDetails')}
          extra={
            <Button onClick={() => setPriceDetailsOpen(true)}>
              {t('pages.dealPricingRequest.action.editPriceDetails')}
            </Button>
          }
        >
          {editingRequest?.simulation ? (
            <Alert
              message={t('pages.dealPricingRequest.simulation.mockLabel')}
              type="info"
            />
          ) : null}
          {editingRequest?.simulation ? (
            <ProDescriptions
              column={3}
              style={{ marginTop: 16 }}
              dataSource={editingRequest.simulation}
              columns={[
                {
                  title: t('pages.dealPricingRequest.simulation.baseline'),
                  dataIndex: 'baselineAnnualizedFee',
                  render: (_, item) =>
                    money(item.baselineAnnualizedFee, editingRequest.currency),
                },
                {
                  title: t('pages.dealPricingRequest.simulation.requested'),
                  dataIndex: 'requestedAnnualizedFee',
                  render: (_, item) =>
                    money(item.requestedAnnualizedFee, editingRequest.currency),
                },
                {
                  title: t('pages.dealPricingRequest.simulation.impact'),
                  dataIndex: 'estimatedRevenueImpact',
                  render: (_, item) =>
                    money(item.estimatedRevenueImpact, editingRequest.currency),
                },
              ]}
            />
          ) : null}
        </ProCard>
      </Modal>

      <Modal
        footer={
          <Button onClick={() => setPriceDetailsOpen(false)} type="primary">
            {t('pages.dealPricingRequest.action.confirm')}
          </Button>
        }
        onCancel={() => setPriceDetailsOpen(false)}
        open={priceDetailsOpen}
        title={t('pages.dealPricingRequest.priceDetails.title')}
        width={1200}
      >
        <Space style={{ marginBottom: 16 }}>
          <Button
            disabled={editingDetails.length >= priceDetailOptions().length}
            onClick={addPriceDetail}
            type="primary"
          >
            {t('pages.dealPricingRequest.action.addFeeItem')}
          </Button>
        </Space>
        <Table
          columns={priceColumns}
          dataSource={editingDetails}
          pagination={false}
          rowKey="id"
          scroll={{ x: 1100 }}
          size="small"
        />
      </Modal>

      <Drawer
        destroyOnHidden
        onClose={() => setDetailRequest(null)}
        open={Boolean(detailRequest)}
        title={t('pages.dealPricingRequest.drawer.title')}
        width={760}
      >
        {detailRequest ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <ProDescriptions
              column={2}
              dataSource={detailRequest}
              columns={[
                {
                  title: t('pages.dealPricingRequest.table.customerId'),
                  dataIndex: 'customerId',
                },
                {
                  title: t('pages.dealPricingRequest.table.customerName'),
                  dataIndex: 'customerName',
                },
                {
                  title: t('pages.dealPricingRequest.table.requestType'),
                  dataIndex: 'requestType',
                  render: (_, item) =>
                    enumLabel('requestType', item.requestType),
                },
                {
                  title: t('pages.dealPricingRequest.table.requestReason'),
                  dataIndex: 'requestReason',
                  render: (_, item) =>
                    enumLabel('requestReason', item.requestReason),
                },
                {
                  title: t('pages.dealPricingRequest.table.benchmarkSource'),
                  dataIndex: 'benchmarkSource',
                  render: (_, item) =>
                    enumLabel('benchmarkSource', item.benchmarkSource),
                },
                {
                  title: t('pages.dealPricingRequest.table.status'),
                  dataIndex: 'status',
                  render: (_, item) => (
                    <Tag color={requestStatusColors[item.status]}>
                      {enumLabel('status', item.status)}
                    </Tag>
                  ),
                },
              ]}
            />
            <ProTable<DealPricingPriceDetail>
              columns={[
                {
                  title: t('pages.dealPricingRequest.priceDetails.feeItem'),
                  dataIndex: 'feeItem',
                },
                {
                  title: t(
                    'pages.dealPricingRequest.priceDetails.baselinePrice',
                  ),
                  render: (_, item) => money(item.baselinePrice, item.currency),
                },
                {
                  title: t(
                    'pages.dealPricingRequest.priceDetails.requestedPrice',
                  ),
                  render: (_, item) =>
                    item.requestedPriceType === 'WAIVER'
                      ? money(0, item.currency)
                      : String(item.requestedPrice ?? '-'),
                },
              ]}
              dataSource={detailRequest.priceDetails}
              headerTitle={t('pages.dealPricingRequest.priceDetails.title')}
              pagination={false}
              rowKey="id"
              search={false}
            />
          </Space>
        ) : null}
      </Drawer>
    </PageContainer>
  );
};

export default DealPricingRequestPage;
