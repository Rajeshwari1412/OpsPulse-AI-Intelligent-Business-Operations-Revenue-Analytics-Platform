import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart 
} from 'recharts';
import { LineChart as LineIcon, TrendingUp, Sparkles, Sliders, Info } from 'lucide-react';
import { fetchForecast } from '../services/api';

export const ForecastingLab: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');
  const [horizon, setHorizon] = useState<number>(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForecast = async () => {
      setLoading(true);
      try {
        const res = await fetchForecast(metric, horizon);
        setData(res);
      } catch (err) {
        console.error('Failed to load forecast:', err);
      } finally {
        setLoading(false);
      }
    };
    loadForecast();
  }, [metric, horizon]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-brand-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Fitting Holt-Winters Exponential Smoothing model and calculating prediction intervals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Time-Series Forecasting Lab</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Statsmodels
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical projection using Triple Exponential Smoothing with 95% confidence intervals
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as any)}
            className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="revenue">Monthly Net Revenue ($)</option>
            <option value="orders">Monthly Order Volume (#)</option>
          </select>
          <select
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            className="bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value={3}>3 Months Horizon</option>
            <option value={6}>6 Months Horizon</option>
            <option value={12}>12 Months Horizon</option>
          </select>
        </div>
      </div>

      {/* Model Info Summary Banner */}
      <div className="glass-card rounded-2xl p-4 bg-gradient-to-r from-slate-900 to-slate-900/80 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Active Statistical Model</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{data.model_used}</div>
            <p className="text-xs text-slate-400 mt-1">{data.executive_takeaway}</p>
          </div>
          <div className="flex items-center gap-4 text-center shrink-0">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">In-Sample MAPE</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">{data.mape_score}%</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Projected Trajectory</div>
              <div className="text-xs font-bold text-brand-400 mt-1">{data.trend_direction}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Forecast Chart with Confidence Band */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Historical vs Projected {data.metric_name}</h3>
            <p className="text-xs text-slate-400">Solid green represents actual data, dashed blue indicates projected forecast band</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="text-emerald-400">● Historical Actuals</span>
            <span className="text-blue-400">--- Point Forecast</span>
            <span className="text-slate-500">■ 95% Confidence Band</span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.forecast_points} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => metric === 'revenue' ? `$${val/1000}k` : `${val}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any, name: any) => [val ? (metric === 'revenue' ? `$${Number(val).toLocaleString()}` : `${Number(val).toLocaleString()}`) : '-', name]}
              />
              <Area type="monotone" dataKey="upper_bound" stroke="none" fill="url(#forecastBand)" fillOpacity={1} name="Upper 95% Bound" />
              <Area type="monotone" dataKey="lower_bound" stroke="none" fill="url(#forecastBand)" fillOpacity={0} name="Lower 95% Bound" />
              <Line type="monotone" dataKey="historical" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Historical Data" />
              <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3 }} name="Forecast Projection" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
