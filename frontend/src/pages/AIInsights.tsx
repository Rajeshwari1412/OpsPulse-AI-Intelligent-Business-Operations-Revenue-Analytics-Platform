import React, { useEffect, useState } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight, 
  Layers, Lightbulb, ShieldAlert, TrendingUp 
} from 'lucide-react';
import { fetchAIInsights, fetchRootCause } from '../services/api';
import { AIInsightItem } from '../types';

export const AIInsights: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [rootCause, setRootCause] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      try {
        const [insRes, rcRes] = await Promise.all([
          fetchAIInsights(),
          fetchRootCause('revenue')
        ]);
        setData(insRes);
        setRootCause(rcRes);
      } catch (err) {
        console.error('Failed to load AI insights:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInsights();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-brand-400 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Synthesizing grounded AI business explanations and factor attribution...</span>
        </div>
      </div>
    );
  }

  const categories = ['All', 'Revenue & Product Performance', 'Operations & Logistics Friction', 'Customer Retention & Attrition', 'Inventory Capital & Stockout Risk'];

  const filteredInsights = activeCategory === 'All' 
    ? data.insights 
    : data.insights.filter((i: AIInsightItem) => i.category === activeCategory);

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'Positive': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Critical': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Warning': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">AI Business Insight & Root-Cause Engine</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Zero Hallucination
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic rule-based and LLM-assisted explanations strictly grounded in calculated database facts
          </p>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="glass-card rounded-2xl p-5 border-brand-500/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Executive Summary & Operational Focus</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{data.summary}</p>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400 font-mono">
              <span>Engine Mode: <b>{data.engine_mode}</b></span>
              <span>Generated: <b>{data.generated_at}</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* Root-Cause Factor Attribution Waterfall */}
      {rootCause && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Automated Root-Cause Waterfall Factor Decomposition</h3>
              <p className="text-xs text-slate-400">Mathematical attribution of operational drivers contributing to net revenue</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400">
              Net Realized: ${rootCause.total_value.toLocaleString()}
            </span>
          </div>

          <div className="space-y-3">
            {rootCause.waterfall_factors.map((f: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{f.factor}</span>
                    <span className={`text-[9px] px-2 py-0.2 rounded font-bold uppercase ${
                      f.impact === 'Positive' ? 'bg-emerald-500/20 text-emerald-300' :
                      f.impact === 'Negative' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {f.impact}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{f.explanation}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xs font-mono font-bold ${f.value > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {f.value > 0 ? `+$${f.value.toLocaleString()}` : `-$${Math.abs(f.value).toLocaleString()}`}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{f.contribution_pct}% contribution</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-brand-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Structured Insight Cards */}
      <div className="space-y-4">
        {filteredInsights.map((ins: AIInsightItem) => (
          <div key={ins.id} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${getSeverityStyle(ins.severity)}`}>
                  {ins.severity}
                </span>
                <span className="text-xs text-slate-400 font-medium">{ins.category}</span>
              </div>
              <div className="text-xs font-mono text-brand-400 font-semibold">
                Confidence: {ins.confidence_score}%
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-100">{ins.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{ins.observation}</p>

            {/* Evidence Checklist */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Analytical Database Evidence
              </div>
              <div className="space-y-1.5">
                {ins.evidence.map((ev, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Root Cause Attribution</span>
                <p className="text-slate-300 mt-1">{ins.root_cause_analysis}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30">
                <span className="text-[10px] font-bold text-brand-400 uppercase">Recommended Business Action</span>
                <p className="text-emerald-300 mt-1">{ins.recommended_action}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
