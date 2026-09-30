import React, { useState } from 'react';
import { 
  Sparkles, Send, Terminal, Database, ArrowRight, 
  CheckCircle2, Clock, BarChart2, Table, ChevronDown, ChevronUp 
} from 'lucide-react';
import { askOpsPulse } from '../services/api';

export const AskOpsPulse: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showSql, setShowSql] = useState(true);

  const sampleQuestions = [
    "Which products generated the highest revenue and profit?",
    "Which region has the highest carrier delivery delays?",
    "Show enterprise customers at high churn risk",
    "What is the monthly revenue and growth trajectory?",
    "Evaluate marketing campaigns by ROAS and CAC",
    "Which inventory items are facing stockout risk?"
  ];

  const handleAsk = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setQuestion(q);
    try {
      const res = await askOpsPulse(q);
      setResult(res);
    } catch (err) {
      console.error('Ask OpsPulse failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Ask OpsPulse — Conversational AI Analytics</h2>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Natural Language to SQL
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Ask plain-English operational questions. Translates semantic intent into safe, validated SQL queries and structured reports.
        </p>
      </div>

      {/* Input Box */}
      <div className="glass-card rounded-2xl p-4 border border-brand-500/40 bg-gradient-to-r from-slate-900 to-slate-900/90 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(question);
          }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Ask a question (e.g. 'Show customers with high churn risk in the South region')..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Ask AI</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Suggested Quick Prompts */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Sample Inquiries:</span>
          {sampleQuestions.map((sq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAsk(sq)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-brand-500/40 text-[11px] text-slate-300 hover:text-brand-300 transition-colors whitespace-nowrap shrink-0"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Answer Summary Card */}
          <div className="glass-card rounded-2xl p-5 border-brand-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                  Interpreted Business Intent: {result.interpreted_intent}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>{result.execution_time_ms}ms execution</span>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-100 leading-relaxed mt-2">
              {result.answer_summary}
            </p>
          </div>

          {/* Expandable Generated SQL Block */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
            <button
              onClick={() => setShowSql(!showSql)}
              className="w-full p-3.5 bg-slate-950/70 flex items-center justify-between text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-400" />
                <span>Generated Safe Analytical SQL Query (Allowlist Verified)</span>
              </div>
              {showSql ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSql && (
              <div className="p-4 bg-slate-950/90 font-mono text-xs text-emerald-300/90 overflow-x-auto border-t border-slate-800/60">
                <pre>{result.sql_query}</pre>
              </div>
            )}
          </div>

          {/* Data Table Preview */}
          {result.data_table && result.data_table.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Table className="w-4 h-4 text-brand-400" />
                  <span>Analytical Results Data Table ({result.data_table.length} records)</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                      {Object.keys(result.data_table[0]).map((col) => (
                        <th key={col} className="pb-3 px-3">
                          {col.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {result.data_table.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                        {Object.values(row).map((val: any, cIdx: number) => (
                          <td key={cIdx} className="py-2.5 px-3 text-slate-300">
                            {typeof val === 'number' ? (val > 100 ? val.toLocaleString() : val) : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
