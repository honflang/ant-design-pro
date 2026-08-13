import { request } from '@umijs/max';
import type {
  ReportDownloadResponse,
  ReportGenerateResponse,
  ReportHistoryResponse,
  ReportOverviewResponse,
  ReportPreviewResponse,
  ReportRequest,
} from './data';

export async function queryReportOverview() {
  const response = await request<ReportOverviewResponse>('/api/reports/overview');
  return response.data;
}

export async function queryReportHistory() {
  const response = await request<ReportHistoryResponse>('/api/reports/history');
  return response.data;
}

export async function generateReport(payload: ReportRequest) {
  const response = await request<ReportGenerateResponse>('/api/reports/generate', {
    method: 'POST',
    data: payload,
  });
  return response.data;
}

export async function queryReportPreview(reportId: string) {
  const response = await request<ReportPreviewResponse>('/api/reports/preview', {
    params: { reportId },
  });
  return response.data;
}

export async function downloadReport(reportId: string) {
  const response = await request<ReportDownloadResponse>(`/api/reports/${reportId}/download`);
  return response.data;
}
