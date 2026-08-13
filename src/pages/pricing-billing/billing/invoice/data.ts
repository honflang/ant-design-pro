export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'SENT' | 'CORRECTED' | 'CANCELLED' | 'OVERDUE';

export type InvoiceFormat = 'PDF' | 'ISO20022' | 'MT940' | 'XLSX';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxCategory: string;
}

export interface BillingRunProfile {
  id: string;
  label: string;
  market: string;
  currency: string;
  billingPeriod: string;
  taxRuleId: string;
  taxType: string;
  taxRate: number;
  taxAuthority: string;
  taxTreatment: string;
  taxCalculationBasis: string;
  formatNotes: string;
  dueOffsetDays: number;
  lineItemTemplates: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxCategory: string;
  }>;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  billingRunId: string;
  billingRunReference: string;
  clientName: string;
  market: string;
  billingPeriod: string;
  currency: string;
  subTotal: number;
  taxType: string;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  taxRuleId: string;
  taxTreatment: string;
  taxAuthority: string;
  taxCalculationBasis: string;
  invoiceFormat: InvoiceFormat;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  isCorrection: boolean;
  originalInvoiceId?: string;
  correctionReason?: string;
  sendChannel?: string;
  sendDate?: string;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceSummary {
  totalInvoices: number;
  draftInvoices: number;
  issuedInvoices: number;
  sentInvoices: number;
  correctedInvoices: number;
  cancelledInvoices: number;
  totalBilledAmount: number;
}

export interface InvoiceFilters {
  market?: string;
  clientName?: string;
  billingPeriod?: string;
  status?: string;
  keyword?: string;
}

export interface InvoiceListResponse {
  success: boolean;
  data: InvoiceRecord[];
  total: number;
  summary: InvoiceSummary;
}

