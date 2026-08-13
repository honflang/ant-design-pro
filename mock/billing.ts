import type { Request, Response } from 'express';
import {
  BILLING_RUNS,
  buildBulkReportHtml,
  buildInvoiceTemplate,
  createInitialInvoices,
  createInvoiceRecord,
  filterInvoices,
  getBillingRunProfile,
  getInvoiceDownloadName,
  summarizeInvoices,
  type InvoiceFilters,
  type InvoiceListResponse,
  type InvoiceRecord,
} from '../src/pages/pricing-billing/billing/invoice/data';

let invoices: InvoiceRecord[] = createInitialInvoices();
let invoiceSequence = 1006;

const nextInvoiceId = () => `INV-2026-${invoiceSequence++}`;

const nextInvoiceNumber = (market: string) => {
  const marketPrefix =
    {
      Singapore: 'SG',
      China: 'CN',
      Japan: 'JP',
      'Hong Kong': 'HK',
      Australia: 'AU',
    }[market] ?? 'IV';

  return `${marketPrefix}-2026-${String(invoiceSequence).padStart(5, '0')}`;
};

const getInvoiceListResponse = (filters: InvoiceFilters): InvoiceListResponse => {
  const filtered = filterInvoices(invoices, filters);
  return {
    success: true,
    data: filtered,
    total: filtered.length,
    summary: summarizeInvoices(invoices),
  };
};

const getInvoiceById = (id: string) => invoices.find((item) => item.id === id);

const updateInvoice = (id: string, updater: (record: InvoiceRecord) => InvoiceRecord) => {
  invoices = invoices.map((item) => (item.id === id ? updater(item) : item));
  return getInvoiceById(id);
};

const createInvoice = (record: InvoiceRecord) => {
  invoices = [record, ...invoices];
  return record;
};

const handleList = (req: Request, res: Response) => {
  const filters: InvoiceFilters = {
    market: (req.query.market as string) || undefined,
    clientName: (req.query.clientName as string) || undefined,
    billingPeriod: (req.query.billingPeriod as string) || undefined,
    status: (req.query.status as string) || undefined,
    keyword: (req.query.keyword as string) || undefined,
  };

  res.status(200).json(getInvoiceListResponse(filters));
};

const handleGetById = (req: Request, res: Response) => {
  const invoice = getInvoiceById(String(req.params.id));

  if (!invoice) {
    res.status(404).json({ success: false, message: 'Invoice not found' });
    return;
  }

  res.status(200).json({ success: true, data: invoice });
};

const handleCreate = (req: Request, res: Response) => {
  const billingRunId = req.body?.billingRunId as string;
  const billingRun = getBillingRunProfile(billingRunId) ?? BILLING_RUNS[0];
  const clientName = (req.body?.clientName as string) || 'Mock Client';
  const invoiceFormat = (req.body?.invoiceFormat as InvoiceRecord['invoiceFormat']) || 'PDF';
  const issueDate = (req.body?.issueDate as string) || new Date().toISOString().slice(0, 10);
  const record = createInvoiceRecord({
    id: nextInvoiceId(),
    invoiceNumber: nextInvoiceNumber(billingRun.market),
    billingRunId: billingRun.id,
    billingRunReference: billingRun.id,
    clientName,
    invoiceFormat,
    issueDate,
    status: 'DRAFT',
    billingPeriod: billingRun.billingPeriod,
  });

  createInvoice(record);
  res.status(201).json({ success: true, data: record });
};

const handleIssue = (req: Request, res: Response) => {
  const invoice = updateInvoice(String(req.params.id), (record) => ({
    ...record,
    status: 'ISSUED',
  }));

  if (!invoice) {
    res.status(404).json({ success: false, message: 'Invoice not found' });
    return;
  }

  res.status(200).json({ success: true, data: invoice });
};

const handleSend = (req: Request, res: Response) => {
  const invoice = updateInvoice(String(req.params.id), (record) => ({
    ...record,
    status: 'SENT',
    sendDate: new Date().toISOString().slice(0, 10),
    sendChannel: record.sendChannel ?? 'Secure client portal',
  }));

  if (!invoice) {
    res.status(404).json({ success: false, message: 'Invoice not found' });
    return;
  }

  res.status(200).json({ success: true, data: invoice });
};

const handleCorrect = (req: Request, res: Response) => {
  const invoice = getInvoiceById(String(req.params.id));

  if (!invoice) {
    res.status(404).json({ success: false, message: 'Invoice not found' });
    return;
  }

  const reason = (req.body?.reason as string) || 'Correction requested';
  const adjustedLineItems = Array.isArray(req.body?.adjustedLineItems) ? req.body.adjustedLineItems : undefined;
  const correctedRecord = createInvoiceRecord({
    id: nextInvoiceId(),
    invoiceNumber: `${invoice.invoiceNumber}-C`,
    billingRunId: invoice.billingRunId,
    billingRunReference: invoice.billingRunReference,
    clientName: invoice.clientName,
    invoiceFormat: invoice.invoiceFormat,
    issueDate: new Date().toISOString().slice(0, 10),
    status: 'CORRECTED',
    isCorrection: true,
    originalInvoiceId: invoice.id,
    correctionReason: reason,
    billingPeriod: invoice.billingPeriod,
    lineItems: adjustedLineItems?.length ? adjustedLineItems : invoice.lineItems,
  });

  invoices = invoices.map((item) =>
    item.id === invoice.id ? { ...item, status: 'CORRECTED' } : item,
  );
  createInvoice(correctedRecord);
  res.status(201).json({ success: true, data: correctedRecord });
};

const handleDownload = (req: Request, res: Response) => {
  const invoice = getInvoiceById(String(req.params.id));

  if (!invoice) {
    res.status(404).json({ success: false, message: 'Invoice not found' });
    return;
  }

  res.status(200).send(buildInvoiceTemplate(invoice));
};

const handleBulkDownload = (_req: Request, res: Response) => {
  res.status(200).send(buildBulkReportHtml(invoices));
};

export default {
  'GET /api/billing/invoices': handleList,
  'GET /api/billing/invoices/:id': handleGetById,
  'POST /api/billing/invoices': handleCreate,
  'POST /api/billing/invoices/:id/issue': handleIssue,
  'POST /api/billing/invoices/:id/send': handleSend,
  'POST /api/billing/invoices/:id/correct': handleCorrect,
  'GET /api/billing/invoices/:id/download': handleDownload,
  'GET /api/billing/invoices/download/bulk': handleBulkDownload,
};
