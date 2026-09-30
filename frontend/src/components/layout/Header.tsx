import React from 'react';
import { 
  Search, Bell, Download, ShieldCheck, Sparkles, 
  User, CheckCircle2, AlertTriangle, Layers
} from 'lucide-react';

interface HeaderProps {
  currentRole: 'Executive' | 'Manager' | 'Analyst';
  setCurrentRole: (role: 'Executive' | 'Manager' | 'Analyst') => void;
  onOpenCommand: () => void;
  criticalAlertsCount: number;
  qualityScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  onOpenCommand,
  criticalAlertsCount,
  qualityScore,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search / Command bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenCommand}
          className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-400 bg-slate-950/70 border border-slate-800 rounded-lg hover:border-slate-700 hover:text-slate-200 transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-500 group-hover:text-brand-500 transition-colors" />
            <span>Search metrics, cohorts, SKUs, or ask AI...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-slate-400 bg-slate-900 border border-slate-700 rounded font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3.5">
        {/* Demo Mode Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Demo Data Loaded (100k+ Records)</span>
        </div>

        {/* Data Quality Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
          <span>DQ: {qualityScore.toFixed(1)}%</span>
        </div>

        {/* Role Selector */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
          {(['Executive', 'Manager', 'Analyst'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setCurrentRole(role)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                currentRole === role
                  ? 'bg-brand-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Excel Export Button */}
        <a
          href="/api/export/excel"
          download="OpsPulse_AI_Analytics_Report.xlsx"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-brand-400" />
          <span className="hidden sm:inline">Export XLSX</span>
        </a>

        {/* Alert Bell */}
        <div className="relative">
          <button 
            onClick={onOpenCommand}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors relative"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {criticalAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