export const BILLING_RUNS: BillingRunProfile[] = [
  {
    id: 'BR-SG-2026-08-001',
    label: 'Singapore August 2026 Billing Run',
    market: 'Singapore',
    currency: 'SGD',
    billingPeriod: '2026-08',
    taxRuleId: 'sg-gst-001',
    taxType: 'GST',
    taxRate: 9,
    taxAuthority: 'Inland Revenue Authority of Singapore (IRAS)',
    taxTreatment: 'Tax Exclusive',
    taxCalculationBasis: 'Taxable domestic banking services from the billing run results',
    formatNotes: 'Invoices include GST breakdown and IRAS traceability references.',
    dueOffsetDays: 30,
    lineItemTemplates: [
      { description: 'Cash management service fees', quantity: 1, unitPrice: 8500, taxCategory: 'Taxable' },
      { description: 'Transaction processing charges', quantity: 1, unitPrice: 2500, taxCategory: 'Taxable' },
      { description: 'Trade finance settlement service', quantity: 1, unitPrice: 1500, taxCategory: 'Taxable' },
    ],
  },
  {
    id: 'BR-CN-2026-08-001',
    label: 'China August 2026 Billing Run',
    market: 'China',
    currency: 'CNY',
    billingPeriod: '2026-08',
    taxRuleId: 'cn-vat-001',
    taxType: 'VAT',
    taxRate: 6,
    taxAuthority: 'State Taxation Administration (STA)',
    taxTreatment: 'Tax Exclusive',
    taxCalculationBasis: 'VAT taxable financial services sourced from the billing run results',
    formatNotes: 'Chinese invoices highlight VAT rate, tax code and issuer details.',
    dueOffsetDays: 30,
    lineItemTemplates: [
      { description: 'Deposit service package', quantity: 1, unitPrice: 12000, taxCategory: 'Taxable' },
      { description: 'FX service spread', quantity: 1, unitPrice: 7800, taxCategory: 'Taxable' },
      { description: 'Premium treasury support', quantity: 1, unitPrice: 4200, taxCategory: 'Taxable' },
    ],
  },
  {
    id: 'BR-JP-2026-08-001',
    label: 'Japan August 2026 Billing Run',
    market: 'Japan',
    currency: 'JPY',
    billingPeriod: '2026-08',
    taxRuleId: 'jp-ct-001',
    taxType: 'Consumption Tax',
    taxRate: 10,
    taxAuthority: 'National Tax Agency (NTA)',
    taxTreatment: 'Tax Exclusive',
    taxCalculationBasis: 'Domestic consumption tax for banking services',
    formatNotes: 'Japanese invoices show consumption tax and qualified invoice references.',
    dueOffsetDays: 30,
    lineItemTemplates: [
      { description: 'Settlement account maintenance', quantity: 1, unitPrice: 1020000, taxCategory: 'Taxable' },
      { description: 'Cross-border payment handling', quantity: 1, unitPrice: 580000, taxCategory: 'Taxable' },
      { description: 'Advisory support services', quantity: 1, unitPrice: 240000, taxCategory: 'Taxable' },
    ],
  },
  {
    id: 'BR-HK-2026-08-001',
    label: 'Hong Kong August 2026 Billing Run',
    market: 'Hong Kong',
    currency: 'HKD',
    billingPeriod: '2026-08',
    taxRuleId: 'hk-exempt-001',
    taxType: 'Exempt',
    taxRate: 0,
    taxAuthority: 'Inland Revenue Department (IRD)',
    taxTreatment: 'Tax Exempt',
    taxCalculationBasis: 'Financial services exempt from VAT-style indirect tax',
    formatNotes: 'Hong Kong invoices can highlight exempt services and zero tax amount.',
    dueOffsetDays: 30,
    lineItemTemplates: [
      { description: 'Cash management platform fee', quantity: 1, unitPrice: 5800, taxCategory: 'Exempt' },
      { description: 'Treasury reporting service', quantity: 1, unitPrice: 2100, taxCategory: 'Exempt' },
      { description: 'Relationship service fee', quantity: 1, unitPrice: 1000, taxCategory: 'Exempt' },
    ],
  },
  {
    id: 'BR-AU-2026-08-001',
    label: 'Australia August 2026 Billing Run',
    market: 'Australia',
    currency: 'AUD',
    billingPeriod: '2026-08',
    taxRuleId: 'au-gst-001',
    taxType: 'GST',
    taxRate: 10,
    taxAuthority: 'Australian Taxation Office (ATO)',
    taxTreatment: 'Tax Exclusive',
    taxCalculationBasis: 'Australian GST on supplied financial and treasury services',
    formatNotes: 'Australia invoice layouts emphasise GST, ABN and payment due date.',
    dueOffsetDays: 14,
    lineItemTemplates: [
      { description: 'Operating account package', quantity: 1, unitPrice: 9300, taxCategory: 'Taxable' },
      { description: 'Liquidity management add-on', quantity: 1, unitPrice: 3200, taxCategory: 'Taxable' },
      { description: 'Cross-border remittance processing', quantity: 1, unitPrice: 1800, taxCategory: 'Taxable' },
    ],
  },
];

const marketByBillingRunId = BILLING_RUNS.reduce<Record<string, BillingRunProfile>>((accumulator, item) => {
  accumulator[item.id] = item;
  return accumulator;
}, {});

const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  });

const formatAmount = (amount: number, currency: string) => currencyFormatter(currency).format(amount);

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const roundAmount = (value: number) => Math.round(value * 100) / 100;

const buildLineItems = (profile: BillingRunProfile, multiplier = 1): InvoiceLineItem[] =>
  profile.lineItemTemplates.map((item, index) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: roundAmount(item.unitPrice * multiplier + index * 25),
    amount: roundAmount((item.unitPrice * multiplier + index * 25) * item.quantity),
    taxCategory: item.taxCategory,
  }));

