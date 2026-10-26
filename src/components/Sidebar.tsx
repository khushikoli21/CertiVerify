import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  PlusCircle, 
  Ban, 
  Layers, 
  Settings, 
  ShieldCheck, 
  Award, 
  ExternalLink,
  ChevronRight,
  Database,
  Cloud,
  FileCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'home' | 'dashboard' | 'verify' | 'register' | 'revoke';
  setActiveTab: (tab: 'home' | 'dashboard' | 'verify' | 'register' | 'revoke') => void;
  onOpenArchitecture: () => void;
  onOpenSettings: () => void;
  trackedCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenArchitecture,
  onOpenSettings,
  trackedCount,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems = [
    {
      id: 'home' as const,
      label: 'System Overview',
      icon: ShieldCheck
    },
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: trackedCount > 0 ? trackedCount : undefined
    },
    {
      id: 'verify' as const,
      label: 'Verify Certificate',
      icon: Search
    },
    {
      id: 'register' as const,
      label: 'Register (Admin)',
      icon: PlusCircle
    },
    {
      id: 'revoke' as const,
      label: 'Revoke (Admin)',
      icon: Ban
    }
  ];

  const handleNavClick = (tab: 'home' | 'dashboard' | 'verify' | 'register' | 'revoke') => {
    setActiveTab(tab);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 sm:w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 no-print ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header / Brand Crest */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-start gap-3 text-left group focus:outline-none w-full cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-all shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  CertiVerify
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  AWS
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 block leading-tight mt-0.5 tracking-tight">
                Certificate Issuance and Authentication Platform
              </span>
            </div>
          </button>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
              Core Modules
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* System & Architecture Section */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
              System Engineering
            </span>

            <button
              onClick={() => {
                onOpenArchitecture();
                if (isOpenMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>AWS Architecture</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                if (isOpenMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>UI & API Settings</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Bottom Cloud Architecture Stack Card */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                <span>AWS ap-south-1</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="text-[10px] text-slate-500 space-y-0.5 font-mono">
              <div>API: HTTP API (v2)</div>
              <div>Table: CertificateRecords</div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center">
            CertiVerify · Naresh Karothia
          </div>
        </div>
      </aside>
    </>
  );
};
