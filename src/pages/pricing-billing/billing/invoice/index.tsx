import {
  BellOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  MoreOutlined,
  PlusOutlined,
  SendOutlined,
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
  Badge,
  Button,
  Col,
  Drawer,
  Dropdown,
  Input,
  Modal,
  Row,
  Space,
  Select,
  Table,
  Tag,
  Typography,
} from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import {
  BILLING_RUNS,
  buildBulkReportHtml,
  buildInvoiceTemplate,
  getBillingRunProfile,
  type InvoiceFilters,
  type InvoiceRecord,
  type InvoiceStatus,
  type InvoiceSummary,
} from './data';

const { Text } = Typography;

type InvoiceQuery = InvoiceFilters;

type InvoiceFormValues = {
  billingRunId: string;
  clientName: string;
  invoiceFormat: InvoiceRecord['invoiceFormat'];
  issueDate: string;
};

type CorrectionFormValues = {
  reason: string;
  adjustedLineItems?: string;
};

const statusColors: Record<InvoiceStatus, string> = {
  DRAFT: 'default',
  ISSUED: 'processing',
  SENT: 'success',
  CORRECTED: 'warning',
  CANCELLED: 'error',
  OVERDUE: 'red',
};

const marketOptions = ['All', 'Singapore', 'China', 'Japan', 'Hong Kong', 'Australia'];
const statusOptions = ['All', 'DRAFT', 'ISSUED', 'SENT', 'CORRECTED', 'CANCELLED', 'OVERDUE'];
const formatOptions = ['PDF', 'ISO20022', 'MT940', 'XLSX'];

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount);

const formatPercent = (rate: number) => `${rate.toFixed(rate % 1 === 0 ? 0 : 2)}%`;

const formatDate = (value?: string) => (value ? value.slice(0, 10) : '—');

