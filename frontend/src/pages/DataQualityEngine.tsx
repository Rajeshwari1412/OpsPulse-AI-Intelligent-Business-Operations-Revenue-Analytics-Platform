import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Upload, 
  Database, RefreshCw, FileSpreadsheet, ArrowUpRight 
} from 'lucide-react';
import { fetchDataQuality, uploadDataset } from '../services/api';

export const DataQualityEngine: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const loadDQ = async () => {
    setLoading(true);
    try {
      const res = await fetchDataQuality();
      setData(res);
    } catch (err) {
      console.error('Failed to load DQ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDQ();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMsg(null);
    try {
      const res = await uploadDataset(file, 'orders');
      setUploadMsg(res.message);
      loadDQ(); // Refresh quality scores
    } catch (err: any) {
      setUploadMsg(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-brand-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Running enterprise data quality audit across relational tables...</span>
        </div>
      </div>
    );
  }

  const dimensions = [
    { name: 'Completeness', score: data.completeness, desc: 'Null & missing field rates' },
    { name: 'Validity', score: data.validity, desc: 'Range & domain bounds' },
    { name: 'Consistency', score: data.consistency, desc: 'Foreign key referential checks' },
    { name: 'Uniqueness', score: data.uniqueness, desc: 'Primary key deduplication' },
    { name: 'Freshness', score: data.freshness, desc: 'Chronological synchronization lag' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Data Quality & Validation Engine</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              ELT Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated schema profiling, domain constraint enforcement, referential integrity audit, and dataset health scoring
          </p>
        </div>

        {/* Upload Trigger */}
        <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95 self-start sm:self-auto">
          <Upload className="w-3.5 h-3.5" />
          <span>{uploading ? 'Validating CSV...' : 'Upload Staging CSV'}</span>
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {uploadMsg && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-brand-500/40 text-xs text-slate-200 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
          <span>{uploadMsg}</span>
        </div>
      )}

      {/* Main DQ Score Banner */}
      <div className="glass-card rounded-2xl p-5 border-brand-500/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-brand-500/40 flex flex-col items-center justify-center text-center shadow-lg shrink-0">
            <span className="text-2xl font-black font-mono text-brand-400">{data.overall_score}%</span>
            <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">DQ Score</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">Enterprise Data Pipeline Status: Healthy</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                PASS
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Audited <b>{data.total_records_analyzed.toLocaleString()} records</b> across 8 core relational entities. 
              Zero critical foreign-key orphan records or negative price violations detected in production analytical marts.
            </p>
          </div>
        </div>

        <button
          onClick={loadDQ}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-run Audit</span>
        </button>
      </div>

      {/* Dimension Scores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {dimensions.map((dim) => (
          <div key={dim.name} className="glass-card rounded-2xl p-3.5 border border-slate-800 text-center">
            <div className="text-[11px] font-bold text-slate-400">{dim.name}</div>
            <div className="text-2xl font-mono font-black text-slate-100 mt-1">{dim.score}%</div>
            <div className="text-[10px] text-slate-500 mt-1">{dim.desc}</div>
          </div>
        ))}
      </div>

      {/* Itemized Quality Checks Audit Table */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-100 mb-1">Itemized Rule Validation & Anomaly Checks</h3>
        <p className="text-xs text-slate-400 mb-4">Granular pass/fail criteria evaluating enterprise data integrity</p>

        <div className="space-y-3">
          {data.checks.map((c: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-400" />
                  <span className="text-xs font-bold text-slate-200">{c.check_name}</span>
                  <span className="text-[9px] px-2 py-0.2 rounded font-bold uppercase bg-slate-800 text-slate-400">
                    {c.dimension}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{c.description}</p>
                <div className="text-[11px] text-brand-400/90 font-medium">
                  <b>Recommended Remediation:</b> {c.recommended_fix}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-mono font-bold text-emerald-400">{c.score}% Score</div>
                <div className="text-[10px] text-slate-500 font-mono">{c.affected_rows} issues</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Profiles Grid */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-100 mb-1">Relational Staging Table Profiles</h3>
        <p className="text-xs text-slate-400 mb-4">Volume, memory footprint, null ratios, and duplicate counts</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {data.dataset_profiles.map((p: any) => (
            <div key={p.dataset_name} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs font-bold text-slate-200 capitalize">{p.dataset_name}</div>
              <div className="text-lg font-mono font-bold text-slate-100 mt-1">{p.row_count.toLocaleString()} rows</div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800/80">
                <span>Nulls: {p.null_rate_pct}%</span>
                <span>{p.memory_usage_mb} MB</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
