import React, { useEffect, useState } from 'react';
import { 
  Terminal, Play, CheckCircle2, AlertTriangle, 
  Clock, Database, Sparkles, BookOpen, Layers 
} from 'lucide-react';
import { fetchSqlLabQueries, executeSqlLab } from '../services/api';

export const SqlAnalyticsLab: React.FC = () => {
  const [queries, setQueries] = useState<any[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [customSql, setCustomSql] = useState<string>('');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQueries = async () => {
      setLoading(true);
      try {
        const res = await fetchSqlLabQueries();
        setQueries(res);
        if (res.length > 0) {
          setSelectedQuery(res[0]);
          setCustomSql(res[0].sql.trim());
          // Execute initial query
          runSql(res[0].sql.trim());
        }
      } catch (err) {
        console.error('Failed to load SQL queries:', err);
      } finally {
        setLoading(false);
      }
    };
    loadQueries();
  }, []);

  const runSql = async (sqlToRun: string) => {
    setExecuting(true);
    try {
      const res = await executeSqlLab(sqlToRun);
      setExecutionResult(res);
    } catch (err: any) {
      setExecutionResult({
        columns: [],
        rows: [],
        row_count: 0,
        execution_time_ms: 0,
        is_safe: true,
        error_message: err.message || 'Execution error'
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleSelectPrebuilt = (q: any) => {
    setSelectedQuery(q);
    setCustomSql(q.sql.trim());
    runSql(q.sql.trim());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">SQL Analytics Lab & Engineering Showcase</h2>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            CTEs & Window Functions
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Demonstrating advanced SQL proficiency for Data Analyst / BI roles (LAG, NTILE, RANK, Moving Averages, Cohorts, and CTEs)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prebuilt Questions Sidebar */}
        <div className="glass-card rounded-2xl p-4 flex flex-col h-[650px]">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center justify-between">
            <span>Business SQL Questions</span>
            <span className="text-[10px] font-mono text-brand-400">10 Queries</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {queries.map((q) => (
              <button
                key={q.id}
                onClick={() => handleSelectPrebuilt(q)}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  selectedQuery?.id === q.id
                    ? 'bg-brand-500/15 border border-brand-500/40 text-slate-100 shadow-sm'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono text-brand-400 font-bold">Query #{q.id}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-slate-800 text-slate-400">
                    {q.difficulty}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200 line-clamp-1">{q.title}</div>
                <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{q.business_question}</div>
              </button>
            ))}
          </div>
        </div>

        {/* SQL Editor & Results Workbench */}
        <div className="lg:col-span-2 space-y-4">
          {/* Query Explanation Banner */}
          {selectedQuery && (
            <div className="glass-card rounded-2xl p-4 border border-brand-500/30 bg-slate-900/90">
              <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-400" />
                <span>Business Analysis & SQL Methodology</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                <b>Question:</b> {selectedQuery.business_question}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                <b>SQL Technique:</b> {selectedQuery.explanation}
              </p>
            </div>
          )}

          {/* Interactive SQL Editor */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col">
            <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Terminal className="w-4 h-4 text-brand-400" />
                <span>Read-Only Analytical SQL Console</span>
              </div>
              <button
                onClick={() => runSql(customSql)}
                disabled={executing || !customSql.trim()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{executing ? 'Executing...' : 'Run Query'}</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              className="w-full p-4 bg-slate-950 text-emerald-300 font-mono text-xs focus:outline-none resize-none leading-relaxed selection:bg-brand-500 selection:text-slate-950"
              spellCheck={false}
            />
          </div>

          {/* Execution Results View */}
          {executionResult && (
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-brand-400" />
                  <h3 className="text-sm font-bold text-slate-100">Query Output</h3>
                  <span className="text-xs font-mono text-slate-400">({executionResult.row_count} rows)</span>
                </div>
                <div className="text-xs font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{executionResult.execution_time_ms} ms</span>
                </div>
              </div>

              {executionResult.error_message ? (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
                  <b>Execution Error:</b> {executionResult.error_message}
                </div>
              ) : (
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                      <tr>
                        {executionResult.columns.map((col: string) => (
                          <th key={col} className="pb-2.5 px-3 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {executionResult.rows.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                          {executionResult.columns.map((col: string) => (
                            <td key={col} className="py-2 px-3 text-slate-300 whitespace-nowrap">
                              {typeof row[col] === 'number' ? row[col].toLocaleString() : String(row[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
