import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Sparkles, AlertTriangle, ShieldCheck, ArrowUpRight, 
  TrendingUp, Layers, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { fetchOverview, fetchAlerts, fetchAIInsights } from '../services/api';
import { KpiCard } from '../components/kpi/KpiCard';
import { ExecutiveOverviewData, BusinessAlertItem, AIInsightItem } from '../types';

interface ExecutiveDashboardProps {
  filters: any;
  onNavigate: (page: string) => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ filters, onNavigate }) => {
  const [data, setData] = useState<ExecutiveOverviewData | null>(null);
  const [alerts, setAlerts] = useState<BusinessAlertItem[]>([]);
  const [insights, setInsights] = useState<AIInsightItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [overviewRes, alertsRes, insightsRes] = await Promise.all([
          fetchOverview(filters),
          fetchAlerts(),
          fetchAIInsights(),
        ]);
        setData(overviewRes);
        setAlerts(alertsRes.slice(0, 3));
        setInsights(insightsRes.insights.slice(0, 2));
      } catch (err) {
        console.error('Failed to load executive overview:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [filters]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-brand-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Synthesizing enterprise operational metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Briefing Banner */}
      <div className="glass-card rounded-2xl p-5 border-brand-500/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">AI Executive Synthesis Briefing</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Grounded Facts
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Consolidated top-line revenue expanded <b>+12.9% YoY</b> led by sustained demand in <b>Electronics & Audio</b>. 
                Immediate executive attention is recommended for <b>logistics delay bottlenecks in South Region</b> and 
                targeted retention campaigns for <b>412 at-risk customer accounts</b>.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('insights')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
          >
            <span>View Full Root Cause</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.slice(0, 4).map((kpi) => (
          <KpiCard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {data.kpis.slice(4, 7).map((kpi) => (
          <KpiCard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Timeline */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Revenue & Operating Profit Velocity</h3>
              <p className="text-xs text-slate-400">Monthly completed transaction totals and net gross profits</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Gross Profit
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue_trend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#profitGrad)" name="Gross Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Revenue Distribution */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Regional Revenue Distribution</h3>
            <p className="text-xs text-slate-400">Share of transactions by fulfillment zone</p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.regional_breakdown}
                  dataKey="revenue"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {data.regional_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            {data.regional_breakdown.map((r, i) => (
              <div key={r.region} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {r.region}
                </span>
                <span className="font-semibold text-slate-100">{r.share_pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Alerts & Category Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Performance Bar Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Category Revenue vs Gross Profit Margin</h3>
              <p className="text-xs text-slate-400">Total volume and operating profit generation by product line</p>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>Portfolio Matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.category_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} name="Revenue" />
                <Bar dataKey="profit" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Business Alerts */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">Operational Alert Center</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {alerts.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Automated threshold triggers across logistics and churn</p>

            <div className="space-y-3">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200 line-clamp-1">{a.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      a.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{a.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{a.metric}: {a.actual_value}</span>
                    <span className="text-brand-400 font-semibold cursor-pointer hover:underline" onClick={() => onNavigate(a.route_link.replace('/', ''))}>
                      Investigate →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('alerts')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors text-center"
          >
            View All Operational Alerts
          </button>
        </div>
      </div>
    </div>
  );
};
