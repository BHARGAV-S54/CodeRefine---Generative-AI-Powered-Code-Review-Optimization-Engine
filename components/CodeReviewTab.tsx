
import React, { useState } from 'react';
import { analyzeCode, rewriteCode } from '../services/geminiService';
import { CodeReviewResult, CodeRewriteResult, Severity } from '../types';

export const CodeReviewTab: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [focusAreas, setFocusAreas] = useState<string[]>(['Bugs', 'Security']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CodeReviewResult | null>(null);
  
  // New state for inline rewrite
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteResult, setRewriteResult] = useState<CodeRewriteResult | null>(null);

  const handleToggleFocus = (area: string) => {
    setFocusAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleReview = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setRewriteResult(null); // Reset previous rewrite
    try {
      // Fix: added empty callback for analysis streaming as required by service signature.
      const data = await analyzeCode(code, language, focusAreas, () => {});
      setResult(data);
    } catch (error) {
      console.error('Review failed:', error);
    } finally {
      setLanguage(language);
      setLoading(false);
    }
  };

  const handleInlineRewrite = async () => {
    if (!code.trim()) return;
    setIsRewriting(true);
    try {
      // Fix: added callback for streaming rewrite result to enhance UX during generation.
      const data = await rewriteCode(code, language, (text) => {
        setRewriteResult({
          rewrittenCode: text,
          summary: "Generating...",
          improvements: [],
          explanation: text
        });
      });
      setRewriteResult(data);
    } catch (error) {
      console.error('Rewrite failed:', error);
    } finally {
      setIsRewriting(false);
    }
  };

  const severityColors = {
    [Severity.CRITICAL]: 'bg-red-500/20 text-red-400 border-red-500/30',
    [Severity.HIGH]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    [Severity.MEDIUM]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    [Severity.LOW]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <i className="fas fa-code text-indigo-400"></i> Source Code
            </h2>
            <div className="flex gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
          </div>
          <div className="p-0">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full h-80 bg-transparent text-slate-300 p-6 code-font text-sm resize-none focus:outline-none placeholder:text-slate-600"
            />
          </div>
          <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-800">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Analysis Priority</p>
            <div className="flex flex-wrap gap-2">
              {['Bugs', 'Performance', 'Security', 'Best Practices'].map(area => (
                <button
                  key={area}
                  onClick={() => handleToggleFocus(area)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    focusAreas.includes(area)
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {focusAreas.includes(area) && <i className="fas fa-check mr-1.5"></i>}
                  {area}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">
            <button
              onClick={handleReview}
              disabled={loading || !code.trim()}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch animate-spin"></i>
                  Analyzing Code...
                </>
              ) : (
                <>
                  <i className="fas fa-magnifying-glass"></i>
                  Review Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[400px] flex flex-col shadow-xl">
          <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-semibold flex items-center gap-2">
              <i className="fas fa-chart-line text-purple-400"></i> Review Results
            </h2>
            {result && (
              <span className="text-xs text-slate-500">
                Found {result.suggestions.length} issues
              </span>
            )}
          </div>
          
          <div className="flex-1 p-6">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl">
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-300">Analysis Pending</h3>
                  <p className="text-sm text-slate-500 max-w-[250px] mx-auto">Click 'Review Code' to see automated suggestions and bug detection.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(Severity).map(sev => (
                    <div key={sev} className={`p-3 rounded-xl border ${severityColors[sev]} flex flex-col items-center justify-center`}>
                      <span className="text-xl font-bold">{result.counts[sev] || 0}</span>
                      <span className="text-[9px] uppercase font-bold tracking-tighter mt-1">{sev}</span>
                    </div>
                  ))}
                </div>

                {/* Suggestions List */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    Key Findings
                    <div className="h-px flex-1 bg-slate-800"></div>
                  </h3>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {result.suggestions.map((item, idx) => (
                      <div key={idx} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl hover:border-indigo-500/30 transition-colors group">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${severityColors[item.severity as Severity]}`}>
                            {item.severity}
                          </span>
                          {item.line && <span className="text-[10px] text-slate-500 code-font">L{item.line}</span>}
                        </div>
                        <h4 className="font-medium text-sm text-slate-200 mb-1">{item.issue}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inline Rewrite Trigger */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                     <p className="text-xs text-slate-400">Ready to fix these issues?</p>
                     <button
                        onClick={handleInlineRewrite}
                        disabled={isRewriting}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                     >
                        {isRewriting ? (
                          <><i className="fas fa-sparkles animate-pulse"></i> Generating...</>
                        ) : (
                          <><i className="fas fa-wand-magic-sparkles"></i> Fix & Rewrite Now</>
                        )}
                     </button>
                  </div>

                  {/* Inline Rewrite Results */}
                  {rewriteResult && (
                    <div className="bg-slate-950 border border-emerald-500/20 rounded-xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                      <div className="bg-emerald-500/5 px-4 py-2 border-b border-emerald-500/10 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                          <i className="fas fa-check-double"></i> AI-Optimized Code
                        </span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(rewriteResult.rewrittenCode)}
                          className="text-[10px] text-slate-500 hover:text-emerald-400 transition-colors"
                        >
                          <i className="fas fa-copy"></i> Copy
                        </button>
                      </div>
                      <div className="p-4 overflow-x-auto max-h-[300px]">
                        <pre className="code-font text-xs text-emerald-300/90 leading-relaxed">
                          <code>{rewriteResult.rewrittenCode}</code>
                        </pre>
                      </div>
                      <div className="p-3 bg-emerald-500/5 border-t border-emerald-500/10">
                        <p className="text-[10px] text-emerald-500/70 italic">
                          Applied: {rewriteResult.improvements.slice(0, 3).join(', ')}...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
