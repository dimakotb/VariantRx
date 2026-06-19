import { env } from '@/config/env';
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/client';
import type { ApiResponse, CreateReportPayload, GenomicReport } from '@/types';

const STORAGE_KEY = 'variantrx_reports';

function loadLocalReports(): GenomicReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GenomicReport[]) : [];
  } catch {
    return [];
  }
}

function saveLocalReports(reports: GenomicReport[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export async function listReports(): Promise<GenomicReport[]> {
  if (env.useMockApi) {
    await new Promise((r) => setTimeout(r, 200));
    return loadLocalReports().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  const res = await apiGet<ApiResponse<GenomicReport[]>>('/reports');
  if (!res.success) throw new Error('Could not load reports from server');
  return res.data;
}

export async function createReport(payload: CreateReportPayload): Promise<GenomicReport> {
  if (env.useMockApi) {
    const reports = loadLocalReports();
    const report: GenomicReport = {
      _id: `local-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
    reports.unshift(report);
    saveLocalReports(reports);
    return report;
  }

  const res = await apiPost<ApiResponse<GenomicReport>>('/reports', payload);
  if (!res.success) throw new Error('Failed to save report');
  return res.data;
}

export async function updateReport(
  id: string,
  updates: Partial<Pick<GenomicReport, 'patientName' | 'patientId' | 'reviewerNotes'>>,
): Promise<GenomicReport> {
  if (env.useMockApi || id.startsWith('local-')) {
    const reports = loadLocalReports();
    const idx = reports.findIndex((r) => r._id === id);
    if (idx === -1) throw new Error('Report not found');
    reports[idx] = { ...reports[idx], ...updates, updatedAt: new Date().toISOString() };
    saveLocalReports(reports);
    return reports[idx];
  }

  const res = await apiPut<ApiResponse<GenomicReport>>(`/reports/${id}`, updates);
  if (!res.success) throw new Error('Update failed');
  return res.data;
}

export async function deleteReport(id: string): Promise<void> {
  if (env.useMockApi || id.startsWith('local-')) {
    saveLocalReports(loadLocalReports().filter((r) => r._id !== id));
    return;
  }

  await apiDelete<ApiResponse<null>>(`/reports/${id}`);
}