const InvoiceDetails: React.FC<{ invoice: InvoiceRecord | null }> = ({ invoice }) => {
  const intl = useIntl();
  const t = (id: string, defaultMessage: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id, defaultMessage }, values);

  if (!invoice) {
    return null;
  }

  const template = buildInvoiceTemplate(invoice);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <ProDescriptions<InvoiceRecord>
        column={2}
        dataSource={invoice}
        columns={[
          { title: t('pages.billing.invoice.detail.invoiceNumber', 'Invoice Number'), dataIndex: 'invoiceNumber' },
          { title: t('pages.billing.invoice.detail.clientName', 'Client'), dataIndex: 'clientName' },
          { title: t('pages.billing.invoice.detail.market', 'Market'), dataIndex: 'market' },
          { title: t('pages.billing.invoice.detail.billingPeriod', 'Billing Period'), dataIndex: 'billingPeriod' },
          { title: t('pages.billing.invoice.detail.billingRunReference', 'Billing Run Reference'), dataIndex: 'billingRunReference' },
          { title: t('pages.billing.invoice.detail.invoiceFormat', 'Invoice Format'), dataIndex: 'invoiceFormat', render: (_, row) => <Tag color="blue">{row.invoiceFormat}</Tag> },
          { title: t('pages.billing.invoice.detail.status', 'Status'), dataIndex: 'status', render: (_, row) => <Tag color={statusColors[row.status]}>{row.status}</Tag> },
          { title: t('pages.billing.invoice.detail.issueDate', 'Issue Date'), dataIndex: 'issueDate' },
          { title: t('pages.billing.invoice.detail.dueDate', 'Due Date'), dataIndex: 'dueDate' },
          { title: t('pages.billing.invoice.detail.taxRuleId', 'Tax Rule ID'), dataIndex: 'taxRuleId' },
          { title: t('pages.billing.invoice.detail.taxType', 'Tax Type'), dataIndex: 'taxType' },
          { title: t('pages.billing.invoice.detail.taxRate', 'Tax Rate'), dataIndex: 'taxRate', render: (_, row) => formatPercent(row.taxRate) },
          { title: t('pages.billing.invoice.detail.taxAmount', 'Tax Amount'), dataIndex: 'taxAmount', render: (_, row) => formatMoney(row.taxAmount, row.currency) },
          { title: t('pages.billing.invoice.detail.totalAmount', 'Total Amount'), dataIndex: 'totalAmount', render: (_, row) => formatMoney(row.totalAmount, row.currency) },
          { title: t('pages.billing.invoice.detail.taxAuthority', 'Tax Authority'), dataIndex: 'taxAuthority', span: 2 },
          { title: t('pages.billing.invoice.detail.taxTreatment', 'Tax Treatment'), dataIndex: 'taxTreatment' },
          { title: t('pages.billing.invoice.detail.taxCalculationBasis', 'Tax Calculation Basis'), dataIndex: 'taxCalculationBasis', span: 2 },
          { title: t('pages.billing.invoice.detail.originalInvoiceId', 'Original Invoice'), dataIndex: 'originalInvoiceId', render: (_, row) => row.originalInvoiceId ?? '—' },
          { title: t('pages.billing.invoice.detail.correctionReason', 'Correction Reason'), dataIndex: 'correctionReason', span: 2, render: (_, row) => row.correctionReason ?? '—' },
        ]}
      />

      <ProCard title={t('pages.billing.invoice.detail.lineItems', 'Invoice Line Items')} size="small">
        <Table
          size="small"
          rowKey={(record) => record.description}
          pagination={false}
          dataSource={invoice.lineItems}
          columns={[
            { title: t('pages.billing.invoice.line.description', 'Description'), dataIndex: 'description' },
            { title: t('pages.billing.invoice.line.quantity', 'Qty'), dataIndex: 'quantity', align: 'right' },
            { title: t('pages.billing.invoice.line.unitPrice', 'Unit Price'), dataIndex: 'unitPrice', align: 'right', render: (_, row) => formatMoney(row.unitPrice, invoice.currency) },
            { title: t('pages.billing.invoice.line.amount', 'Amount'), dataIndex: 'amount', align: 'right', render: (_, row) => formatMoney(row.amount, invoice.currency) },
            { title: t('pages.billing.invoice.line.taxCategory', 'Tax Category'), dataIndex: 'taxCategory' },
          ]}
        />
      </ProCard>

      <ProCard title={t('pages.billing.invoice.detail.summary', 'Sub Total / Tax / Total Due')} size="small">
        <Row gutter={16}>
          <Col span={8}>
            <StatisticCard statistic={{ title: t('pages.billing.invoice.detail.subtotal', 'Sub Total'), value: formatMoney(invoice.subTotal, invoice.currency) }} />
          </Col>
          <Col span={8}>
            <StatisticCard statistic={{ title: t('pages.billing.invoice.detail.taxAmount', 'Tax Amount'), value: formatMoney(invoice.taxAmount, invoice.currency) }} />
          </Col>
          <Col span={8}>
            <StatisticCard statistic={{ title: t('pages.billing.invoice.detail.totalDue', 'Total Due'), value: formatMoney(invoice.totalAmount, invoice.currency) }} />
          </Col>
        </Row>
      </ProCard>

      <ProCard title={t('pages.billing.invoice.detail.taxPreview', 'Tax Determination Preview')} size="small">
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 0 }}>
              <Text strong>{t('pages.billing.invoice.detail.taxRuleId', 'Tax Rule ID')}:</Text> {invoice.taxRuleId}
            </div>
            <div style={{ marginBottom: 0 }}>
              <Text strong>{t('pages.billing.invoice.detail.taxTreatment', 'Tax Treatment')}:</Text> {invoice.taxTreatment}
            </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 0 }}>
              <Text strong>{t('pages.billing.invoice.detail.taxAuthority', 'Tax Authority')}:</Text> {invoice.taxAuthority}
            </div>
            <div style={{ marginBottom: 0 }}>
              <Text strong>{t('pages.billing.invoice.detail.taxCalculationBasis', 'Tax Calculation Basis')}:</Text> {invoice.taxCalculationBasis}
            </div>
          </Col>
        </Row>
      </ProCard>

    </Space>
  );
};

