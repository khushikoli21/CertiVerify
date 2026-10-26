import React, { useState } from 'react';
import { 
  PlusCircle, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Code2, 
  Calendar, 
  Building2, 
  BookOpen, 
  User, 
  Hash, 
  ArrowRight,
  Award,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { registerCertificate, RegisterApiResponse } from '../services/api.ts';
import { generateQrDataUrl, downloadQrCode, getVerificationUrl } from '../utils/qr.ts';

import { CertificateData } from '../types.ts';

interface RegisterSectionProps {
  onCertificateRegistered?: (certificateId: string, certData?: Partial<CertificateData>) => void;
  onNavigateToVerify: (certificateId: string) => void;
}

export const RegisterSection: React.FC<RegisterSectionProps> = ({
  onCertificateRegistered,
  onNavigateToVerify
}) => {
  // Form fields
  const [studentName, setStudentName] = useState('');
  const [course, setCourse] = useState('');
  const [institution, setInstitution] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [customCertId, setCustomCertId] = useState('');
  
  // Administrator Key (volatile in-memory state only, never persisted)
  const [adminKey, setAdminKey] = useState('');
  const [showAdminKey, setShowAdminKey] = useState(false);

  // Submission states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredCertId, setRegisteredCertId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<Record<string, unknown> | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim() || !course.trim() || !institution.trim() || !issueDate.trim()) {
      setError('Please fill in all certificate details before submitting.');
      return;
    }

    setLoading(true);
    setError(null);
    setRegisteredCertId(null);
    setQrDataUrl(null);
    setSuccessMessage(null);
    setRawResponse(null);

    const res: RegisterApiResponse = await registerCertificate({
      studentName,
      course,
      institution,
      issueDate,
      expiryDate: expiryDate.trim() || undefined,
      certificateId: customCertId.trim() || undefined,
      adminKey: adminKey.trim() || undefined
    });

    setLoading(false);

    // Strict validation: must be genuine success with a valid non-empty certificateId
    if (!res.success || !res.certificateId || res.certificateId.trim().length === 0) {
      setError(res.error || 'Failed to register certificate with AWS API Gateway. No valid certificate ID was returned by the backend.');
      setRawResponse(res.rawResponse || null);
      return;
    }

    // Genuine success confirmed by AWS Lambda and DynamoDB
    const certId = res.certificateId.trim();
    setRegisteredCertId(certId);
    setSuccessMessage(res.message || `Certificate ${certId} registered successfully in Amazon DynamoDB.`);
    setRawResponse(res.rawResponse || null);

    // Notify parent if needed
    if (onCertificateRegistered) {
      onCertificateRegistered(certId, {
        studentName,
        course,
        institution,
        issueDate,
        expiryDate: expiryDate.trim() || undefined
      });
    }

    // Generate browser-side QR code linking to deployed website with ?id=CERTIFICATE_ID
    try {
      const qr = await generateQrDataUrl(certId);
      setQrDataUrl(qr);
    } catch (qrErr) {
      console.error('QR code generation error', qrErr);
    }
  };

  const handleDownloadQr = () => {
    if (qrDataUrl && registeredCertId) {
      downloadQrCode(qrDataUrl, registeredCertId);
    }
  };

  const handleCopyLink = () => {
    if (!registeredCertId) return;
    const url = getVerificationUrl(registeredCertId);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleResetForm = () => {
    setStudentName('');
    setCourse('');
    setInstitution('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setCustomCertId('');
    setRegisteredCertId(null);
    setQrDataUrl(null);
    setSuccessMessage(null);
    setError(null);
    setRawResponse(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Administrator Section</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Register Digital Certificate
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Create an authoritative academic record stored in Amazon DynamoDB table <code className="font-mono text-slate-800 text-xs font-semibold">CertificateRecords</code>.
        </p>
      </div>


      {/* SUCCESS CARD: Displayed ONLY when AWS genuinely confirms registration with a real ID */}
      {registeredCertId && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500/50 shadow-md overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 text-emerald-700">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Certificate Successfully Registered</h3>
              <p className="text-xs text-emerald-700">{successMessage}</p>
            </div>
          </div>

          {/* Certificate Identification Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Generated Certificate ID</span>
              <span className="text-2xl font-mono font-extrabold text-blue-700">
                {registeredCertId}
              </span>
            </div>
            <button
              onClick={() => onNavigateToVerify(registeredCertId)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <span>Verify This Certificate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Client-Side QR Code Display */}
          {qrDataUrl && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 to-slate-50 border border-blue-100 flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                <img
                  src={qrDataUrl}
                  alt={`QR code for certificate ${registeredCertId}`}
                  className="w-40 h-40 object-contain"
                />
              </div>
              <div className="space-y-3 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[11px] font-bold">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Browser-Side QR Generated</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Instant Verification Link Encoded
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                  This QR code directly links to your deployed website with query parameter <code className="font-mono text-slate-800 font-semibold text-[11px]">?id={registeredCertId}</code>. Scanning verifies the credential in Amazon DynamoDB.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                  <button
                    onClick={handleDownloadQr}
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied Link' : 'Copy Verification URL'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

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
              onClick={handleResetForm}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              + Register Another Certificate
            </button>
          </div>
        </div>
      )}

      {/* Main Registration Area with Live Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Registration Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-sm">AWS Registration Error</span>
                  <p className="mt-0.5 leading-relaxed">{error}</p>
                  {rawResponse && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowRawJson(!showRawJson)}
                        className="text-[11px] underline text-rose-800 hover:text-rose-950 font-semibold"
                      >
                        {showRawJson ? 'Hide debug payload' : 'Show raw AWS response payload'}
                      </button>
                      {showRawJson && (
                        <pre className="mt-2 p-3 bg-rose-950/90 text-rose-100 rounded-lg text-[11px] font-mono overflow-x-auto">
                          {JSON.stringify(rawResponse, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Optional Custom Certificate ID */}
            <div className="space-y-1.5">
              <label htmlFor="customCertId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Certificate ID <span className="text-slate-400 text-[11px] font-normal lowercase">(optional · leave blank for auto-generation)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4 text-blue-600" />
                </div>
                <input
                  id="customCertId"
                  type="text"
                  value={customCertId}
                  onChange={(e) => setCustomCertId(e.target.value)}
                  placeholder="Leave blank for Lambda ID, or enter e.g. CERT-2026-001..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-mono"
                />
              </div>
            </div>

            {/* Student Name */}
            <div className="space-y-1.5">
              <label htmlFor="studentName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Student Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <input
                  id="studentName"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* Course Name */}
            <div className="space-y-1.5">
              <label htmlFor="course" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Course / Qualification <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <input
                  id="course"
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. AWS Cloud Architecture & Distributed Systems"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* Issuing Institution */}
            <div className="space-y-1.5">
              <label htmlFor="institution" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Issuing Institution <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <input
                  id="institution"
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Stanford University · School of Engineering"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* Issue Date */}
            <div className="space-y-1.5">
              <label htmlFor="issueDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Issue Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-mono"
                  required
                />
              </div>
            </div>

            {/* Administrator Key Input */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label htmlFor="adminKey" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Administrator Key <span className="text-slate-400 text-[11px] font-normal">(Sent via X-Admin-Key)</span>
                </label>
                <span className="text-[11px] text-amber-700 font-medium">Volatile memory only</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                </div>
                <input
                  id="adminKey"
                  type={showAdminKey ? 'text' : 'password'}
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter administrator key configured in AWS Lambda..."
                  className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-mono"
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
              <span className="text-[11px] text-slate-500 block">
                Required by your Lambda function to authenticate <code className="font-mono text-slate-700">POST /register</code>.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting to AWS API Gateway...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Register Certificate & Generate QR</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Live Certificate Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Live Issuance Preview</span>
            <span className="text-[11px] font-mono text-blue-600 font-semibold">Real-time Draft</span>
          </div>

          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-5 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-1">
              <Award className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Institution</span>
              <div className="text-xs font-bold text-slate-800">
                {institution.trim() || 'Institution Name will appear here'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Student Recipient</span>
              <div className="text-lg font-extrabold text-slate-900">
                {studentName.trim() || 'Student Full Name'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Course / Qualification</span>
              <div className="text-sm font-bold text-blue-700 bg-blue-50/80 p-2.5 rounded-xl border border-blue-100">
                {course.trim() || 'Course Title'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Issue Date</span>
                <span className="font-mono text-slate-800 font-semibold">{issueDate || 'YYYY-MM-DD'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">ID Strategy</span>
                <span className="font-mono text-slate-800 font-semibold truncate block">
                  {customCertId.trim() || 'Auto-generated'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Will be saved in DynamoDB <code className="font-mono font-semibold">CertificateRecords</code>.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
