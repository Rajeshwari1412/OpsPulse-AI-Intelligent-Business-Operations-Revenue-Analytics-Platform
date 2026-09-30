import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, ZAxis 
} from 'recharts';
import { Megaphone, TrendingUp, Target, DollarSign, ArrowUpRight } from 'lucide-react';
import { fetchMarketing } from '../services/api';

export const MarketingAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMkt = async () => {
      setLoading(true);
      try {
        const res = await fetchMarketing();
        setData(res);
      } catch (err) {
        console.error('Failed to load marketing:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMkt();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-brand-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Evaluating marketing channel efficiency, CAC, and ROAS attribution...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Marketing Attribution & ROAS Intelligence</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Campaign return on advertising spend (ROAS), customer acquisition costs (CAC), and channel performance
        </p>
      </div>

      {/* Channel Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.channel_performance.map((c: any) => (
          <div key={c.channel} className="glass-card rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">{c.channel}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">
                {c.roas}x ROAS
              </span>
            </div>
            <div className="text-xl font-extrabold text-slate-100 font-mono">${c.revenue.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Attributed Sales Volume</div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Ad Spend</span>
                <div className="font-bold text-slate-300 mt-0.5">${c.spend.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Blended CAC</span>
                <div className="font-bold text-emerald-400 mt-0.5">${c.cac}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Comparison Master Table */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Active Marketing Campaigns Master</h3>
            <p className="text-xs text-slate-400">Comparing budget utilization, conversions, realized ROAS, and CAC</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3 pl-2">Campaign Name</th>
                <th className="pb-3">Channel</th>
                <th className="pb-3">Target Region</th>
                <th className="pb-3 text-right">Ad Spend</th>
                <th className="pb-3 text-right">Conversions</th>
                <th className="pb-3 text-right">Realized Revenue</th>
                <th className="pb-3 text-right">ROAS</th>
                <th className="pb-3 text-right pr-2">CAC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {data.campaign_comparison.map((cmp: any) => (
                <tr key={cmp.campaign_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 pl-2 font-sans font-semibold text-slate-200">{cmp.name}</td>
                  <td className="py-3.5 font-sans text-slate-400">{cmp.channel}</td>
                  <td className="py-3.5 font-sans text-slate-400">{cmp.region}</td>
                  <td className="py-3.5 text-right text-slate-300">${cmp.spend.toLocaleString()}</td>
                  <td className="py-3.5 text-right text-slate-300">{cmp.conversions.toLocaleString()}</td>
                  <td className="py-3.5 text-right font-bold text-slate-100">${cmp.revenue.toLocaleString()}</td>
                  <td className="py-3.5 text-right font-bold text-emerald-400">{cmp.roas}x</td>
                  <td className="py-3.5 text-right pr-2 font-bold text-slate-200">${cmp.cac}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
