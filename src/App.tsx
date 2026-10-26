/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HomeSection } from './components/HomeSection.tsx';
import { VerifySection } from './components/VerifySection.tsx';
import { RegisterSection } from './components/RegisterSection.tsx';
import { RevokeSection } from './components/RevokeSection.tsx';
import { ArchitectureModal } from './components/ArchitectureModal.tsx';
import { ApiSettingsModal } from './components/ApiSettingsModal.tsx';
import { ShieldCheck, Cloud, Server, Database, Award, ArrowUp } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'verify' | 'register' | 'revoke'>('home');
  const [targetCertId, setTargetCertId] = useState<string>('');
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [, setConfigKey] = useState(0);

  // Check URL query parameter ?id=... on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');
      if (urlId && urlId.trim()) {
        setTargetCertId(urlId.trim());
        setActiveTab('verify');
      }
    }
  }, []);

  const handleVerifySearch = (certId: string) => {
    setTargetCertId(certId);
    setActiveTab('verify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToVerify = (certId: string) => {
    setTargetCertId(certId);
    setActiveTab('verify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfigUpdated = () => {
    setConfigKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 antialiased">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {activeTab === 'home' && (
          <HomeSection
            onVerifySearch={handleVerifySearch}
            onNavigateToTab={setActiveTab}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
          />
        )}

        {activeTab === 'verify' && (
          <VerifySection
            key={targetCertId}
            initialCertificateId={targetCertId}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'register' && (
          <RegisterSection
            onCertificateRegistered={(newId) => setTargetCertId(newId)}
            onNavigateToVerify={handleNavigateToVerify}
          />
        )}

        {activeTab === 'revoke' && (
          <RevokeSection
            onNavigateToVerify={handleNavigateToVerify}
          />
        )}

      </main>

      {/* Dignified Academic Footer */}
      <footer className="bg-white border-t border-slate-200/90 py-12 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Brand Information */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base">CertiVerify</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                    Production Build
                  </span>
                </div>
                <p className="text-slate-500 text-xs">
                  AWS Digital Certificate Verification System
                </p>
              </div>
            </div>

            {/* Cloud Architecture Stack Indicator Strip */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
              <span className="inline-flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-medium">Amazon S3</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-purple-500" />
                <span className="font-medium">API Gateway</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-medium">AWS Lambda</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-medium">DynamoDB</span>
              </span>
            </div>

            {/* Quick Actions in Footer */}
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => setIsArchitectureOpen(true)}
                className="px-3 py-1.5 text-blue-600 hover:text-blue-800 font-bold hover:underline transition-colors cursor-pointer"
              >
                S3 Export Guide
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Back to top"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Academic Microproject Attribution */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 text-center sm:text-left">
            <p>
              College Cloud Computing Microproject · Developed by <strong>Naresh Karothia</strong>
            </p>
            <p className="font-mono text-[11px] text-slate-400">
              Region: ap-south-1 · HTTP API (v2) · Single-Table Design
            </p>
          </div>

        </div>
      </footer>

      {/* Architecture Spec & S3 Export Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Runtime API & S3 Settings Modal */}
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigUpdated={handleConfigUpdated}
      />

    </div>
  );
}
