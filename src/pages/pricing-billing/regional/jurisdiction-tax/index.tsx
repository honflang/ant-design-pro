import {
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FlagOutlined,
  MoreOutlined,
  PlusOutlined,
  StopOutlined,
  TagsOutlined,
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
  Steps,
  Tag,
  Typography,
} from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import type {
  JurisdictionTaxNode,
  JurisdictionTaxNodeType,
  JurisdictionTaxStatus,
  TaxTreatment,
} from '../../../../../mock/jurisdictionTax';

const { Text, Title } = Typography;

const JURISDICTION_OPTIONS = [
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
];
const CURRENCY_OPTIONS = ['SGD', 'HKD', 'CNY', 'JPY', 'AUD'];
const TAX_TYPE_OPTIONS = ['GST', 'VAT', 'WHT', 'Consumption Tax', 'Other'];
const NODE_TYPES: JurisdictionTaxNodeType[] = ['JURISDICTION', 'TAX_DEFINITION'];
const STATUS_OPTIONS: JurisdictionTaxStatus[] = ['DRAFT', 'ACTIVE', 'INACTIVE'];
const TAX_TREATMENT_OPTIONS: TaxTreatment[] = [
  'TAX_EXCLUSIVE',
  'TAX_INCLUSIVE',
  'TAX_EXEMPT',
  'ZERO_RATED',
  'INPUT_TAXED',
  'OUT_OF_SCOPE',
];
const STATUS_COLORS: Record<JurisdictionTaxStatus, string> = {
  ACTIVE: 'success',
  DRAFT: 'processing',
  INACTIVE: 'default',
};
const NODE_TYPE_ICONS: Record<JurisdictionTaxNodeType, React.ReactNode> = {
  JURISDICTION: <FlagOutlined style={{ color: '#1677ff', fontSize: 12 }} />,
  TAX_DEFINITION: <TagsOutlined style={{ color: '#13a8a8', fontSize: 12 }} />,
};

type JurisdictionTaxTreeNode = JurisdictionTaxNode & {
  children?: JurisdictionTaxTreeNode[];
};

const toJurisdictionTaxTree = (
  records: JurisdictionTaxNode[],
): JurisdictionTaxTreeNode[] => {
  const byParent = new Map<string | undefined, JurisdictionTaxNode[]>();
  records.forEach((record) => {
    byParent.set(record.parentId, [
      ...(byParent.get(record.parentId) ?? []),
      record,
    ]);
  });
  const build = (parentId?: string): JurisdictionTaxTreeNode[] =>
    (byParent.get(parentId) ?? []).map((node) => {
      const children = build(node.id);
      return children.length ? { ...node, children } : { ...node };
    });
  return build(undefined);
};

type JurisdictionTaxFormValues = {
  code: string;
  name: string;
  description?: string;
  status: JurisdictionTaxStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  taxAuthority?: string;
  defaultCurrency?: string;
  taxType?: string;
  defaultRate?: number;
  defaultTaxTreatment?: TaxTreatment;
};