export const createInvoiceRecord = (input: {
  id: string;
  invoiceNumber: string;
  billingRunId: string;
  clientName: string;
  invoiceFormat: InvoiceFormat;
  issueDate: string;
  status: InvoiceStatus;
  isCorrection?: boolean;
  originalInvoiceId?: string;
  correctionReason?: string;
  sendChannel?: string;
  sendDate?: string;
  lineItems?: InvoiceLineItem[];
  billingRunReference?: string;
  billingPeriod?: string;
}): InvoiceRecord => {
  const profile = marketByBillingRunId[input.billingRunId];
  const lineItems = input.lineItems ?? (profile ? buildLineItems(profile) : []);
  const subTotal = roundAmount(lineItems.reduce((total, item) => total + item.amount, 0));
  const taxRate = profile?.taxRate ?? 0;
  const taxAmount = roundAmount(subTotal * (taxRate / 100));
  const totalAmount = roundAmount(subTotal + taxAmount);
  const dueDate = profile ? addDays(input.issueDate, profile.dueOffsetDays) : addDays(input.issueDate, 30);

  return {
    id: input.id,
    invoiceNumber: input.invoiceNumber,
    billingRunId: input.billingRunId,
    billingRunReference: input.billingRunReference ?? `${input.billingRunId}-REF`,
    clientName: input.clientName,
    market: profile?.market ?? 'Unknown',
    billingPeriod: input.billingPeriod ?? profile?.billingPeriod ?? input.issueDate.slice(0, 7),
    currency: profile?.currency ?? 'USD',
    subTotal,
    taxType: profile?.taxType ?? 'Other',
    taxRate,
    taxAmount,
    totalAmount,
    taxRuleId: profile?.taxRuleId ?? 'manual-rule',
    taxTreatment: profile?.taxTreatment ?? 'Tax Exclusive',
    taxAuthority: profile?.taxAuthority ?? 'Local Authority',
    taxCalculationBasis: profile?.taxCalculationBasis ?? 'Manual invoice generation',
    invoiceFormat: input.invoiceFormat,
    status: input.status,
    issueDate: input.issueDate,
    dueDate,
    isCorrection: input.isCorrection ?? false,
    originalInvoiceId: input.originalInvoiceId,
    correctionReason: input.correctionReason,
    sendChannel: input.sendChannel,
    sendDate: input.sendDate,
    lineItems,
  };
};

