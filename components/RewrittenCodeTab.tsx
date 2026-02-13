
import React, { useState } from 'react';
import { rewriteCode } from '../services/geminiService';
import { CodeRewriteResult } from '../types';

export const RewrittenCodeTab: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CodeRewriteResult | null>(null);

  const handleRewrite = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      // Fix: added callback for streaming rewrite result to ensure the UI updates as content is generated.
      const data = await rewriteCode(code, language, (text) => {
        setResult({
          rewrittenCode: text,
          summary: "Generating...",
          improvements: [],
          explanation: text
        });
      });
      setResult(data);
    } catch (error) {
      console.error('Rewrite failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original Code */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2 text-slate-300">
              <i className="fas fa-file-code text-indigo-400"></i> Original Code
            </h2>
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-400"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste source code to refactor..."
            className="w-full h-[500px] bg-transparent text-slate-300 p-6 code-font text-sm resize-none focus:outline-none placeholder:text-slate-600"
          />
          <div className="p-6 bg-slate-800/30 border-t border-slate-800">
            <button
              onClick={handleRewrite}
              disabled={loading || !code.trim()}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-magic animate-pulse"></i>
                  Generating Optimized Version...
                </>
              ) : (
                <>
                  <i className="fas fa-wand-magic-sparkles"></i>
                  Fix & Rewrite Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Rewritten Code */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2 text-emerald-400">
              <i className="fas fa-sparkles"></i> Rewritten Code
            </h2>
            {result && (
              <button 
                onClick={() => navigator.clipboard.writeText(result.rewrittenCode)}
                className="text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-700 px-2 py-1 rounded"
              >
                <i className="fas fa-copy mr-1"></i> Copy
              </button>
            )}
          </div>
          <div className="h-[500px] overflow-auto p-6 bg-slate-950">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <i className="fas fa-code-merge text-5xl mb-4"></i>
                <p className="text-slate-500 italic">No rewritten code yet.</p>
              </div>
            ) : (
              <pre className="code-font text-sm text-emerald-300 leading-relaxed whitespace-pre-wrap">
                <code>{result.rewrittenCode}</code>
              </pre>
            )}
          </div>
          <div className="p-6 bg-slate-800/30 border-t border-slate-800">
             <div className="text-xs font-bold text-slate-500 uppercase mb-2">Key Improvements</div>
             <div className="flex flex-wrap gap-2">
                {result?.improvements.map((imp, i) => (
                  <span key={i} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] rounded border border-emerald-500/20">
                    <i className="fas fa-circle-check mr-1"></i> {imp}
                  </span>
                )) || <span className="text-slate-600 italic text-xs">Awaiting input...</span>}
             </div>
          </div>
        </div>
      </div>

      {/* Explanation Section */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 animate-in slide-in-from-top-4 duration-700">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-indigo-400">
            <i className="fas fa-book-open"></i> Changes Explained
          </h3>
          <p className="text-slate-300 leading-relaxed max-w-4xl">{result.explanation}</p>
        </div>
      )}
    </div>
  );
};