const JurisdictionTaxForm: React.FC<{
  open: boolean;
  parent?: JurisdictionTaxNode;
  editRecord?: JurisdictionTaxNode;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ open, parent, editRecord, onClose, onSuccess }) => {
  const intl = useIntl();
  const { message } = App.useApp();
  const [form] = ProForm.useForm<JurisdictionTaxFormValues>();
  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  const nodeType: JurisdictionTaxNodeType =
    editRecord?.nodeType ?? (parent ? 'TAX_DEFINITION' : 'JURISDICTION');
  const nodeTypeLabel = t(`pages.regional.jurisdictionTax.nodeType.${nodeType}`);

  const handleFinish = async (values: JurisdictionTaxFormValues) => {
    const payload = { ...values, parentId: editRecord?.parentId ?? parent?.id };
    try {
      if (editRecord) {
        await request(`/api/regional/jurisdiction-tax/nodes/${editRecord.id}`, {
          method: 'PUT',
          data: payload,
        });
        message.success(t('pages.regional.jurisdictionTax.msg.updated'));
      } else {
        await request('/api/regional/jurisdiction-tax/nodes', {
          method: 'POST',
          data: payload,
        });
        message.success(t('pages.regional.jurisdictionTax.msg.created'));
      }
      onSuccess();
      onClose();
    } catch {
      message.error(t('pages.regional.jurisdictionTax.msg.failed'));
    }
  };

  return (
    <Drawer
      title={
        editRecord
          ? t('pages.regional.jurisdictionTax.form.editTitle', {
              nodeType: nodeTypeLabel,
            })
          : t('pages.regional.jurisdictionTax.form.addTitle', {
              nodeType: nodeTypeLabel,
            })
      }
      open={open}
      width={520}
      onClose={onClose}
      destroyOnHidden
      footer={null}
    >
      <ProForm<JurisdictionTaxFormValues>
        form={form}
        layout="vertical"
        initialValues={editRecord ?? { status: 'DRAFT' }}
        onFinish={handleFinish}
        submitter={{
          render: (_, doms) => (
            <Space style={{ float: 'right' }}>
              <Button onClick={onClose}>
                {t('pages.regional.jurisdictionTax.form.cancel')}
              </Button>
              {doms[1]}
            </Space>
          ),
        }}
      >
        <ProFormText
          name="code"
          label={t('pages.regional.jurisdictionTax.form.code')}
          rules={[
            { required: true },
            {
              pattern: /^[A-Z0-9-]+$/,
              message: t('pages.regional.jurisdictionTax.form.codeRule'),
            },
          ]}
        />
        <ProFormText
          name="name"
          label={t('pages.regional.jurisdictionTax.form.name')}
          rules={[{ required: true }]}
        />
        <ProFormTextArea
          name="description"
          label={t('pages.regional.jurisdictionTax.form.description')}
        />
        {nodeType === 'JURISDICTION' ? (
          <>
            <ProFormText
              name="taxAuthority"
              label={t('pages.regional.jurisdictionTax.form.taxAuthority')}
              rules={[{ required: true }]}
            />
            <ProFormSelect
              name="defaultCurrency"
              label={t('pages.regional.jurisdictionTax.form.defaultCurrency')}
              rules={[{ required: true }]}
              options={CURRENCY_OPTIONS.map((value) => ({ value, label: value }))}
            />
          </>
        ) : (
          <>
            <ProFormSelect
              name="taxType"
              label={t('pages.regional.jurisdictionTax.form.taxType')}
              rules={[{ required: true }]}
              options={TAX_TYPE_OPTIONS.map((value) => ({ value, label: value }))}
            />
            <ProForm.Item
              name="defaultRate"
              label={t('pages.regional.jurisdictionTax.form.defaultRate')}
              rules={[
                { required: true },
                {
                  type: 'number',
                  min: 0,
                  max: 100,
                  message: t('pages.regional.jurisdictionTax.form.defaultRateRule'),
                },
              ]}
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </ProForm.Item>
            <ProFormSelect
              name="defaultTaxTreatment"
              label={t('pages.regional.jurisdictionTax.form.defaultTaxTreatment')}
              rules={[{ required: true }]}
              options={TAX_TREATMENT_OPTIONS.map((value) => ({
                value,
                label: t(`pages.regional.jurisdictionTax.taxTreatment.${value}`),
              }))}
            />
          </>
        )}
        <ProFormSelect
          name="status"
          label={t('pages.regional.jurisdictionTax.form.status')}
          rules={[{ required: true }]}
          options={STATUS_OPTIONS.map((value) => ({
            value,
            label: t(`pages.regional.jurisdictionTax.status.${value}`),
          }))}
        />
        <Row gutter={16}>
          <Col span={12}>
            <ProFormDatePicker
              name="effectiveFrom"
              label={t('pages.regional.jurisdictionTax.form.effectiveFrom')}
              rules={[{ required: true }]}
              fieldProps={{ style: { width: '100%' } }}
            />
          </Col>
          <Col span={12}>
            <ProFormDatePicker
              name="effectiveTo"
              label={t('pages.regional.jurisdictionTax.form.effectiveTo')}
              fieldProps={{ style: { width: '100%' } }}
            />
          </Col>
        </Row>
      </ProForm>
    </Drawer>
  );
};

