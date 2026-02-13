
import React from 'react';

export const HowItWorksTab: React.FC = () => {
  const steps = [
    {
      icon: 'fas fa-paste',
      title: 'Paste Your Code',
      desc: 'Select your programming language and paste the source code you want to review or optimize.',
      color: 'text-blue-400'
    },
    {
      icon: 'fas fa-brain',
      title: 'Get Instant Review',
      desc: 'Our AI analyzes the code in real-time for bugs, performance bottlenecks, and security flaws.',
      color: 'text-purple-400'
    },
    {
      icon: 'fas fa-wand-sparkles',
      title: 'Auto-Rewrite',
      desc: 'Get production-ready, refactored code that follows industry best practices automatically.',
      color: 'text-emerald-400'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent inline-block">
          Intelligent Code Review & Rewrite
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Experience the future of software development with real-time AI-driven analysis. Identify bottlenecks and fix issues before they reach production.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-800 -translate-y-1/2 z-0"></div>
        
        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center flex flex-col items-center hover:border-slate-700 transition-all group">
            <div className={`w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform ${step.color}`}>
              <i className={step.icon}></i>
            </div>
            <h3 className="font-bold text-lg mb-3">{step.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            <div className="mt-6 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
              {idx + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
           <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
             <i className="fas fa-shield-halved text-indigo-400"></i>
             Enterprise-Grade Analysis
           </h3>
           <p className="text-slate-400 text-sm mb-6 leading-relaxed">
             Our model uses deep contextual understanding to spot logic errors that traditional static analysis tools miss. It checks for SQL injection, cross-site scripting, and other security vulnerabilities in real-time.
           </p>
           <ul className="space-y-3">
             {['Detects complex logical bugs', 'Identifies O(n²) performance patterns', 'Ensures consistent naming conventions', 'Validates proper error handling'].map(feat => (
               <li key={feat} className="flex items-center gap-3 text-sm text-slate-300">
                 <i className="fas fa-check-circle text-emerald-500"></i>
                 {feat}
               </li>
             ))}
           </ul>
        </div>
        <div className="bg-indigo-600/5 border border-indigo-500/20 p-1 rounded-2xl">
           <img 
            src="https://picsum.photos/seed/code-review/800/600" 
            alt="AI Concept" 
            className="rounded-xl grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
           />
        </div>
      </div>
    </div>
  );
};
