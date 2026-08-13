import { CreditCardOutlined, EyeOutlined, MoreOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { PageContainer, ProCard, ProTable, StatisticCard } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Button, Drawer, Dropdown, Form, Input, InputNumber, Modal, Select, Space, Tag, Typography } from 'antd';
import React, { useState } from 'react';

const { Text } = Typography;

type ConfigStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE';

type ConfigRecord = {
  id: string;
  client: string;
  market: string;
  cycle: string;
  chargeAccount: string;
  chargeCurrency: string;
  billingCurrency: string;
  fxMethod: string;
  consolidateProducts: string;
  consolidateCountries: string;
  maxBackdateDays: number;
  invoiceFormat: string;
  deliveryChannel: string;
  status: ConfigStatus;
  updatedBy: string;
};

const initialConfigs: ConfigRecord[] = [
  { id: 'CFG-001', client: 'ACME Corp', market: 'Singapore', cycle: 'MONTHLY', chargeAccount: 'SGD OPERATIONS A/C', chargeCurrency: 'SGD', billingCurrency: 'SGD', fxMethod: 'Monthly Average', consolidateProducts: 'Yes', consolidateCountries: 'No', maxBackdateDays: 60, invoiceFormat: 'PDF', deliveryChannel: 'Email', status: 'ACTIVE', updatedBy: 'Liam Tan' },
  { id: 'CFG-011', client: 'Northwind Ltd', market: 'Hong Kong', cycle: 'QUARTERLY', chargeAccount: 'HKD Treasury A/C', chargeCurrency: 'HKD', billingCurrency: 'SGD', fxMethod: 'Avg. of month', consolidateProducts: 'Yes', consolidateCountries: 'No', maxBackdateDays: 30, invoiceFormat: 'XML', deliveryChannel: 'Portal', status: 'ACTIVE', updatedBy: 'Avery Chan' },
  { id: 'CFG-023', client: 'Mizuho Japan', market: 'Japan', cycle: 'ANNUAL', chargeAccount: 'JPY Treasury A/C', chargeCurrency: 'JPY', billingCurrency: 'JPY', fxMethod: 'Spot on booking', consolidateProducts: 'No', consolidateCountries: 'Yes', maxBackdateDays: 90, invoiceFormat: 'PDF', deliveryChannel: 'Email', status: 'PENDING', updatedBy: 'Mio Kato' },
];

const statusColors = { ACTIVE: 'success', PENDING: 'processing', INACTIVE: 'default' };

