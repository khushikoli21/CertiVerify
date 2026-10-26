import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Ban, 
  Award, 
  RefreshCw, 
  PlusCircle, 
  Eye, 
  Printer, 
  Copy, 
  Check, 
  SlidersHorizontal, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  Calendar,
  Hourglass,
  Clock,
  Sparkles
} from 'lucide-react';
import { CertificateData, SessionActivity } from '../types.ts';
import { getCertificateExpiryInfo } from '../utils/certificateStorage.ts';

interface DashboardSectionProps {
  trackedCertificates: CertificateData[];
  sessionActivities: SessionActivity[];
  onOpenDetails: (cert: CertificateData) => void;
  onQuickVerify: (certId: string) => void;
  onNavigateToTab: (tab: 'home' | 'dashboard' | 'verify' | 'register' | 'revoke') => void;
  onPrintCertificate: (cert: CertificateData) => void;
  onClearTracked: () => void;
  onClearActivities: () => void;
  tableDensity: 'comfortable' | 'compact';
  onToggleDensity: () => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  trackedCertificates,
  sessionActivities,
  onOpenDetails,
  onQuickVerify,
  onNavigateToTab,
  onPrintCertificate,
  onClearTracked,
  onClearActivities,
  tableDensity,
  onToggleDensity
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'REVOKED' | 'EXPIRED'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'NAME' | 'ID'>('NEWEST');
  const [quickLookupId, setQuickLookupId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calculate genuine dashboard summary metrics
  const metrics = useMemo(() => {
    const total = trackedCertificates.length;
    let validCount = 0;
    let revokedCount = 0;
    let expiredCount = 0;
    let expiringSoonCount = 0;

    trackedCertificates.forEach((cert) => {
      const info = getCertificateExpiryInfo(cert);
      if (info.displayStatus === 'REVOKED') {
        revokedCount++;
      } else if (info.displayStatus === 'EXPIRED') {
        expiredCount++;
      } else if (info.displayStatus === 'EXPIRING_SOON') {
        validCount++;
        expiringSoonCount++;
      } else {
        validCount++;
      }
    });

    const validPct = total > 0 ? Math.round((validCount / total) * 100) : 0;
    const revokedPct = total > 0 ? Math.round((revokedCount / total) * 100) : 0;
    const expiredPct = total > 0 ? Math.round((expiredCount / total) * 100) : 0;

    return {
      total,
      validCount,
      revokedCount,
      expiredCount,
      expiringSoonCount,
      validPct,
      revokedPct,
      expiredPct
    };
  }, [trackedCertificates]);

  // Filtered and sorted certificates list
  const filteredCertificates = useMemo(() => {
    return trackedCertificates
      .filter((cert) => {
        const matchesSearch =
          cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cert.studentName && cert.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (cert.course && cert.course.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (cert.institution && cert.institution.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;

        const info = getCertificateExpiryInfo(cert);
        if (statusFilter === 'ALL') return true;
        if (statusFilter === 'VALID') return info.displayStatus === 'VALID' || info.displayStatus === 'EXPIRING_SOON';
        if (statusFilter === 'REVOKED') return info.displayStatus === 'REVOKED';
        if (statusFilter === 'EXPIRED') return info.displayStatus === 'EXPIRED';

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          const dateA = a.issueDate ? new Date(a.issueDate).getTime() : 0;
          const dateB = b.issueDate ? new Date(b.issueDate).getTime() : 0;
          return dateB - dateA;
        }
        if (sortBy === 'OLDEST') {
          const dateA = a.issueDate ? new Date(a.issueDate).getTime() : 0;
          const dateB = b.issueDate ? new Date(b.issueDate).getTime() : 0;
          return dateA - dateB;
        }
        if (sortBy === 'NAME') {
          return (a.studentName || '').localeCompare(b.studentName || '');
        }
        if (sortBy === 'ID') {
          return a.certificateId.localeCompare(b.certificateId);
        }
        return 0;
      });
  }, [trackedCertificates, searchTerm, statusFilter, sortBy]);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickLookupId.trim()) {
      onQuickVerify(quickLookupId.trim());
      setQuickLookupId('');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/80 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Operational Console</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            CIAP Credential Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time status overview of certificates authenticated against Amazon DynamoDB in region ap-south-1.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateToTab('register')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Issue New</span>
          </button>
          <button
            onClick={() => onNavigateToTab('verify')}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Search className="w-4 h-4 text-blue-600" />
            <span>Verify Portal</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards (Calculated from genuine tracked data) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Certificates */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tracked Records</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tabular-nums">
            {metrics.total}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>Authoritative DynamoDB items</span>
          </div>
        </div>

        {/* Valid Certificates */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Valid & Active</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700 tabular-nums">
            {metrics.validCount}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>{metrics.validPct}% of tracked</span>
            {metrics.expiringSoonCount > 0 && (
              <span className="text-amber-600 font-semibold">{metrics.expiringSoonCount} expiring soon</span>
            )}
          </div>
        </div>

        {/* Revoked Certificates */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Revoked</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-700 tabular-nums">
            {metrics.revokedCount}
          </div>
          <div className="text-[11px] text-slate-500">
            <span>{metrics.revokedPct}% of tracked</span>
          </div>
        </div>

        {/* Expired Certificates */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Expired</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-700 tabular-nums">
            {metrics.expiredCount}
          </div>
          <div className="text-[11px] text-slate-500">
            <span>{metrics.expiredPct}% of tracked</span>
          </div>
        </div>

      </div>

      {/* Status Distribution Progress Visualizer (When records exist) */}
      {metrics.total > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Credential Status Ratio</span>
            <span className="text-[11px] text-slate-400 font-mono">{metrics.total} tracked records</span>
          </div>
          
          {/* Multi-segment progress bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${metrics.validPct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Valid: ${metrics.validCount} (${metrics.validPct}%)`}
            />
            <div
              style={{ width: `${metrics.revokedPct}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Revoked: ${metrics.revokedCount} (${metrics.revokedPct}%)`}
            />
            <div
              style={{ width: `${metrics.expiredPct}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Expired: ${metrics.expiredCount} (${metrics.expiredPct}%)`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Valid ({metrics.validCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Revoked ({metrics.revokedCount})</span>
            </div>
            {metrics.expiredCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Expired ({metrics.expiredCount})</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Tracked Registry Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-0">
        
        {/* Toolbar: Search, Filters, Sorters & Density */}
        <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-blue-600" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by ID, student, course, or issuer..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter Segmented Controls */}
            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 overflow-x-auto shrink-0">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'ALL' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({metrics.total})
              </button>
              <button
                onClick={() => setStatusFilter('VALID')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'VALID' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Valid ({metrics.validCount})
              </button>
              <button
                onClick={() => setStatusFilter('REVOKED')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'REVOKED' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Revoked ({metrics.revokedCount})
              </button>
              {metrics.expiredCount > 0 && (
                <button
                  onClick={() => setStatusFilter('EXPIRED')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === 'EXPIRED' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Expired ({metrics.expiredCount})
                </button>
              )}
            </div>

            {/* Sorter and Density controls */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="NEWEST">Newest Date</option>
                  <option value="OLDEST">Oldest Date</option>
                  <option value="NAME">Holder Name</option>
                  <option value="ID">Certificate ID</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </div>

              <button
                onClick={onToggleDensity}
                className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors cursor-pointer"
                title={`Toggle table density (Current: ${tableDensity})`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {trackedCertificates.length > 0 && (
                <button
                  onClick={onClearTracked}
                  className="p-2 bg-slate-50 border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                  title="Clear tracked certificates from session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Certificate Table */}
        <div className="overflow-x-auto">
          {filteredCertificates.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Certificate ID</th>
                  <th className="py-3 px-5">Holder / Student</th>
                  <th className="py-3 px-5">Qualification / Course</th>
                  <th className="py-3 px-5">Issuing Authority</th>
                  <th className="py-3 px-5">Dates</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCertificates.map((cert) => {
                  const expiryInfo = getCertificateExpiryInfo(cert);
                  const isRevoked = expiryInfo.displayStatus === 'REVOKED';
                  const isExpired = expiryInfo.displayStatus === 'EXPIRED';
                  const isExpiringSoon = expiryInfo.displayStatus === 'EXPIRING_SOON';
                  const isValid = expiryInfo.displayStatus === 'VALID';

                  const rowPadding = tableDensity === 'compact' ? 'py-2.5 px-5' : 'py-4 px-5';

                  return (
                    <tr
                      key={cert.certificateId}
                      onClick={() => onOpenDetails(cert)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Certificate ID */}
                      <td className={rowPadding}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {cert.certificateId}
                          </span>
                          <button
                            onClick={(e) => handleCopyId(cert.certificateId, e)}
                            className="text-slate-300 hover:text-slate-600 p-1 rounded"
                            title="Copy ID"
                          >
                            {copiedId === cert.certificateId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Holder Name */}
                      <td className={rowPadding}>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {(cert.studentName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate max-w-[140px]">{cert.studentName || 'Unknown Holder'}</span>
                        </div>
                      </td>

                      {/* Course */}
                      <td className={rowPadding}>
                        <span className="text-slate-700 font-medium truncate block max-w-[180px]">
                          {cert.course || '—'}
                        </span>
                      </td>

                      {/* Issuing Institution */}
                      <td className={rowPadding}>
                        <span className="text-slate-500 truncate block max-w-[160px]">
                          {cert.institution || '—'}
                        </span>
                      </td>

                      {/* Issue & Expiry Dates */}
                      <td className={rowPadding}>
                        <div className="font-mono text-[11px] text-slate-600 space-y-0.5">
                          <div>Issued: {cert.issueDate || '—'}</div>
                          {cert.expiryDate && (
                            <div className="text-[10px] text-slate-400">
                              Exp: {cert.expiryDate}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className={rowPadding}>
                        {isValid && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>VALID</span>
                          </span>
                        )}
                        {isExpiringSoon && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>EXPIRING SOON</span>
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <span>EXPIRED</span>
                          </span>
                        )}
                        {isRevoked && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>REVOKED</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className={`${rowPadding} text-right`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onQuickVerify(cert.certificateId)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Verify directly in AWS"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onPrintCertificate(cert)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Print Certificate"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenDetails(cert)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Full Specification"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  {trackedCertificates.length === 0 ? 'No Certificates Tracked Yet' : 'No Matching Certificates Found'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {trackedCertificates.length === 0
                    ? 'Verify an existing certificate or register a new one to populate your session dashboard with authentic DynamoDB records.'
                    : 'No certificates match your current search and filter criteria. Try resetting filters.'}
                </p>
              </div>

              {trackedCertificates.length === 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="text-xs text-slate-400">Quick Test Lookups:</span>
                  <button
                    onClick={() => onQuickVerify('CERT-2026-001')}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-mono font-semibold hover:bg-blue-100 transition-colors"
                  >
                    CERT-2026-001
                  </button>
                  <button
                    onClick={() => onQuickVerify('CERT-AWS-001')}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-mono font-semibold hover:bg-blue-100 transition-colors"
                  >
                    CERT-AWS-001
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Honest DynamoDB Architecture Notice */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              <strong>Authentic Record Policy:</strong> Table items are verified directly against Amazon DynamoDB (<code className="font-mono text-slate-700">CertificateRecords</code>).
            </span>
          </div>
          <span className="font-mono text-slate-400">
            Showing {filteredCertificates.length} of {trackedCertificates.length} records
          </span>
        </div>

      </div>

      {/* Grid: Instant Lookup Tool (7 cols) + Session Activity Timeline (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Instant Lookup Tool */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Live DynamoDB Query</span>
            <h3 className="text-base font-bold text-slate-900">Track an Existing Certificate</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Query any certificate ID from Amazon API Gateway to authenticate and append it to your active dashboard session.
            </p>
          </div>

          <form onSubmit={handleQuickLookup} className="flex gap-2">
            <input
              type="text"
              value={quickLookupId}
              onChange={(e) => setQuickLookupId(e.target.value)}
              placeholder="Enter Certificate ID..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 text-xs font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Authenticate & Track
            </button>
          </form>

          <div className="p-3 rounded-xl bg-blue-50/70 text-[11px] text-blue-900 border border-blue-100 flex items-center justify-between">
            <span>Direct query endpoint:</span>
            <code className="font-mono text-blue-700 font-bold">GET /verify?id=...</code>
          </div>
        </div>

        {/* Session Activity Timeline */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Real-time Stream</span>
              <h3 className="text-base font-bold text-slate-900">Session Activity</h3>
            </div>
            {sessionActivities.length > 0 && (
              <button
                onClick={onClearActivities}
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Clear Log
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {sessionActivities.length > 0 ? (
              sessionActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        act.status === 'SUCCESS' ? 'bg-emerald-500' : act.status === 'WARNING' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      <span className="truncate">{act.description}</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 truncate">
                      ID: {act.certificateId}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {act.timestamp}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <Clock className="w-6 h-6 mx-auto text-slate-300" />
                <p>No activity recorded in this session yet.</p>
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-400">
            Note: Session activity tracks actions in volatile browser memory. It is not a persistent backend audit table.
          </p>
        </div>

      </div>

    </div>
  );
};
