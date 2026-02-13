
<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { detectLanguage, reviewCode, rewriteCode, simulateExecution, chatWithAssistant } from './geminiService';
import { ActiveTab, AppState, ChatMessage } from './types';
import { marked } from 'marked';
import hljs from 'highlight.js';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [state, setState] = useState<AppState>({
    code: '',
    language: 'auto',
    analysis: null,
    rewritten: null,
    output: null,
    isLoading: false,
    activeTab: 'editor',
  });
  const [focusAreas, setFocusAreas] = useState<string[]>(['Performance', 'Security', 'Best Practices']);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [runTabMode, setRunTabMode] = useState<'console' | 'preview'>('preview');

  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }, []);

  useEffect(() => {
    if (state.language === 'auto' && state.code.trim().length > 15) {
      const timer = setTimeout(async () => {
        setIsDetecting(true);
        try {
          const detected = await detectLanguage(state.code);
          if (detected !== 'auto') {
            setState(prev => ({ ...prev, language: detected }));
          }
        } finally {
          setIsDetecting(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.code, state.language]);

  useEffect(() => {
    if (state.activeTab === 'rewrite' && state.rewritten) {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [state.activeTab, state.rewritten]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  const handleAction = async (action: 'review' | 'rewrite' | 'run') => {
    if (!state.code.trim()) return;

    setState(prev => ({ ...prev, isLoading: true }));
    let lang = state.language;
    
    if (lang === 'auto') {
      lang = await detectLanguage(state.code);
      setState(prev => ({ ...prev, language: lang }));
    }

    try {
      if (action === 'review') {
        const result = await reviewCode(state.code, lang, focusAreas);
        setState(prev => ({ ...prev, analysis: result, activeTab: 'review', isLoading: false }));
      } else if (action === 'rewrite') {
        const result = await rewriteCode(state.code, lang);
        setState(prev => ({ ...prev, rewritten: result, activeTab: 'rewrite', isLoading: false }));
      } else if (action === 'run') {
        const result = await simulateExecution(state.code, lang);
        setState(prev => ({ ...prev, output: result, activeTab: 'run', isLoading: false }));
        if (result.html) {
          setRunTabMode('preview');
        } else {
          setRunTabMode('console');
        }
      }
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    const assistantMsgContent = await chatWithAssistant(chatInput, chatMessages);
    setChatMessages(prev => [...prev, { role: 'assistant', content: assistantMsgContent }]);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-3xl bg-blue-50 mb-4 text-blue-600">
              <i className="fa-solid fa-code-branch text-4xl"></i>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">CodeRev AI</h2>
            <p className="text-slate-500 text-sm">Professional Code Review & Optimization</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleLogin}>
            {!isLoginView && (
              <div>
                <label className="block text-slate-700 text-xs mb-1.5 font-bold uppercase tracking-wider">Full Name</label>
                <input type="text" placeholder="Your Name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" required />
              </div>
            )}
            <div>
              <label className="block text-slate-700 text-xs mb-1.5 font-bold uppercase tracking-wider">Email Address</label>
              <input type="email" defaultValue="dev@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" required />
            </div>
            <div>
              <label className="block text-slate-700 text-xs mb-1.5 font-bold uppercase tracking-wider">Password</label>
              <input type="password" defaultValue="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.98]">
              {isLoginView ? 'Sign In' : 'Create Account'}
            </button>
            <p className="text-center text-sm text-slate-500 pt-2">
              {isLoginView ? "New here?" : "Joined already?"}{' '}
              <button type="button" onClick={() => setIsLoginView(!isLoginView)} className="text-blue-600 font-bold hover:underline underline-offset-4">
                {isLoginView ? 'Register' : 'Login'}
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <i className="fa-solid fa-wand-sparkles text-lg"></i>
              </div>
              <div>
                <h1 className="font-black text-slate-900 leading-none">CodeRev AI</h1>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v2.5 Professional</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={() => setChatOpen(true)} className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold text-sm transition-colors">
                <i className="fa-solid fa-message"></i> Ask Assistant
              </button>
              <button onClick={() => setIsAuthenticated(false)} className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 transition-all p-2 px-4 rounded-xl text-sm font-bold border border-slate-200">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          <nav className="lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
            {[
              { id: 'editor', icon: 'fa-code', label: 'Source Editor' },
              { id: 'review', icon: 'fa-microscope', label: 'AI Code Review' },
              { id: 'rewrite', icon: 'fa-sparkles', label: 'Rewritten Code' },
              { id: 'run', icon: 'fa-terminal', label: 'Environment' },
              { id: 'help', icon: 'fa-circle-info', label: 'Documentation' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setState(prev => ({ ...prev, activeTab: tab.id as ActiveTab }))}
                className={`whitespace-nowrap flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  state.activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 translate-x-1'
                    : 'text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                }`}
              >
                <i className={`fa-solid ${tab.icon} w-5 text-center`}></i>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex-grow min-w-0">
            {state.activeTab === 'editor' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col min-h-[650px] animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-black text-2xl text-slate-900">Source Editor</h3>
                    <p className="text-slate-500 text-sm">Write or paste your code below</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 pl-3 pr-1 py-1">
                      {isDetecting ? (
                         <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <i className="fa-solid fa-language text-slate-400"></i>
                      )}
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Language:</span>
                    </div>
                    <select
                      value={state.language}
                      onChange={(e) => setState(prev => ({ ...prev, language: e.target.value }))}
                      className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none min-w-[140px]"
                    >
                      <option value="auto">✨ Auto Detect</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="rust">Rust</option>
                      <option value="go">Go</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                    </select>
                  </div>
                </div>

                <div className="flex-grow flex flex-col mb-6">
                  <textarea
                    value={state.code}
                    onChange={(e) => setState(prev => ({ ...prev, code: e.target.value }))}
                    spellCheck={false}
                    className="w-full flex-grow bg-slate-900 text-blue-100 font-mono text-sm rounded-2xl p-6 border-4 border-slate-950 focus:outline-none shadow-inner min-h-[400px] leading-relaxed selection:bg-blue-500/30"
                    placeholder="// Start typing or paste code for instant analysis..."
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    {['Performance', 'Security', 'Best Practices'].map(focus => (
                      <label key={focus} className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={focusAreas.includes(focus)}
                            onChange={() => setFocusAreas(prev => prev.includes(focus) ? prev.filter(f => f !== focus) : [...prev, focus])}
                            className="w-5 h-5 appearance-none border-2 border-slate-200 rounded-lg checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                          />
                          <i className="fa-solid fa-check absolute inset-0 m-auto text-[10px] text-white opacity-0"></i>
                        </div>
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{focus}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => handleAction('review')} 
                      disabled={state.isLoading || !state.code.trim()} 
                      className="flex-1 sm:flex-none px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      <i className="fa-solid fa-microscope text-blue-600"></i> Code Review
                    </button>
                    <button 
                      onClick={() => handleAction('rewrite')} 
                      disabled={state.isLoading || !state.code.trim()} 
                      className="flex-1 sm:flex-none px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      <i className="fa-solid fa-wand-magic-sparkles text-blue-600"></i> Rewrite
                    </button>
                    <button 
                      onClick={() => handleAction('run')} 
                      disabled={state.isLoading || !state.code.trim()} 
                      className="flex-1 sm:flex-none px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {state.isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <i className="fa-solid fa-play"></i>} 
                      Run Code
                    </button>
                  </div>
                </div>
              </div>
            )}

            {state.activeTab === 'review' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm min-h-[650px] flex flex-col animate-in slide-in-from-right duration-500">
                <div className="mb-8 border-b border-slate-100 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-black text-3xl text-slate-900">AI Code Analysis</h3>
                    <button 
                      onClick={() => setState(p => ({ ...p, activeTab: 'editor' }))} 
                      className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    >
                      <i className="fa-solid fa-pen mr-2"></i> Edit Code
                    </button>
                  </div>
                  <p className="text-slate-500 font-medium">Detailed findings categorized by risk level</p>
                </div>

                {state.isLoading ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <div className="relative mb-8">
                      <div className="w-20 h-20 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
                      <i className="fa-solid fa-magnifying-glass absolute inset-0 m-auto text-blue-600 text-2xl animate-pulse"></i>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Analyzing Architecture...</h4>
                    <p className="text-slate-500 max-w-xs">Our AI is checking for security patterns, logic errors, and performance gaps.</p>
                  </div>
                ) : state.analysis ? (
                  <div className="space-y-8 overflow-y-auto max-h-[700px] pr-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <MetricCard icon="fa-radiation" label="Critical" count={state.analysis.critical} theme="red" />
                      <MetricCard icon="fa-triangle-exclamation" label="High" count={state.analysis.high} theme="orange" />
                      <MetricCard icon="fa-circle-exclamation" label="Medium" count={state.analysis.medium} theme="yellow" />
                      <MetricCard icon="fa-circle-info" label="Low" count={state.analysis.low} theme="blue" />
                    </div>
                    <div className="prose prose-slate prose-lg max-w-none bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                      <div dangerouslySetInnerHTML={{ __html: marked.parse(state.analysis.content) }} />
                    </div>
                  </div>
                ) : (
                   <EmptyState icon="fa-shield-heart" message="Run a code review to see the analysis report." />
                )}
              </div>
            )}

            {state.activeTab === 'rewrite' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm min-h-[650px] flex flex-col animate-in slide-in-from-right duration-500">
                <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
                  <div>
                    <h3 className="font-black text-3xl text-slate-900">Refactored Version</h3>
                    <p className="text-slate-500 font-medium">Clean, optimized code following industry standards</p>
                  </div>
                  {state.rewritten && (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(state.rewritten?.code || '');
                        alert("Copied!");
                      }} 
                      className="bg-blue-600 text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                    >
                      <i className="fa-regular fa-copy"></i> Copy Implementation
                    </button>
                  )}
                </div>

                {state.isLoading ? (
                  <div className="flex-grow flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 mb-6 animate-bounce">
                      <i className="fa-solid fa-wand-sparkles text-3xl"></i>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Reimagining Code...</h4>
                    <p className="text-slate-500">Applying design patterns and structural optimizations.</p>
                  </div>
                ) : state.rewritten ? (
                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 flex-grow overflow-hidden">
                    <div className="xl:col-span-2 space-y-6 overflow-y-auto max-h-[500px] pr-4">
                       <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                          <h4 className="text-blue-900 font-black mb-3 text-sm uppercase tracking-wider">AI Strategy</h4>
                          <div className="text-blue-800 text-sm leading-relaxed prose prose-sm prose-blue" dangerouslySetInnerHTML={{ __html: marked.parse(state.rewritten.explanation) }} />
                       </div>
                    </div>
                    <div className="xl:col-span-3 bg-slate-950 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                      <div className="bg-slate-900 px-4 py-2 flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/30"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/30"></div>
                        <span className="ml-2 text-[10px] text-slate-500 font-bold font-mono">optimized_source.{state.language === 'javascript' ? 'js' : state.language === 'python' ? 'py' : 'txt'}</span>
                      </div>
                      <pre className="p-6 overflow-auto text-sm font-mono flex-grow custom-scrollbar">
                        <code className={`language-${state.language}`}>{state.rewritten.code}</code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <EmptyState icon="fa-sparkles" message="Generate a rewrite to see the refactored implementation." />
                )}
              </div>
            )}

            {state.activeTab === 'run' && (
              <div className="bg-slate-950 rounded-3xl shadow-2xl min-h-[650px] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
                <div className="bg-slate-900 border-b border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-blue-400">
                      <i className="fa-solid fa-terminal text-sm"></i>
                    </div>
                    <h3 className="font-bold text-white text-lg">V-Environment</h3>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
                    <button 
                      onClick={() => setRunTabMode('preview')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${runTabMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <i className="fa-solid fa-eye mr-1.5"></i> Preview
                    </button>
                    <button 
                      onClick={() => setRunTabMode('console')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${runTabMode === 'console' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <i className="fa-solid fa-list mr-1.5"></i> Console
                    </button>
                  </div>

                  <div className="hidden md:flex px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                    Runtime Ready
                  </div>
                </div>
                
                <div className="flex-grow flex flex-col relative">
                  {state.isLoading ? (
                    <div className="absolute inset-0 z-10 bg-slate-950 flex flex-col items-center justify-center text-center p-8">
                      <div className="w-12 h-12 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-4" />
                      <p className="text-blue-400 font-mono text-sm">{">"} Initializing simulation trace...</p>
                    </div>
                  ) : state.output ? (
                    <>
                      {runTabMode === 'preview' && (
                        <div className="flex-grow bg-white flex flex-col">
                          {state.output.html ? (
                            <iframe 
                              title="Simulation Preview"
                              className="w-full flex-grow border-none"
                              srcDoc={state.output.html}
                              sandbox="allow-scripts"
                            />
                          ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                              <i className="fa-solid fa-image text-5xl mb-4 opacity-20"></i>
                              <p className="max-w-xs font-medium">No visual component detected for this execution. Check the Console tab.</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {runTabMode === 'console' && (
                        <div className="flex-grow p-8 font-mono text-sm overflow-y-auto leading-loose">
                          <div className="space-y-6">
                            <div>
                              <span className="text-slate-600 mr-2"># STDOUT</span>
                              <pre className="text-blue-300 bg-slate-900/40 p-6 rounded-xl border border-slate-800/50 mt-2 whitespace-pre-wrap">{state.output.stdout || "(No output data generated)"}</pre>
                            </div>
                            {state.output.stderr && (
                              <div>
                                <span className="text-red-900 mr-2"># STDERR</span>
                                <pre className="text-red-400 bg-red-950/20 p-6 rounded-xl border border-red-900/30 mt-2 whitespace-pre-wrap">{state.output.stderr}</pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-40">
                      <i className="fa-solid fa-play text-4xl mb-4"></i>
                      <p className="font-bold">Waiting for program execution...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {state.activeTab === 'help' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm overflow-y-auto max-h-[700px]">
                <h3 className="text-2xl font-bold mb-6 pb-2 border-b">Local Setup & Troubleshooting</h3>
                
                <section className="mb-8">
                  <h4 className="text-lg font-bold text-red-600 mb-3">Fixing Terminal & Path Errors</h4>
                  <div className="p-5 bg-red-50 border-2 border-red-100 rounded-2xl mb-6 text-sm text-red-800 shadow-sm">
                    <p className="font-black mb-3 flex items-center gap-2"><i className="fa-solid fa-circle-exclamation text-lg"></i> Fatal Error: path contains special characters</p>
                    <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                      <li><strong>The Issue:</strong> Your current path <code>ai-code-review-&-rewrite-agent (1)</code> contains <code>&</code> and <code>()</code>. PowerShell cannot parse ampersands, and Node.js cannot find modules in folders with parentheses on some Windows versions.</li>
                      <li><strong>The Fix:</strong> Close your editor. Rename the folder to <strong><code>code-review-agent</code></strong>. Delete the <code>node_modules</code> folder if it exists. Re-open terminal in the NEW folder and run <code>npm install</code>.</li>
                    </ul>
                  </div>
                  
                  <h4 className="text-lg font-bold text-blue-600 mb-3">Correct Installation Guide</h4>
                  <div className="bg-slate-900 rounded-2xl p-6 text-blue-100 font-mono text-sm space-y-4 shadow-xl">
                    <div>
                      <p className="text-slate-500 mb-1"># 1. Rename your folder to remove ALL symbols/spaces</p>
                      <code>cd code-review-agent</code>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1"># 2. Install all dependencies</p>
                      <code>npm install</code>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1"># 3. Start the application</p>
                      <code>npm run dev</code>
                    </div>
                  </div>
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-2">Architectural Logic</h4>
                      <p className="text-sm text-slate-600">The core engine uses Gemini 3 Flash for low-latency analysis. It detects structural flaws and provides refactored production code automatically.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-2">Web Simulation</h4>
                      <p className="text-sm text-slate-600">Supports live HTML/CSS/JS preview using a sandboxed iframe. If your code is visual, the Environment tab will automatically render a preview.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className={`fixed bottom-24 right-8 w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-3xl shadow-2xl flex-col z-50 overflow-hidden transition-all duration-300 transform ${chatOpen ? 'scale-100 opacity-100 flex' : 'scale-95 opacity-0 pointer-events-none hidden'}`}>
        <div className="bg-slate-950 p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <i className="fa-solid fa-headset text-xs"></i>
            </div>
            <div>
              <span className="text-white font-black text-sm block">Code Assistant</span>
              <span className="text-[10px] text-green-400 font-bold uppercase">Online Now</span>
            </div>
          </div>
          <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto h-[400px] flex flex-col gap-5 bg-slate-50/50 scroll-smooth">
          {chatMessages.length === 0 && (
            <div className="text-center mt-20">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Start a conversation</p>
              <p className="text-slate-500 text-sm">Ask about optimization patterns or security fixes.</p>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`max-w-[90%] p-4 rounded-2xl text-sm shadow-sm leading-relaxed ${msg.role === 'user' ? 'self-end bg-blue-600 text-white rounded-tr-none' : 'self-start bg-white border border-slate-200 text-slate-800 rounded-tl-none prose prose-slate prose-sm'}`}>
              <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
            </div>
          ))}
        </div>
        <div className="p-5 border-t bg-white">
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="How can I optimize this loop?"
              className="flex-grow bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl w-12 h-12 flex items-center justify-center transition-all shadow-lg shadow-blue-500/20 active:scale-90">
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>

      <button onClick={() => setChatOpen(!chatOpen)} className="fixed bottom-8 right-8 bg-slate-900 hover:bg-slate-800 text-white w-16 h-16 rounded-3xl shadow-2xl flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all">
        {chatOpen ? <i className="fa-solid fa-chevron-down text-xl"></i> : <i className="fa-solid fa-comments text-2xl"></i>}
      </button>
    </div>
  );
};

const MetricCard: React.FC<{ icon: string; label: string; count: number; theme: 'red' | 'orange' | 'yellow' | 'blue' }> = ({ icon, label, count, theme }) => {
  const themes = {
    red: 'bg-red-50 border-red-100 text-red-600 icon:text-red-600/30',
    orange: 'bg-orange-50 border-orange-100 text-orange-600 icon:text-orange-600/30',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-600 icon:text-yellow-600/30',
    blue: 'bg-blue-50 border-blue-100 text-blue-600 icon:text-blue-600/30',
  };
  return (
    <div className={`${themes[theme]} border-2 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group transition-all hover:-translate-y-1`}>
      <i className={`fa-solid ${icon} absolute top-2 right-2 text-2xl opacity-10 group-hover:opacity-20 transition-opacity`}></i>
      <div className="text-[10px] font-black uppercase tracking-tighter mb-1 opacity-60">{label}</div>
      <div className="text-3xl font-black">{count}</div>
=======
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AssistantPanel } from './components/AssistantPanel';
import { Login } from './components/Login';
import { analyzeCode, rewriteCode, runSimulatedCode } from './services/geminiService';
import { TabType, User, CodeReviewResult, CodeRewriteResult, TerminalOutput, HistoryItem } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const [code, setCode] = useState('/* Sample CSS */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);\n  color: white;\n  font-family: system-ui;\n}\n\n.card {\n  padding: 3rem;\n  background: rgba(255,255,255,0.1);\n  backdrop-filter: blur(12px);\n  border-radius: 1.5rem;\n  border: 1px solid rgba(255,255,255,0.2);\n  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);\n  text-align: center;\n}\n\n.card h1 {\n  font-size: 2.5rem;\n  margin-bottom: 1rem;\n  font-weight: 800;\n}');
  const [language, setLanguage] = useState('css');
  const [focus, setFocus] = useState<string[]>(['Bugs', 'Security']);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Results & History
  const [review, setReview] = useState<CodeReviewResult | null>(null);
  const [rewrite, setRewrite] = useState<CodeRewriteResult | null>(null);
  const [terminal, setTerminal] = useState<TerminalOutput | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('code_reviewer_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState<string | null>(null);

  // Sync history to localStorage
  useEffect(() => {
    localStorage.setItem('code_reviewer_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (code.length > 5) {
      const detection = (window as any).hljs.highlightAuto(code);
      if (detection.language && detection.language !== language) {
        setLanguage(detection.language);
      }
    }
  }, [code, language]);

  const addToHistory = (type: HistoryItem['type'], summary: string, result: any) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type,
      language,
      codePreview: code.substring(0, 80) + (code.length > 80 ? '...' : ''),
      resultSummary: summary,
      fullCode: code,
      result: result
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setCode(item.fullCode);
    setLanguage(item.language);
    if (item.type === 'Review') {
      setReview(item.result);
      setActiveTab('review');
    } else if (item.type === 'Rewrite') {
      setRewrite(item.result);
      setActiveTab('rewrite');
    } else if (item.type === 'Run') {
      setTerminal(item.result);
      setActiveTab('output');
    }
  };

  const handleReview = async () => {
    setLoading('review');
    setActiveTab('review');
    setReview(null); // Clear previous output
    try {
      const result = await analyzeCode(code, language, focus, (text) => {
        setReview({ counts: {}, markdown: text, suggestions: [] });
      });
      setReview(result);
      addToHistory('Review', 'Analysis completed', result);
    } catch (e: any) {
       alert(e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleRewrite = async () => {
    setLoading('rewrite');
    setActiveTab('rewrite');
    setRewrite(null); // Clear previous output
    try {
      const result = await rewriteCode(code, language, (text) => {
        setRewrite({
          rewrittenCode: "",
          summary: "Processing...",
          improvements: [],
          explanation: text
        });
      });
      setRewrite(result);
      addToHistory('Rewrite', result.summary.substring(0, 50) + '...', result);
    } catch (e: any) {
       alert(e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleRun = async () => {
    setLoading('run');
    setActiveTab('output');
    setTerminal(null); // Clear previous output immediately
    try {
      const result = await runSimulatedCode(code, language);
      setTerminal(result);
      addToHistory('Run', result.stdout.substring(0, 50) + '...', result);
    } catch (e: any) {
       alert(e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCode(content);
        setActiveTab('editor');
      }
    };
    reader.readAsText(file);
    // Reset the input value to allow the same file to be uploaded again if needed
    e.target.value = '';
  };

  const handleLogout = () => {
    setUser(null);
    setShowSettings(false);
  };

  if (!user) return <Login onLogin={setUser} />;

  const isWebLanguage = ['css', 'html', 'xml', 'svg'].includes(language.toLowerCase());

  const actionButtons = (
    <div className="flex items-center gap-3">
      <button 
        onClick={handleRun}
        disabled={!!loading}
        className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
      >
        <i className={`fas ${loading === 'run' ? 'fa-circle-notch animate-spin' : 'fa-play'} text-xs`}></i> Run
      </button>
      <button 
        onClick={handleRewrite}
        disabled={!!loading}
        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
      >
        <i className={`fas ${loading === 'rewrite' ? 'fa-circle-notch animate-spin' : 'fa-wand-magic-sparkles'} text-xs`}></i> Rewrite
      </button>
      <button 
        onClick={handleReview}
        disabled={!!loading}
        className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-orange-500 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
      >
        <i className={`fas ${loading === 'review' ? 'fa-circle-notch animate-spin' : 'fa-bolt'} text-xs`}></i> Analyze
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenSettings={() => setShowSettings(true)} 
        onOpenProfile={() => setShowProfile(true)}
        user={user}
      />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col p-4 md:p-8 max-w-[1400px] mx-auto w-full relative">
          <header className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">Project Workspace</h1>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/20">
                <i className="fas fa-microchip text-indigo-200 animate-pulse"></i>
                <span className="uppercase tracking-widest">LANG-DETECTED:</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded uppercase tracking-tighter">{language}</span>
              </div>
            </div>
            {actionButtons}
          </header>

          <div className="grid grid-cols-1 gap-6 flex-1">
            {activeTab === 'editor' && (
              <div className="bg-white rounded-2xl border border-slate-custom shadow-xl flex flex-col overflow-hidden h-full min-h-[700px]">
                 <div className="px-6 py-4 border-b border-slate-custom flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">MAIN EDITOR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all flex items-center gap-2 cursor-pointer">
                        <i className="fas fa-upload"></i> Upload File
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>
                 </div>
                 <div className="flex-1 relative editor-bg">
                    <textarea 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="absolute inset-0 w-full h-full p-10 code-font text-slate-700 focus:outline-none resize-none bg-transparent"
                      spellCheck={false}
                    />
                 </div>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="bg-white rounded-2xl border border-slate-custom shadow-xl flex flex-col overflow-hidden h-full min-h-[600px]">
                <div className="px-6 py-4 border-b border-slate-custom flex justify-between items-center bg-slate-50">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">REVIEW ANALYSIS</span>
                </div>
                <div className="p-10">
                  {review?.markdown ? (
                    <div className="prose max-w-none prose-slate animate-in fade-in duration-300" dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(review.markdown) }} />
                  ) : (
                    <div className="text-center py-32 opacity-20">
                      {loading === 'review' ? (
                        <i className="fas fa-circle-notch animate-spin text-8xl mb-6 text-orange-600"></i>
                      ) : (
                        <i className="fas fa-magnifying-glass text-8xl mb-6"></i>
                      )}
                      <p className="text-lg font-medium">{loading === 'review' ? 'AI is analyzing your code...' : 'Initialize an analysis to reveal insights.'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'rewrite' && (
               <div className="space-y-6">
                 <div className="bg-white rounded-2xl border border-slate-custom shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                    <div className="px-6 py-4 border-b border-slate-custom bg-slate-50 flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">REFACTORED RESULT</span>
                      {rewrite?.rewrittenCode && (
                        <button 
                          onClick={() => rewrite && navigator.clipboard.writeText(rewrite.rewrittenCode)}
                          className="text-xs font-black text-orange-600 flex items-center gap-2 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-all active:scale-95"
                        >
                          <i className="fas fa-copy"></i> COPY RAW CODE
                        </button>
                      )}
                    </div>
                    <div className="p-10 bg-white space-y-10">
                      {rewrite ? (
                        <div className="animate-in fade-in duration-300">
                          <div className="prose max-w-none prose-slate border-b border-slate-100 pb-10" 
                               dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(rewrite.explanation) }} />
                          
                          {rewrite.rewrittenCode && (
                            <div className="space-y-4 mt-8">
                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fas fa-sparkles text-emerald-500"></i> FINAL OPTIMIZED CODE
                              </h3>
                              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xl">
                                <pre className="p-8 bg-[#0f172a] text-slate-100 code-font text-sm overflow-x-auto leading-relaxed custom-scrollbar">
                                  <code>{rewrite.rewrittenCode}</code>
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-32 flex flex-col items-center gap-4 opacity-20">
                           {loading === 'rewrite' ? (
                             <i className="fas fa-circle-notch animate-spin text-8xl text-emerald-600"></i>
                           ) : (
                             <i className="fas fa-wand-magic-sparkles text-8xl text-emerald-600"></i>
                           )}
                           <p className="font-black text-lg">{loading === 'rewrite' ? 'Sequencing optimization patterns...' : 'Awaiting Refactoring Sequence...'}</p>
                        </div>
                      )}
                    </div>
                 </div>
               </div>
            )}

            {activeTab === 'output' && (
              <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden h-[750px] flex flex-col border border-slate-800">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                   <div className="flex items-center gap-4">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                        {isWebLanguage ? 'VISUAL PREVIEW ENVIRONMENT' : 'SIMULATED TERMINAL'}
                      </span>
                   </div>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                  {terminal ? (
                    <div className="flex-1 flex flex-col w-full h-full animate-in fade-in duration-500">
                       <div className="flex-1 flex overflow-hidden">
                          {!isWebLanguage ? (
                            <div className="flex-1 p-10 code-font text-sm overflow-y-auto custom-scrollbar bg-slate-900/50">
                               <div className="space-y-8">
                                  <div>
                                    <p className="text-emerald-400 font-bold tracking-[0.2em] text-[10px] mb-4 flex items-center gap-2">
                                      <i className="fas fa-chevron-right text-[8px]"></i> SYSTEM STDOUT
                                    </p>
                                    <pre className="text-slate-300 ml-2 whitespace-pre-wrap code-font bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 shadow-inner">
                                      {terminal.stdout || "(no output returned)"}
                                    </pre>
                                  </div>
                               </div>
                            </div>
                          ) : (
                            <div className="flex-1 bg-white relative flex flex-col">
                              <div className="absolute top-6 right-6 z-10 pointer-events-none">
                                 <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl ring-4 ring-white flex items-center gap-2">
                                   <i className="fas fa-eye"></i> LIVE RENDER
                                 </span>
                              </div>
                              <div className="w-full h-full bg-[#f8fafc] p-0.5 overflow-hidden">
                                <iframe 
                                  key={terminal.stdout} // Force re-render iframe on new output
                                  title="Web Preview"
                                  srcDoc={terminal.stdout}
                                  className="w-full h-full border-none bg-white"
                                  sandbox="allow-scripts"
                                />
                              </div>
                            </div>
                          )}
                       </div>

                       {terminal.stderr && (
                          <div className="bg-red-950/20 border-t border-red-900/30 p-6 max-h-40 overflow-y-auto custom-scrollbar">
                             <p className="text-red-400 font-bold tracking-[0.2em] text-[10px] mb-2 flex items-center gap-2">
                               <i className="fas fa-triangle-exclamation text-[8px]"></i> RUNTIME STDERR
                             </p>
                             <pre className="text-red-300 ml-2 whitespace-pre-wrap code-font text-xs">
                               {terminal.stderr}
                             </pre>
                          </div>
                       )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-700 bg-slate-900">
                       <div className="text-center">
                          {loading === 'run' ? (
                            <i className="fas fa-circle-notch animate-spin text-7xl mb-6 text-blue-500 opacity-50"></i>
                          ) : (
                            <i className="fas fa-terminal text-7xl mb-6 opacity-10"></i>
                          )}
                          <p className="text-sm font-bold opacity-30 tracking-widest uppercase">
                            {loading === 'run' ? 'Initializing Execution Sandbox...' : 'Environment Ready for Initialization'}
                          </p>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-2xl border border-slate-custom shadow-xl overflow-hidden min-h-[600px]">
                <div className="px-6 py-4 border-b border-slate-custom flex justify-between items-center bg-slate-50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">SESSION ARCHIVE</span>
                  <button 
                    onClick={() => setHistory([])}
                    className="text-[10px] text-red-500 hover:text-red-700 font-black uppercase px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-all"
                  >
                    Purge All Data
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {history.length > 0 ? history.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => loadHistoryItem(item)}
                      className="p-8 hover:bg-slate-50 transition-all group cursor-pointer border-l-4 border-transparent hover:border-blue-500"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            item.type === 'Review' ? 'bg-orange-100 text-orange-600' :
                            item.type === 'Rewrite' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                        <i className="fas fa-chevron-right text-slate-200 group-hover:text-blue-500 transition-colors"></i>
                      </div>
                      <p className="text-sm font-bold text-slate-700 mb-2 line-clamp-1 code-font tracking-tight">{item.codePreview}</p>
                      <p className="text-xs text-slate-400 italic font-medium">{item.resultSummary}</p>
                    </div>
                  )) : (
                    <div className="py-40 text-center opacity-10">
                      <i className="fas fa-folder-open text-8xl mb-6"></i>
                      <p className="text-lg font-black uppercase tracking-[0.2em]">Archive Empty</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 flex items-center gap-3">
                  <i className="fas fa-sliders text-blue-600"></i> WORKSPACE CONFIG
                </h3>
                <button onClick={() => setShowSettings(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">Auto-save Pulse</p>
                      <p className="text-xs text-slate-500 font-medium">Commit sessions to local vault</p>
                    </div>
                    <div className="w-14 h-7 bg-blue-600 rounded-full relative cursor-pointer ring-4 ring-blue-100">
                      <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-lg"></div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Core AI Intelligence</label>
                    <select className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-700">
                      <option>Groq Llama 3.3 (Versatile Engine)</option>
                      <option>Groq Llama 3.1 (Instant Response)</option>
                    </select>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all group"
                    >
                      <span className="font-black text-xs uppercase tracking-widest">Terminate Session</span>
                      <i className="fas fa-power-off group-hover:rotate-90 transition-transform"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-slate-50 text-center">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-4 bg-[#1e293b] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
                >
                  Apply Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfile && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="h-32 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 relative">
                <button onClick={() => setShowProfile(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white/80 hover:bg-black/40 transition-all">
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
              <div className="px-10 pb-10 -mt-16 text-center relative">
                <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center text-4xl text-blue-600 font-black mx-auto border-8 border-white mb-6">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{user.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">{user.role || 'Member'}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <p className="text-2xl font-black text-blue-600">{history.length}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Archived</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <p className="text-2xl font-black text-emerald-500">Live</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Status</p>
                  </div>
                </div>

                <div className="text-left space-y-4 px-2">
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <i className="fas fa-envelope text-xs"></i>
                    </div>
                    <span className="text-sm font-bold truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <i className="fas fa-shield-halved text-xs"></i>
                    </div>
                    <span className="text-sm font-bold tracking-tight">Security Cleared</span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowProfile(false)}
                  className="w-full mt-10 py-4 bg-blue-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  Return to Console
                </button>
              </div>
            </div>
          </div>
        )}

        <AssistantPanel currentCode={code} />
      </div>
>>>>>>> 3388560 (first commit)
    </div>
  );
};

<<<<<<< HEAD
const EmptyState: React.FC<{ icon: string; message: string }> = ({ icon, message }) => (
  <div className="flex-grow flex flex-col items-center justify-center text-slate-300 p-12">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
      <i className={`fa-solid ${icon} text-4xl`}></i>
    </div>
    <p className="font-bold text-slate-400 text-center max-w-[240px] leading-relaxed">{message}</p>
  </div>
);

=======
>>>>>>> 3388560 (first commit)
export default App;
