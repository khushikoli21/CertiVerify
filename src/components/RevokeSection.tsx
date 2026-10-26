import React, { useState } from 'react';
import { 
  Ban, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Hash, 
  Code2, 
  AlertTriangle,
  ArrowRight,
  ShieldX
} from 'lucide-react';
import { revokeCertificate, RevokeApiResponse } from '../services/api.ts';

interface RevokeSectionProps {
  onNavigateToVerify: (certificateId: string) => void;
  onCertificateRevoked?: (certificateId: string) => void;
}

export const RevokeSection: React.FC<RevokeSectionProps> = ({
  onNavigateToVerify,
  onCertificateRevoked
}) => {
  const [certificateId, setCertificateId] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [confirmPrompt, setConfirmPrompt] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [revokedId, setRevokedId] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<Record<string, unknown> | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleInitialClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) {
      setError('Please provide a valid certificate ID to revoke.');
      return;
    }
    setError(null);
    setConfirmPrompt(true);
  };

  const executeRevocation = async () => {
    setConfirmPrompt(false);
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setRevokedId(null);
    setRawResponse(null);

    const res: RevokeApiResponse = await revokeCertificate({
      certificateId: certificateId.trim(),
      adminKey: adminKey.trim() || undefined
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to revoke certificate on AWS API Gateway.');
      setRawResponse(res.rawResponse || null);
      return;
    }

    setRevokedId(certificateId.trim());
    setSuccessMessage(res.message || `Certificate ${certificateId.trim()} was successfully marked as REVOKED in AWS DynamoDB.`);
    setRawResponse(res.rawResponse || null);

    if (onCertificateRevoked) {
      onCertificateRevoked(certificateId.trim());
    }
  };

  const handleReset = () => {
    setCertificateId('');
    setSuccessMessage(null);
    setRevokedId(null);
    setError(null);
    setRawResponse(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 rounded-full text-rose-700 text-xs font-bold uppercase tracking-wider">
          <Ban className="w-3.5 h-3.5" />
          <span>Administrator Section</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Revoke Academic Certificate
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Invalidate fraudulent, expired, or superseded credentials in Amazon DynamoDB.
        </p>
      </div>


      {/* SUCCESS CONFIRMATION */}
      {revokedId && (
        <div className="bg-white rounded-3xl border-2 border-rose-300 shadow-md overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 text-rose-700">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Certificate Revocation Confirmed</h3>
              <p className="text-xs text-rose-700">{successMessage}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">Revoked Certificate ID</span>
              <span className="text-2xl font-mono font-bold text-slate-900">
                {revokedId}
              </span>
            </div>
            <button
              onClick={() => onNavigateToVerify(revokedId)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs shrink-0 cursor-pointer"
            >
              <span>Test Verify Revocation State</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Raw AWS Response Inspector */}
          {rawResponse && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showRawJson ? 'Hide AWS Response' : 'Inspect Raw AWS Lambda Response'}</span>
              </button>

              {showRawJson && (
                <div className="mt-3 p-4 bg-slate-900 rounded-2xl text-slate-200 text-xs font-mono overflow-x-auto shadow-inner">
                  <pre>{JSON.stringify(rawResponse, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleReset}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              + Revoke Another Certificate
            </button>
          </div>
        </div>
      )}

      {/* Revocation Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <form onSubmit={handleInitialClick} className="space-y-6">
          
          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">AWS Revocation Error</span>
                <p className="mt-0.5 leading-relaxed">{error}</p>
                {error.includes('invalid administrator key') && (
                  <p className="mt-1 text-rose-800">
                    Tip: Ensure the admin key matches the Lambda environment secret.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Certificate ID */}
          <div className="space-y-1.5">
            <label htmlFor="revokeCertId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Certificate ID to Revoke <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-4 h-4 text-rose-600" />
              </div>
              <input
                id="revokeCertId"
                type="text"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                placeholder="Enter exact Certificate ID (e.g. CERT-2026-001)..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all text-sm font-mono"
                required
              />
            </div>
          </div>

          {/* Administrator Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="revokeAdminKey" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Administrator Key <span className="text-slate-400 text-[11px] font-normal">(Sent via X-Admin-Key)</span>
              </label>
              <span className="text-[11px] text-amber-700 font-medium">Volatile memory only</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4 text-amber-600" />
              </div>
              <input
                id="revokeAdminKey"
                type={showAdminKey ? 'text' : 'password'}
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter administrator key configured in AWS Lambda..."
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowAdminKey(!showAdminKey)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showAdminKey ? 'Hide key' : 'Show key'}
              >
                {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 disabled:from-rose-400 disabled:to-rose-500 text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to AWS API Gateway (POST /revoke)...</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  <span>Revoke Certificate</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Confirmation Modal */}
      {confirmPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldX className="w-7 h-7" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900">Confirm Certificate Revocation</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to revoke certificate <strong className="font-mono text-slate-900">{certificateId}</strong>?
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-900 leading-relaxed">
              This action updates the record in DynamoDB to <span className="font-bold">REVOKED</span>. Anyone verifying this credential in the future will see an official revocation notice.
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmPrompt(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeRevocation}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Yes, Revoke in AWS
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
