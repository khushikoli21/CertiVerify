import React from 'react';
import { ShieldCheck, Search, PlusCircle, Ban, Layers, Settings, ExternalLink, Award } from 'lucide-react';
import { getApiBaseUrl } from '../config.ts';

interface NavbarProps {
  activeTab: 'home' | 'verify' | 'register' | 'revoke';
  setActiveTab: (tab: 'home' | 'verify' | 'register' | 'revoke') => void;
  onOpenArchitecture: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenArchitecture,
  onOpenSettings
}) => {
  const currentApiUrl = getApiBaseUrl();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* Zone 1: Brand Wordmark with Academic Security Crest */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-[1.03] transition-all">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                  <Award className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    CertiVerify
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                    AWS Cloud
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 -mt-0.5">
                  Digital Certificate Verification System
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Refined Segmented Capsule) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'home'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Home / Overview
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'verify'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Verify Certificate</span>
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'register'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register (Admin)</span>
            </button>
            <button
              onClick={() => setActiveTab('revoke')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'revoke'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Revoke (Admin)</span>
            </button>
          </nav>

          {/* Zone 3: Quick Action & Architecture Spec Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenArchitecture}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-all shadow-2xs whitespace-nowrap"
              title="View AWS Architecture & S3 Export Guide"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Architecture Spec</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-all shadow-2xs whitespace-nowrap"
              title={`API Gateway: ${currentApiUrl}`}
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">AWS Endpoint</span>
            </button>

            <button
              onClick={() => setActiveTab('verify')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all shadow-sm shadow-blue-500/25 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Verify Now</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-1.5 border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'home' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'verify' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Verify Certificate
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'register' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Register (Admin)
          </button>
          <button
            onClick={() => setActiveTab('revoke')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'revoke' ? 'bg-rose-600 text-white font-semibold shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Revoke (Admin)
          </button>
          <button
            onClick={onOpenArchitecture}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg whitespace-nowrap"
          >
            Architecture
          </button>
        </div>

      </div>
    </header>
  );
};
