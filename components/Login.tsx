
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth with provided or default info
    onLogin({ 
      email, 
      name: isSignup ? name : 'John Developer',
      role: 'Senior Software Engineer'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="max-w-md w-full space-y-8 bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
        
        <div className="relative text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl text-white mb-6 shadow-xl shadow-indigo-600/20">
            <i className="fas fa-robot"></i>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isSignup ? 'Join the next generation of code review' : 'AI-Powered Code Analysis & Rewriting'}
          </p>
        </div>

        <form className="mt-8 space-y-6 relative" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isSignup && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <i className="fas fa-user"></i>
                  </div>
                  <input
                    type="text"
                    required={isSignup}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <i className="fas fa-envelope"></i>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <i className="fas fa-lock"></i>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:-translate-y-0.5"
          >
            <i className={`fas ${isSignup ? 'fa-user-plus' : 'fa-sign-in-alt'} mr-2`}></i> 
            {isSignup ? 'Create Account' : 'Sign In'}
          </button>

          <div className="text-center">
            <button 
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
