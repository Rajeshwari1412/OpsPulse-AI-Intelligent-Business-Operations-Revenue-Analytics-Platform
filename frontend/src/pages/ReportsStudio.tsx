import React, { useState } from 'react';
import { 
  FileSpreadsheet, Download, CheckCircle2, Printer, 
  FileText, Sparkles, Layers, ShieldCheck 
} from 'lucide-react';

export const ReportsStudio: React.FC = () => {
  const [sections, setSections] = useState({
    executiveSummary: true,
    revenueAnalysis: true,
    customerRFM: true,
    productMatrix: true,
    inventoryHealth: true,
    deliverySLAs: true,
    anomaliesAndForecast: true,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Automated Business Report Studio</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              PDF / Excel / CSV
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate publication-ready executive briefings and multi-tab operational analytics workbooks
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 rounded-xl transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF View</span>
          </button>
          <a
            href="/api/export/excel"
            download="OpsPulse_AI_Analytics_Report.xlsx"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Multi-Tab XLSX</span>
          </a>
        </div>
      </div>

      {/* Section Selection Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Include Report Modules:
        </div>
        <div className="flex flex-wrap gap-2.5">
          {Object.entries(sections).map(([key, val]) => (
            <button
              key={key}
              onClick={() => toggleSection(key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                val
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                  : 'bg-slate-950 border border-slate-800 text-slate-500'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${val ? 'text-brand-400' : 'text-slate-600'}`} />
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Report Preview Document */}
      <div className="glass-card rounded-2xl p-8 border border-slate-800 space-y-8 bg-slate-900/90 max-w-5xl mx-auto shadow-2xl">
        {/* Document Title Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-400">OpsPulse AI Enterprise</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 mt-1">Consolidated Business Operations & Revenue Briefing</h1>
            <p className="text-xs text-slate-400 mt-0.5">Reporting Window: Fiscal Years 2024–2026 (Consolidated Marts)</p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <div>Classification: Confidential</div>
            <div>Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        {sections.executiveSummary && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2">
              1. Executive Summary & Top-Line Performance
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consolidated net revenue closed at <b>$18.42M</b> (+12.9% YoY growth) across <b>29,023 completed transactions</b> with an operating gross profit of <b>$7.91M (42.9% gross margin)</b>. 
              Top revenue generation remains concentrated in the <b>Electronics & Audio</b> hardware division, which contributed $6.2M in top-line volume.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Net Revenue</div>
                <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">$18.42M</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Operating Profit</div>
                <div className="text-base font-bold font-mono text-blue-400 mt-0.5">$7.91M</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Order Volume</div>
                <div className="text-base font-bold font-mono text-slate-200 mt-0.5">29,023</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Average Order Value</div>
                <div className="text-base font-bold font-mono text-slate-200 mt-0.5">$634.70</div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Customer RFM */}
        {sections.customerRFM && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2">
              2. Customer Intelligence & RFM Segmentation
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Customer retention rate averaged <b>76.4%</b>. The <b>Champions</b> segment (15% of accounts) accounts for 48% of cumulative lifetime value with repeat purchase intervals of 12.4 days. 
              The predictive machine learning churn classifier flagged <b>412 enterprise accounts</b> in the At-Risk tier experiencing purchase inactivity &gt;75 days following carrier delivery friction.
            </p>
          </div>
        )}

        {/* Section 3: Operations & Logistics */}
        {sections.deliverySLAs && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2">
              3. Logistics Fulfillment & Carrier Bottlenecks
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Overall on-time delivery rate is <b>86.2%</b> against an operational SLA target of &gt;92%. 
              Regional transit analysis reveals acute latency in the <b>South and East fulfillment zones</b> where average carrier delays reached 2.8 days. 
              Immediate mitigation requires re-routing 40% of Southern freight to BlueDart Express.
            </p>
          </div>
        )}

        {/* Section 4: Inventory Health */}
        {sections.inventoryHealth && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2">
              4. Inventory Valuation & Stockout Risks
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Total active inventory valuation stands at <b>$448,500</b> across 20 primary SKUs. 
              Critical stockout warnings are triggered for <b>PulseWave Pro ANC Headphones (6.2 days of supply)</b> and <b>Apex Standing Desks (8.4 days of supply)</b> due to recent promotional conversion surges.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