const JurisdictionTaxDetailDrawer: React.FC<{
  open: boolean;
  record?: JurisdictionTaxNode;
  childCount: number;
  onClose: () => void;
  onEdit: (record: JurisdictionTaxNode) => void;
}> = ({ open, record, childCount, onClose, onEdit }) => {
  const intl = useIntl();
  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  if (!record) return null;

  // Demo-only estimate to illustrate the downstream Tax Configuration relationship.
  const referencedTaxRules =
    record.nodeType === 'JURISDICTION'
      ? childCount * 2 + 1
      : Math.round((record.defaultRate ?? 0) % 5) + 1;

  return (
    <Drawer
      title={t('pages.regional.jurisdictionTax.detail.title', {
        name: record.name,
      })}
      open={open}
      width={520}
      onClose={onClose}
      extra={
        <Button icon={<EditOutlined />} onClick={() => onEdit(record)}>
          {t('pages.regional.jurisdictionTax.action.edit')}
        </Button>
      }
    >
      <ProDescriptions<JurisdictionTaxNode>
        column={1}
        bordered
        dataSource={record}
        columns={[
          { title: t('pages.regional.jurisdictionTax.col.code'), dataIndex: 'code' },
          {
            title: t('pages.regional.jurisdictionTax.col.nodeType'),
            dataIndex: 'nodeType',
            render: (_, r) => t(`pages.regional.jurisdictionTax.nodeType.${r.nodeType}`),
          },
          {
            title: t('pages.regional.jurisdictionTax.col.status'),
            dataIndex: 'status',
            render: (_, r) => (
              <Tag color={STATUS_COLORS[r.status]}>
                {t(`pages.regional.jurisdictionTax.status.${r.status}`)}
              </Tag>
            ),
          },
          {
            title: t('pages.regional.jurisdictionTax.form.description'),
            dataIndex: 'description',
          },
          ...(record.nodeType === 'JURISDICTION'
            ? [
                {
                  title: t('pages.regional.jurisdictionTax.form.taxAuthority'),
                  dataIndex: 'taxAuthority',
                },
                {
                  title: t('pages.regional.jurisdictionTax.form.defaultCurrency'),
                  dataIndex: 'defaultCurrency',
                },
                {
                  title: t('pages.regional.jurisdictionTax.detail.taxDefinitions'),
                  dataIndex: 'id',
                  render: () => childCount,
                },
              ]
            : [
                {
                  title: t('pages.regional.jurisdictionTax.form.taxType'),
                  dataIndex: 'taxType',
                },
                {
                  title: t('pages.regional.jurisdictionTax.form.defaultRate'),
                  dataIndex: 'defaultRate',
                  render: (_: unknown, r: JurisdictionTaxNode) => `${r.defaultRate ?? 0}%`,
                },
                {
                  title: t('pages.regional.jurisdictionTax.form.defaultTaxTreatment'),
                  dataIndex: 'defaultTaxTreatment',
                  render: (_: unknown, r: JurisdictionTaxNode) =>
                    r.defaultTaxTreatment
                      ? t(`pages.regional.jurisdictionTax.taxTreatment.${r.defaultTaxTreatment}`)
                      : '—',
                },
              ]),
          {
            title: t('pages.regional.jurisdictionTax.form.effectiveFrom'),
            dataIndex: 'effectiveFrom',
          },
          {
            title: t('pages.regional.jurisdictionTax.col.updatedBy'),
            dataIndex: 'updatedBy',
          },
          {
            title: t('pages.regional.jurisdictionTax.col.updatedAt'),
            dataIndex: 'updatedAt',
            valueType: 'dateTime',
          },
        ]}
      />
      <ProCard
        title={t('pages.regional.jurisdictionTax.detail.referencedTaxRules')}
        style={{ marginTop: 16 }}
      >
        <Statistic value={referencedTaxRules} />
      </ProCard>
    </Drawer>
  );
};

