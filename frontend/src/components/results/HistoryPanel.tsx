import { useEffect, useState, type FormEvent } from 'react';
import { listReports, updateReport, deleteReport } from '@/services/reportService';
import { exportReportAsHtml } from '@/utils/exportReport';
import type { GenomicReport } from '@/types';

interface HistoryPanelProps {
  reportsUpdated?: number;
  onReportDeleted?: () => void;
}

export default function HistoryPanel({ reportsUpdated = 0, onReportDeleted }: HistoryPanelProps) {
  const [reports, setReports] = useState<GenomicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<GenomicReport | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingPatientName, setEditingPatientName] = useState('');
  const [editingPatientId, setEditingPatientId] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      setReports(await listReports());
    } catch {
      setError('Could not load report history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportsUpdated]);

  const handleSelectReport = (report: GenomicReport) => {
    setSelectedReport(report);
    setEditingNotes(report.reviewerNotes || '');
    setEditingPatientName(report.patientName);
    setEditingPatientId(report.patientId || '');
    setEditSuccess(false);
  };

  const handleUpdateReport = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setSavingEdit(true);
    try {
      const updated = await updateReport(selectedReport._id, {
        patientName: editingPatientName,
        patientId: editingPatientId,
        reviewerNotes: editingNotes,
      });
      setEditSuccess(true);
      await fetchReports();
      setSelectedReport(updated);
      setTimeout(() => setEditSuccess(false), 2000);
    } catch {
      alert('Failed to update report.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm('Permanently delete this report?')) return;
    try {
      await deleteReport(id);
      if (selectedReport?._id === id) setSelectedReport(null);
      await fetchReports();
      onReportDeleted?.();
    } catch {
      alert('Failed to delete report.');
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[var(--bg)] min-h-0 overflow-hidden font-mono border-t border-[var(--border)]">
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[var(--border)] flex flex-col shrink-0">
        <div className="p-4 bg-[var(--surface)] border-b border-[var(--border)]">
          <h2 className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider">
            Genomic report history ({reports.length})
          </h2>
        </div>
        {loading ? (
          <p className="p-4 text-[var(--muted)] text-xs">Retrieving archives…</p>
        ) : error ? (
          <p className="p-4 text-[var(--danger)] text-xs">{error}</p>
        ) : reports.length === 0 ? (
          <p className="p-6 text-[var(--muted)] text-xs text-center">No saved analyses yet.</p>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
            {reports.map((rep) => (
              <button
                key={rep._id}
                type="button"
                onClick={() => handleSelectReport(rep)}
                className={`w-full text-left p-4 cursor-pointer transition-colors ${
                  selectedReport?._id === rep._id
                    ? 'bg-[rgba(59,142,255,0.08)] border-l-2 border-[var(--accent)]'
                    : 'hover:bg-[var(--surface2)] border-l-2 border-transparent'
                }`}
              >
                <div className="text-[var(--text)] font-bold text-xs">{rep.patientName}</div>
                <div className="text-[var(--accent)] text-xs mt-1">{rep.rsid}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {selectedReport ? (
          <div className="max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
              <h2 className="text-[var(--text)] text-sm font-bold">{selectedReport.patientName}</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => exportReportAsHtml(selectedReport)}
                  className="text-[10px] px-3 py-1.5 border border-[var(--accent)] text-[var(--accent)] rounded cursor-pointer hover:bg-[rgba(59,142,255,0.1)]"
                >
                  Export HTML
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteReport(selectedReport._id)}
                  className="text-[10px] px-3 py-1.5 border border-[var(--border)] text-[var(--muted)] rounded cursor-pointer hover:text-[var(--danger)]"
                >
                  Delete
                </button>
              </div>
            </div>
            <form onSubmit={handleUpdateReport} className="space-y-3">
              <input
                value={editingPatientName}
                onChange={(e) => setEditingPatientName(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] text-xs px-3 py-2 rounded text-[var(--text)]"
              />
              <input
                value={editingPatientId}
                onChange={(e) => setEditingPatientId(e.target.value)}
                placeholder="Patient ID"
                className="w-full bg-[var(--bg)] border border-[var(--border)] text-xs px-3 py-2 rounded text-[var(--text)]"
              />
              <textarea
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                rows={4}
                className="w-full bg-[var(--bg)] border border-[var(--border)] text-xs px-3 py-2 rounded text-[var(--text)] font-sans"
              />
              {editSuccess && <p className="text-[var(--accent2)] text-xs">✔ Updated.</p>}
              <button
                type="submit"
                disabled={savingEdit}
                className="text-[10px] px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded cursor-pointer"
              >
                {savingEdit ? 'Updating…' : 'Update record'}
              </button>
            </form>
          </div>
        ) : (
          <p className="text-[var(--muted)] text-xs text-center mt-12">
            Select a record to view, edit, or export.
          </p>
        )}
      </div>
    </div>
  );
}
