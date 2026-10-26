import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Server, 
  Database, 
  Cloud, 
  QrCode, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  FileCheck, 
  Award,
  Zap,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { getApiBaseUrl } from '../config.ts';

interface HomeSectionProps {
  onVerifySearch: (id: string) => void;
  onNavigateToTab: (tab: 'home' | 'verify' | 'register' | 'revoke') => void;
  onOpenArchitecture: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  onVerifySearch,
  onNavigateToTab,
  onOpenArchitecture
}) => {
  const [quickId, setQuickId] = useState('');
  const apiUrl = getApiBaseUrl();

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickId.trim()) {
      onVerifySearch(quickId.trim());
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section with Blueprint Pattern & Ambient Glow */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-14 sm:pb-18 rounded-3xl bg-gradient-to-b from-blue-50/90 via-white to-slate-50 border border-blue-100 shadow-sm bg-grid-pattern">
        
        {/* Subtle Decorative Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 text-center space-y-7">
          
          {/* Microproject Header Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-100/80 border border-blue-200/80 rounded-full text-blue-900 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>AWS Cloud Computing Microproject</span>
            <span className="text-blue-300">|</span>
            <span className="text-blue-700">Region ap-south-1</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15] text-balance">
            Digital Certificate Verification <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
              using Amazon Web Services
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance">
            CertiVerify provides instant, cryptographic academic credential verification 
            using Amazon API Gateway, AWS Lambda compute, and Amazon DynamoDB storage.
          </p>

          {/* Quick Certificate Search Bar */}
          <div className="max-w-xl mx-auto pt-2">
            <form onSubmit={handleQuickSubmit} className="relative flex items-center shadow-xl shadow-blue-950/5 rounded-2xl bg-white p-2 border border-blue-200/90 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
              <div className="pl-3.5 pr-2 text-slate-400">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <input
                type="text"
                value={quickId}
                onChange={(e) => setQuickId(e.target.value)}
                placeholder="Enter Certificate ID (e.g. CERT-2026-001)..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none py-1.5 font-mono"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Verify</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Test Samples */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 text-xs text-slate-500">
              <span className="text-[11px] font-medium text-slate-400">Try testing:</span>
              <button
                type="button"
                onClick={() => onVerifySearch('CERT-2026-001')}
                className="px-2 py-0.5 rounded bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[11px] font-mono transition-colors"
              >
                CERT-2026-001
              </button>
              <button
                type="button"
                onClick={() => onVerifySearch('CERT-AWS-001')}
                className="px-2 py-0.5 rounded bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[11px] font-mono transition-colors"
              >
                CERT-AWS-001
              </button>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] text-slate-500">
                Direct QR URL support: <code className="text-blue-700 font-mono">?id=ID</code>
              </span>
            </div>
          </div>

          {/* Connected AWS Endpoint Indicator */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/95 border border-slate-200 rounded-xl shadow-2xs font-mono text-[11px] text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-900">API Gateway:</span>
              <span className="truncate max-w-[260px] sm:max-w-md">{apiUrl}</span>
            </div>
            <button
              onClick={onOpenArchitecture}
              className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>Architecture Spec</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* Quantitative System Capabilities Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Architecture</span>
            <Cloud className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">100% Serverless</div>
          <p className="text-xs text-slate-500">Zero idle compute cost</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Query Latency</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">&lt; 150 ms</div>
          <p className="text-xs text-slate-500">Single-digit ms DynamoDB lookup</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Storage Layer</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">DynamoDB</div>
          <p className="text-xs text-slate-500">Table: CertificateRecords</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Verification</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">Zero Fake Data</div>
          <p className="text-xs text-slate-500">100% authoritative records</p>
        </div>

      </section>

      {/* Cloud Architecture Pipeline Diagram */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-2xs space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AWS Cloud Topology</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How CertiVerify Operates in AWS
          </h2>
          <p className="text-sm text-slate-600">
            A secure, event-driven credential authentication pipeline spanning 4 decoupled AWS services.
          </p>
        </div>

        {/* 4-Layer Connected Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          
          {/* Step 1: Amazon S3 */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-50/40 to-slate-50/60 border border-slate-200 hover:border-amber-400/80 transition-all space-y-3 group">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Layer 1 · Distribution</div>
              <h3 className="text-base font-bold text-slate-900">Amazon S3</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hosts this compiled static SPA. Highly available and cost-effective delivery for public verifiers and QR scanners.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
              Static Web Hosting
            </div>
          </div>

          {/* Step 2: Amazon API Gateway */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-50/40 to-slate-50/60 border border-slate-200 hover:border-purple-400/80 transition-all space-y-3 group">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Layer 2 · Routing</div>
              <h3 className="text-base font-bold text-slate-900">API Gateway</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Handles HTTP API endpoints with full CORS integration. Authenticates administrator actions via <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border">X-Admin-Key</code>.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
              HTTP API (v2)
            </div>
          </div>

          {/* Step 3: AWS Lambda */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-orange-50/40 to-slate-50/60 border border-slate-200 hover:border-orange-400/80 transition-all space-y-3 group">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Layer 3 · Compute</div>
              <h3 className="text-base font-bold text-slate-900">AWS Lambda</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <code className="text-[11px] font-mono text-orange-700 font-semibold">CertificateVerificationAPI</code> executes business rules, verifies keys, and manages status transitions.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
              Serverless Function
            </div>
          </div>

          {/* Step 4: Amazon DynamoDB */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-50/40 to-slate-50/60 border border-slate-200 hover:border-blue-400/80 transition-all space-y-3 group">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Layer 4 · Database</div>
              <h3 className="text-base font-bold text-slate-900">Amazon DynamoDB</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <code className="text-[11px] font-mono text-blue-700 font-semibold">CertificateRecords</code> stores immutable academic items indexed by <code className="text-[10px] font-mono bg-white px-1 py-0.5 rounded border">certificateId</code>.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
              NoSQL Key-Value Store
            </div>
          </div>

        </div>

        {/* Footer info bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Strict Validation: Every certificate record is validated directly against AWS DynamoDB.</span>
          </div>
          <button
            onClick={onOpenArchitecture}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <span>Review Full Architecture & Lambda Spec</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Authoritative Verification</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Verify certificate authenticity using unique IDs. Evaluates current valid/revoked states, institution issuance records, and date stamps directly from AWS.
          </p>
          <button
            onClick={() => onNavigateToTab('verify')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 pt-1"
          >
            <span>Open Verification Portal</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Client-Side QR Code Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Newly registered certificates immediately generate high-definition QR codes pointing to the deployed S3 website URL for effortless mobile camera verification.
          </p>
          <button
            onClick={() => onNavigateToTab('register')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 pt-1"
          >
            <span>Issue New Certificate</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Cryptographic Revocation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Administrators can invalidate fraudulent or superseded credentials using their administrator key transmitted securely via the <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">X-Admin-Key</code> header.
          </p>
          <button
            onClick={() => onNavigateToTab('revoke')}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 pt-1"
          >
            <span>Revoke Certificate</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </section>

    </div>
  );
};
