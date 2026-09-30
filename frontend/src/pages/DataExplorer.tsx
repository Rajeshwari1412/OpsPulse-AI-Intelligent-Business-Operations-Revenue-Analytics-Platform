import React, { useEffect, useState } from 'react';
import { 
  Database, Table, Search, ChevronLeft, ChevronRight, 
  Info, BarChart2, ShieldCheck, Layers 
} from 'lucide-react';
import { fetchExplorerTables, fetchTableData } from '../services/api';

export const DataExplorer: React.FC = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [activeTable, setActiveTable] = useState<string>('orders');
  const [tableData, setTableData] = useState<any>(null);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTables = async () => {
      try {
        const tbls = await fetchExplorerTables();
        setTables(tbls);
      } catch (err) {
        console.error('Failed to load tables list:', err);
      }
    };
    loadTables();
  }, []);

  const loadCurrentTable = async (tableName: string, p: number, s: string) => {
    setLoading(true);
    try {
      const res = await fetchTableData(tableName, 50, p * 50, s);
      setTableData(res);
    } catch (err) {
      console.error('Failed to load table details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    loadCurrentTable(activeTable, 0, search);
  }, [activeTable]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadCurrentTable(activeTable, 0, search);
  };

  const handleNextPage = () => {
    const next = page + 1;
    setPage(next);
    loadCurrentTable(activeTable, next, search);
  };

  const handlePrevPage = () => {
    if (page > 0) {
      const prev = page - 1;
      setPage(prev);
      loadCurrentTable(activeTable, prev, search);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Interactive Relational Data Explorer</h2>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Schema & Profiler
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Inspect relational schema definitions, null distributions, descriptive statistics, and raw records
        </p>
      </div>

      {/* Table Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tables.map((t) => (
          <button
            key={t.name}
            onClick={() => setActiveTable(t.name)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTable === t.name
                ? 'bg-brand-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{t.display_name}</span>
          </button>
        ))}
      </div>

      {tableData && (
        <div className="space-y-6">
          {/* Column Profiling & Descriptive Statistics Cards */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-400" />
              <span>Column Schema & Statistical Distributions ({tableData.columns.length} Attributes)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {tableData.columns.map((c: any) => (
                <div key={c.name} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200 font-mono">{c.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {c.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>Nulls: {c.null_pct}%</span>
                    <span>{c.unique_count} distinct</span>
                  </div>
                  {c.stats.min !== undefined && c.stats.min !== null && (
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                      <span>Min: {c.stats.min}</span>
                      <span>Avg: {c.stats.mean}</span>
                      <span>Max: {c.stats.max}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Records Table View */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm flex-1">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={`Search within ${activeTable}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors shrink-0"
                >
                  Filter
                </button>
              </form>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-400 self-end sm:self-auto">
                <span>
                  Showing {tableData.offset + 1}–{Math.min(tableData.offset + tableData.limit, tableData.filtered_records)} of {tableData.filtered_records.toLocaleString()}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 0 || loading}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={tableData.offset + tableData.limit >= tableData.filtered_records || loading}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    {tableData.columns.map((c: any) => (
                      <th key={c.name} className="pb-3 px-3 whitespace-nowrap">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {tableData.rows.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                      {tableData.columns.map((c: any) => (
                        <td key={c.name} className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                          {typeof row[c.name] === 'number' ? row[c.name].toLocaleString() : String(row[c.name] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
