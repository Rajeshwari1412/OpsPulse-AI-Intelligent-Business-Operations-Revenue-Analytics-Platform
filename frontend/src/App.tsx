import React, { useState } from 'react';
import { Sidebar, NavPage } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalFilterBar } from './components/layout/GlobalFilterBar';
import { CommandMenu } from './components/layout/CommandMenu';

// Pages
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { SalesAnalytics } from './pages/SalesAnalytics';
import { CustomerAnalytics } from './pages/CustomerAnalytics';
import { ChurnWorkbench } from './pages/ChurnWorkbench';
import { ProductIntelligence } from './pages/ProductIntelligence';
import { InventoryAnalytics } from './pages/InventoryAnalytics';
import { DeliveryAnalytics } from './pages/DeliveryAnalytics';
import { MarketingAnalytics } from './pages/MarketingAnalytics';
import { AnomalyDetection } from './pages/AnomalyDetection';
import { ForecastingLab } from './pages/ForecastingLab';
import { DataQualityEngine } from './pages/DataQualityEngine';
import { AIInsights } from './pages/AIInsights';
import { AskOpsPulse } from './pages/AskOpsPulse';
import { SqlAnalyticsLab } from './pages/SqlAnalyticsLab';
import { DataExplorer } from './pages/DataExplorer';
import { ReportsStudio } from './pages/ReportsStudio';
import { ProjectOverview } from './pages/ProjectOverview';

export function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('overview');
  const [currentRole, setCurrentRole] = useState<'Executive' | 'Manager' | 'Analyst'>('Executive');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [filters, setFilters] = useState({
    region: '',
    category: '',
    startDate: '',
    endDate: '',
  });

  const renderActiveView = () => {
    switch (currentPage) {
      case 'overview':
        return <ExecutiveDashboard filters={filters} onNavigate={(p) => setCurrentPage(p as NavPage)} />;
      case 'sales':
        return <SalesAnalytics filters={filters} />;
      case 'customers':
        return <CustomerAnalytics />;
      case 'churn':
        return <ChurnWorkbench />;
      case 'products':
        return <ProductIntelligence />;
      case 'inventory':
        return <InventoryAnalytics />;
      case 'deliveries':
        return <DeliveryAnalytics />;
      case 'marketing':
        return <MarketingAnalytics />;
      case 'anomalies':
        return <AnomalyDetection />;
      case 'forecast':
        return <ForecastingLab />;
      case 'insights':
        return <AIInsights />;
      case 'ask-opspulse':
        return <AskOpsPulse />;
      case 'data-quality':
        return <DataQualityEngine />;
      case 'alerts':
        return <AnomalyDetection />;
      case 'sql-lab':
        return <SqlAnalyticsLab />;
      case 'explorer':
        return <DataExplorer />;
      case 'reports':
        return <ReportsStudio />;
      case 'project-overview':
        return <ProjectOverview />;
      default:
        return <ExecutiveDashboard filters={filters} onNavigate={(p) => setCurrentPage(p as NavPage)} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          onOpenCommand={() => setIsCommandOpen(true)}
          criticalAlertsCount={3}
          qualityScore={98.5}
        />

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Show Global Filter Bar on Operational Dashboards */}
          {['overview', 'sales'].includes(currentPage) && (
            <GlobalFilterBar
              filters={filters}
              setFilters={setFilters}
              onRefresh={() => setFilters({ ...filters })}
            />
          )}

          {/* Render Active View */}
          {renderActiveView()}
        </main>
      </div>

      {/* Quick Command Palette Modal */}
      <CommandMenu
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectPage={(page) => setCurrentPage(page)}
      />
    </div>
  );
}

export default App;
