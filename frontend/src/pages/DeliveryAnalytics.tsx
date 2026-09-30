import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line 
} from 'recharts';
import { Truck, Clock, AlertTriangle, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { fetchDeliveries } from '../services/api';

export const DeliveryAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDel = async () => {
      setLoading(true);
      try {
        const res = await fetchDeliveries();
        setData(res);
      } catch (err) {
        console.error('Failed to load deliveries:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDel();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-brand-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Benchmarking carrier logistics performance and regional transit latency...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Delivery & Carrier Logistics Intelligence</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Carrier SLA fulfillment benchmarks, regional delay hotspots, and customer satisfaction correlations
        </p>
      </div>

      {/* Carrier Benchmark Master Table */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Logistics Carrier SLA Performance Benchmark</h3>
            <p className="text-xs text-slate-400">Comparing transit speeds, delay durations, and customer CSAT scores</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3 pl-2">Carrier Partner</th>
                <th className="pb-3 text-right">Total Shipments</th>
                <th className="pb-3 text-right">On-Time SLA %</th>
                <th className="pb-3 text-right">Avg Transit Days</th>
                <th className="pb-3 text-right">Avg Delay</th>
                <th className="pb-3 text-right pr-2">Customer CSAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {data.carrier_performance.map((c: any) => (
                <tr key={c.carrier} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 pl-2 font-sans font-semibold text-slate-200 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-400" />
                    <span>{c.carrier}</span>
                  </td>
                  <td className="py-3.5 text-right text-slate-300">{c.total_shipments.toLocaleString()}</td>
                  <td className="py-3.5 text-right font-bold text-slate-100">
                    <span className={`px-2 py-0.5 rounded ${c.on_time_pct >= 90 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                      {c.on_time_pct}%
                    </span>
                  </td>
                  <td className="py-3.5 text-right text-slate-300">{c.avg_transit_days}d</td>
                  <td className="py-3.5 text-right font-bold text-rose-400">+{c.avg_delay_days}d</td>
                  <td className="py-3.5 text-right pr-2 text-emerald-400 font-bold">★ {c.avg_rating} / 5.0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Delay Duration Breakdown & Regional Heatmap Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delay Duration Distribution */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-100 mb-1">Transit Delay Severity Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Volume of orders impacted by logistics delays</p>

          <div className="space-y-3">
            {data.delay_distribution.map((d: any) => (
              <div key={d.bucket} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">{d.bucket}</span>
                <span className="text-xs font-mono font-bold text-slate-100">{d.count.toLocaleString()} shipments</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Bottleneck Matrix */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-100 mb-1">Regional Carrier Performance Matrix</h3>
          <p className="text-xs text-slate-400 mb-4">Delay averages across regional distribution nodes</p>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
            {data.region_delivery_heatmap.map((h: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-200">{h.region} • {h.carrier}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-400">On-Time: <b>{h.on_time_rate}%</b></span>
                  <span className={h.avg_delay_days > 1.0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    Delay: {h.avg_delay_days}d
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
