
import React, { useState, useEffect, useRef } from 'react';
import { chatWithAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AssistantPanelProps {
  currentCode: string;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({ currentCode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    const modelMsg: ChatMessage = { role: 'model', text: "" };
    
    setMessages(prev => [...prev, userMsg, modelMsg]);
    setInput('');
    setLoading(true);

    try {
      await chatWithAssistant(input, currentCode, messages, (text) => {
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1] = { role: 'model', text: text };
          }
          return newMessages;
        });
      });
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages.length > 0) {
          newMessages[newMessages.length - 1] = { role: 'model', text: "⚠️ **System Error**: Connectivity interrupted. Please check your configuration." };
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button - Professional Circular FAB */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-[0_10px_40px_rgba(37,99,235,0.4)] flex items-center justify-center hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all z-40 border-4 border-white group"
      >
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 group-hover:hidden"></div>
        <i className="fas fa-robot text-2xl relative"></i>
        {messages.length > 0 && !isOpen && (
           <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white text-[10px] font-black flex items-center justify-center shadow-lg animate-bounce">
             {Math.floor(messages.length / 2)}
           </span>
        )}
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.15)] z-50 flex flex-col animate-in slide-in-from-right duration-300 ease-out border-l border-slate-100">
          
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-lg shadow-inner shadow-white/20 border border-blue-400/30">
                <i className="fas fa-robot"></i>
              </div>
              <div>
                <h3 className="font-black text-base tracking-[0.15em] uppercase">AI ASSISTANT</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Ready to assist</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all group"
            >
              <i className="fas fa-times text-lg group-hover:rotate-90 transition-transform"></i>
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc] custom-scrollbar selection:bg-blue-100"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-10">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-sm flex items-center justify-center text-slate-100 text-4xl mb-8 border border-slate-100/50">
                  <i className="fas fa-sparkles text-indigo-500 opacity-20"></i>
                </div>
                <h4 className="text-slate-800 font-black text-xl mb-3 uppercase tracking-[0.1em]">Welcome, Explorer.</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[280px]">
                  Unlock high-performance coding with your dedicated AI companion. How can I help you build something amazing today?
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`relative group max-w-[88%] ${m.role === 'user' ? 'order-1' : 'order-2'}`}>
                  
                  {/* Bubble - Using improved containment */}
                  <div className={`p-4 rounded-2xl text-[13px] shadow-sm transition-all overflow-hidden border ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none' 
                      : 'bg-white border-slate-200 text-slate-700 rounded-tl-none'
                  }`}>
                    <div 
                      className={`prose prose-sm max-w-none break-words leading-relaxed ${m.role === 'user' ? 'prose-invert' : 'prose-slate'}`}
                      dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(m.text || "") }}
                    />
                  </div>
                  
                  {/* Meta Label */}
                  <div className={`mt-2 flex items-center gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      {m.role === 'user' ? 'USER CONTEXT' : 'AI RESPONSE'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {loading && messages[messages.length-1]?.text === "" && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="relative flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 focus-within:bg-white">
              <textarea 
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message AI Assistant..." 
                className="flex-1 bg-transparent border-none px-3 py-2 text-sm focus:ring-0 outline-none resize-none max-h-32 font-medium text-slate-700 placeholder:text-slate-400 custom-scrollbar"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 shadow-lg shadow-blue-500/20"
              >
                <i className={`fas ${loading ? 'fa-circle-notch animate-spin' : 'fa-paper-plane'} text-sm`}></i>
              </button>
            </div>
            <div className="mt-4 flex justify-center items-center gap-4">
              <div className="h-px bg-slate-100 flex-1"></div>
              <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">
                Shift + Enter for new line
              </p>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
