import React, { useEffect, useState } from 'react';
import { 
  Users, UserCheck, UserX, Crown, ShieldAlert, 
  ArrowUpRight, Sparkles, TrendingUp, Layers 
} from 'lucide-react';
import { fetchCustomers } from '../services/api';
import { KpiCard } from '../components/kpi/KpiCard';
import { RFMSegment } from '../types';

export const CustomerAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomerData = async () => {
      setLoading(true);
      try {
        const res = await fetchCustomers();
        setData(res);
      } catch (err) {
        console.error('Failed to load customer analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCustomerData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-brand-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Computing RFM scores and customer cohort matrix...</span>
        </div>
      </div>
    );
  }

  const getHeatmapColor = (pct: number) => {
    if (pct >= 80) return 'bg-emerald-500 text-slate-950 font-bold';
    if (pct >= 60) return 'bg-emerald-600/80 text-white font-medium';
    if (pct >= 40) return 'bg-emerald-700/60 text-slate-200';
    if (pct >= 25) return 'bg-emerald-900/40 text-slate-300';
    return 'bg-slate-800/40 text-slate-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Customer Intelligence & RFM Segmentation</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Calculated Recency, Frequency, Monetary (RFM) quintiles, Customer Cohort Retention, and Lifetime Value distribution
        </p>
      </div>

      {/* RFM Segment Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.rfm_segments.map((seg: RFMSegment) => {
          const isAtRisk = seg.segment === 'At Risk' || seg.segment === 'Lost Customers';
          return (
            <div 
              key={seg.segment}
              className={`glass-card rounded-2xl p-4 border transition-all ${
                seg.segment === 'Champions' 
                  ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-slate-900' 
                  : isAtRisk 
                    ? 'border-rose-500/30 bg-gradient-to-b from-rose-950/20 to-slate-900'
                    : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  {seg.segment === 'Champions' && <Crown className="w-4 h-4 text-amber-400" />}
                  {isAtRisk && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                  {seg.segment}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  {seg.customer_count.toLocaleString()} Users ({seg.share_pct}%)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-xl bg-slate-950/60 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Recency</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">{seg.avg_recency_days}d</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Freq</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">{seg.avg_frequency}x</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Spend</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">${seg.avg_monetary.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800 text-slate-400">
                <span>Total Contribution: <b className="text-slate-200">${seg.total_revenue.toLocaleString()}</b></span>
                <span className={seg.churn_rate > 50 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-medium'}>
                  {seg.churn_rate}% Churn Risk
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Cohort Retention Heatmap */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Monthly Customer Cohort Retention Heatmap</h3>
            <p className="text-xs text-slate-400">Percentage of acquired customers returning for repeat purchases over 6 months</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Low (15%)</span>
            <div className="w-20 h-2 rounded bg-gradient-to-r from-slate-800 via-emerald-700 to-emerald-400" />
            <span>High (100%)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3 text-left pl-2">Signup Cohort</th>
                <th className="pb-3">Cohort Size</th>
                {data.cohort_retention.periods.map((p: string) => (
                  <th key={p} className="pb-3 px-2">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-mono">
              {data.cohort_retention.matrix.map((row: any) => (
                <tr key={row.cohort} className="hover:bg-slate-800/30">
                  <td className="py-2.5 pl-2 text-left font-sans font-semibold text-slate-200">{row.cohort}</td>
                  <td className="py-2.5 text-slate-400">{row.size} users</td>
                  {data.cohort_retention.periods.map((p: string, idx: number) => {
                    const key = `m${idx}`;
                    const val = row[key];
                    return (
                      <td key={p} className="py-2 px-1">
                        <div className={`py-1.5 px-2 rounded-lg text-xs transition-all ${getHeatmapColor(val)}`}>
                          {val}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: CLV Brackets & Top VIP Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CLV Distribution */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-100 mb-1">Customer Lifetime Value (CLV) Tiers</h3>
          <p className="text-xs text-slate-400 mb-4">Value concentration across cumulative spend tiers</p>

          <div className="space-y-3">
            {data.clv_distribution.map((tier: any) => (
              <div key={tier.tier} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">{tier.tier}</div>
                  <div className="text-[11px] text-slate-500">{tier.count.toLocaleString()} customer accounts</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400">${tier.total_value.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Cumulative Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top VIP Customers Table */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-100 mb-1">Top Enterprise VIP Accounts</h3>
          <p className="text-xs text-slate-400 mb-4">Highest cumulative lifetime spend customers</p>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {data.top_customers.map((cust: any) => (
              <div key={cust.customer_id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">{cust.name}</div>
                  <div className="text-[11px] text-slate-500">{cust.email} • {cust.region}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-100">${cust.clv.toLocaleString()}</div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-500/20 text-emerald-300">
                    {cust.rfm_segment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
