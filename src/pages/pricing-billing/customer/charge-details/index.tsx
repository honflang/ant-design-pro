import { EyeOutlined, LinkOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProCard, ProTable, StatisticCard } from '@ant-design/pro-components';
import { history, useIntl } from '@umijs/max';
import { Button, Space, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

type ChargeRecord = {
  id: string;
  event_type: string;
  event_time: string;
  customer_id: string;
  service_code: string;
  tariff_item_no: string;
  tariff_item_name: string;
  group_number?: number;
  total_active_account_count?: number;
  total_changed_accounts?: number;
  currency: string;
  amount: number;
};

const chargeRecords: ChargeRecord[] = [
  { id: 'CHG-20260115-001', event_type: 'CASH_POOL_CREATE', event_time: '2026-01-15T09:30:00+08:00', customer_id: 'CUST_12345', service_code: 'FCY_DOMESTIC_CASH_POOL', tariff_item_no: 'TARIFF-001', tariff_item_name: 'Setup Fee', group_number: 3, total_active_account_count: 4, currency: 'SGD', amount: 1800 },
  { id: 'CHG-20260701-001', event_type: 'CASH_POOL_MONTHLY_MAINT', event_time: '2026-07-01T02:00:00+08:00', customer_id: 'CUST_12345', service_code: 'FCY_DOMESTIC_CASH_POOL', tariff_item_no: 'TARIFF-002', tariff_item_name: 'Monthly Maintenance Fee', group_number: 3, total_active_account_count: 4, currency: 'SGD', amount: 420 },
  { id: 'CHG-20260701-002', event_type: 'CASH_POOL_COMMISSION', event_time: '2026-07-01T02:00:00+08:00', customer_id: 'CUST_12345', service_code: 'FCY_DOMESTIC_CASH_POOL', tariff_item_no: 'TARIFF-003', tariff_item_name: 'Commission Fee', group_number: 3, total_active_account_count: 4, currency: 'SGD', amount: 1260 },
  { id: 'CHG-20260610-001', event_type: 'CASH_POOL_AMEND', event_time: '2026-06-10T14:20:00+08:00', customer_id: 'CUST_12345', service_code: 'FCY_DOMESTIC_CASH_POOL', tariff_item_no: 'TARIFF-004', tariff_item_name: 'Amendment Fee', total_changed_accounts: 2, currency: 'SGD', amount: 600 },
];

const ChargeDetailsPage: React.FC = () => {
  const intl = useIntl();
  const t = (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage });
  const formatAmount = (row: ChargeRecord) => `${row.currency} ${row.amount.toLocaleString('en-US')}`;
  const columns: ProColumns<ChargeRecord>[] = [
    { title: t('pages.customer.charge.eventType', 'Event Type'), dataIndex: 'event_type', width: 210, valueType: 'select', valueEnum: Object.fromEntries(chargeRecords.map((item) => [item.event_type, { text: item.event_type }])) },
    { title: t('pages.customer.charge.eventTime', 'Event Time'), dataIndex: 'event_time', width: 190 },
    { title: t('pages.customer.charge.customerId', 'Customer ID'), dataIndex: 'customer_id', width: 140 },
    { title: t('pages.customer.charge.serviceCode', 'Service Code'), dataIndex: 'service_code', width: 220 },
    { title: t('pages.customer.charge.tariffItem', 'Tariff Item'), dataIndex: 'tariff_item_name', width: 180, render: (_, row) => <div><Text strong>{row.tariff_item_name}</Text><br /><Text type="secondary">{row.tariff_item_no}</Text></div> },
    { title: t('pages.customer.charge.groupNumber', 'Group Number'), dataIndex: 'group_number', width: 110 },
    { title: t('pages.customer.charge.activeAccounts', 'Active Accounts'), dataIndex: 'total_active_account_count', width: 120 },
    { title: t('pages.customer.charge.changedAccounts', 'Changed Accounts'), dataIndex: 'total_changed_accounts', width: 125 },
    { title: t('pages.customer.charge.amount', 'Charge Amount'), dataIndex: 'amount', width: 140, render: (_, row) => <Text strong>{formatAmount(row)}</Text> },
    { title: t('pages.customer.charge.actions', 'Actions'), fixed: 'right', width: 110, search: false, render: (_, row) => <Button type="link" icon={<EyeOutlined />} onClick={() => history.push(`/pricing-billing/customer/360?customerId=${row.customer_id === 'CUST_12345' ? 'CUST-000128' : row.customer_id}`)}>{t('pages.customer.charge.viewCustomer', 'View Customer')}</Button> },
  ];

  return (
    <PageContainer title={t('pages.customer.charge.title', '收费明细')} subTitle={t('pages.customer.charge.subtitle', '按客户和服务事件追踪收费来源与账户变更')}>
      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard statistic={{ title: t('pages.customer.charge.stat.events', '收费事件'), value: chargeRecords.length }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.customer.charge.stat.customers', '涉及客户'), value: new Set(chargeRecords.map((item) => item.customer_id)).size }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.customer.charge.stat.amount', '本期收费金额'), value: 'SGD 4,080' }} />
      </StatisticCard.Group>
      <ProCard title={<Space><LinkOutlined />{t('pages.customer.charge.section.title', '收费事件流水')}</Space>}>
        <ProTable rowKey="id" search={{ labelWidth: 'auto' }} options={false} dataSource={chargeRecords} columns={columns} pagination={{ pageSize: 10 }} />
      </ProCard>
    </PageContainer>
  );
};

export default ChargeDetailsPage;