import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';
import { Warehouse, AlertTriangle, PackageX, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { fetchInventory } from '../services/api';

const COLORS = ['#f43f5e', '#f59e0b', '#10b981'];

export const InventoryAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInv = async () => {
      setLoading(true);
      try {
        const res = await fetchInventory();
        setData(res);
      } catch (err) {
        console.error('Failed to load inventory:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInv();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-brand-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Analyzing warehouse stock levels and stockout depletion velocities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Inventory Intelligence & Stockout Risk</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Days of supply estimation, turnover rates, warehouse distribution, and supply chain bottlenecks
        </p>
      </div>

      {/* Grid: Stockout Risk Table & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stockout High-Risk Table */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <PackageX className="w-4 h-4 text-rose-400" />
                <span>Stockout Alert List (Buffer &lt; 15 Days)</span>
              </h3>
              <p className="text-xs text-slate-400">High velocity SKUs requiring expedited replenishment purchase orders</p>
            </div>
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {data.stockout_risk_items.length} SKUs Critical
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 pl-2">Product Name</th>
                  <th className="pb-3">Warehouse</th>
                  <th className="pb-3 text-right">Stock On Hand</th>
                  <th className="pb-3 text-right">Reorder Point</th>
                  <th className="pb-3 text-right pr-2">Days of Supply</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {data.stockout_risk_items.map((item: any) => (
                  <tr key={item.product_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pl-2 font-sans font-semibold text-slate-200">{item.name}</td>
                    <td className="py-3 font-sans text-slate-400">{item.warehouse}</td>
                    <td className="py-3 text-right text-slate-200">{item.stock_on_hand} units</td>
                    <td className="py-3 text-right text-slate-400">{item.reorder_point} units</td>
                    <td className="py-3 text-right pr-2 font-bold text-rose-400">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30">
                        {item.days_of_supply} Days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Status Pie / Distribution */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">Catalog Stock Health Breakdown</h3>
            <p className="text-xs text-slate-400 mb-4">Proportion of items in optimal vs risky inventory state</p>

            <div className="space-y-3">
              {data.stock_status_breakdown.map((s: any, idx: number) => (
                <div key={s.status} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-200">{s.status}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-100">{s.item_count} SKUs</div>
                    <div className="text-[10px] text-slate-500 font-mono">{s.total_units} units</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 mt-4">
            <b>Inventory Action Item:</b> Rebalance stock from Central Hub to Southern Hub to resolve carrier transfer friction.
          </div>
        </div>
      </div>

      {/* Overstock & Category Turnover */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overstock Capital Tie-Up */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-100 mb-1">Overstock Items & Capital Tie-Up</h3>
          <p className="text-xs text-slate-400 mb-4">Excess inventory holding capital with &gt;50 days of supply</p>

          <div className="space-y-3">
            {data.overstock_risk_items.map((item: any) => (
              <div key={item.product_id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">{item.name}</div>
                  <div className="text-[11px] text-slate-500">{item.stock_on_hand} units • {item.days_of_supply} days supply</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-amber-400">${item.capital_tied_up.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500">Tied-Up Capital</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Turnover Benchmark */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-100 mb-1">Inventory Turnover by Category</h3>
          <p className="text-xs text-slate-400 mb-4">Annualized stock turns and inventory velocity</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.turnover_by_category} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} unit="x" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}x Turnover`, 'Velocity']}
                />
                <Bar dataKey="avg_turnover" fill="#10b981" radius={[6, 6, 0, 0]} name="Turnover Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
