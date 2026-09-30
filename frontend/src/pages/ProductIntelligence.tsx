import React, { useEffect, useState } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Cell, Legend 
} from 'recharts';
import { Package, TrendingUp, TrendingDown, Layers, ArrowUpRight, DollarSign } from 'lucide-react';
import { fetchProducts } from '../services/api';
import { ProductPortfolioItem } from '../types';

export const ProductIntelligence: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await fetchProducts();
        setData(res);
      } catch (err) {
        console.error('Failed to load product analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-brand-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Generating product portfolio matrix and margin distributions...</span>
        </div>
      </div>
    );
  }

  const getQuadrantColor = (quad: string) => {
    switch (quad) {
      case 'High Revenue / High Margin': return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
      case 'High Revenue / Low Margin': return 'text-blue-400 border-blue-500/30 bg-blue-950/20';
      case 'Low Revenue / High Margin': return 'text-purple-400 border-purple-500/30 bg-purple-950/20';
      default: return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Product Portfolio & Matrix Intelligence</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          BCG-style Revenue vs Gross Margin matrix, SKU profitability, fast growers, and declining lines
        </p>
      </div>

      {/* Quadrant Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(data.quadrant_summary).map(([quad, info]: [string, any]) => (
          <div key={quad} className={`glass-card rounded-2xl p-4 border ${getQuadrantColor(quad)}`}>
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">{quad}</div>
            <div className="text-xl font-extrabold text-slate-100 mt-1 font-mono">${info.revenue.toLocaleString()}</div>
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-800/80">
              <span className="text-slate-400">{info.count} SKUs</span>
              <span className="font-mono text-emerald-400 font-bold">${info.profit.toLocaleString()} Profit</span>
            </div>
          </div>
        ))}
      </div>

      {/* Product Portfolio Scatter Matrix */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Product Portfolio Matrix (Revenue vs Profit Margin %)</h3>
            <p className="text-xs text-slate-400">Bubble size indicates total unit sales volume</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-emerald-400 font-semibold">● Stars (High Rev/High Margin)</span>
            <span className="text-blue-400 font-semibold">● Cash Drivers (High Rev/Low Margin)</span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis type="number" dataKey="revenue" name="Revenue" stroke="#64748b" tickFormatter={(v) => `$${v/1000}k`} unit="$" />
              <YAxis type="number" dataKey="profit_margin_pct" name="Margin" stroke="#64748b" unit="%" />
              <ZAxis type="number" dataKey="units_sold" range={[80, 450]} name="Units Sold" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any, name: any) => [name === 'Revenue' ? `$${Number(val).toLocaleString()}` : `${val}%`, name]}
              />
              <Scatter name="Products" data={data.portfolio_matrix} fill="#10b981">
                {data.portfolio_matrix.map((entry: any, index: number) => {
                  let fill = '#10b981';
                  if (entry.quadrant === 'High Revenue / Low Margin') fill = '#3b82f6';
                  if (entry.quadrant === 'Low Revenue / High Margin') fill = '#a855f7';
                  if (entry.quadrant === 'Low Revenue / Low Margin') fill = '#f43f5e';
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Complete Product Catalog Table */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-100 mb-1">Product Catalog & Economics Master</h3>
        <p className="text-xs text-slate-400 mb-4">Complete unit pricing, cost basis, margins, and stock status</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3 pl-2">Product</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Quadrant</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-right">Cost Basis</th>
                <th className="pb-3 text-right">Margin %</th>
                <th className="pb-3 text-right">Total Revenue</th>
                <th className="pb-3 text-center pr-2">Stock Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {data.portfolio_matrix.map((p: any) => (
                <tr key={p.product_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-2 font-sans font-semibold text-slate-200">{p.name}</td>
                  <td className="py-3 font-sans text-slate-400">{p.category}</td>
                  <td className="py-3 font-sans">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getQuadrantColor(p.quadrant)}`}>
                      {p.quadrant}
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-200">${p.unit_price}</td>
                  <td className="py-3 text-right text-slate-400">${p.cost_price}</td>
                  <td className="py-3 text-right font-bold text-emerald-400">{p.profit_margin_pct}%</td>
                  <td className="py-3 text-right font-bold text-slate-100">${p.revenue.toLocaleString()}</td>
                  <td className="py-3 text-center pr-2 font-sans">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      p.stock_status === 'Potential Stockout'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : p.stock_status === 'Potential Overstock'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {p.stock_status} ({p.stock_on_hand} in stock)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
