import type { GenomicReport } from '@/types';

/** Export a printable genomic report as HTML (prototype-style clinical document) */
export function exportReportAsHtml(report: GenomicReport): void {
  const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>VariantRx Genomic Analysis Report — ${report.patientName}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; padding: 40px; background-color: #f8fafc; }
    .report-card { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 40px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { border-bottom: 2px solid #3b8eff; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-weight: bold; font-size: 24px; color: #0f172a; letter-spacing: 2px; }
    .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; font-weight: bold; }
    .results-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .result-box { border: 1px solid #cbd5e1; padding: 15px; border-radius: 6px; }
    .score { font-size: 32px; font-weight: bold; color: #3b8eff; font-family: monospace; }
    .label { font-weight: bold; text-transform: uppercase; font-size: 14px; margin-top: 5px; }
    .features-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    .features-table th, .features-table td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: left; }
    .features-table th { background: #f8fafc; color: #64748b; }
    .notes { font-style: italic; color: #475569; background: #f8fafc; padding: 15px; border-left: 4px solid #3b8eff; border-radius: 0 4px 4px 0; }
    @media print { body { padding: 0; background: none; } .report-card { border: none; box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="report-card">
    <div class="header">
      <div class="logo">VARIANTRX REPORT</div>
      <div style="font-family: monospace; font-size: 12px; color: #64748b;">Generated: ${new Date(report.createdAt).toLocaleString()}</div>
    </div>
    <div class="section-title">Patient Profile</div>
    <table style="width:100%; margin-bottom:30px; font-size:14px;">
      <tr><td style="width:150px; font-weight:bold; padding:4px 0;">Patient Name:</td><td>${escapeHtml(report.patientName)}</td></tr>
      <tr><td style="font-weight:bold; padding:4px 0;">Patient ID:</td><td>${escapeHtml(report.patientId || 'N/A')}</td></tr>
      <tr><td style="font-weight:bold; padding:4px 0;">Target Variant:</td><td style="font-family:monospace; font-weight:bold;">${escapeHtml(report.rsid)} (${escapeHtml(report.gene)})</td></tr>
      <tr><td style="font-weight:bold; padding:4px 0;">Coordinates:</td><td>chr${escapeHtml(report.chromosome)} | ${escapeHtml(report.alleleChange)}</td></tr>
    </table>
    <div class="section-title">ML Inference Summaries</div>
    <div class="results-grid">
      <div class="result-box">
        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">PathNet · Residual MLP</div>
        ${
          report.pathnetResult
            ? `<div class="score">${report.pathnetResult.score.toFixed(3)}</div>
               <div class="label" style="color: ${report.pathnetResult.label === 'PATHOGENIC' ? '#ef4444' : '#10b981'}">${escapeHtml(report.pathnetResult.label)}</div>
               <div style="font-size: 11px; color:#64748b;">Confidence: ${escapeHtml(report.pathnetResult.confidence)}</div>`
            : '<div style="color:#94a3b8; font-style:italic; margin-top:10px;">Not calculated.</div>'
        }
      </div>
      <div class="result-box">
        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">DrugNet · XGBoost</div>
        ${
          report.drugnetResult
            ? `<div class="score">${report.drugnetResult.score.toFixed(3)}</div>
               <div class="label" style="color: #059669;">${escapeHtml(report.drugnetResult.label)}</div>
               <div style="font-size: 11px; color:#64748b; margin-top:4px;"><b>Drugs:</b> ${report.drugnetResult.drugs.map((d) => escapeHtml(d.n)).join(', ')}</div>`
            : '<div style="color:#94a3b8; font-style:italic; margin-top:10px;">Not available.</div>'
        }
      </div>
    </div>
    ${
      report.pathnetResult?.features?.length
        ? `<div class="section-title">Engineered Features</div>
           <table class="features-table" style="margin-bottom:30px;">
             <thead><tr><th>Feature</th><th>Value</th></tr></thead>
             <tbody>${report.pathnetResult.features.map((f) => `<tr><td>${escapeHtml(f.key)}</td><td>${escapeHtml(String(f.value))}</td></tr>`).join('')}</tbody>
           </table>`
        : ''
    }
    <div class="section-title">Clinical Notes</div>
    <div class="notes">${report.reviewerNotes ? escapeHtml(report.reviewerNotes).replace(/\n/g, '<br />') : 'No clinician notes appended.'}</div>
    <div style="margin-top:50px; border-top:1px solid #cbd5e1; padding-top:10px; font-size:10px; color:#94a3b8; text-align:center; font-family:monospace;">
      VariantRx Bio-computational Inference Registry · CONFIDENTIAL
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([reportHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `variantrx_report_${report.patientName.replace(/\s+/g, '_').toLowerCase()}_${report.rsid}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
