import { EyeOutlined, LinkOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProCard, ProTable, StatisticCard } from '@ant-design/pro-components';
import { history, useIntl } from '@umijs/max';
import { Button, Space, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

type BillDetailRecord = {
  id: string;
  date: string;
  customer_id: string;
  charge_service: string;
  category: string;
  tariff_item: string;
  pricing_model: 'Flat' | 'Rate' | 'Tiered';
  billing_basis: string;
  amount: number;
  currency: string;
  quantity: number;
  gross_amount: number;
  discount_waiver: number;
  net_amount: number;
  remarks?: string;
};

const billDetails: BillDetailRecord[] = [
  { id: 'BILL-20260115-001', date: '2026-01-15', customer_id: 'CUST_12345', charge_service: 'FCY_DOMESTIC_CASH_POOL', category: 'Setup Fee', tariff_item: 'Setup Fee', pricing_model: 'Flat', billing_basis: 'Group', amount: 5000, currency: 'USD', quantity: 3, gross_amount: 2000, discount_waiver: 0, net_amount: 2000, remarks: 'Initial setup' },
  { id: 'BILL-20260701-001', date: '2026-07-01', customer_id: 'CUST_12345', charge_service: 'FCY_DOMESTIC_CASH_POOL', category: 'Monthly Maintenance Fee', tariff_item: 'Monthly Maintenance Fee', pricing_model: 'Flat', billing_basis: 'Account', amount: 500, currency: 'USD', quantity: 1, gross_amount: 500, discount_waiver: 0, net_amount: 500 },
  { id: 'BILL-20260610-001', date: '2026-06-10', customer_id: 'CUST_12345', charge_service: 'FCY_DOMESTIC_CASH_POOL', category: 'Amendment Fee', tariff_item: 'Amendment Fee', pricing_model: 'Flat', billing_basis: 'Account', amount: 1000, currency: 'USD', quantity: 1, gross_amount: 1000, discount_waiver: 0, net_amount: 1000 },
  { id: 'BILL-20260701-002', date: '2026-07-01', customer_id: 'CUST_12345', charge_service: 'FCY_DOMESTIC_CASH_POOL', category: 'Commission Fee', tariff_item: 'Commission Fee', pricing_model: 'Rate', billing_basis: 'Account', amount: 0.3, currency: 'USD', quantity: 20000, gross_amount: 600, discount_waiver: 0, net_amount: 600 },
  { id: 'BILL-20260701-003', date: '2026-07-01', customer_id: 'CUST_12345', charge_service: 'FCY_DOMESTIC_CASH_POOL', category: 'Commission Fee', tariff_item: 'Commission Fee', pricing_model: 'Rate', billing_basis: 'Account', amount: 0.3, currency: 'USD', quantity: 30000, gross_amount: 900, discount_waiver: 0, net_amount: 900 },
];

const BillDetailsPage: React.FC = () => {
  const intl = useIntl();
  const t = (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage });
  const formatAmount = (amount: number, currency: string) => `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const columns: ProColumns<BillDetailRecord>[] = [
    { title: t('pages.customer.bill.chargeService', 'Charge Service'), dataIndex: 'charge_service', width: 220 },
    { title: t('pages.customer.bill.category', 'Category'), dataIndex: 'category', width: 180 },
    { title: t('pages.customer.bill.date', 'Date'), dataIndex: 'date', width: 120 },
    { title: t('pages.customer.bill.tariffItem', 'Tariff Item'), dataIndex: 'tariff_item', width: 180 },
    { title: t('pages.customer.bill.pricingModel', 'Pricing Model'), dataIndex: 'pricing_model', width: 130, valueEnum: { Flat: { text: t('pages.customer.bill.pricingModel.flat', 'Flat') }, Rate: { text: t('pages.customer.bill.pricingModel.rate', 'Rate') }, Tiered: { text: t('pages.customer.bill.pricingModel.tiered', 'Tiered') } } },
    { title: t('pages.customer.bill.billingBasis', 'Billing Basis'), dataIndex: 'billing_basis', width: 130 },
    { title: t('pages.customer.bill.amount', 'Amount'), dataIndex: 'amount', width: 130, render: (_, row) => row.pricing_model === 'Rate' ? `${row.amount}%` : formatAmount(row.amount, row.currency) },
    { title: t('pages.customer.bill.currency', 'Currency'), dataIndex: 'currency', width: 100 },
    { title: t('pages.customer.bill.quantity', 'Qty'), dataIndex: 'quantity', width: 90 },
    { title: t('pages.customer.bill.grossAmount', 'Gross Amount'), dataIndex: 'gross_amount', width: 140, render: (_, row) => formatAmount(row.gross_amount, row.currency) },
    { title: t('pages.customer.bill.discountWaiver', 'Discount/Waiver'), dataIndex: 'discount_waiver', width: 150, render: (_, row) => formatAmount(row.discount_waiver, row.currency) },
    { title: t('pages.customer.bill.netAmount', 'Net Amount'), dataIndex: 'net_amount', width: 140, render: (_, row) => <Text strong>{formatAmount(row.net_amount, row.currency)}</Text> },
    { title: t('pages.customer.bill.remarks', 'Remarks'), dataIndex: 'remarks', width: 150 },
    { title: t('pages.customer.bill.actions', 'Actions'), fixed: 'right', width: 110, search: false, render: (_, row) => <Button type="link" icon={<EyeOutlined />} onClick={() => history.push(`/pricing-billing/customer/360?customerId=${row.customer_id === 'CUST_12345' ? 'CUST-000128' : row.customer_id}`)}>{t('pages.customer.bill.viewCustomer', 'View Customer')}</Button> },
  ];

  return (
    <PageContainer title={t('pages.customer.bill.title', 'Bill Details')} subTitle={t('pages.customer.bill.subtitle', 'Review charge service pricing and bill amount details')}>
      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard statistic={{ title: t('pages.customer.bill.stat.items', 'Bill Items'), value: billDetails.length }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.customer.bill.stat.services', 'Charge Services'), value: new Set(billDetails.map((item) => item.charge_service)).size }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.customer.bill.stat.netAmount', 'Net Amount'), value: `USD ${billDetails.reduce((total, item) => total + item.net_amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` }} />
      </StatisticCard.Group>
      <ProCard title={<Space><LinkOutlined />{t('pages.customer.bill.section.title', 'Bill Detail Ledger')}</Space>}>
        <ProTable rowKey="id" scroll={{ x: 2100 }} search={{ labelWidth: 'auto' }} options={false} dataSource={billDetails} columns={columns} pagination={{ pageSize: 10 }} />
      </ProCard>
    </PageContainer>
  );
};

export default BillDetailsPage;