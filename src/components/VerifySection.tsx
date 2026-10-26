import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Loader2, 
  Calendar, 
  Building2, 
  BookOpen, 
  User, 
  Hash, 
  Clock, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink,
  Code2,
  RefreshCw,
  QrCode,
  Award,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { verifyCertificate, VerifyApiResponse } from '../services/api.ts';
import { CertificateData, VerificationStatus } from '../types.ts';
import { getVerificationUrl, generateQrDataUrl } from '../utils/qr.ts';

interface VerifySectionProps {
  initialCertificateId?: string;
  onNavigateToTab: (tab: 'home' | 'verify' | 'register' | 'revoke') => void;
}

export const VerifySection: React.FC<VerifySectionProps> = ({
  initialCertificateId = '',
  onNavigateToTab
}) => {
  const [certId, setCertId] = useState(initialCertificateId);
  const [status, setStatus] = useState<VerificationStatus>('IDLE');
  const [result, setResult] = useState<CertificateData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | undefined>(undefined);
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [certificateQrUrl, setCertificateQrUrl] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Trigger verification if initialCertificateId provided
  useEffect(() => {
    if (initialCertificateId && initialCertificateId.trim()) {
      setCertId(initialCertificateId.trim());
      handleVerify(initialCertificateId.trim());
    }
  }, [initialCertificateId]);

  const handleVerify = async (idToVerify: string) => {
    const targetId = idToVerify.trim();
    if (!targetId) {
      setStatus('ERROR');
      setErrorMessage('Please enter a certificate ID to verify.');
      return;
    }

    setStatus('LOADING');
    setErrorMessage(null);
    setResult(null);
    setShowRawJson(false);
    setCertificateQrUrl(null);

    // Track in recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter((id) => id !== targetId);
      return [targetId, ...filtered].slice(0, 4);
    });

    // Call real AWS API Gateway GET /verify?id=...
    const res: VerifyApiResponse = await verifyCertificate(targetId);

    setHttpStatus(res.statusCode);
    setVerifiedAt(new Date().toLocaleString());

    if (res.status === 'ERROR') {
      setStatus('ERROR');
      setErrorMessage(res.error || 'Unable to connect to AWS API Gateway.');
    } else if (res.status === 'NOT_FOUND') {
      setStatus('NOT_FOUND');
      setResult(res.certificate || {
        certificateId: targetId,
        status: 'NOT FOUND',
        message: 'No certificate exists with this ID in DynamoDB records.'
      });
    } else if (res.status === 'REVOKED') {
      setStatus('REVOKED');
      setResult(res.certificate || {
        certificateId: targetId,
        status: 'REVOKED'
      });
    } else {
      setStatus('VALID');
      setResult(res.certificate || null);

      // Generate embedded QR code for the valid certificate card
      if (res.certificate?.certificateId) {
        generateQrDataUrl(res.certificate.certificateId)
          .then((url) => setCertificateQrUrl(url))
          .catch(() => {});
      }
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(certId);
  };

  const handleCopyLink = () => {
    if (!result?.certificateId) return;
    const url = getVerificationUrl(result.certificateId);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Title & Introduction */}
      <div className="text-center space-y-2 no-print">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-bold tracking-wide uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Cryptographic Authentication</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Verify Academic Credential
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Perform real-time authentication against authoritative records in Amazon DynamoDB via AWS API Gateway.
        </p>
      </div>

      {/* Verification Search Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm no-print space-y-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="certificateId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Certificate Identification Number
            </label>
            <span className="text-[11px] font-mono text-slate-400">Endpoint: GET /verify?id=...</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-4 h-4 text-blue-600" />
              </div>
              <input
                id="certificateId"
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="e.g. CERT-2026-001 or CERT-AWS-001..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={status === 'LOADING'}
              className="px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white text-sm font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {status === 'LOADING' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying in AWS...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Verify Certificate</span>
                </>
              )}
            </button>
          </div>

          {/* Recent Search Chips */}
          {recentSearches.length > 0 && (
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 overflow-x-auto">
              <span className="text-[11px] font-medium text-slate-400 shrink-0">Recent Lookups:</span>
              {recentSearches.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setCertId(id);
                    handleVerify(id);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-mono transition-colors shrink-0"
                >
                  {id}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Verification Loading Skeleton */}
      {status === 'LOADING' && (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/90 shadow-sm text-center space-y-4 no-print">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner animate-pulse">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">Querying AWS Lambda & DynamoDB</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Looking up primary partition key <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">certificateId</code> in table <code className="font-mono text-slate-700">CertificateRecords</code>...
            </p>
          </div>
        </div>
      )}

      {/* STATE 1: VALID - MAGNIFICENT ACADEMIC CERTIFICATE PLAQUE */}
      {status === 'VALID' && result && (
        <div className="space-y-6">
          
          {/* Top Verification Status Strip */}
          <div className="bg-emerald-600 rounded-2xl px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm no-print">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black tracking-wide uppercase">CERTIFICATE IS AUTHENTIC & VALID</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-white text-emerald-800 tracking-wider">
                    VERIFIED
                  </span>
                </div>
                <p className="text-xs text-emerald-100">
                  Confirmed by AWS Lambda backend & Amazon DynamoDB in region ap-south-1
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy direct verification link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied' : 'Share Proof'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Print digital certificate proof"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>

          {/* OFFICIAL DIPLOMA / CERTIFICATE CARD */}
          <div className="certificate-plaque bg-white rounded-3xl border-2 border-slate-200/90 shadow-md p-6 sm:p-12 relative overflow-hidden space-y-8">
            
            {/* Background Watermark Crest */}
            <div className="absolute right-6 bottom-6 text-slate-100 opacity-60 pointer-events-none select-none">
              <Award className="w-64 h-64 -mb-16 -mr-16 stroke-1 text-blue-900/10" />
            </div>

            {/* Certificate Header with Issuing Institution */}
            <div className="text-center space-y-3 border-b-2 border-slate-100 pb-8 relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-900/10 mb-3">
                <Award className="w-8 h-8" />
              </div>

              {result.institution && (
                <div className="text-base sm:text-xl font-extrabold uppercase tracking-widest text-slate-900">
                  {result.institution}
                </div>
              )}

              <div className="text-xs font-bold uppercase tracking-widest text-blue-700">
                Official Credential Verification Record
              </div>
            </div>

            {/* Core Certificate Body */}
            <div className="text-center space-y-6 max-w-2xl mx-auto py-2 relative">
              
              <div className="text-xs sm:text-sm uppercase font-semibold text-slate-400 tracking-wider">
                This certifies that
              </div>

              {result.studentName ? (
                <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif sm:font-sans">
                  {result.studentName}
                </div>
              ) : (
                <div className="text-xl sm:text-2xl font-bold text-slate-700 italic">
                  [Recipient Name on Record]
                </div>
              )}

              <div className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                has successfully completed all requirements and academic milestones for
              </div>

              {result.course && (
                <div className="text-xl sm:text-3xl font-extrabold text-blue-700 tracking-tight px-4 py-2 bg-blue-50/60 rounded-2xl inline-block border border-blue-100/80">
                  {result.course}
                </div>
              )}

            </div>

            {/* Certificate Metadata Grid (Rendered only when available) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t-2 border-slate-100 relative">
              
              {/* Certificate ID */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Certificate ID</span>
                <span className="text-sm font-mono font-bold text-slate-900 break-all">
                  {result.certificateId}
                </span>
              </div>

              {/* Issue Date */}
              {result.issueDate && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date of Issuance</span>
                  <span className="text-sm font-mono font-bold text-slate-900">
                    {result.issueDate}
                  </span>
                </div>
              )}

              {/* Status & Verification Stamp */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Audit Status</span>
                <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>VALID & VERIFIED</span>
                </span>
              </div>

            </div>

            {/* Embedded QR Code & Digital Trust Seal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-100 text-xs text-slate-500 relative">
              
              <div className="flex items-center gap-4">
                {certificateQrUrl && (
                  <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0">
                    <img 
                      src={certificateQrUrl} 
                      alt={`Verification QR for ${result.certificateId}`}
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                )}
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Cryptographically Authenticated</span>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                    Scan QR code with any smartphone camera to verify this exact record on Amazon S3.
                  </p>
                  <div className="text-[10px] font-mono text-slate-400">
                    Verified: {verifiedAt}
                  </div>
                </div>
              </div>

              {/* Academic Digital Signature Line */}
              <div className="text-center sm:text-right space-y-1 sm:border-l sm:pl-6 border-slate-100 shrink-0">
                <div className="font-serif italic text-base text-slate-700">AWS Cloud Registrar</div>
                <div className="w-36 h-0.5 bg-slate-300 mx-auto sm:ml-auto"></div>
                <div className="text-[10px] font-mono text-slate-400">Authorized Academic Seal</div>
              </div>

            </div>

            {/* Developer Raw JSON Inspector */}
            <div className="pt-2 border-t border-slate-100 no-print">
              <button
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showRawJson ? 'Hide AWS JSON Response' : 'Inspect Raw AWS Lambda Response'}</span>
              </button>

              {showRawJson && (
                <div className="mt-3 p-4 bg-slate-900 rounded-2xl text-slate-200 text-xs font-mono overflow-x-auto shadow-inner">
                  <pre>{JSON.stringify(result.rawResponse || result, null, 2)}</pre>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* STATE 2: REVOKED */}
      {status === 'REVOKED' && result && (
        <div className="bg-white rounded-3xl border-2 border-rose-300 shadow-sm overflow-hidden space-y-0">
          
          <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 sm:px-8 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-wide uppercase">CERTIFICATE HAS BEEN REVOKED</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-white text-rose-800">
                    INVALIDATED
                  </span>
                </div>
                <p className="text-xs text-rose-100">
                  This academic credential was officially revoked by the issuing institution.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Official Revocation Notice</span>
              </div>
              <p className="leading-relaxed">
                The certificate with ID <strong className="font-mono text-slate-900">{result.certificateId}</strong> is marked as revoked in Amazon DynamoDB. It can no longer be presented as authentic proof of qualification.
              </p>
              {result.revokedAt && (
                <div className="text-[11px] font-mono text-rose-700 font-semibold pt-1">
                  Revocation Timestamp: {result.revokedAt}
                </div>
              )}
            </div>

            {/* Display metadata if returned alongside the revoked status */}
            {(result.studentName || result.course || result.institution) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {result.studentName && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                    <span className="text-slate-400 block font-medium">Recipient</span>
                    <span className="text-slate-900 font-bold">{result.studentName}</span>
                  </div>
                )}
                {result.course && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                    <span className="text-slate-400 block font-medium">Course</span>
                    <span className="text-slate-900 font-bold">{result.course}</span>
                  </div>
                )}
                {result.institution && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                    <span className="text-slate-400 block font-medium">Institution</span>
                    <span className="text-slate-900 font-bold">{result.institution}</span>
                  </div>
                )}
              </div>
            )}

            {/* Developer Raw JSON Inspector */}
            <div className="pt-2 border-t border-slate-100 no-print">
              <button
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showRawJson ? 'Hide AWS JSON Response' : 'Inspect Raw AWS JSON Response'}</span>
              </button>

              {showRawJson && (
                <div className="mt-3 p-4 bg-slate-900 rounded-2xl text-slate-200 text-xs font-mono overflow-x-auto shadow-inner">
                  <pre>{JSON.stringify(result.rawResponse || result, null, 2)}</pre>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* STATE 3: NOT FOUND */}
      {status === 'NOT_FOUND' && (
        <div className="bg-white rounded-3xl border border-amber-300 shadow-sm overflow-hidden">
          
          <div className="bg-amber-500 px-6 sm:px-8 py-5 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wide uppercase">CERTIFICATE NOT FOUND</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-white text-amber-800">
                  HTTP 404
                </span>
              </div>
              <p className="text-xs text-amber-100">
                No matching record in Amazon DynamoDB for this certificate ID.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                The certificate ID <strong className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{certId}</strong> does not exist in table <code className="font-mono text-xs">CertificateRecords</code>.
              </p>
              
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-xs text-amber-900 space-y-1.5">
                <span className="font-bold block text-sm">Verification Guidance:</span>
                <ul className="list-disc pl-5 space-y-1 text-amber-800">
                  <li>Check the certificate ID for typos or whitespace.</li>
                  <li>Ensure the certificate was registered through the administrator section.</li>
                  <li>Verify that the certificate exists in the active DynamoDB partition.</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('register')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Register This Certificate (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleVerify(certId)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Verification</span>
              </button>
            </div>

            {/* Developer Raw JSON Inspector */}
            {result?.rawResponse && (
              <div className="pt-2 border-t border-slate-100 no-print">
                <button
                  type="button"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{showRawJson ? 'Hide AWS JSON Response' : 'Inspect Raw AWS JSON Response'}</span>
                </button>

                {showRawJson && (
                  <div className="mt-3 p-4 bg-slate-900 rounded-2xl text-slate-200 text-xs font-mono overflow-x-auto shadow-inner">
                    <pre>{JSON.stringify(result.rawResponse, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* STATE 4: ERROR / UNABLE TO CONNECT */}
      {status === 'ERROR' && (
        <div className="bg-white rounded-3xl border border-rose-300 shadow-sm overflow-hidden">
          
          <div className="bg-rose-700 px-6 sm:px-8 py-5 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wide uppercase">CONNECTION ERROR</span>
                {httpStatus && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-white text-rose-900">
                    HTTP {httpStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-rose-100">
                Failed to communicate with Amazon API Gateway endpoint.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
              <span className="font-bold block text-sm">Error Diagnostic:</span>
              <p className="font-mono text-xs text-rose-800 break-words">{errorMessage}</p>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <span className="font-bold text-slate-900 block">Troubleshooting steps:</span>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Verify your network connection.</li>
                <li>Ensure API Gateway HTTP API has stage <code className="font-mono bg-slate-100 px-1 rounded">prod</code> deployed.</li>
                <li>Check CORS settings in API Gateway (<code className="font-mono bg-slate-100 px-1 rounded">content-type, x-admin-key</code> allowed).</li>
                <li>Inspect CloudWatch logs for <code className="font-mono bg-slate-100 px-1 rounded">CertificateVerificationAPI</code>.</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleVerify(certId)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
