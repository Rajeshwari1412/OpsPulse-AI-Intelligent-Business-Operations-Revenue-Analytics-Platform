import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { KPICardData } from '../../types';

interface KpiCardProps {
  data: KPICardData;
}

export const KpiCard: React.FC<KpiCardProps> = ({ data }) => {
  const isUp = data.trend === 'up';
  const isDown = data.trend === 'down';

  // Normalize sparkline data for SVG polyline
  const sparklinePoints = React.useMemo(() => {
    if (!data.sparkline || data.sparkline.length < 2) return '';
    const min = Math.min(...data.sparkline);
    const max = Math.max(...data.sparkline);
    const range = max - min || 1;
    const width = 80;
    const height = 28;

    return data.sparkline
      .map((val, idx) => {
        const x = (idx / (data.sparkline.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data.sparkline]);

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/40 relative overflow-hidden group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          {data.title}
        </span>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
          data.is_positive 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {isUp ? (
            <TrendingUp className="w-3 h-3" />
          ) : isDown ? (
            <TrendingDown className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          <span>{data.change_pct > 0 ? `+${data.change_pct}%` : `${data.change_pct}%`}</span>
        </div>
      </div>

      {/* Main value and Sparkline */}
      <div className="flex items-end justify-between mt-3 mb-2">
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            {data.formatted_value}
          </div>
          {data.benchmark_note && (
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {data.benchmark_note}
            </div>
          )}
        </div>

        {/* Mini Sparkline SVG */}
        {sparklinePoints && (
          <div className="w-20 h-7 flex items-center justify-end">
            <svg viewBox="0 0 80 28" className="w-full h-full overflow-visible">
              <polyline
                fill="none"
                stroke={data.is_positive ? '#10b981' : '#f43f5e'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklinePoints}
              />
            </svg>
          </div>
        )}
      </div>

      {/* Bottom subtle glow line on hover */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${
        data.is_positive ? 'bg-brand-500' : 'bg-rose-500'
      }`} />
    </div>
  );
};
