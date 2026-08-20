import {
  ApartmentOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  PlusOutlined,
  StopOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormSwitch,
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
  Row,
  Select,
  Space,
  Statistic,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  BillingUnit,
  CatalogNode,
  CatalogNodeType,
  CatalogStatus,
} from '../../../../mock/catalog';

const { Text, Title } = Typography;

const MARKET_OPTIONS = [
  'Singapore',
  'Hong Kong',
  'China',
  'Japan',
  'Australia',
];
const CURRENCY_OPTIONS = ['SGD', 'HKD', 'CNY', 'JPY', 'AUD'];
const NODE_TYPES: CatalogNodeType[] = ['PRODUCT', 'SERVICE_GROUP', 'SERVICE'];
const STATUS_OPTIONS: CatalogStatus[] = ['DRAFT', 'ACTIVE', 'INACTIVE'];
const BILLING_UNITS: BillingUnit[] = [
  'PER_MONTH',
  'PER_TRANSACTION',
  'PER_ACCOUNT',
  'PER_DOCUMENT',
];
const STATUS_COLORS: Record<CatalogStatus, string> = {
  ACTIVE: 'success',
  DRAFT: 'processing',
  INACTIVE: 'default',
};
const NODE_TYPE_ICONS: Record<CatalogNodeType, React.ReactNode> = {
  PRODUCT: <AppstoreOutlined style={{ color: '#1677ff', fontSize: 12 }} />,
  SERVICE_GROUP: <ApartmentOutlined style={{ color: '#597ef7', fontSize: 12 }} />,
  SERVICE: <ToolOutlined style={{ color: '#13a8a8', fontSize: 12 }} />,
};

type CatalogTreeNode = CatalogNode & { children?: CatalogTreeNode[] };

const toCatalogTree = (records: CatalogNode[]): CatalogTreeNode[] => {
  const byParent = new Map<string | undefined, CatalogNode[]>();
  records.forEach((record) => {
    byParent.set(record.parentId, [
      ...(byParent.get(record.parentId) ?? []),
      record,
    ]);
  });
  const build = (parentId?: string): CatalogTreeNode[] =>
    (byParent.get(parentId) ?? []).map((node) => {
      const children = build(node.id);
      return children.length ? { ...node, children } : { ...node };
    });
  return build(undefined);
};

const childNodeType = (parentType?: CatalogNodeType): CatalogNodeType => {
  if (!parentType) return 'PRODUCT';
  if (parentType === 'PRODUCT') return 'SERVICE_GROUP';
  return 'SERVICE';
};

type CatalogFormValues = {
  code: string;
  name: string;
  description?: string;
  status: CatalogStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  supportedMarkets: string[];
  supportedCurrencies: string[];
  pricingEnabled?: boolean;
  billingEnabled?: boolean;
  billingUnit?: BillingUnit;
  taxCategory?: string;
};

