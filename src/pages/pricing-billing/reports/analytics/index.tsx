import {
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  FundOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormSelect,
  ProList,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Badge, Button, Col, Drawer, Row, Space, Tag, Typography } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ReportInsightSummary,
  ReportOverview,
  ReportPreviewRow,
  ReportRecord,
  ReportRequest,
  ReportType,
} from './data';
import {
  CURRENCY_OPTIONS,
  FORMAT_OPTIONS,
  GROUP_BY_OPTIONS,
  MARKET_OPTIONS,
  PRODUCT_OPTIONS,
  REPORT_TYPE_LABEL,
  REPORT_TYPE_OPTIONS,
  SEGMENT_OPTIONS,
} from './data';
import {
  downloadReport,
  generateReport,
  queryReportHistory,
  queryReportOverview,
  queryReportPreview,
} from './service';

const { Text } = Typography;

const defaultRequest: ReportRequest = {
  reportType: 'REVENUE_SUMMARY',
  period: '2026-08',
  market: 'ALL',
  product: 'ALL',
  segment: 'ALL',
  groupBy: 'MARKET',
  currency: 'USD',
  format: 'EXCEL',
};

const quickReportConfig: Array<{
  reportType: ReportType;
  gradient: string;
}> = [
  { reportType: 'REVENUE_SUMMARY', gradient: 'linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)' },
  { reportType: 'PRICING_EXECUTION', gradient: 'linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%)' },
  { reportType: 'INVOICE_SUMMARY', gradient: 'linear-gradient(135deg, #f6ffed 0%, #fcffe6 100%)' },
  { reportType: 'DEAL_PERFORMANCE', gradient: 'linear-gradient(135deg, #fff1f0 0%, #fff7e6 100%)' },
  { reportType: 'TAX_REPORT', gradient: 'linear-gradient(135deg, #f9f0ff 0%, #f0f5ff 100%)' },
  { reportType: 'CAPACITY_PLANNING', gradient: 'linear-gradient(135deg, #e6fffb 0%, #f6ffed 100%)' },
];

const statusBadge: Record<string, 'success' | 'processing' | 'error' | 'default' | 'warning'> = {
  READY: 'success',
  RUNNING: 'processing',
  FAILED: 'error',
};

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount);

const downloadBlob = (name: string, mimeType: string, content: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};

