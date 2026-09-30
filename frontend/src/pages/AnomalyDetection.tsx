import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot 
} from 'recharts';
import { AlertOctagon, Sparkles, AlertTriangle, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { fetchAnomalies } from '../services/api';

export const AnomalyDetection: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnom = async () => {
      setLoading(true);
      try {
        const res = await fetchAnomalies();
        setData(res);
      } catch (err) {
        console.error('Failed to load anomalies:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnom();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-brand-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Running Isolation Forest and Rolling Z-Score anomaly detection algorithms...</span>
        </div>
      </div>
    );
  }

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'HIGH': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Automated Anomaly Detection Engine</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Isolation Forest + Z-Score
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical outlier detection across revenue velocity, carrier delivery latency, and demand surges
          </p>
        </div>
      </div>

      {/* Anomaly Timeline Visualizer */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Daily Revenue Timeline with 95% Confidence Envelope</h3>
            <p className="text-xs text-slate-400">Comparing actual realized daily revenue vs expected rolling baseline</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-emerald-400">● Actual Daily Revenue</span>
            <span className="text-slate-400">--- Expected Baseline</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.anomalies_timeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any, name: any) => [`$${Number(val).toLocaleString()}`, name]}
              />
              <Line type="monotone" dataKey="actual_revenue" stroke="#10b981" strokeWidth={2} dot={false} name="Actual Revenue" />
              <Line type="monotone" dataKey="expected_revenue" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Expected Baseline" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Itemized Detected Anomalies Table */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Detected Operational Anomalies & Root Explanations</h3>
            <p className="text-xs text-slate-400">Statistical anomalies verified against operational metrics and historical baselines</p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
            {data.total_anomalies} Anomalies Logged
          </span>
        </div>

        <div className="space-y-3">
          {data.anomalies.map((anom: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className={`w-4 h-4 ${anom.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`} />
                  <span className="text-xs font-bold text-slate-200">{anom.metric} • {anom.dimension}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${getSeverityBadge(anom.severity)}`}>
                    {anom.severity}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Date: <b className="text-slate-200">{anom.anomaly_date}</b>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-2.5 p-2.5 rounded-lg bg-slate-900/60 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Actual Value</span>
                  <div className="font-bold text-slate-100 mt-0.5">${anom.actual_value.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Expected Value</span>
                  <div className="font-bold text-slate-400 mt-0.5">${anom.expected_value.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Statistical Deviation</span>
                  <div className={`font-bold mt-0.5 ${anom.deviation_pct > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {anom.deviation_pct > 0 ? `+${anom.deviation_pct}%` : `${anom.deviation_pct}%`}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs space-y-1 text-slate-300">
                <div><b className="text-slate-400">Possible Operational Cause:</b> {anom.possible_explanation}</div>
                <div><b className="text-brand-400">Suggested Action:</b> {anom.suggested_action}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
