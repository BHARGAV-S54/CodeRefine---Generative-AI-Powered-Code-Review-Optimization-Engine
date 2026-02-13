
import React from 'react';
import { TabType, User } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenSettings, 
  onOpenProfile,
  user 
}) => {
  const menuItems = [
    { id: 'editor', icon: 'fa-code', label: 'Editor' },
    { id: 'review', icon: 'fa-magnifying-glass', label: 'Review' },
    { id: 'rewrite', icon: 'fa-wand-magic-sparkles', label: 'Rewrite' },
    { id: 'output', icon: 'fa-terminal', label: 'Output' },
    { id: 'history', icon: 'fa-clock-rotate-left', label: 'History' },
  ];

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <aside className="w-20 md:w-64 bg-obsidian text-slate-400 h-screen sticky top-0 flex flex-col items-center md:items-stretch transition-all border-r border-slate-800 z-30">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
          <i className="fas fa-robot"></i>
        </div>
        <span className="hidden md:block font-bold text-white tracking-tight text-lg">CodeAgent Pro</span>
      </div>

      <nav className="flex-1 px-4 mt-8 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="hidden md:block font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800/50">
        <div className="space-y-1">
          <button 
            onClick={onOpenSettings}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-slate-800/50 hover:text-slate-200 group"
          >
            <i className="fas fa-gear w-5 text-slate-500 group-hover:text-blue-400"></i>
            <span className="hidden md:block font-medium text-sm">Settings</span>
          </button>
          <button 
            onClick={onOpenProfile}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-slate-800/50 hover:text-slate-200 group"
          >
            <i className="fas fa-circle-user w-5 text-slate-500 group-hover:text-blue-400"></i>
            <span className="hidden md:block font-medium text-sm">Profile</span>
          </button>
        </div>
        
        <div className="hidden md:flex items-center gap-3 mt-4 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
            {userInitials}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
