import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, LineChart, Line, Legend 
} from 'recharts';
import { TrendingUp, Package, Tag, Layers, ArrowUpRight, DollarSign, Download } from 'lucide-react';
import { fetchSales } from '../services/api';
import { KpiCard } from '../components/kpi/KpiCard';

interface SalesAnalyticsProps {
  filters: any;
}

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ filters }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSales = async () => {
      setLoading(true);
      try {
        const res = await fetchSales(filters);
        setData(res);
      } catch (err) {
        console.error('Failed to load sales analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSales();
  }, [filters]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-brand-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Aggregating transactional sales data across dimensions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Sales & Revenue Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            SQL Aggregated transaction volumes, net revenue, channel mix, and product profitability
          </p>
        </div>
        <a
          href="/api/export/excel"
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-brand-400" />
          <span>Export Sales Dataset</span>
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.slice(0, 4).map((kpi: any) => (
          <KpiCard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Revenue & Margin Timeline */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Monthly Revenue & Operating Profit Margin Trend</h3>
            <p className="text-xs text-slate-400">Longitudinal performance with margin percentage overlay</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Net Revenue
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Operating Profit
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenue_timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="salesProfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(value: any, name: any) => [`$${Number(value).toLocaleString()}`, name]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#salesRevGrad)" name="Revenue" />
              <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#salesProfGrad)" name="Gross Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Sales by Channel & Regional Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Channel */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-100 mb-1">Sales Channel Mix & Average Order Value</h3>
          <p className="text-xs text-slate-400 mb-4">Channel transaction volume and monetization depth</p>

          <div className="space-y-3">
            {data.sales_by_channel.map((ch: any) => (
              <div key={ch.channel} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-200">{ch.channel}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">${ch.revenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{ch.orders.toLocaleString()} completed orders</span>
                  <span>AOV: <b className="text-slate-200">${ch.aov}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Breakdown */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-100 mb-1">Regional Revenue Contribution</h3>
          <p className="text-xs text-slate-400 mb-4">Total revenue and volume by geographic region</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sales_by_region} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="region" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Products Table */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Top Performing Products by Gross Revenue & Margin</h3>
            <p className="text-xs text-slate-400">Ranked by total realized transaction line items</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Product Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3 text-right">Units Sold</th>
                <th className="pb-3 text-right">Total Revenue</th>
                <th className="pb-3 text-right">Gross Profit</th>
                <th className="pb-3 text-right pr-2">Profit Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.top_products.map((prod: any, idx: number) => (
                <tr key={prod.product_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-2 font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono">
                      {idx + 1}
                    </span>
                    {prod.name}
                  </td>
                  <td className="py-3 text-slate-400">{prod.category}</td>
                  <td className="py-3 text-right font-mono text-slate-300">{prod.units_sold.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono font-semibold text-slate-100">${prod.revenue.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono text-emerald-400">${prod.profit.toLocaleString()}</td>
                  <td className="py-3 text-right pr-2 font-mono font-bold text-slate-200">{prod.margin_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
