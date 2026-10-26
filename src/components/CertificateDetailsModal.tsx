import React, { useState, useEffect } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Calendar, 
  Building2, 
  BookOpen, 
  User, 
  Hash, 
  Clock, 
  Printer, 
  Copy, 
  Check, 
  QrCode, 
  Download, 
  Ban, 
  ExternalLink,
  Code2,
  RefreshCw,
  Hourglass
} from 'lucide-react';
import { CertificateData } from '../types.ts';
import { getVerificationUrl, generateQrDataUrl, downloadQrCode } from '../utils/qr.ts';
import { getCertificateExpiryInfo } from '../utils/certificateStorage.ts';

interface CertificateDetailsModalProps {
  certificate: CertificateData | null;
  isOpen: boolean;
  onClose: () => void;
  onVerifyInAws: (certificateId: string) => void;
  onRevokeCertificate: (certificateId: string) => void;
  onPrintCertificate: (certificate: CertificateData) => void;
}

export const CertificateDetailsModal: React.FC<CertificateDetailsModalProps> = ({
  certificate,
  isOpen,
  onClose,
  onVerifyInAws,
  onRevokeCertificate,
  onPrintCertificate
}) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    if (certificate?.certificateId) {
      generateQrDataUrl(certificate.certificateId)
        .then((url) => setQrUrl(url))
        .catch(() => setQrUrl(null));
    }
  }, [certificate]);

  if (!isOpen || !certificate) return null;

  const expiryInfo = getCertificateExpiryInfo(certificate);
  const isRevoked = expiryInfo.displayStatus === 'REVOKED';
  const isExpired = expiryInfo.displayStatus === 'EXPIRED';
  const isExpiringSoon = expiryInfo.displayStatus === 'EXPIRING_SOON';
  const isValid = expiryInfo.displayStatus === 'VALID';

  const verificationUrl = getVerificationUrl(certificate.certificateId);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQr = () => {
    if (qrUrl) {
      downloadQrCode(qrUrl, certificate.certificateId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm ${
              isRevoked
                ? 'bg-rose-600'
                : isExpired
                ? 'bg-amber-600'
                : 'bg-gradient-to-br from-blue-600 to-indigo-800'
            }`}>
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900">Certificate Specification</h3>
                {isValid && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    VALID
                  </span>
                )}
                {isExpiringSoon && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                    EXPIRING SOON ({expiryInfo.daysRemaining}d left)
                  </span>
                )}
                {isExpired && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                    EXPIRED
                  </span>
                )}
                {isRevoked && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-800 border border-rose-200">
                    REVOKED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono">
                DynamoDB Partition Key: {certificate.certificateId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Credential Grid */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Student Name */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Credential Holder</span>
              <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{certificate.studentName || 'Not specified in record'}</span>
              </div>
            </div>

            {/* Course Name */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Course / Qualification</span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{certificate.course || 'Not specified in record'}</span>
              </div>
            </div>

            {/* Issuing Institution */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Issuing Authority</span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="truncate">{certificate.institution || 'Not specified in record'}</span>
              </div>
            </div>

            {/* Issue Date & Expiry */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date Schedule</span>
              <div className="text-xs font-mono font-medium text-slate-800 space-y-0.5">
                <div>Issue Date: <strong>{certificate.issueDate || 'N/A'}</strong></div>
                {certificate.expiryDate && (
                  <div>
                    Expiry: <strong>{certificate.expiryDate}</strong>
                    {expiryInfo.daysRemaining !== null && (
                      <span className="text-slate-500 ml-1">
                        ({expiryInfo.daysRemaining > 0 ? `${expiryInfo.daysRemaining} days remaining` : 'Expired'})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Revocation notice if applicable */}
          {isRevoked && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Certificate Status: REVOKED</span>
              </div>
              <p>
                This credential was invalidated in Amazon DynamoDB.
                {certificate.revokedAt && ` Revoked on: ${certificate.revokedAt}`}
              </p>
            </div>
          )}

          {/* Public Verification Link & QR Code Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-slate-50 border border-blue-100 flex flex-col sm:flex-row items-center gap-5">
            {qrUrl && (
              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs shrink-0">
                <img
                  src={qrUrl}
                  alt={`QR for ${certificate.certificateId}`}
                  className="w-24 h-24 object-contain"
                />
              </div>
            )}
            <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start text-xs font-bold text-slate-900">
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                <span>Public Verification URL</span>
              </div>
              <p className="text-xs text-slate-600 font-mono break-all truncate">
                {verificationUrl}
              </p>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
                </button>
                {qrUrl && (
                  <button
                    onClick={handleDownloadQr}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Developer Raw JSON Inspector */}
          {certificate.rawResponse && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showRawJson ? 'Hide Raw DynamoDB Record' : 'Inspect Raw AWS DynamoDB Record'}</span>
              </button>

              {showRawJson && (
                <div className="mt-2.5 p-3.5 bg-slate-900 rounded-xl text-slate-200 text-[11px] font-mono overflow-x-auto shadow-inner">
                  <pre>{JSON.stringify(certificate.rawResponse, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Action Buttons Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onVerifyInAws(certificate.certificateId)}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Query AWS API Gateway in real time"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Verify in AWS</span>
            </button>
            <button
              onClick={() => onPrintCertificate(certificate)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isRevoked && (
              <button
                onClick={() => {
                  onClose();
                  onRevokeCertificate(certificate.certificateId);
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Revoke</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