const BillingConfigurationPage: React.FC = () => {
  const { message } = App.useApp();
  const intl = useIntl();
  const t = (id: string, defaultMessage: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id, defaultMessage }, values);
  const [form] = Form.useForm();
  const [configs, setConfigs] = useState<ConfigRecord[]>(initialConfigs);
  const [detail, setDetail] = useState<ConfigRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ConfigRecord | null>(null);

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editRecord) {
      setConfigs((prev) =>
        prev.map((item) =>
          item.id === editRecord.id ? { ...item, ...values, updatedBy: 'Current User' } : item,
        ),
      );
      message.success(t('pages.billing.configuration.msg.updated', 'Configuration updated'));
    } else {
      setConfigs((prev) => [
        {
          id: `CFG-${Date.now()}`,
          updatedBy: 'Current User',
          status: 'ACTIVE',
          ...values,
        },
        ...prev,
      ]);
      message.success(t('pages.billing.configuration.msg.created', 'Configuration created'));
    }
    setFormOpen(false);
    setEditRecord(null);
    form.resetFields();
  };

  const toggleStatus = (record: ConfigRecord) => {
    const nextStatus: ConfigStatus = record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setConfigs((prev) =>
      prev.map((item) => (item.id === record.id ? { ...item, status: nextStatus } : item)),
    );
    message.success(
      nextStatus === 'ACTIVE'
        ? t('pages.billing.configuration.msg.enabled', 'Configuration enabled')
        : t('pages.billing.configuration.msg.disabled', 'Configuration disabled'),
    );
  };

  return (
    <PageContainer
      title={t('pages.billing.configuration.title', 'Billing Configuration')}
      subTitle={t(
        'pages.billing.configuration.subtitle',
        'Configure billing behavior across clients and markets',
      )}
      extra={[
        <Button
          key="new"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditRecord(null);
            form.resetFields();
            setFormOpen(true);
          }}
        >
          {t('pages.billing.configuration.action.new', 'New Configuration')}
        </Button>,
      ]}
    >
      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard
          statistic={{
            title: t('pages.billing.configuration.stat.active', 'Active Configurations'),
            value: configs.filter((item) => item.status === 'ACTIVE').length,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.billing.configuration.stat.markets', 'Markets Covered'),
            value: new Set(configs.map((item) => item.market)).size,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.billing.configuration.stat.pending', 'Pending Review'),
            value: configs.filter((item) => item.status === 'PENDING').length,
          }}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: t('pages.billing.configuration.stat.crossCurrency', 'Cross-currency'),
            value: configs.filter((item) => item.chargeCurrency !== item.billingCurrency).length,
          }}
        />
      </StatisticCard.Group>

      <ProCard>
        <ProTable
          rowKey="id"
          dataSource={configs}
          columns={[
            { title: t('pages.billing.configuration.col.client', 'Client'), dataIndex: 'client', width: 150 },
            { title: t('pages.billing.configuration.col.market', 'Market'), dataIndex: 'market', width: 120 },
            { title: t('pages.billing.configuration.col.cycle', 'Cycle'), dataIndex: 'cycle', width: 110 },
            {
              title: t('pages.billing.configuration.col.chargeAccount', 'Charge Account'),
              dataIndex: 'chargeAccount',
              width: 180,
            },
            {
              title: t('pages.billing.configuration.col.billingCurrency', 'Billing Currency'),
              dataIndex: 'billingCurrency',
              width: 120,
            },
            { title: t('pages.billing.configuration.col.fxMethod', 'FX Method'), dataIndex: 'fxMethod', width: 140 },
            {
              title: t('pages.billing.configuration.col.maxBackdate', 'Max Backdate'),
              dataIndex: 'maxBackdateDays',
              width: 120,
            },
            {
              title: t('pages.billing.configuration.col.status', 'Status'),
              dataIndex: 'status',
              render: (_: unknown, row: ConfigRecord) => (
                <Tag color={statusColors[row.status as keyof typeof statusColors]}>{row.status}</Tag>
              ),
            },
            { title: t('pages.billing.configuration.col.updatedBy', 'Updated By'), dataIndex: 'updatedBy', width: 110 },
            {
              title: t('pages.billing.configuration.col.actions', 'Actions'),
              width: 110,
              render: (_: unknown, row: ConfigRecord) => (
                <Dropdown menu={{ items: [
                  {
                    key: 'view',
                    label: t('pages.billing.configuration.action.view', 'View'),
                    icon: <EyeOutlined />,
                    onClick: () => setDetail(row),
                  },
                  {
                    key: 'edit',
                    label: t('pages.billing.configuration.action.edit', 'Edit'),
                    icon: <SettingOutlined />,
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
                        ? t('pages.billing.configuration.action.disable', 'Disable')
                        : t('pages.billing.configuration.action.enable', 'Enable'),
                    icon: <CreditCardOutlined />,
                    onClick: () => toggleStatus(row),
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
        width={640}
        title={
          <Space>
            <EyeOutlined /> {detail?.id}
          </Space>
        }
      >
        {detail && (
          <ProCard title={t('pages.billing.configuration.detail.title', 'Configuration Details')} size="small">
            <Text>{t('pages.billing.configuration.col.client', 'Client')}: {detail.client}</Text><br />
            <Text>{t('pages.billing.configuration.col.market', 'Market')}: {detail.market}</Text><br />
            <Text>{t('pages.billing.configuration.col.cycle', 'Cycle')}: {detail.cycle}</Text><br />
            <Text>{t('pages.billing.configuration.col.chargeAccount', 'Charge Account')}: {detail.chargeAccount}</Text><br />
            <Text>{t('pages.billing.configuration.col.billingCurrency', 'Billing Currency')}: {detail.billingCurrency}</Text><br />
            <Text>{t('pages.billing.configuration.col.fxMethod', 'FX Method')}: {detail.fxMethod}</Text><br />
            <Text>
              {t('pages.billing.configuration.detail.backdateWindow', 'Backdate Window')}: {detail.maxBackdateDays}{' '}
              {t('pages.billing.configuration.detail.days', 'days')}
            </Text>
            <br />
            <Text>
              {t('pages.billing.configuration.detail.consolidation', 'Consolidation')}: {detail.consolidateProducts} /{' '}
              {detail.consolidateCountries}
            </Text>
          </ProCard>
        )}
      </Drawer>

      <Modal
        open={formOpen}
        title={
          editRecord
            ? t('pages.billing.configuration.form.editTitle', 'Edit Configuration')
            : t('pages.billing.configuration.form.addTitle', 'New Configuration')
        }
        onCancel={() => {
          setFormOpen(false);
          setEditRecord(null);
        }}
        onOk={handleSave}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ cycle: 'MONTHLY', status: 'ACTIVE' }}>
          <Form.Item name="client" label={t('pages.billing.configuration.col.client', 'Client')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="market" label={t('pages.billing.configuration.col.market', 'Market')} rules={[{ required: true }]}>
            <Select options={['Singapore', 'Hong Kong', 'China', 'Japan', 'Australia'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item name="cycle" label={t('pages.billing.configuration.col.cycle', 'Cycle')} rules={[{ required: true }]}>
            <Select options={['MONTHLY', 'QUARTERLY', 'ANNUAL', 'ON_DEMAND'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item name="chargeAccount" label={t('pages.billing.configuration.col.chargeAccount', 'Charge Account')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="chargeCurrency" label={t('pages.billing.configuration.form.chargeCurrency', 'Charge Currency')} rules={[{ required: true }]}>
            <Select options={['SGD', 'HKD', 'CNY', 'JPY', 'AUD'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item name="billingCurrency" label={t('pages.billing.configuration.col.billingCurrency', 'Billing Currency')} rules={[{ required: true }]}>
            <Select options={['SGD', 'HKD', 'CNY', 'JPY', 'AUD'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item name="fxMethod" label={t('pages.billing.configuration.col.fxMethod', 'FX Method')} rules={[{ required: true }]}>
            <Select options={['Monthly Average', 'Spot on booking', 'Fixed Rate'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item name="maxBackdateDays" label={t('pages.billing.configuration.col.maxBackdate', 'Max Backdate')} rules={[{ required: true }]}>
            <InputNumber min={0} max={180} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="consolidateProducts" label={t('pages.billing.configuration.form.consolidateProducts', 'Consolidate Products')} rules={[{ required: true }]}>
            <Select options={['Yes', 'No'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item name="consolidateCountries" label={t('pages.billing.configuration.form.consolidateCountries', 'Consolidate Countries')} rules={[{ required: true }]}>
            <Select options={['Yes', 'No'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item name="invoiceFormat" label={t('pages.billing.configuration.form.invoiceFormat', 'Invoice Format')} rules={[{ required: true }]}>
            <Select options={['PDF', 'XML', 'XLSX'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item name="deliveryChannel" label={t('pages.billing.configuration.form.deliveryChannel', 'Delivery Channel')} rules={[{ required: true }]}>
            <Select options={['Email', 'Portal', 'SFTP'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item name="status" label={t('pages.billing.configuration.col.status', 'Status')} rules={[{ required: true }]}>
            <Select options={['ACTIVE', 'PENDING', 'INACTIVE'].map((value) => ({ label: value, value }))} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default BillingConfigurationPage;
