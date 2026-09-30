import React from 'react';
import { 
  Sparkles, Database, Terminal, Cpu, LineChart, 
  ShieldCheck, CheckCircle2, Layers, BookOpen, Download, Code 
} from 'lucide-react';

export const ProjectOverview: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Showcase Banner */}
      <div className="glass-card rounded-3xl p-8 border-brand-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 relative overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
            Portfolio & Recruiter Technical Case Study
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
          OpsPulse AI — Intelligent Operations & Revenue Analytics Platform
        </h1>
        <p className="text-sm text-slate-300 mt-2.5 max-w-3xl leading-relaxed">
          A production-grade Data Engineering, BI, Machine Learning, and AI Analytics SaaS platform built to solve real-world business visibility, churn prediction, logistics latency, and inventory forecasting challenges.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-200">
            ⚡ 100,000+ Transaction Marts
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-200">
            🤖 Scikit-Learn Churn Classifier (F1: 82.4%)
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-200">
            📈 Holt-Winters Forecasting
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-200">
            🛡️ 98.5% Data Quality Engine
          </div>
        </div>
      </div>

      {/* Recruiter Message Highlight */}
      <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200 space-y-2 leading-relaxed">
        <div className="font-bold text-sm text-emerald-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Core Competencies Demonstrated for Data Analyst / BI / Data Engineer Roles:</span>
        </div>
        <p>
          "I can ingest raw operational data, validate schema and integrity constraints, build star-schema analytical models in SQL/PostgreSQL, perform exploratory and cohort analytics, develop machine learning churn models and time-series forecasts, and communicate actionable, zero-hallucination business recommendations to executive stakeholders."
        </p>
      </div>

      {/* Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technology Stack */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Code className="w-4 h-4 text-brand-400" />
            <span>Full-Stack & Data Technology Stack</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
              <span><b>Frontend:</b> React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, Glassmorphism design system</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
              <span><b>Backend Engine:</b> Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, PostgreSQL & SQLite</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
              <span><b>Analytics & ML:</b> Pandas, NumPy, Scikit-Learn (Random Forest, Gradient Boosting), Statsmodels (Holt-Winters), SciPy</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
              <span><b>Reporting & Export:</b> Openpyxl (multi-tab styled workbooks), CSV Streaming, PDF print stylesheet</span>
            </li>
          </ul>
        </div>

        {/* Data Engineering Pipeline */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-400" />
            <span>Lightweight ELT & Quality Pipeline</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
              <span><b>Raw Ingestion:</b> Multi-file CSV staging with Pandera/Pydantic range and type validation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
              <span><b>Data Quality Profiler:</b> 5-dimensional audit (Completeness, Validity, Consistency, Uniqueness, Freshness)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
              <span><b>Star Schema Modeling:</b> Fact Orders, Fact Order Items, Dim Customers, Dim Products, Dim Logistics, Dim Campaigns</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
              <span><b>Server-Side Aggregation:</b> SQL window functions (LAG, RANK, NTILE, Moving Averages) to avoid client-side bloat</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Analytical Modules Deep Dive */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-400" />
          <span>Comprehensive Analytics & Machine Learning Capabilities</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="font-bold text-slate-200">1. Customer RFM & Cohort Heatmap</div>
            <p className="text-slate-400 mt-1">Mathematical quintile segmentation (Champions to Lost) and monthly retention decay matrix over 6 months.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="font-bold text-slate-200">2. Predictive Churn Classification</div>
            <p className="text-slate-400 mt-1">Supervised model comparison (Random Forest, Gradient Boosting, Logistic Regression) with ROC-AUC and feature importance.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="font-bold text-slate-200">3. Time-Series Forecasting</div>
            <p className="text-slate-400 mt-1">Holt-Winters Exponential Smoothing point forecasts with 95% confidence bands and in-sample MAPE score.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="font-bold text-slate-200">4. Anomaly Detection Engine</div>
            <p className="text-slate-400 mt-1">Isolation Forest and 14-day rolling Z-Score outlier detection with automated severity and root causes.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="font-bold text-slate-200">5. Conversational SQL Assistant</div>
            <p className="text-slate-400 mt-1">Ask OpsPulse translates plain-English business inquiries into safe, allowlisted SQL queries with instant charts.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="font-bold text-slate-200">6. Root-Cause Waterfall Factor</div>
            <p className="text-slate-400 mt-1">Mathematical variance decomposition attributing top-line revenue growth across categories and carrier logistics drag.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
