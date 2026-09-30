import React from 'react';
import { Filter, Calendar, MapPin, Tag, RefreshCw } from 'lucide-react';

interface FilterProps {
  filters: {
    region: string;
    category: string;
    startDate: string;
    endDate: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    region: string;
    category: string;
    startDate: string;
    endDate: string;
  }>>;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const GlobalFilterBar: React.FC<FilterProps> = ({
  filters,
  setFilters,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md mb-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 px-2 py-1 bg-slate-800/50 rounded-lg">
          <Filter className="w-3.5 h-3.5 text-brand-400" />
          <span>Global Filters</span>
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={filters.region}
            onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-slate-200">All Regions</option>
            <option value="North" className="bg-slate-900 text-slate-200">North Region</option>
            <option value="South" className="bg-slate-900 text-slate-200">South Region</option>
            <option value="East" className="bg-slate-900 text-slate-200">East Region</option>
            <option value="West" className="bg-slate-900 text-slate-200">West Region</option>
            <option value="Central" className="bg-slate-900 text-slate-200">Central Region</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
          <Tag className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-slate-200">All Categories</option>
            <option value="Electronics" className="bg-slate-900 text-slate-200">Electronics</option>
            <option value="Office & Furniture" className="bg-slate-900 text-slate-200">Office & Furniture</option>
            <option value="Industrial IoT" className="bg-slate-900 text-slate-200">Industrial IoT</option>
            <option value="Health & Lighting" className="bg-slate-900 text-slate-200">Health & Lighting</option>
            <option value="Facilities & Security" className="bg-slate-900 text-slate-200">Facilities & Security</option>
          </select>
        </div>

        {/* Date Presets */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'all') setFilters(prev => ({ ...prev, startDate: '', endDate: '' }));
              else if (val === '2025') setFilters(prev => ({ ...prev, startDate: '2025-01-01', endDate: '2025-12-31' }));
              else if (val === '2026') setFilters(prev => ({ ...prev, startDate: '2026-01-01', endDate: '2026-03-31' }));
            }}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-200">Full Timeline (2024–2026)</option>
            <option value="2025" className="bg-slate-900 text-slate-200">FY 2025 (Annual)</option>
            <option value="2026" className="bg-slate-900 text-slate-200">Q1 2026 (Recent)</option>
          </select>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
          Live Database Cache (0.12ms)
        </span>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Data</span>
        </button>
      </div>
    </div>
  );
};