export const createInitialInvoices = (): InvoiceRecord[] => [
  createInvoiceRecord({
    id: 'INV-2026-1001',
    invoiceNumber: 'SG-2026-08001',
    billingRunId: 'BR-SG-2026-08-001',
    billingRunReference: 'BR-SG-2026-08-001',
    clientName: 'ACME Financial Pte. Ltd.',
    invoiceFormat: 'PDF',
    issueDate: '2026-08-11',
    status: 'ISSUED',
    billingPeriod: '2026-08',
    lineItems: [
      { description: 'Cash management service fees', quantity: 1, unitPrice: 8500, amount: 8500, taxCategory: 'Taxable' },
      { description: 'Transaction processing charges', quantity: 1, unitPrice: 2500, amount: 2500, taxCategory: 'Taxable' },
      { description: 'Trade finance settlement service', quantity: 1, unitPrice: 1500, amount: 1500, taxCategory: 'Taxable' },
    ],
  }),
  createInvoiceRecord({
    id: 'INV-2026-1002',
    invoiceNumber: 'HK-2026-08002',
    billingRunId: 'BR-HK-2026-08-001',
    billingRunReference: 'BR-HK-2026-08-001',
    clientName: 'Northwind Asia Holdings',
    invoiceFormat: 'ISO20022',
    issueDate: '2026-08-12',
    status: 'DRAFT',
    billingPeriod: '2026-08',
    lineItems: [
      { description: 'Cash management platform fee', quantity: 1, unitPrice: 5800, amount: 5800, taxCategory: 'Exempt' },
      { description: 'Treasury reporting service', quantity: 1, unitPrice: 2100, amount: 2100, taxCategory: 'Exempt' },
      { description: 'Relationship service fee', quantity: 1, unitPrice: 1000, amount: 1000, taxCategory: 'Exempt' },
    ],
  }),
  createInvoiceRecord({
    id: 'INV-2026-1003',
    invoiceNumber: 'JP-2026-08003-R1',
    billingRunId: 'BR-JP-2026-08-001',
    billingRunReference: 'BR-JP-2026-08-001',
    clientName: 'Mizuho Corporate Services',
    invoiceFormat: 'MT940',
    issueDate: '2026-08-09',
    status: 'CORRECTED',
    billingPeriod: '2026-08',
    isCorrection: true,
    originalInvoiceId: 'INV-2026-0977',
    correctionReason: 'Consumption tax base updated after billing run reconciliation.',
    lineItems: [
      { description: 'Settlement account maintenance', quantity: 1, unitPrice: 1020000, amount: 1020000, taxCategory: 'Taxable' },
      { description: 'Cross-border payment handling', quantity: 1, unitPrice: 580000, amount: 580000, taxCategory: 'Taxable' },
      { description: 'Advisory support services', quantity: 1, unitPrice: 240000, amount: 240000, taxCategory: 'Taxable' },
    ],
  }),
  createInvoiceRecord({
    id: 'INV-2026-1004',
    invoiceNumber: 'CN-2026-08004',
    billingRunId: 'BR-CN-2026-08-001',
    billingRunReference: 'BR-CN-2026-08-001',
    clientName: 'Jade River Industrial Bank Co., Ltd.',
    invoiceFormat: 'XLSX',
    issueDate: '2026-08-10',
    status: 'SENT',
    billingPeriod: '2026-08',
    sendChannel: 'Secure client portal',
    sendDate: '2026-08-10',
    lineItems: [
      { description: 'Deposit service package', quantity: 1, unitPrice: 12000, amount: 12000, taxCategory: 'Taxable' },
      { description: 'FX service spread', quantity: 1, unitPrice: 7800, amount: 7800, taxCategory: 'Taxable' },
      { description: 'Premium treasury support', quantity: 1, unitPrice: 4200, amount: 4200, taxCategory: 'Taxable' },
    ],
  }),
  createInvoiceRecord({
    id: 'INV-2026-1005',
    invoiceNumber: 'AU-2026-08005',
    billingRunId: 'BR-AU-2026-08-001',
    billingRunReference: 'BR-AU-2026-08-001',
    clientName: 'Southern Cross Capital',
    invoiceFormat: 'PDF',
    issueDate: '2026-08-08',
    status: 'CANCELLED',
    billingPeriod: '2026-08',
    lineItems: [
      { description: 'Operating account package', quantity: 1, unitPrice: 9300, amount: 9300, taxCategory: 'Taxable' },
      { description: 'Liquidity management add-on', quantity: 1, unitPrice: 3200, amount: 3200, taxCategory: 'Taxable' },
      { description: 'Cross-border remittance processing', quantity: 1, unitPrice: 1800, amount: 1800, taxCategory: 'Taxable' },
    ],
  }),
];

export const summarizeInvoices = (invoices: InvoiceRecord[]): InvoiceSummary => ({
  totalInvoices: invoices.length,
  draftInvoices: invoices.filter((item) => item.status === 'DRAFT').length,
  issuedInvoices: invoices.filter((item) => item.status === 'ISSUED').length,
  sentInvoices: invoices.filter((item) => item.status === 'SENT').length,
  correctedInvoices: invoices.filter((item) => item.status === 'CORRECTED' || item.isCorrection).length,
  cancelledInvoices: invoices.filter((item) => item.status === 'CANCELLED').length,
  totalBilledAmount: roundAmount(
    invoices.reduce((total, item) => total + item.totalAmount, 0),
  ),
});