const AnalyticsReportsPage: React.FC = () => {
  const intl = useIntl();
  const { message } = App.useApp();
  const previewActionRef = useRef<ActionType | undefined>(undefined);

  const [form] = ProForm.useForm<ReportRequest>();
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [history, setHistory] = useState<ReportRecord[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
  const [previewRows, setPreviewRows] = useState<ReportPreviewRow[]>([]);
  const [insights, setInsights] = useState<ReportInsightSummary | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const t = (id: string, defaultMessage: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id, defaultMessage }, values);

  const fetchOverview = async () => {
    const data = await queryReportOverview();
    setOverview(data);
  };

  const fetchHistory = async () => {
    const data = await queryReportHistory();
    setHistory(data);
  };

  const refreshAll = async () => {
    await Promise.all([fetchOverview(), fetchHistory()]);
  };

  const loadPreview = async (reportId: string) => {
    setPreviewLoading(true);
    try {
      const payload = await queryReportPreview(reportId);
      setSelectedReport(payload.report);
      setPreviewRows(payload.rows);
      setInsights(payload.insights);
      previewActionRef.current?.reload();
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerate = async (values: ReportRequest) => {
    const payload: ReportRequest = {
      ...defaultRequest,
      ...values,
    };

    const report = await generateReport(payload);
    message.success(
      t('pages.reports.analytics.msg.generated', 'Report generated: {id}', {
        id: report.id,
      }),
    );

    await refreshAll();
    await loadPreview(report.id);
  };

  const handleQuickGenerate = async (reportType: ReportType) => {
    const values = form.getFieldsValue();
    await handleGenerate({
      ...defaultRequest,
      ...values,
      reportType,
    });
  };

  const handleDownload = async (reportId: string) => {
    const result = await downloadReport(reportId);
    downloadBlob(result.fileName, result.mimeType, result.content);
    message.success(t('pages.reports.analytics.msg.downloaded', 'Report download started'));
    await fetchOverview();
  };

  const handlePreview = async (report: ReportRecord) => {
    await loadPreview(report.id);
    setDrawerOpen(true);
  };

  const initialLoad = async () => {
    await refreshAll();
    const currentHistory = await queryReportHistory();
    if (currentHistory.length > 0) {
      await loadPreview(currentHistory[0].id);
    }
  };

  useEffect(() => {
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewColumns: ProColumns<ReportPreviewRow>[] = [
    {
      title: t('pages.reports.analytics.preview.market', 'Market'),
      dataIndex: 'market',
      width: 90,
      fixed: 'left',
      render: (_, row) => <Tag color="blue">{row.market}</Tag>,
    },
    {
      title: t('pages.reports.analytics.preview.product', 'Product'),
      dataIndex: 'product',
      width: 150,
    },
    {
      title: t('pages.reports.analytics.preview.segment', 'Segment'),
      dataIndex: 'segment',
      width: 120,
      render: (_, row) => row.segment || '—',
    },
    {
      title: t('pages.reports.analytics.preview.clientCount', 'Client Count'),
      dataIndex: 'clientCount',
      width: 120,
      align: 'right',
      render: (_, row) => formatNumber(row.clientCount),
    },
    {
      title: t('pages.reports.analytics.preview.volume', 'Volume'),
      dataIndex: 'volume',
      width: 120,
      align: 'right',
      render: (_, row) => formatNumber(row.volume),
    },
    {
      title: t('pages.reports.analytics.preview.revenue', 'Revenue'),
      dataIndex: 'revenue',
      width: 140,
      align: 'right',
      render: (_, row) => formatMoney(row.revenue, row.currency),
    },
    {
      title: t('pages.reports.analytics.preview.currency', 'Currency'),
      dataIndex: 'currency',
      width: 100,
    },
    {
      title: t('pages.reports.analytics.preview.yoy', 'YoY Change'),
      dataIndex: 'yoyChange',
      width: 120,
      align: 'right',
      render: (_, row) => (
        <Text style={{ color: row.yoyChange >= 0 ? '#389e0d' : '#cf1322' }}>
          {row.yoyChange >= 0 ? '+' : ''}
          {row.yoyChange.toFixed(1)}%
        </Text>
      ),
    },
    {
      title: t('pages.reports.analytics.preview.mom', 'MoM Change'),
      dataIndex: 'momChange',
      width: 120,
      align: 'right',
      render: (_, row) =>
        typeof row.momChange === 'number' ? (
          <Text style={{ color: row.momChange >= 0 ? '#1677ff' : '#cf1322' }}>
            {row.momChange >= 0 ? '+' : ''}
            {row.momChange.toFixed(1)}%
          </Text>
        ) : (
          '—'
        ),
    },
    {
      title: t('pages.reports.analytics.preview.notes', 'Notes'),
      dataIndex: 'notes',
      ellipsis: true,
      render: (_, row) => row.notes || '—',
    },
  ];

  const keyIndicators = useMemo(() => {
    const totalRevenue = previewRows.reduce((sum, row) => sum + row.revenue, 0);
    const totalClients = previewRows.reduce((sum, row) => sum + row.clientCount, 0);
    const avgYoy =
      previewRows.length > 0
        ? previewRows.reduce((sum, row) => sum + row.yoyChange, 0) / previewRows.length
        : 0;

    return {
      totalRevenue,
      totalClients,
      avgYoy,
    };
  }, [previewRows]);

  return (
    <PageContainer
      title={t('pages.reports.analytics.title', 'Analytics & Reporting')}
      subTitle={t(
        'pages.reports.analytics.subTitle',
        'Unified reporting hub across Pricing, Billing and Performance for APAC governance decisions',
      )}
      extra={[
        <Button key="refresh" icon={<ReloadOutlined />} onClick={refreshAll}>
          {t('pages.reports.analytics.action.refresh', 'Refresh')}
        </Button>,
      ]}
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <StatisticCard.Group direction="row">
            <StatisticCard
              statistic={{
                title: t('pages.reports.analytics.stat.generatedMtd', 'Reports Generated (MTD)'),
                value: overview?.reportsGeneratedMtd ?? 0,
              }}
            />
            <StatisticCard.Divider />
            <StatisticCard
              statistic={{
                title: t('pages.reports.analytics.stat.mostUsed', 'Most Used Report Type'),
                value: overview ? REPORT_TYPE_LABEL[overview.mostUsedReportType] : '-',
              }}
            />
            <StatisticCard.Divider />
            <StatisticCard
              statistic={{
                title: t('pages.reports.analytics.stat.avgGeneration', 'Average Generation Time'),
                value: overview?.averageGenerationSeconds ?? 0,
                suffix: 's',
              }}
            />
            <StatisticCard.Divider />
            <StatisticCard
              statistic={{
                title: t('pages.reports.analytics.stat.downloadMtd', 'Download Count (MTD)'),
                value: overview?.downloadCountMtd ?? 0,
              }}
            />
            <StatisticCard.Divider />
            <StatisticCard
              statistic={{
                title: t('pages.reports.analytics.stat.templates', 'Open Report Templates'),
                value: overview?.openReportTemplates ?? 0,
              }}
            />
          </StatisticCard.Group>
        </Col>
      </Row>

      <ProCard
        title={t('pages.reports.analytics.quick.title', 'Quick Reports')}
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[12, 12]}>
          {quickReportConfig.map((item) => (
            <Col key={item.reportType} xs={24} sm={12} md={8}>
              <ProCard
                style={{
                  background: item.gradient,
                  border: '1px solid #d6e4ff',
                  borderColor: '#d6e4ff',
                }}
                actions={[
                  <Button
                    key="generate"
                    type="link"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handleQuickGenerate(item.reportType)}
                  >
                    {t('pages.reports.analytics.action.generate', 'Generate')}
                  </Button>,
                ]}
              >
                <Space direction="vertical" size={2}>
                  <Text strong>{REPORT_TYPE_LABEL[item.reportType]}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {t(
                      'pages.reports.analytics.quick.desc',
                      'One-click report generation with preview-before-download workflow',
                    )}
                  </Text>
                </Space>
              </ProCard>
            </Col>
          ))}
        </Row>
      </ProCard>

      <ProCard
        title={t('pages.reports.analytics.builder.title', 'Report Builder')}
        style={{ marginBottom: 16 }}
      >
        <ProForm<ReportRequest>
          form={form}
          layout="horizontal"
          submitter={{
            searchConfig: {
              submitText: t('pages.reports.analytics.action.generate', 'Generate'),
              resetText: t('pages.reports.analytics.action.reset', 'Reset'),
            },
            render: (_, doms) => (
              <Space>
                {doms[0]}
                {doms[1]}
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() =>
                    selectedReport
                      ? handleDownload(selectedReport.id)
                      : message.warning(
                          t('pages.reports.analytics.msg.selectReport', 'Generate or preview a report first'),
                        )
                  }
                >
                  {t('pages.reports.analytics.action.download', 'Download')}
                </Button>
              </Space>
            ),
          }}
          initialValues={defaultRequest}
          onFinish={async (values) => {
            await handleGenerate(values);
            return true;
          }}
        >
          <ProCard
            title={t('pages.reports.analytics.builder.scope', '1. Report Scope')}
            style={{ border: '1px solid #f0f0f0', marginBottom: 12 }}
          >
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <ProFormSelect
                  name="reportType"
                  label={t('pages.reports.analytics.builder.reportType', 'Report Type')}
                  options={REPORT_TYPE_OPTIONS.map((option) => ({
                    label: REPORT_TYPE_LABEL[option.value],
                    value: option.value,
                  }))}
                  rules={[{ required: true }]}
                />
              </Col>
              <Col xs={24} md={8}>
                <ProFormSelect
                  name="period"
                  label={t('pages.reports.analytics.builder.period', 'Period')}
                  options={[
                    { label: '2026-08', value: '2026-08' },
                    { label: '2026-07', value: '2026-07' },
                    { label: '2026-Q2', value: '2026-Q2' },
                    { label: '2026-H1', value: '2026-H1' },
                  ]}
                  rules={[{ required: true }]}
                />
              </Col>
              <Col xs={24} md={8}>
                <ProFormSelect
                  name="market"
                  label={t('pages.reports.analytics.builder.market', 'Market')}
                  options={[
                    { label: 'ALL', value: 'ALL' },
                    ...MARKET_OPTIONS.map((value) => ({ label: value, value })),
                  ]}
                />
              </Col>
              <Col xs={24} md={8}>
                <ProFormSelect
                  name="product"
                  label={t('pages.reports.analytics.builder.product', 'Product')}
                  options={[
                    { label: 'ALL', value: 'ALL' },
                    ...PRODUCT_OPTIONS.map((value) => ({ label: value, value })),
                  ]}
                />
              </Col>
              <Col xs={24} md={8}>
                <ProFormSelect
                  name="segment"
                  label={t('pages.reports.analytics.builder.segment', 'Segment')}
                  options={[
                    { label: 'ALL', value: 'ALL' },
                    ...SEGMENT_OPTIONS.map((value) => ({ label: value, value })),
                  ]}
                />
              </Col>
            </Row>
          </ProCard>

          <ProCard
            title={t('pages.reports.analytics.builder.aggregation', '2. Aggregation & Format')}
            style={{ border: '1px solid #f0f0f0' }}
          >
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <ProFormSelect
                  name="groupBy"
                  label={t('pages.reports.analytics.builder.groupBy', 'Group By')}
                  options={GROUP_BY_OPTIONS}
                  rules={[{ required: true }]}
                />
              </Col>
              <Col xs={24} md={8}>
                <ProFormSelect
                  name="currency"
                  label={t('pages.reports.analytics.builder.currency', 'Currency')}
                  options={CURRENCY_OPTIONS.map((value) => ({ label: value, value }))}
                  rules={[{ required: true }]}
                />
              </Col>
              <Col xs={24} md={8}>
                <ProFormSelect
                  name="format"
                  label={t('pages.reports.analytics.builder.format', 'Format')}
                  options={FORMAT_OPTIONS}
                  rules={[{ required: true }]}
                />
              </Col>
            </Row>
          </ProCard>
        </ProForm>
      </ProCard>

      <ProCard
        title={t('pages.reports.analytics.preview.title', 'Report Preview')}
        style={{ marginBottom: 16 }}
      >
        <ProTable<ReportPreviewRow>
          actionRef={previewActionRef}
          rowKey="id"
          loading={previewLoading}
          search={false}
          options={false}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1400 }}
          columns={previewColumns}
          dataSource={previewRows}
          toolBarRender={() => [
            <Button
              key="detail"
              icon={<EyeOutlined />}
              onClick={() => {
                if (!selectedReport) {
                  message.warning(t('pages.reports.analytics.msg.selectReport', 'Generate or preview a report first'));
                  return;
                }
                setDrawerOpen(true);
              }}
            >
              {t('pages.reports.analytics.action.previewDetail', 'Preview Details')}
            </Button>,
          ]}
        />
      </ProCard>

      <ProCard
        title={t('pages.reports.analytics.history.title', 'Recent Reports')}
      >
        <ProList<ReportRecord>
          rowKey="id"
          dataSource={history}
          metas={{
            title: {
              dataIndex: 'id',
              render: (_: React.ReactNode, row: ReportRecord) => (
                <Space>
                  <FileTextOutlined />
                  <Button type="link" style={{ padding: 0 }} onClick={() => handlePreview(row)}>
                    {row.id}
                  </Button>
                  <Tag>{REPORT_TYPE_LABEL[row.reportType]}</Tag>
                </Space>
              ),
            },
            description: {
              render: (_: React.ReactNode, row: ReportRecord) => (
                <Space split={<span>|</span>} size={0}>
                  <Text type="secondary">{t('pages.reports.analytics.history.period', 'Period')}: {row.period}</Text>
                  <Text type="secondary">{t('pages.reports.analytics.history.marketScope', 'Market Scope')}: {row.marketScope}</Text>
                  <Text type="secondary">{t('pages.reports.analytics.history.format', 'Format')}: {row.format}</Text>
                  <Text type="secondary">{t('pages.reports.analytics.history.generatedBy', 'Generated By')}: {row.generatedBy}</Text>
                  <Text type="secondary">{t('pages.reports.analytics.history.generatedAt', 'Generated At')}: {row.generatedAt.replace('T', ' ').slice(0, 19)}</Text>
                </Space>
              ),
            },
            actions: {
              render: (_: React.ReactNode, row: ReportRecord) => [
                <Button key="preview" size="small" icon={<EyeOutlined />} onClick={() => handlePreview(row)}>
                  {t('pages.reports.analytics.action.preview', 'Preview')}
                </Button>,
                <Button key="download" size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(row.id)}>
                  {t('pages.reports.analytics.action.download', 'Download')}
                </Button>,
                <Button key="rerun" size="small" icon={<ReloadOutlined />} onClick={() => handleGenerate({ ...row.request })}>
                  {t('pages.reports.analytics.action.rerun', 'Re-run')}
                </Button>,
              ],
            },
            extra: {
              render: (_: React.ReactNode, row: ReportRecord) => (
                <Badge status={statusBadge[row.status]} text={row.status} />
              ),
            },
          }}
        />
      </ProCard>

      <Drawer
        width={880}
        title={t('pages.reports.analytics.detail.title', 'Report Detail & Insight Preview')}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <ProDescriptions<ReportRecord>
            title={t('pages.reports.analytics.detail.metadata', 'Report Metadata')}
            dataSource={selectedReport ?? undefined}
            column={2}
            columns={[
              {
                title: t('pages.reports.analytics.history.reportId', 'Report ID'),
                dataIndex: 'id',
              },
              {
                title: t('pages.reports.analytics.history.reportType', 'Report Type'),
                dataIndex: 'reportType',
                render: (_, row) => (row ? REPORT_TYPE_LABEL[row.reportType] : '-'),
              },
              {
                title: t('pages.reports.analytics.history.period', 'Period'),
                dataIndex: 'period',
              },
              {
                title: t('pages.reports.analytics.history.marketScope', 'Market Scope'),
                dataIndex: 'marketScope',
              },
              {
                title: t('pages.reports.analytics.history.format', 'Format'),
                dataIndex: 'format',
              },
              {
                title: t('pages.reports.analytics.history.generatedAt', 'Generated At'),
                dataIndex: 'generatedAt',
                render: (_, row) => (row ? row.generatedAt.replace('T', ' ').slice(0, 19) : '-'),
              },
            ]}
          />

          <StatisticCard.Group>
            <StatisticCard
              statistic={{
                title: t('pages.reports.analytics.detail.totalRevenue', 'Total Revenue'),
                value: selectedReport
                  ? formatMoney(keyIndicators.totalRevenue, selectedReport.request.currency)
                  : '-',
              }}
            />
            <StatisticCard.Divider />
            <StatisticCard
              statistic={{
                title: t('pages.reports.analytics.detail.totalClients', 'Total Clients'),
                value: keyIndicators.totalClients,
              }}
            />
            <StatisticCard.Divider />
            <StatisticCard
              statistic={{
                title: t('pages.reports.analytics.detail.avgYoy', 'Average YoY'),
                value: `${keyIndicators.avgYoy.toFixed(1)}%`,
              }}
            />
            <StatisticCard.Divider />
            <StatisticCard
              statistic={{
                title: t('pages.reports.analytics.detail.generatedTime', 'Generated Time'),
                value: selectedReport ? `${selectedReport.generationTimeSeconds}s` : '-',
              }}
            />
          </StatisticCard.Group>

          <ProTable<ReportPreviewRow>
            rowKey="id"
            search={false}
            options={false}
            pagination={false}
            size="small"
            columns={previewColumns}
            dataSource={previewRows}
            scroll={{ x: 1300 }}
          />

          <ProCard
            title={t('pages.reports.analytics.detail.insightTitle', 'Insight Summary Preview')}
            style={{
              background: 'linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)',
              border: '1px solid #b7eb8f',
              borderColor: '#b7eb8f',
            }}
          >
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Text strong>
                  {t('pages.reports.analytics.insight.topMarket', 'Top Market Contributor')}:
                </Text>{' '}
                <Text>{insights?.topMarketContributor ?? '-'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>
                  {t('pages.reports.analytics.insight.topProduct', 'Top Product Contributor')}:
                </Text>{' '}
                <Text>{insights?.topProductContributor ?? '-'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>
                  {t('pages.reports.analytics.insight.largestYoy', 'Largest YoY Increase')}:
                </Text>{' '}
                <Text>{insights?.largestYoyIncrease ?? '-'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>
                  {t('pages.reports.analytics.insight.capacitySignal', 'Potential Capacity Signal')}:
                </Text>{' '}
                <Text>{insights?.potentialCapacitySignal ?? '-'}</Text>
              </Col>
            </Row>
          </ProCard>

          <ProCard title={t('pages.reports.analytics.detail.flow', 'Analytics Relationship Flow')}>
            <Space split={<span>→</span>} wrap>
              <Tag icon={<FundOutlined />} color="blue">
                {t('pages.reports.analytics.flow.data', 'Pricing & Billing Data')}
              </Tag>
              <Tag color="cyan">{t('pages.reports.analytics.flow.builder', 'Report Builder')}</Tag>
              <Tag color="gold">{t('pages.reports.analytics.flow.preview', 'Preview & Insight')}</Tag>
              <Tag color="green">{t('pages.reports.analytics.flow.download', 'Download & Distribution')}</Tag>
              <Tag color="purple">{t('pages.reports.analytics.flow.action', 'Planning / Governance Action')}</Tag>
            </Space>
          </ProCard>
        </Space>
      </Drawer>
    </PageContainer>
  );
};

export default AnalyticsReportsPage;