const InvoicePage: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const intl = useIntl();
  const { message } = App.useApp();
  const [detailOpen, setDetailOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [correctOpen, setCorrectOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [list, setList] = useState<InvoiceRecord[]>([]);
  const [summary, setSummary] = useState<InvoiceSummary>({
    totalInvoices: 0,
    draftInvoices: 0,
    issuedInvoices: 0,
    sentInvoices: 0,
    correctedInvoices: 0,
    cancelledInvoices: 0,
    totalBilledAmount: 0,
  });
  const [pageInfo, setPageInfo] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState<InvoiceQuery>({ market: 'All', status: 'All' });
  const [generateForm] = ProForm.useForm<InvoiceFormValues>();
  const [correctForm] = ProForm.useForm<CorrectionFormValues>();

  const t = (id: string, defaultMessage: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id, defaultMessage }, values);

  const downloadHtml = (name: string, html: string) => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fetchInvoices = async (params: InvoiceQuery & { current?: number; pageSize?: number }) => {
    const response = await request<{ success: boolean; data: InvoiceRecord[]; total: number; summary: InvoiceSummary }>('/api/billing/invoices', {
      params,
    });

    setSummary(response.summary);
    setPageInfo((state) => ({
      current: params.current ?? state.current,
      pageSize: params.pageSize ?? state.pageSize,
      total: response.total,
    }));
    return {
      data: response.data,
      success: true,
      total: response.total,
    };
  };

  const refresh = () => actionRef.current?.reload();

  const issueInvoice = async (invoice: InvoiceRecord) => {
    await request(`/api/billing/invoices/${invoice.id}/issue`, { method: 'POST' });
    message.success(t('pages.billing.invoice.msg.issued', 'Invoice issued'));
    refresh();
  };

  const sendInvoice = async (invoice: InvoiceRecord) => {
    await request(`/api/billing/invoices/${invoice.id}/send`, { method: 'POST' });
    message.success(t('pages.billing.invoice.msg.sent', 'Invoice sent'));
    refresh();
  };

  const correctInvoice = async () => {
    if (!selectedInvoice) {
      return;
    }

    const values = await correctForm.validateFields();
    const adjustedLineItems = values.adjustedLineItems
      ? values.adjustedLineItems
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item, index) => ({ description: item, quantity: 1, unitPrice: 0, amount: 0, taxCategory: index === 0 ? 'Adjusted' : 'Adjusted' }))
      : undefined;

    await request(`/api/billing/invoices/${selectedInvoice.id}/correct`, {
      method: 'POST',
      data: {
        reason: values.reason,
        adjustedLineItems,
      },
    });

    message.success(t('pages.billing.invoice.msg.corrected', 'Invoice corrected: {reason}', { reason: values.reason }));
    setCorrectOpen(false);
    refresh();
  };

  const generateInvoice = async () => {
    const values = await generateForm.validateFields();
    const issueDateValue = values.issueDate as unknown as { format?: (formatString: string) => string };
    const issueDate = typeof values.issueDate === 'string' ? values.issueDate : issueDateValue.format?.('YYYY-MM-DD') ?? String(values.issueDate);
    await request('/api/billing/invoices', {
      method: 'POST',
      data: {
        ...values,
        issueDate,
      },
    });
    message.success(t('pages.billing.invoice.msg.generated', 'Invoice generated'));
    setGenerateOpen(false);
    generateForm.resetFields();
    refresh();
  };

  const handleDownload = async (invoice: InvoiceRecord) => {
    const html = buildInvoiceTemplate(invoice);
    downloadHtml(`${invoice.invoiceNumber}-${invoice.issueDate}.html`, html);
    message.success(t('pages.billing.invoice.msg.downloaded', 'Invoice file downloaded'));
  };

  const handleBulkDownload = () => {
    const html = buildBulkReportHtml(list);
    downloadHtml('invoice-batch-report.html', html);
    message.success(t('pages.billing.invoice.msg.bulkDownloaded', 'Bulk file downloaded'));
  };

  const columns: ProColumns<InvoiceRecord>[] = [
    {
      title: t('pages.billing.invoice.col.invoiceNo', 'Invoice Number'),
      dataIndex: 'invoiceNumber',
      width: 160,
    },
    {
      title: t('pages.billing.invoice.col.client', 'Client'),
      dataIndex: 'clientName',
      width: 220,
    },
    {
      title: t('pages.billing.invoice.col.market', 'Market'),
      dataIndex: 'market',
      width: 120,
      filters: true,
      valueType: 'select',
      valueEnum: Object.fromEntries(marketOptions.filter((item) => item !== 'All').map((item) => [item, { text: item }])),
    },
    {
      title: t('pages.billing.invoice.col.period', 'Billing Period'),
      dataIndex: 'billingPeriod',
      width: 120,
    },
    {
      title: t('pages.billing.invoice.col.subtotal', 'Sub Total'),
      dataIndex: 'subTotal',
      width: 140,
      align: 'right',
      render: (_, record) => formatMoney(record.subTotal, record.currency),
    },
    {
      title: t('pages.billing.invoice.col.taxType', 'Tax Type'),
      dataIndex: 'taxType',
      width: 140,
    },
    {
      title: t('pages.billing.invoice.col.taxRate', 'Tax Rate'),
      dataIndex: 'taxRate',
      width: 110,
      render: (_, record) => formatPercent(record.taxRate),
    },
    {
      title: t('pages.billing.invoice.col.taxAmount', 'Tax Amount'),
      dataIndex: 'taxAmount',
      width: 140,
      align: 'right',
      render: (_, record) => formatMoney(record.taxAmount, record.currency),
    },
    {
      title: t('pages.billing.invoice.col.totalAmount', 'Total Amount'),
      dataIndex: 'totalAmount',
      width: 150,
      align: 'right',
      render: (_, record) => formatMoney(record.totalAmount, record.currency),
    },
    {
      title: t('pages.billing.invoice.col.format', 'Invoice Format'),
      dataIndex: 'invoiceFormat',
      width: 140,
      render: (_, record) => <Tag color="blue">{record.invoiceFormat}</Tag>,
    },
    {
      title: t('pages.billing.invoice.col.status', 'Status'),
      dataIndex: 'status',
      width: 120,
      render: (_, record) => <Badge status={statusColors[record.status] as any} text={record.status} />,
    },
    {
      title: t('pages.billing.invoice.col.issueDate', 'Issue Date'),
      dataIndex: 'issueDate',
      width: 120,
    },
    {
      title: t('pages.billing.invoice.col.dueDate', 'Due Date'),
      dataIndex: 'dueDate',
      width: 120,
    },
    {
      title: t('pages.billing.invoice.col.actions', 'Actions'),
      valueType: 'option',
      width: 240,
      render: (_, record) => [
        <Button
          key="view"
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedInvoice(record);
            setDetailOpen(true);
          }}
        >
          {t('pages.billing.invoice.action.view', 'View')}
        </Button>,
        <Button
          key="issue"
          type="link"
          size="small"
          icon={<CheckCircleOutlined />}
          disabled={record.status !== 'DRAFT'}
          onClick={() => issueInvoice(record)}
        >
          {t('pages.billing.invoice.action.issue', 'Issue')}
        </Button>,
        <Button
          key="correct"
          type="link"
          size="small"
          disabled={record.status === 'CANCELLED'}
          onClick={() => {
            setSelectedInvoice(record);
            correctForm.resetFields();
            setCorrectOpen(true);
          }}
        >
          {t('pages.billing.invoice.action.correct', 'Correct')}
        </Button>,
        <Dropdown
          key="more"
          menu={{
            items: [
              {
                key: 'download',
                label: t('pages.billing.invoice.action.download', 'Download'),
                icon: <DownloadOutlined />,
                onClick: () => handleDownload(record),
              },
              {
                key: 'send',
                label: t('pages.billing.invoice.action.send', 'Send'),
                icon: <SendOutlined />,
                onClick: () => sendInvoice(record),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>,
      ],
    },
  ];

  const transformedSummary = useMemo(
    () => [
      { title: t('pages.billing.invoice.stat.total', 'Total Invoices'), value: summary.totalInvoices },
      { title: t('pages.billing.invoice.stat.draft', 'Draft Invoices'), value: summary.draftInvoices },
      { title: t('pages.billing.invoice.stat.issued', 'Issued Invoices'), value: summary.issuedInvoices },
      { title: t('pages.billing.invoice.stat.corrected', 'Corrected Invoices'), value: summary.correctedInvoices },
      {
        title: t('pages.billing.invoice.stat.totalBilled', 'Total Billed Amount'),
        value: formatMoney(summary.totalBilledAmount, 'SGD'),
      },
    ],
    [summary, intl],
  );

  return (
    <PageContainer
      title={t('pages.billing.invoice.title', 'Invoice Management')}
      subTitle={t('pages.billing.invoice.subtitle', 'Generate and manage compliant invoices across markets')}
      extra={[
        <Button key="generate" type="primary" icon={<PlusOutlined />} onClick={() => setGenerateOpen(true)}>
          {t('pages.billing.invoice.action.generate', 'Generate Invoice')}
        </Button>,
        <Button key="bulk" icon={<DownloadOutlined />} onClick={handleBulkDownload}>
          {t('pages.billing.invoice.action.bulkDownload', 'Bulk Download')}
        </Button>,
      ]}
    >
      <ProCard style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          {transformedSummary.map((item) => (
            <Col xs={12} md={8} xl={4} key={item.title}>
              <StatisticCard statistic={{ title: item.title, value: item.value }} />
            </Col>
          ))}
        </Row>
      </ProCard>

      <ProCard style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12 }}>
            <Input
              allowClear
              placeholder={t('pages.billing.invoice.filter.keyword', 'Keyword')}
              style={{ width: 220 }}
              onChange={(event) => {
                const keyword = event.target.value;
                setFilters((state) => ({ ...state, keyword }));
                actionRef.current?.reload();
              }}
            />
            <Input
              allowClear
              placeholder={t('pages.billing.invoice.filter.client', 'Client')}
              style={{ width: 220 }}
              onChange={(event) => {
                const clientName = event.target.value;
                setFilters((state) => ({ ...state, clientName }));
                actionRef.current?.reload();
              }}
            />
            <Select
              value={filters.market ?? 'All'}
              placeholder={t('pages.billing.invoice.filter.market', 'Market')}
              style={{ width: 220 }}
              options={marketOptions.map((item) => ({ label: item, value: item }))}
              onChange={(value) => {
                setFilters((state) => ({ ...state, market: value }));
                actionRef.current?.reload();
              }}
            />
            <Select
              value={filters.status ?? 'All'}
              placeholder={t('pages.billing.invoice.filter.status', 'Status')}
              style={{ width: 220 }}
              options={statusOptions.map((item) => ({ label: item, value: item }))}
              onChange={(value) => {
                setFilters((state) => ({ ...state, status: value }));
                actionRef.current?.reload();
              }}
            />
            <Select
              value={filters.billingPeriod}
              placeholder={t('pages.billing.invoice.filter.period', 'Period')}
              style={{ width: 220 }}
              options={['2026-08', '2026-07', '2026-06'].map((item) => ({ label: item, value: item }))}
              onChange={(value) => {
                setFilters((state) => ({ ...state, billingPeriod: value }));
                actionRef.current?.reload();
              }}
              allowClear
            />
          </div>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => {
              if (selectedInvoice) {
                downloadHtml(`${selectedInvoice.invoiceNumber}-template.html`, buildInvoiceTemplate(selectedInvoice));
              }
            }}
            disabled={!selectedInvoice}
          >
            {t('pages.billing.invoice.action.templateDownload', 'Download Template')}
          </Button>
        </div>
      </ProCard>

      <ProCard>
        <ProTable<InvoiceRecord, InvoiceQuery>
          actionRef={actionRef}
          rowKey="id"
          columns={columns}
          request={async (params) =>
            fetchInvoices({
              market: filters.market,
              clientName: filters.clientName,
              billingPeriod: filters.billingPeriod,
              status: filters.status,
              keyword: filters.keyword,
              current: params.current,
              pageSize: params.pageSize,
            })
          }
          search={false}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            current: pageInfo.current,
            pageSizeOptions: ['10', '20', '50'],
            total: pageInfo.total,
          }}
          toolBarRender={false}
          options={false}
        />
      </ProCard>

      <Drawer
        open={detailOpen}
        width={860}
        onClose={() => setDetailOpen(false)}
        title={
          <Space>
            <FileTextOutlined />
            {selectedInvoice?.invoiceNumber}
          </Space>
        }
        extra={
          <Space>
            <Button
              onClick={() => setPreviewOpen(true)}
              disabled={!selectedInvoice}
            >
              {t('pages.billing.invoice.action.preview', 'Preview')}
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => selectedInvoice && handleDownload(selectedInvoice)}
              disabled={!selectedInvoice}
            >
              {t('pages.billing.invoice.action.download', 'Download')}
            </Button>
          </Space>
        }
      >
        <InvoiceDetails invoice={selectedInvoice} />
      </Drawer>

      <Modal
        open={previewOpen}
        width={1200}
        title={t('pages.billing.invoice.preview.title', 'Invoice Preview')}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        destroyOnClose
        styles={{ body: { padding: 0 } }}
      >
        {selectedInvoice ? (
          <iframe
            title={t('pages.billing.invoice.preview.title', 'Invoice Preview')}
            srcDoc={buildInvoiceTemplate(selectedInvoice)}
            style={{ width: '100%', height: '82vh', border: 0, display: 'block' }}
          />
        ) : null}
      </Modal>

      <Modal
        open={generateOpen}
        title={t('pages.billing.invoice.modal.generateTitle', 'Generate Invoice')}
        onCancel={() => setGenerateOpen(false)}
        onOk={generateInvoice}
        destroyOnClose
      >
        <ProForm<InvoiceFormValues>
          form={generateForm}
          layout="vertical"
          submitter={false}
          initialValues={{
            billingRunId: BILLING_RUNS[0].id,
            clientName: 'Demo Client',
            invoiceFormat: 'PDF',
            issueDate: '2026-08-12',
          }}
        >
          <ProFormSelect
            name="billingRunId"
            label={t('pages.billing.invoice.modal.billingRun', 'Billing Run')}
            rules={[{ required: true }]}
            options={BILLING_RUNS.map((item) => ({ label: `${item.label} (${item.currency})`, value: item.id }))}
          />
          <ProFormText
            name="clientName"
            label={t('pages.billing.invoice.modal.client', 'Client')}
            rules={[{ required: true }]}
          />
          <ProFormSelect
            name="invoiceFormat"
            label={t('pages.billing.invoice.modal.format', 'Invoice Format')}
            rules={[{ required: true }]}
            options={formatOptions.map((item) => ({ label: item, value: item }))}
          />
          <ProFormDatePicker
            name="issueDate"
            label={t('pages.billing.invoice.modal.issueDate', 'Issue Date')}
            rules={[{ required: true }]}
            fieldProps={{ style: { width: '100%' } }}
          />
        </ProForm>
      </Modal>

      <Modal
        open={correctOpen}
        title={t('pages.billing.invoice.modal.correctTitle', 'Correct Invoice')}
        onCancel={() => setCorrectOpen(false)}
        onOk={correctInvoice}
        destroyOnClose
      >
        <ProForm<CorrectionFormValues> form={correctForm} layout="vertical" submitter={false}>
          <ProFormTextArea
            name="reason"
            label={t('pages.billing.invoice.modal.reason', 'Correction Reason')}
            rules={[{ required: true }]}
            fieldProps={{ rows: 3 }}
          />
          <ProFormTextArea
            name="adjustedLineItems"
            label={t('pages.billing.invoice.modal.adjustedLineItems', 'Adjusted Line Items (optional)')}
            fieldProps={{ rows: 4, placeholder: 'Line item adjustment notes, one per line' }}
          />
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default InvoicePage;