const CatalogForm: React.FC<{
  open: boolean;
  parent?: CatalogNode;
  editRecord?: CatalogNode;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ open, parent, editRecord, onClose, onSuccess }) => {
  const intl = useIntl();
  const { message } = App.useApp();
  const [form] = ProForm.useForm<CatalogFormValues>();
  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  const nodeType = editRecord?.nodeType ?? childNodeType(parent?.nodeType);
  const nodeTypeLabel = t(`pages.catalog.nodeType.${nodeType}`);

  const handleFinish = async (values: CatalogFormValues) => {
    const payload = { ...values, parentId: editRecord?.parentId ?? parent?.id };
    try {
      if (editRecord) {
        await request(`/api/catalog/nodes/${editRecord.id}`, {
          method: 'PUT',
          data: payload,
        });
        message.success(t('pages.catalog.msg.updated'));
      } else {
        await request('/api/catalog/nodes', { method: 'POST', data: payload });
        message.success(t('pages.catalog.msg.created'));
      }
      onSuccess();
      onClose();
    } catch {
      message.error(t('pages.catalog.msg.failed'));
    }
  };

  return (
    <Drawer
      title={
        editRecord
          ? t('pages.catalog.form.editTitle', { nodeType: nodeTypeLabel })
          : t('pages.catalog.form.addTitle', { nodeType: nodeTypeLabel })
      }
      open={open}
      width={560}
      onClose={onClose}
      destroyOnHidden
      footer={null}
    >
      <ProForm<CatalogFormValues>
        form={form}
        layout="vertical"
        initialValues={
          editRecord ?? {
            status: 'DRAFT',
            supportedMarkets: [],
            supportedCurrencies: [],
            pricingEnabled: true,
            billingEnabled: false,
          }
        }
        onFinish={handleFinish}
        submitter={{
          render: (_, doms) => (
            <Space style={{ float: 'right' }}>
              <Button onClick={onClose}>
                {t('pages.catalog.form.cancel')}
              </Button>
              {doms[1]}
            </Space>
          ),
        }}
      >
        <ProFormText
          name="code"
          label={t('pages.catalog.form.code')}
          rules={[
            { required: true },
            {
              pattern: /^[A-Z0-9-]+$/,
              message: t('pages.catalog.form.codeRule'),
            },
          ]}
        />
        <ProFormText
          name="name"
          label={t('pages.catalog.form.name')}
          rules={[{ required: true }]}
        />
        <ProFormTextArea
          name="description"
          label={t('pages.catalog.form.description')}
        />
        <ProFormSelect
          name="status"
          label={t('pages.catalog.form.status')}
          rules={[{ required: true }]}
          options={STATUS_OPTIONS.map((value) => ({
            value,
            label: t(`pages.catalog.status.${value}`),
          }))}
        />
        <Row gutter={16}>
          <Col span={12}>
            <ProFormDatePicker
              name="effectiveFrom"
              label={t('pages.catalog.form.effectiveFrom')}
              rules={[{ required: true }]}
              fieldProps={{ style: { width: '100%' } }}
            />
          </Col>
          <Col span={12}>
            <ProFormDatePicker
              name="effectiveTo"
              label={t('pages.catalog.form.effectiveTo')}
              fieldProps={{ style: { width: '100%' } }}
            />
          </Col>
        </Row>
        <ProFormSelect
          name="supportedMarkets"
          label={t('pages.catalog.form.markets')}
          mode="multiple"
          rules={[
            {
              required: true,
              type: 'array',
              min: 1,
              message: t('pages.catalog.form.marketsRule'),
            },
          ]}
          options={MARKET_OPTIONS.map((value) => ({ value, label: value }))}
        />
        <ProFormSelect
          name="supportedCurrencies"
          label={t('pages.catalog.form.currencies')}
          mode="multiple"
          rules={[
            {
              required: true,
              type: 'array',
              min: 1,
              message: t('pages.catalog.form.currenciesRule'),
            },
          ]}
          options={CURRENCY_OPTIONS.map((value) => ({ value, label: value }))}
        />
        <Row gutter={16}>
          <Col span={12}>
            <ProFormSwitch
              name="pricingEnabled"
              label={t('pages.catalog.form.pricingEnabled')}
            />
          </Col>
          <Col span={12}>
            <ProFormSwitch
              name="billingEnabled"
              label={t('pages.catalog.form.billingEnabled')}
            />
          </Col>
        </Row>
        {nodeType !== 'PRODUCT' && (
          <ProFormSelect
            name="billingUnit"
            label={t('pages.catalog.form.billingUnit')}
            options={BILLING_UNITS.map((value) => ({
              value,
              label: t(`pages.catalog.billingUnit.${value}`),
            }))}
          />
        )}
        {nodeType === 'SERVICE' && (
          <ProFormText
            name="taxCategory"
            label={t('pages.catalog.form.taxCategory')}
            placeholder={t('pages.catalog.form.taxCategoryPlaceholder')}
            rules={[
              {
                required: true,
                message: t('pages.catalog.form.taxCategoryRule'),
              },
            ]}
          />
        )}
      </ProForm>
    </Drawer>
  );
};