const JurisdictionTaxPage: React.FC = () => {
  const intl = useIntl();
  const { message, modal } = App.useApp();
  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);
  const actionRef = useRef<ActionType | null>(null);

  const [allRecords, setAllRecords] = useState<JurisdictionTaxNode[]>([]);
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>();
  const [taxTypeFilter, setTaxTypeFilter] = useState<string>();

  const [formOpen, setFormOpen] = useState(false);
  const [formParent, setFormParent] = useState<JurisdictionTaxNode>();
  const [editRecord, setEditRecord] = useState<JurisdictionTaxNode>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<JurisdictionTaxNode>();

  const stats = useMemo(() => {
    const jurisdictions = allRecords.filter((node) => node.nodeType === 'JURISDICTION');
    const taxDefinitions = allRecords.filter((node) => node.nodeType === 'TAX_DEFINITION');
    return {
      jurisdictions: jurisdictions.length,
      activeTaxDefinitions: taxDefinitions.filter((node) => node.status === 'ACTIVE').length,
      taxTypes: new Set(taxDefinitions.map((node) => node.taxType).filter(Boolean)).size,
      markets: jurisdictions.length,
    };
  }, [allRecords]);

  const childCountOf = (id: string) =>
    allRecords.filter((node) => node.parentId === id).length;

  const openCreate = (parent?: JurisdictionTaxNode) => {
    setEditRecord(undefined);
    setFormParent(parent);
    setFormOpen(true);
  };

  const openEdit = (record: JurisdictionTaxNode) => {
    setEditRecord(record);
    setFormParent(undefined);
    setFormOpen(true);
  };

  const toggleStatus = (record: JurisdictionTaxNode) => {
    const nextStatus: JurisdictionTaxStatus =
      record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const nodeTypeLabel = t(`pages.regional.jurisdictionTax.nodeType.${record.nodeType}`);
    modal.confirm({
      title:
        nextStatus === 'ACTIVE'
          ? t('pages.regional.jurisdictionTax.confirm.enableTitle', { nodeType: nodeTypeLabel })
          : t('pages.regional.jurisdictionTax.confirm.disableTitle', { nodeType: nodeTypeLabel }),
      content:
        nextStatus === 'ACTIVE'
          ? t('pages.regional.jurisdictionTax.confirm.enableContent', { name: record.name })
          : t('pages.regional.jurisdictionTax.confirm.disableContent', { name: record.name }),
      onOk: async () => {
        try {
          await request(`/api/regional/jurisdiction-tax/nodes/${record.id}/status`, {
            method: 'PATCH',
          });
          message.success(
            nextStatus === 'ACTIVE'
              ? t('pages.regional.jurisdictionTax.msg.enabled')
              : t('pages.regional.jurisdictionTax.msg.disabled'),
          );
          actionRef.current?.reload();
        } catch {
          message.error(t('pages.regional.jurisdictionTax.msg.failed'));
        }
      },
    });
  };

  const columns: ProColumns<JurisdictionTaxTreeNode>[] = [
    {
      title: t('pages.regional.jurisdictionTax.col.name'),
      dataIndex: 'name',
      width: 320,
      render: (_, record) => (
        <Space size={6}>
          {NODE_TYPE_ICONS[record.nodeType]}
          {record.nodeType === 'JURISDICTION' ? (
            <Text strong>{record.name}</Text>
          ) : (
            <Text>{record.name}</Text>
          )}
        </Space>
      ),
    },
    {
      title: t('pages.regional.jurisdictionTax.col.code'),
      dataIndex: 'code',
      width: 140,
      search: false,
      render: (_, record) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.code}
        </Text>
      ),
    },
    {
      title: t('pages.regional.jurisdictionTax.col.nodeType'),
      dataIndex: 'nodeType',
      width: 140,
      hideInTable: true,
      valueEnum: Object.fromEntries(
        NODE_TYPES.map((value) => [
          value,
          { text: t(`pages.regional.jurisdictionTax.nodeType.${value}`) },
        ]),
      ),
    },
    {
      title: t('pages.regional.jurisdictionTax.col.defaultCurrency'),
      dataIndex: 'defaultCurrency',
      width: 120,
      search: false,
      render: (_, record) => record.defaultCurrency ?? '—',
    },
    {
      title: t('pages.regional.jurisdictionTax.col.defaultRate'),
      dataIndex: 'defaultRate',
      width: 110,
      search: false,
      render: (_, record) =>
        record.nodeType === 'TAX_DEFINITION' ? `${record.defaultRate ?? 0}%` : '—',
    },
    {
      title: t('pages.regional.jurisdictionTax.col.defaultTaxTreatment'),
      dataIndex: 'defaultTaxTreatment',
      width: 160,
      search: false,
      render: (_, record) =>
        record.defaultTaxTreatment
          ? t(`pages.regional.jurisdictionTax.taxTreatment.${record.defaultTaxTreatment}`)
          : '—',
    },
    {
      title: t('pages.regional.jurisdictionTax.col.status'),
      dataIndex: 'status',
      width: 110,
      render: (_, record) => (
        <Tag color={STATUS_COLORS[record.status]}>
          {t(`pages.regional.jurisdictionTax.status.${record.status}`)}
        </Tag>
      ),
    },
    {
      title: t('pages.regional.jurisdictionTax.col.actions'),
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
                label: t('pages.regional.jurisdictionTax.action.view'),
                onClick: () => {
                  setDetailRecord(record);
                  setDetailOpen(true);
                },
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: t('pages.regional.jurisdictionTax.action.edit'),
                onClick: () => openEdit(record),
              },
              ...(record.nodeType === 'JURISDICTION'
                ? [
                    {
                      key: 'addChild',
                      icon: <PlusOutlined />,
                      label: t('pages.regional.jurisdictionTax.action.addChild'),
                      onClick: () => openCreate(record),
                    },
                  ]
                : []),
              { type: 'divider' as const },
              {
                key: 'status',
                icon:
                  record.status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />,
                label:
                  record.status === 'ACTIVE'
                    ? t('pages.regional.jurisdictionTax.action.disable')
                    : t('pages.regional.jurisdictionTax.action.enable'),
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
      title={t('pages.regional.jurisdictionTax.title')}
      subTitle={t('pages.regional.jurisdictionTax.subTitle')}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>
          {t('pages.regional.jurisdictionTax.addItem')}
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
        <Row align="middle" gutter={24}>
          <Col flex="auto">
            <Space align="start">
              <FlagOutlined style={{ fontSize: 24, color: '#1677ff' }} />
              <div>
                <Title level={5} style={{ margin: 0 }}>
                  {t('pages.regional.jurisdictionTax.banner.title')}
                </Title>
                <Text type="secondary">{t('pages.regional.jurisdictionTax.banner.desc')}</Text>
              </div>
            </Space>
            <div style={{ marginTop: 12 }}>
              <Steps
                size="small"
                current={100}
                items={[
                  { title: t('pages.regional.jurisdictionTax.flow.jurisdictionTax') },
                  { title: t('pages.regional.jurisdictionTax.flow.taxConfiguration') },
                  { title: t('pages.regional.jurisdictionTax.flow.billing') },
                  { title: t('pages.regional.jurisdictionTax.flow.invoice') },
                ]}
              />
            </div>
          </Col>
        </Row>
      </ProCard>

      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard
          statistic={{
            title: t('pages.regional.jurisdictionTax.stat.jurisdictions'),
            value: stats.jurisdictions,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.regional.jurisdictionTax.stat.activeTaxDefinitions'),
            value: stats.activeTaxDefinitions,
            valueStyle: { color: '#389e0d' },
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.regional.jurisdictionTax.stat.taxTypes'),
            value: stats.taxTypes,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.regional.jurisdictionTax.stat.markets'),
            value: stats.markets,
          }}
        />
      </StatisticCard.Group>

      <ProCard style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col flex="200px">
            <Select
              allowClear
              placeholder={t('pages.regional.jurisdictionTax.filter.allJurisdictions')}
              value={jurisdictionFilter}
              onChange={(value) => {
                setJurisdictionFilter(value);
                actionRef.current?.reload();
              }}
              style={{ width: '100%' }}
              options={JURISDICTION_OPTIONS.map(({ code, name }) => ({
                value: `J-${code}`,
                label: name,
              }))}
            />
          </Col>
          <Col flex="200px">
            <Select
              allowClear
              placeholder={t('pages.regional.jurisdictionTax.filter.allTaxTypes')}
              value={taxTypeFilter}
              onChange={(value) => {
                setTaxTypeFilter(value);
                actionRef.current?.reload();
              }}
              style={{ width: '100%' }}
              options={TAX_TYPE_OPTIONS.map((value) => ({ value, label: value }))}
            />
          </Col>
        </Row>
      </ProCard>

      <ProTable<JurisdictionTaxTreeNode>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        scroll={{ x: 1000 }}
        cardProps={{
          title: (
            <Space>
              <FlagOutlined />
              <span>{t('pages.regional.jurisdictionTax.table.title')}</span>
            </Space>
          ),
          extra: (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('pages.regional.jurisdictionTax.table.total', { count: allRecords.length })}
            </Text>
          ),
        }}
        request={async (params) => {
          const res = await request<{ success: boolean; data: JurisdictionTaxNode[] }>(
            '/api/regional/jurisdiction-tax/nodes',
            {
              method: 'GET',
              params: {
                nodeType: params.nodeType,
                status: params.status,
                parentId: jurisdictionFilter,
                taxType: taxTypeFilter,
                keyword: params.keyword,
              },
            },
          );
          const records = res.data ?? [];
          setAllRecords(records);
          return { data: toJurisdictionTaxTree(records), success: res.success };
        }}
        toolbar={{
          search: {
            placeholder: t('pages.regional.jurisdictionTax.filter.keywordPlaceholder'),
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

      <JurisdictionTaxForm
        open={formOpen}
        parent={formParent}
        editRecord={editRecord}
        onClose={() => setFormOpen(false)}
        onSuccess={() => actionRef.current?.reload()}
      />

      <JurisdictionTaxDetailDrawer
        open={detailOpen}
        record={detailRecord}
        childCount={detailRecord ? childCountOf(detailRecord.id) : 0}
        onClose={() => setDetailOpen(false)}
        onEdit={(record) => {
          setDetailOpen(false);
          openEdit(record);
        }}
      />
    </PageContainer>
  );
};

export default JurisdictionTaxPage;
