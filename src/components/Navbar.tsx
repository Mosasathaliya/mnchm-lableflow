import React from 'react';
import { LayoutDashboard, Layers, PlusCircle, History, Settings, LogOut, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'products' | 'history' | 'settings';
  onNavigate: (view: 'dashboard' | 'products' | 'history' | 'settings') => void;
  onOpenGenerateModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenGenerateModal,
  onLogout,
}) => {
  return (
    <header className="bg-[#071d3a] text-white border-b border-[#14325a] shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <img
              src="/logo.png"
              alt="MNChem LabelFlow"
              className="h-10 w-10 object-contain rounded bg-white/10 p-0.5 border border-white/20 shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">MNChem</span>
                <span className="font-light text-lg tracking-tight text-[#00a3e0]">LabelFlow</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#00a3e0]/20 text-[#00a3e0] px-1.5 py-0.5 rounded border border-[#00a3e0]/40">
                  Studio
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium tracking-wider hidden sm:block">
                CHEMICAL PACKAGING & COMPLIANCE LABELS
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-[#00a3e0] text-white shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('products')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'products'
                  ? 'bg-[#00a3e0] text-white shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Product Library</span>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'history'
                  ? 'bg-[#00a3e0] text-white shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Order History</span>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'settings'
                  ? 'bg-[#00a3e0] text-white shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Quick Action & User Section */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenGenerateModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-sm font-semibold bg-[#00a3e0] hover:bg-[#028fc7] text-white shadow-sm transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Order Label</span>
              <span className="sm:hidden">Generate</span>
            </button>

            <div className="hidden lg:flex items-center text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              <span>Auth Active</span>
            </div>

            <button
              onClick={onLogout}
              title="Logout from MNChem Studio"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded text-sm text-slate-300 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 border border-transparent transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-300" />
              <span className="hidden sm:inline text-xs">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