type CatalogUsage = {
  childCount: number;
  descendantCount: number;
  basePricePoints: number;
  regionPricePoints: number;
  segmentPricePoints: number;
  groupPricePoints: number;
  billingReferences: number;
};

const CatalogDetailDrawer: React.FC<{
  open: boolean;
  record?: CatalogNode;
  onClose: () => void;
  onEdit: (record: CatalogNode) => void;
}> = ({ open, record, onClose, onEdit }) => {
  const intl = useIntl();
  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);
  const [usage, setUsage] = useState<CatalogUsage>();

  useEffect(() => {
    if (open && record) {
      request<{ success: boolean; data: CatalogUsage }>(
        `/api/catalog/nodes/${record.id}/usage`,
      ).then((res) => setUsage(res.data));
    } else {
      setUsage(undefined);
    }
  }, [open, record]);

  if (!record) return null;

  return (
    <Drawer
      title={t('pages.catalog.detail.title', { name: record.name })}
      open={open}
      width={560}
      onClose={onClose}
      extra={
        <Button icon={<EditOutlined />} onClick={() => onEdit(record)}>
          {t('pages.catalog.action.edit')}
        </Button>
      }
    >
      <Tabs
        items={[
          {
            key: 'overview',
            label: t('pages.catalog.detail.tab.overview'),
            children: (
              <ProDescriptions<CatalogNode>
                column={1}
                bordered
                dataSource={record}
                columns={[
                  { title: t('pages.catalog.col.code'), dataIndex: 'code' },
                  {
                    title: t('pages.catalog.col.nodeType'),
                    dataIndex: 'nodeType',
                    render: (_, r) => t(`pages.catalog.nodeType.${r.nodeType}`),
                  },
                  {
                    title: t('pages.catalog.col.status'),
                    dataIndex: 'status',
                    render: (_, r) => (
                      <Tag color={STATUS_COLORS[r.status]}>
                        {t(`pages.catalog.status.${r.status}`)}
                      </Tag>
                    ),
                  },
                  {
                    title: t('pages.catalog.form.description'),
                    dataIndex: 'description',
                  },
                  {
                    title: t('pages.catalog.col.pricingEnabled'),
                    dataIndex: 'pricingEnabled',
                    render: (_, r) =>
                      r.pricingEnabled
                        ? t('pages.catalog.filter.yes')
                        : t('pages.catalog.filter.no'),
                  },
                  {
                    title: t('pages.catalog.col.billingEnabled'),
                    dataIndex: 'billingEnabled',
                    render: (_, r) =>
                      r.billingEnabled
                        ? t('pages.catalog.filter.yes')
                        : t('pages.catalog.filter.no'),
                  },
                  {
                    title: t('pages.catalog.col.markets'),
                    dataIndex: 'supportedMarkets',
                    render: (_, r) => r.supportedMarkets.join(', ') || '—',
                  },
                  {
                    title: t('pages.catalog.col.currencies'),
                    dataIndex: 'supportedCurrencies',
                    render: (_, r) => r.supportedCurrencies.join(', ') || '—',
                  },
                  {
                    title: t('pages.catalog.form.effectiveFrom'),
                    dataIndex: 'effectiveFrom',
                  },
                ]}
              />
            ),
          },
          {
            key: 'hierarchy',
            label: t('pages.catalog.detail.tab.hierarchy'),
            children: (
              <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                <Text type="secondary">
                  {record.description ||
                    t('pages.catalog.detail.noDescription')}
                </Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title={t('pages.catalog.detail.directChildren')}
                      value={usage?.childCount ?? 0}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title={t('pages.catalog.detail.descendants')}
                      value={usage?.descendantCount ?? 0}
                    />
                  </Col>
                </Row>
              </Space>
            ),
          },
          {
            key: 'pricingUsage',
            label: t('pages.catalog.detail.tab.pricingUsage'),
            children: (
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title={t('pages.catalog.detail.basePricePoints')}
                    value={usage?.basePricePoints ?? 0}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={t('pages.catalog.detail.regionPricePoints')}
                    value={usage?.regionPricePoints ?? 0}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={t('pages.catalog.detail.segmentPricePoints')}
                    value={usage?.segmentPricePoints ?? 0}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={t('pages.catalog.detail.groupPricePoints')}
                    value={usage?.groupPricePoints ?? 0}
                  />
                </Col>
              </Row>
            ),
          },
          {
            key: 'billingUsage',
            label: t('pages.catalog.detail.tab.billingUsage'),
            children: (
              <Statistic
                title={t('pages.catalog.detail.billingReferences')}
                value={usage?.billingReferences ?? 0}
              />
            ),
          },
          {
            key: 'audit',
            label: t('pages.catalog.detail.tab.audit'),
            children: (
              <ProDescriptions<CatalogNode>
                column={1}
                bordered
                dataSource={record}
                columns={[
                  {
                    title: t('pages.catalog.col.updatedBy'),
                    dataIndex: 'updatedBy',
                  },
                  {
                    title: t('pages.catalog.col.updatedAt'),
                    dataIndex: 'updatedAt',
                    valueType: 'dateTime',
                  },
                ]}
              />
            ),
          },
        ]}
      />
    </Drawer>
  );
};

