import React, { useState, useEffect } from 'react';
import { 
  Search, X, Sparkles, TrendingUp, Users, Package, 
  Warehouse, Truck, Terminal, Database, LineChart, ShieldCheck,
  FileSpreadsheet, ArrowRight
} from 'lucide-react';
import { NavPage } from './Sidebar';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: NavPage) => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose, onSelectPage }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { page: 'overview', title: 'Executive Overview Dashboard', icon: TrendingUp, cat: 'Dashboard' },
    { page: 'insights', title: 'AI Business Insights & Root-Cause', icon: Sparkles, cat: 'AI' },
    { page: 'ask-opspulse', title: 'Ask OpsPulse Natural Language SQL', icon: Sparkles, cat: 'AI Assistant' },
    { page: 'churn', title: 'Customer Churn ML Model', icon: Users, cat: 'Predictive' },
    { page: 'forecast', title: 'Revenue & Demand Forecasting', icon: LineChart, cat: 'Predictive' },
    { page: 'products', title: 'Product Portfolio BCG Matrix', icon: Package, cat: 'Merchandising' },
    { page: 'inventory', title: 'Stockout & Days of Supply Risk', icon: Warehouse, cat: 'Operations' },
    { page: 'deliveries', title: 'Carrier SLA & Regional Delays', icon: Truck, cat: 'Logistics' },
    { page: 'sql-lab', title: 'SQL Analytics Lab (10+ CTE Queries)', icon: Terminal, cat: 'Engineering' },
    { page: 'data-quality', title: 'Data Quality & Profiling Engine', icon: ShieldCheck, cat: 'Governance' },
    { page: 'explorer', title: 'Interactive Relational Data Explorer', icon: Database, cat: 'Engineering' },
    { page: 'reports', title: 'Automated Multi-Tab Excel Reports', icon: FileSpreadsheet, cat: 'Reporting' },
    { page: 'project-overview', title: 'Recruiter Case Study & Architecture', icon: Sparkles, cat: 'Case Study' },
  ];

  const filtered = quickActions.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.cat.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden glass-card">
        {/* Search header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-brand-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search analytical views, machine learning models, or SQL queries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No matching analytical view or metric found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectPage(item.page as NavPage);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-brand-500/20 text-slate-400 group-hover:text-brand-400 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-brand-400 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500">{item.cat}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>Navigate with <b>↑</b> <b>↓</b> and select with <b>Enter</b></span>
          <span className="font-mono">OpsPulse AI v1.0</span>
        </div>
      </div>
    </div>
  );
};