export const filterInvoices = (invoices: InvoiceRecord[], filters: InvoiceFilters): InvoiceRecord[] =>
  invoices.filter((item) => {
    if (filters.market && filters.market !== 'All' && item.market !== filters.market) {
      return false;
    }

    if (filters.clientName && !item.clientName.toLowerCase().includes(filters.clientName.toLowerCase())) {
      return false;
    }

    if (filters.billingPeriod && item.billingPeriod !== filters.billingPeriod) {
      return false;
    }

    if (filters.status && filters.status !== 'All' && item.status !== filters.status) {
      return false;
    }

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      const searchable = [
        item.id,
        item.invoiceNumber,
        item.billingRunId,
        item.billingRunReference,
        item.clientName,
        item.market,
        item.taxRuleId,
      ]
        .join(' ')
        .toLowerCase();

      if (!searchable.includes(keyword)) {
        return false;
      }
    }

    return true;
  });

export const getBillingRunProfile = (billingRunId: string) => marketByBillingRunId[billingRunId];

export const getInvoiceDownloadName = (invoice: InvoiceRecord) =>
  `${invoice.invoiceNumber}-${invoice.issueDate}.html`;

export const buildInvoiceTemplate = (invoice: InvoiceRecord) => {
  const profile = getBillingRunProfile(invoice.billingRunId);
  const lineItems = invoice.lineItems
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.description)}</td>
          <td class="right">${item.quantity}</td>
          <td class="right">${formatAmount(item.unitPrice, invoice.currency)}</td>
          <td class="right">${formatAmount(item.amount, invoice.currency)}</td>
          <td>${escapeHtml(item.taxCategory)}</td>
        </tr>`,
    )
    .join('');

  const originalInvoiceBlock = invoice.originalInvoiceId
    ? `<div class="meta-pill danger">Original invoice: ${escapeHtml(invoice.originalInvoiceId)}</div>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(invoice.invoiceNumber)}</title>
  <style>
    :root {
      color-scheme: light;
      --brand: #0f4c81;
      --brand-2: #1f7a8c;
      --ink: #1f2937;
      --muted: #5b6575;
      --line: #d9e2ec;
      --paper: #ffffff;
      --soft: #f5f8fb;
      --warn: #faad14;
      --danger: #d4380d;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px;
      font-family: Inter, 'Segoe UI', Arial, sans-serif;
      background: linear-gradient(180deg, #f5f8fb 0%, #ffffff 100%);
      color: var(--ink);
    }
    .page {
      max-width: 1080px;
      margin: 0 auto;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 20px;
      box-shadow: 0 24px 70px rgba(15, 76, 129, 0.08);
      overflow: hidden;
    }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      padding: 28px 32px;
      background: linear-gradient(135deg, #0f4c81 0%, #1f7a8c 100%);
      color: white;
    }
    .brand {
      max-width: 60%;
    }
    .brand h1 {
      margin: 0;
      font-size: 28px;
      letter-spacing: 0.04em;
    }
    .brand p {
      margin: 10px 0 0;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.86);
    }
    .document-id {
      min-width: 280px;
      padding: 18px 20px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.18);
      display: grid;
      gap: 10px;
      align-content: start;
    }
    .document-id strong {
      font-size: 20px;
    }
    .meta-grid, .summary-grid {
      display: grid;
      gap: 16px;
      padding: 28px 32px 0;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .card {
      background: var(--soft);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 18px;
    }
    .card h3 {
      margin: 0 0 10px;
      font-size: 14px;
      color: var(--brand);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .card p {
      margin: 4px 0;
      color: var(--muted);
      line-height: 1.6;
    }
    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .meta-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 999px;
      background: #e8f2ff;
      color: var(--brand);
      font-size: 12px;
      font-weight: 600;
    }
    .meta-pill.warn { background: #fff7e6; color: #ad6800; }
    .meta-pill.danger { background: #fff1f0; color: var(--danger); }
    .section {
      padding: 28px 32px 0;
    }
    .section h2 {
      margin: 0 0 14px;
      font-size: 18px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      overflow: hidden;
      border-radius: 16px;
      border: 1px solid var(--line);
    }
    thead th {
      background: #f1f5f9;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #475569;
      padding: 14px 12px;
      text-align: left;
    }
    tbody td {
      border-top: 1px solid var(--line);
      padding: 14px 12px;
      vertical-align: top;
      color: var(--ink);
    }
    tbody tr:nth-child(even) td { background: #fbfdff; }
    .right { text-align: right; }
    .summary {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .summary-item {
      padding: 18px;
      border-radius: 16px;
      background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
      border: 1px solid var(--line);
    }
    .summary-item .label {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .summary-item .value {
      display: block;
      margin-top: 8px;
      font-size: 22px;
      font-weight: 700;
      color: var(--brand);
    }
    .footer {
      padding: 24px 32px 32px;
      color: var(--muted);
      line-height: 1.65;
    }
    .trace-grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .small {
      font-size: 12px;
      color: var(--muted);
    }
    @media print {
      body { padding: 0; background: #fff; }
      .page { border: 0; border-radius: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <section class="header">
      <div class="brand">
        <h1>Wholesale Banking Invoice</h1>
        <p>Tax-aware invoice generated from billing run outputs and jurisdiction-specific tax rules. This print-ready template is suitable for management demo and client-facing review.</p>
      </div>
      <div class="document-id">
        <strong>${escapeHtml(invoice.invoiceNumber)}</strong>
        <div>Market: ${escapeHtml(invoice.market)}</div>
        <div>Billing Period: ${escapeHtml(invoice.billingPeriod)}</div>
        <div>Status: ${escapeHtml(invoice.status)}</div>
      </div>
    </section>

    <section class="meta-grid">
      <div class="card">
        <h3>Invoice Header</h3>
        <p>Client: ${escapeHtml(invoice.clientName)}</p>
        <p>Invoice Format: ${escapeHtml(invoice.invoiceFormat)}</p>
        <p>Issue Date: ${escapeHtml(invoice.issueDate)}</p>
        <p>Due Date: ${escapeHtml(invoice.dueDate)}</p>
        ${originalInvoiceBlock}
      </div>
      <div class="card">
        <h3>Billing Run Reference</h3>
        <p>${escapeHtml(invoice.billingRunReference)}</p>
        <p>${escapeHtml(invoice.billingRunId)}</p>
        <p class="small">Generated from billing run results before invoice issuance.</p>
      </div>
      <div class="card">
        <h3>Tax Rule Applied</h3>
        <p>${escapeHtml(invoice.taxRuleId)}</p>
        <p>${escapeHtml(invoice.taxType)} - ${invoice.taxRate}%</p>
        <p>${escapeHtml(invoice.taxAuthority)}</p>
      </div>
      <div class="card">
        <h3>Jurisdiction Format</h3>
        <p>${profile ? escapeHtml(profile.formatNotes) : 'Standard invoice format.'}</p>
      </div>
    </section>

    <section class="section">
      <h2>Invoice Line Items</h2>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="right">Qty</th>
            <th class="right">Unit Price</th>
            <th class="right">Amount</th>
            <th>Tax Category</th>
          </tr>
        </thead>
        <tbody>
          ${lineItems}
        </tbody>
      </table>
    </section>

    <section class="summary-grid">
      <div class="summary-item">
        <span class="label">Sub Total</span>
        <span class="value">${formatAmount(invoice.subTotal, invoice.currency)}</span>
      </div>
      <div class="summary-item">
        <span class="label">Tax Amount</span>
        <span class="value">${formatAmount(invoice.taxAmount, invoice.currency)}</span>
      </div>
      <div class="summary-item">
        <span class="label">Total Due</span>
        <span class="value">${formatAmount(invoice.totalAmount, invoice.currency)}</span>
      </div>
      <div class="summary-item">
        <span class="label">Tax Rate</span>
        <span class="value">${invoice.taxRate}%</span>
      </div>
    </section>

    <section class="section">
      <h2>Tax Determination Preview</h2>
      <div class="trace-grid">
        <div class="card">
          <h3>Tax Rule ID</h3>
          <p>${escapeHtml(invoice.taxRuleId)}</p>
          <h3>Tax Treatment</h3>
          <p>${escapeHtml(invoice.taxTreatment)}</p>
        </div>
        <div class="card">
          <h3>Tax Authority</h3>
          <p>${escapeHtml(invoice.taxAuthority)}</p>
          <h3>Calculation Basis</h3>
          <p>${escapeHtml(invoice.taxCalculationBasis)}</p>
        </div>
      </div>
    </section>

    <section class="footer">
      <strong>Compliance note:</strong> This template is generated from pricing and billing outputs and is intended for demonstration of invoice lifecycle controls, traceability, and jurisdiction-specific format behavior. Tax values should always be confirmed against the active tax configuration before external issuance.
    </section>
  </div>
</body>
</html>`;
};

export const buildBulkReportHtml = (invoices: InvoiceRecord[]) => {
  const rows = invoices
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.invoiceNumber)}</td>
          <td>${escapeHtml(item.clientName)}</td>
          <td>${escapeHtml(item.market)}</td>
          <td>${escapeHtml(item.billingPeriod)}</td>
          <td class="right">${formatAmount(item.totalAmount, item.currency)}</td>
          <td>${escapeHtml(item.taxType)}</td>
          <td>${escapeHtml(item.status)}</td>
        </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice Batch Report</title>
  <style>
    body {
      font-family: Inter, 'Segoe UI', Arial, sans-serif;
      margin: 0;
      padding: 32px;
      background: #f5f8fb;
      color: #1f2937;
    }
    .sheet {
      max-width: 1200px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #d9e2ec;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 18px 50px rgba(15, 76, 129, 0.08);
    }
    .hero {
      padding: 28px 32px;
      background: linear-gradient(135deg, #0f4c81 0%, #1f7a8c 100%);
      color: white;
    }
    .hero h1 { margin: 0; font-size: 28px; }
    .hero p { margin: 8px 0 0; color: rgba(255,255,255,.85); line-height: 1.6; }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      padding: 24px 32px 0;
    }
    .metric {
      padding: 16px;
      border: 1px solid #d9e2ec;
      border-radius: 14px;
      background: #f8fbff;
    }
    .metric .label { display: block; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
    .metric .value { display: block; margin-top: 8px; font-size: 22px; font-weight: 700; color: #0f4c81; }
    table {
      width: calc(100% - 64px);
      margin: 24px 32px 32px;
      border-collapse: collapse;
    }
    th, td { padding: 12px; border-bottom: 1px solid #d9e2ec; text-align: left; }
    th { background: #f1f5f9; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
    .right { text-align: right; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="hero">
      <h1>Invoice Batch Report</h1>
      <p>Batch download view for finance operations and management review. This report is generated from mock invoice data and preserves the invoice lifecycle and tax traceability context.</p>
    </div>
    <div class="summary">
      <div class="metric"><span class="label">Invoices</span><span class="value">${invoices.length}</span></div>
      <div class="metric"><span class="label">Billed Amount</span><span class="value">${formatAmount(invoices.reduce((total, item) => total + item.totalAmount, 0), invoices[0]?.currency ?? 'SGD')}</span></div>
      <div class="metric"><span class="label">Issued</span><span class="value">${invoices.filter((item) => item.status === 'ISSUED').length}</span></div>
      <div class="metric"><span class="label">Corrected</span><span class="value">${invoices.filter((item) => item.status === 'CORRECTED' || item.isCorrection).length}</span></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Invoice Number</th>
          <th>Client</th>
          <th>Market</th>
          <th>Billing Period</th>
          <th class="right">Total Due</th>
          <th>Tax Type</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
</body>
</html>`;
};

const addDays = (dateValue: string, days: number) => {
  const date = new Date(`${dateValue}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};