const CatalogPage: React.FC = () => {
  const intl = useIntl();
  const { message, modal } = App.useApp();
  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);
  const actionRef = useRef<ActionType | null>(null);

  const [allRecords, setAllRecords] = useState<CatalogNode[]>([]);
  const [marketFilter, setMarketFilter] = useState<string>();
  const [pricingFilter, setPricingFilter] = useState<string>();
  const [billingFilter, setBillingFilter] = useState<string>();

  const [formOpen, setFormOpen] = useState(false);
  const [formParent, setFormParent] = useState<CatalogNode>();
  const [editRecord, setEditRecord] = useState<CatalogNode>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<CatalogNode>();

  const stats = useMemo(
    () => ({
      products: allRecords.filter((node) => node.nodeType === 'PRODUCT').length,
      activeServices: allRecords.filter(
        (node) => node.nodeType === 'SERVICE' && node.status === 'ACTIVE',
      ).length,
      services: allRecords.filter((node) => node.nodeType === 'SERVICE').length,
      markets: new Set(allRecords.flatMap((node) => node.supportedMarkets))
        .size,
      billable: allRecords.filter(
        (node) => node.nodeType === 'SERVICE' && node.billingEnabled,
      ).length,
    }),
    [allRecords],
  );

  const openCreate = (parent?: CatalogNode) => {
    setEditRecord(undefined);
    setFormParent(parent);
    setFormOpen(true);
  };

  const openEdit = (record: CatalogNode) => {
    setEditRecord(record);
    setFormParent(undefined);
    setFormOpen(true);
  };

  const toggleStatus = (record: CatalogNode) => {
    const nextStatus: CatalogStatus =
      record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const nodeTypeLabel = t(`pages.catalog.nodeType.${record.nodeType}`);
    modal.confirm({
      title:
        nextStatus === 'ACTIVE'
          ? t('pages.catalog.confirm.enableTitle', { nodeType: nodeTypeLabel })
          : t('pages.catalog.confirm.disableTitle', {
              nodeType: nodeTypeLabel,
            }),
      content:
        nextStatus === 'ACTIVE'
          ? t('pages.catalog.confirm.enableContent', { name: record.name })
          : t('pages.catalog.confirm.disableContent', { name: record.name }),
      onOk: async () => {
        try {
          await request(`/api/catalog/nodes/${record.id}/status`, {
            method: 'PATCH',
          });
          message.success(
            nextStatus === 'ACTIVE'
              ? t('pages.catalog.msg.enabled')
              : t('pages.catalog.msg.disabled'),
          );
          actionRef.current?.reload();
        } catch {
          message.error(t('pages.catalog.msg.failed'));
        }
      },
    });
  };

  const columns: ProColumns<CatalogTreeNode>[] = [
    {
      title: t('pages.catalog.col.name'),
      dataIndex: 'name',
      width: 260,
      render: (_, record) => (
        <Space size={6}>
          {NODE_TYPE_ICONS[record.nodeType]}
          {record.nodeType === 'PRODUCT' || record.nodeType === 'SERVICE_GROUP' ? (
            <Text strong>{record.name}</Text>
          ) : (
            <Text>{record.name}</Text>
          )}
        </Space>
      ),
    },
    {
      title: t('pages.catalog.col.code'),
      dataIndex: 'code',
      width: 160,
      search: false,
      render: (_, record) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.code}
        </Text>
      ),
    },
    {
      title: t('pages.catalog.col.nodeType'),
      dataIndex: 'nodeType',
      width: 140,
      hideInTable: true,
      valueEnum: Object.fromEntries(
        NODE_TYPES.map((value) => [
          value,
          { text: t(`pages.catalog.nodeType.${value}`) },
        ]),
      ),
    },
    {
      title: t('pages.catalog.col.status'),
      dataIndex: 'status',
      width: 110,
      render: (_, record) => (
        <Tag color={STATUS_COLORS[record.status]}>
          {t(`pages.catalog.status.${record.status}`)}
        </Tag>
      ),
    },
    {
      title: t('pages.catalog.col.pricingEnabled'),
      dataIndex: 'pricingEnabled',
      width: 110,
      search: false,
      render: (_, record) =>
        record.pricingEnabled
          ? t('pages.catalog.filter.yes')
          : t('pages.catalog.filter.no'),
    },
    {
      title: t('pages.catalog.col.billingEnabled'),
      dataIndex: 'billingEnabled',
      width: 110,
      search: false,
      render: (_, record) =>
        record.billingEnabled
          ? t('pages.catalog.filter.yes')
          : t('pages.catalog.filter.no'),
    },
    {
      title: t('pages.catalog.col.markets'),
      dataIndex: 'supportedMarkets',
      width: 160,
      ellipsis: true,
      search: false,
      render: (_, record) => {
        const markets = record.supportedMarkets.join(', ') || '—';
        return <Tooltip title={markets}>{markets}</Tooltip>;
      },
    },
    {
      title: t('pages.catalog.col.updatedAt'),
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      search: false,
      width: 170,
    },
    {
      title: t('pages.catalog.col.actions'),
      valueType: 'option',
      width: 80,
      render: (_, record) => [
        <Dropdown
          key="more"
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: t('pages.catalog.action.view'),
                onClick: () => {
                  setDetailRecord(record);
                  setDetailOpen(true);
                },
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: t('pages.catalog.action.edit'),
                onClick: () => openEdit(record),
              },
              ...(record.nodeType !== 'SERVICE'
                ? [
                    {
                      key: 'addChild',
                      icon: <PlusOutlined />,
                      label: t('pages.catalog.action.addChild'),
                      onClick: () => openCreate(record),
                    },
                  ]
                : []),
              { type: 'divider' as const },
              {
                key: 'status',
                icon:
                  record.status === 'ACTIVE' ? (
                    <StopOutlined />
                  ) : (
                    <CheckCircleOutlined />
                  ),
                label:
                  record.status === 'ACTIVE'
                    ? t('pages.catalog.action.disable')
                    : t('pages.catalog.action.enable'),
                onClick: () => toggleStatus(record),
              },
            ],
          }}
        >
          <Button type="link" size="small" icon={<MoreOutlined />} />
        </Dropdown>,
      ],
    },
  ];

  return (
    <PageContainer
      title={t('pages.catalog.title')}
      subTitle={t('pages.catalog.subTitle')}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openCreate()}
        >
          {t('pages.catalog.addItem')}
        </Button>
      }
    >
      <ProCard
        style={{
          marginBottom: 16,
          background: 'linear-gradient(135deg, #f0f5ff 0%, #ffffff 65%)',
          border: '1px solid #d6e4ff',
        }}
      >
        <Space align="start">
          <AppstoreOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <div>
            <Title level={5} style={{ margin: 0 }}>
              {t('pages.catalog.banner.title')}
            </Title>
            <Text type="secondary">{t('pages.catalog.banner.desc')}</Text>
          </div>
        </Space>
      </ProCard>
      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard
          statistic={{
            title: t('pages.catalog.stat.products'),
            value: stats.products,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.catalog.stat.activeServices'),
            value: stats.activeServices,
            valueStyle: { color: '#389e0d' },
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.catalog.stat.services'),
            value: stats.services,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.catalog.stat.markets'),
            value: stats.markets,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.catalog.stat.billable'),
            value: stats.billable,
          }}
        />
      </StatisticCard.Group>

      <ProCard style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col flex="200px">
            <Select
              allowClear
              placeholder={t('pages.catalog.filter.allMarkets')}
              value={marketFilter}
              onChange={(value) => {
                setMarketFilter(value);
                actionRef.current?.reload();
              }}
              style={{ width: '100%' }}
              options={MARKET_OPTIONS.map((value) => ({ value, label: value }))}
            />
          </Col>
          <Col flex="180px">
            <Select
              allowClear
              placeholder={t('pages.catalog.filter.pricingEnabled')}
              value={pricingFilter}
              onChange={(value) => {
                setPricingFilter(value);
                actionRef.current?.reload();
              }}
              style={{ width: '100%' }}
              options={[
                { value: 'true', label: t('pages.catalog.filter.yes') },
                { value: 'false', label: t('pages.catalog.filter.no') },
              ]}
            />
          </Col>
          <Col flex="180px">
            <Select
              allowClear
              placeholder={t('pages.catalog.filter.billingEnabled')}
              value={billingFilter}
              onChange={(value) => {
                setBillingFilter(value);
                actionRef.current?.reload();
              }}
              style={{ width: '100%' }}
              options={[
                { value: 'true', label: t('pages.catalog.filter.yes') },
                { value: 'false', label: t('pages.catalog.filter.no') },
              ]}
            />
          </Col>
        </Row>
      </ProCard>

      <ProTable<CatalogTreeNode>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        scroll={{ x: 1000 }}
        cardProps={{
          title: (
            <Space>
              <AppstoreOutlined />
              <span>{t('pages.catalog.table.title')}</span>
            </Space>
          ),
          extra: (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('pages.catalog.table.total', { count: allRecords.length })}
            </Text>
          ),
        }}
        request={async (params) => {
          const res = await request<{ success: boolean; data: CatalogNode[] }>(
            '/api/catalog/nodes',
            {
              method: 'GET',
              params: {
                nodeType: params.nodeType,
                status: params.status,
                market: marketFilter,
                pricingEnabled: pricingFilter,
                billingEnabled: billingFilter,
                keyword: params.keyword,
              },
            },
          );
          const records = res.data ?? [];
          setAllRecords(records);
          return { data: toCatalogTree(records), success: res.success };
        }}
        toolbar={{
          search: {
            placeholder: t('pages.catalog.filter.keywordPlaceholder'),
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

      <CatalogForm
        open={formOpen}
        parent={formParent}
        editRecord={editRecord}
        onClose={() => setFormOpen(false)}
        onSuccess={() => actionRef.current?.reload()}
      />

      <CatalogDetailDrawer
        open={detailOpen}
        record={detailRecord}
        onClose={() => setDetailOpen(false)}
        onEdit={(record) => {
          setDetailOpen(false);
          openEdit(record);
        }}
      />
    </PageContainer>
  );
};

export default CatalogPage;
