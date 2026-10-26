import React from 'react';
import { 
  Menu, 
  Search, 
  Layers, 
  Settings, 
  Bell, 
  ShieldCheck, 
  Cloud,
  ExternalLink
} from 'lucide-react';
import { getApiBaseUrl } from '../config.ts';

interface NavbarProps {
  activeTab: 'home' | 'dashboard' | 'verify' | 'register' | 'revoke';
  setActiveTab: (tab: 'home' | 'dashboard' | 'verify' | 'register' | 'revoke') => void;
  onOpenArchitecture: () => void;
  onOpenSettings: () => void;
  onOpenMobileSidebar: () => void;
  activityCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenArchitecture,
  onOpenSettings,
  onOpenMobileSidebar,
  activityCount
}) => {
  const currentApiUrl = getApiBaseUrl();

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard / Credential Overview';
      case 'verify':
        return 'Verification / Authenticate Record';
      case 'register':
        return 'Administration / Register Certificate';
      case 'revoke':
        return 'Administration / Revoke Certificate';
      case 'home':
        return 'Overview / System Architecture';
      default:
        return 'CertiVerify';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left Zone: Mobile Menu Toggle + Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Brand / Subtitle / Breadcrumbs */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="hidden sm:flex flex-col">
                <span className="font-extrabold text-slate-900 text-sm leading-tight tracking-tight">CertiVerify</span>
                <span className="text-[9px] font-semibold text-slate-400 leading-none">Certificate Issuance and Authentication Platform</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-xs font-semibold text-slate-600 truncate max-w-[180px] sm:max-w-xs">
                {getBreadcrumb()}
              </span>
            </div>
          </div>

          {/* Right Zone: System Status, Settings & Quick Verify */}
          <div className="flex items-center gap-2.5">
            
            {/* Live API Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-600 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-900 font-semibold">AWS:</span>
              <span className="truncate max-w-[180px]">{currentApiUrl.replace('https://', '')}</span>
            </div>

            {/* System Architecture Guide */}
            <button
              onClick={onOpenArchitecture}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
              title="View AWS System Spec & S3 Deployment Guide"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Architecture</span>
            </button>

            {/* UI Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
              title="UI & Endpoint Settings"
            >
              <Settings className="w-4 h-4 text-slate-500" />
            </button>

            {/* Quick Verify Primary Action */}
            <button
              onClick={() => setActiveTab('verify')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-sm shadow-blue-500/20 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Verify ID</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
