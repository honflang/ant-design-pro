export type BillDetailRecord = {
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

export type ChargeRecord = {
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

export const getBillDetails = (customerId: string, currency: string): BillDetailRecord[] => [
  { id: `BILL-${customerId}-001`, date: '2026-01-15', customer_id: customerId, charge_service: 'FCY_DOMESTIC_CASH_POOL', category: 'Setup Fee', tariff_item: 'Setup Fee', pricing_model: 'Flat', billing_basis: 'Group', amount: 5000, currency, quantity: 3, gross_amount: 2000, discount_waiver: 0, net_amount: 2000, remarks: 'Initial setup' },
  { id: `BILL-${customerId}-002`, date: '2026-07-01', customer_id: customerId, charge_service: 'FCY_DOMESTIC_CASH_POOL', category: 'Monthly Maintenance Fee', tariff_item: 'Monthly Maintenance Fee', pricing_model: 'Flat', billing_basis: 'Account', amount: 500, currency, quantity: 1, gross_amount: 500, discount_waiver: 0, net_amount: 500 },
  { id: `BILL-${customerId}-003`, date: '2026-06-10', customer_id: customerId, charge_service: 'FCY_DOMESTIC_CASH_POOL', category: 'Amendment Fee', tariff_item: 'Amendment Fee', pricing_model: 'Flat', billing_basis: 'Account', amount: 1000, currency, quantity: 1, gross_amount: 1000, discount_waiver: 0, net_amount: 1000 },
  { id: `BILL-${customerId}-004`, date: '2026-07-01', customer_id: customerId, charge_service: 'FCY_DOMESTIC_CASH_POOL', category: 'Commission Fee', tariff_item: 'Commission Fee', pricing_model: 'Rate', billing_basis: 'Account', amount: 0.3, currency, quantity: 20000, gross_amount: 600, discount_waiver: 0, net_amount: 600 },
  { id: `BILL-${customerId}-005`, date: '2026-07-01', customer_id: customerId, charge_service: 'FCY_DOMESTIC_CASH_POOL', category: 'Commission Fee', tariff_item: 'Commission Fee', pricing_model: 'Rate', billing_basis: 'Account', amount: 0.3, currency, quantity: 30000, gross_amount: 900, discount_waiver: 0, net_amount: 900 },
];

export const getChargeRecords = (customerId: string, currency: string): ChargeRecord[] => [
  { id: `CHG-${customerId}-001`, event_type: 'CASH_POOL_CREATE', event_time: '2026-01-15T09:30:00+08:00', customer_id: customerId, service_code: 'FCY_DOMESTIC_CASH_POOL', tariff_item_no: 'TARIFF-001', tariff_item_name: 'Setup Fee', group_number: 3, total_active_account_count: 4, currency, amount: 1800 },
  { id: `CHG-${customerId}-002`, event_type: 'CASH_POOL_MONTHLY_MAINT', event_time: '2026-07-01T02:00:00+08:00', customer_id: customerId, service_code: 'FCY_DOMESTIC_CASH_POOL', tariff_item_no: 'TARIFF-002', tariff_item_name: 'Monthly Maintenance Fee', group_number: 3, total_active_account_count: 4, currency, amount: 420 },
  { id: `CHG-${customerId}-003`, event_type: 'CASH_POOL_COMMISSION', event_time: '2026-07-01T02:00:00+08:00', customer_id: customerId, service_code: 'FCY_DOMESTIC_CASH_POOL', tariff_item_no: 'TARIFF-003', tariff_item_name: 'Commission Fee', group_number: 3, total_active_account_count: 4, currency, amount: 1260 },
  { id: `CHG-${customerId}-004`, event_type: 'CASH_POOL_AMEND', event_time: '2026-06-10T14:20:00+08:00', customer_id: customerId, service_code: 'FCY_DOMESTIC_CASH_POOL', tariff_item_no: 'TARIFF-004', tariff_item_name: 'Amendment Fee', total_changed_accounts: 2, currency, amount: 600 },
];
