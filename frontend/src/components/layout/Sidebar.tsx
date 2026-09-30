import React from 'react';
import { 
  LayoutDashboard, TrendingUp, Users, UserX, Package, 
  Warehouse, Truck, Megaphone, AlertOctagon, LineChart, 
  ShieldCheck, Sparkles, MessageSquareCode, Database, 
  FileSpreadsheet, Terminal, Info, BellRing, Activity
} from 'lucide-react';

export type NavPage = 
  | 'overview'
  | 'sales'
  | 'customers'
  | 'churn'
  | 'products'
  | 'inventory'
  | 'deliveries'
  | 'marketing'
  | 'anomalies'
  | 'forecast'
  | 'insights'
  | 'ask-opspulse'
  | 'data-quality'
  | 'alerts'
  | 'sql-lab'
  | 'explorer'
  | 'reports'
  | 'project-overview';

interface SidebarProps {
  currentPage: NavPage;
  setCurrentPage: (page: NavPage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const navSections = [
    {
      title: "EXECUTIVE & AI",
      items: [
        { id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'insights', label: 'AI Business Insights', icon: Sparkles, badge: 'Smart' },
        { id: 'ask-opspulse', label: 'Ask OpsPulse (AI)', icon: MessageSquareCode, badge: 'NL-SQL' },
        { id: 'alerts', label: 'Business Alert Center', icon: BellRing },
      ]
    },
    {
      title: "OPERATIONS & REVENUE",
      items: [
        { id: 'sales', label: 'Sales & Revenue', icon: TrendingUp },
        { id: 'customers', label: 'Customer & RFM Cohorts', icon: Users },
        { id: 'products', label: 'Product Portfolio Matrix', icon: Package },
        { id: 'inventory', label: 'Inventory & Stockouts', icon: Warehouse },
        { id: 'deliveries', label: 'Delivery & Logistics', icon: Truck },
        { id: 'marketing', label: 'Marketing ROI & CAC', icon: Megaphone },
      ]
    },
    {
      title: "PREDICTIVE & ML",
      items: [
        { id: 'churn', label: 'Customer Churn Model', icon: UserX, badge: 'ML' },
        { id: 'forecast', label: 'Time-Series Forecasting', icon: LineChart },
        { id: 'anomalies', label: 'Anomaly Detection', icon: AlertOctagon },
      ]
    },
    {
      title: "DATA ENGINEERING & LAB",
      items: [
        { id: 'data-quality', label: 'Data Quality Engine', icon: ShieldCheck },
        { id: 'sql-lab', label: 'SQL Analytics Lab', icon: Terminal, badge: 'SQL' },
        { id: 'explorer', label: 'Data Explorer', icon: Database },
        { id: 'reports', label: 'Automated Reports', icon: FileSpreadsheet },
      ]
    },
    {
      title: "RECRUITER SHOWCASE",
      items: [
        { id: 'project-overview', label: 'Project Architecture & Case Study', icon: Info, badge: 'Recruiter' },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black shadow-md shadow-brand-500/20">
          <Activity className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-100 tracking-tight flex items-center gap-1.5">
            OpsPulse <span className="text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">AI</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">Operations & Revenue Platform</p>
        </div>
      </div>

      {/* Navigation Scroll */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-400 tracking-wider">
              {sec.title}
            </h3>
            <div className="space-y-0.5 pt-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id as NavPage)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                        item.badge === 'Recruiter' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isActive 
                            ? 'bg-brand-500/20 text-brand-300' 
                            : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-300 font-medium">PostgreSQL Engine</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">v1.0.0</span>
      </div>
    </aside>
  );
};
