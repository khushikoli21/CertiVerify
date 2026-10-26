import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Award, 
  ShieldCheck, 
  CheckCircle2,
  Calendar,
  Building2,
  Hash
} from 'lucide-react';
import { CertificateData } from '../types.ts';
import { generateQrDataUrl } from '../utils/qr.ts';

interface CertificatePrintModalProps {
  certificate: CertificateData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificatePrintModal: React.FC<CertificatePrintModalProps> = ({
  certificate,
  isOpen,
  onClose
}) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    if (certificate?.certificateId) {
      generateQrDataUrl(certificate.certificateId)
        .then((url) => setQrUrl(url))
        .catch(() => setQrUrl(null));
    }
  }, [certificate]);

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      
      {/* Modal Dialog (Hidden on physical printout) */}
      <div className="bg-white rounded-3xl max-w-4xl w-full my-6 p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[95vh] overflow-y-auto">
        
        {/* Action Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 no-print">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Certificate Print & PDF Export Preview</h3>
            <p className="text-xs text-slate-500">
              Formatted for standard A4 landscape/portrait export. Click "Print Document" to print or save as PDF.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Document Card */}
        <div className="certificate-plaque bg-white p-8 sm:p-14 rounded-3xl border-4 border-slate-900/80 shadow-md relative overflow-hidden space-y-8 print:p-10 print:border-8 print:border-slate-900 print:shadow-none">
          
          {/* Subtle Watermark Logo */}
          <div className="absolute right-10 bottom-10 opacity-5 pointer-events-none select-none">
            <Award className="w-80 h-80 text-blue-900" />
          </div>

          {/* Institutional Header */}
          <div className="text-center space-y-3 border-b-2 border-slate-200 pb-8 relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center mx-auto shadow-md">
              <Award className="w-9 h-9" />
            </div>

            <div className="text-xl sm:text-2xl font-black uppercase tracking-widest text-slate-900">
              {certificate.institution || 'ACADEMIC INSTITUTION'}
            </div>

            <div className="text-xs font-bold uppercase tracking-widest text-blue-700">
              Certificate of Academic Qualification
            </div>
          </div>

          {/* Recipient & Course Body */}
          <div className="text-center space-y-6 max-w-2xl mx-auto py-4 relative">
            <div className="text-xs sm:text-sm uppercase font-semibold text-slate-400 tracking-wider">
              This document officially certifies that
            </div>

            <div className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-serif sm:font-sans py-1">
              {certificate.studentName || 'Student Recipient'}
            </div>

            <div className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
              has satisfactorily completed all academic curricula, practical assessments, and degree requirements for
            </div>

            <div className="text-xl sm:text-3xl font-extrabold text-blue-800 tracking-tight px-6 py-3 bg-blue-50/70 rounded-2xl inline-block border border-blue-200">
              {certificate.course || 'Course of Study'}
            </div>
          </div>

          {/* Details & Dates Grid */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-slate-200 relative text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Certificate ID</span>
              <span className="font-mono font-bold text-slate-900 text-sm break-all">{certificate.certificateId}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date of Issue</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{certificate.issueDate || 'N/A'}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Credential Status</span>
              <span className="font-bold text-emerald-800 flex items-center gap-1 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AUTHENTICATED</span>
              </span>
            </div>
          </div>

          {/* Footer with QR Code & Verification Line */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 relative">
            
            <div className="flex items-center gap-4">
              {qrUrl && (
                <div className="p-1.5 bg-white rounded-xl border border-slate-300 shadow-2xs shrink-0">
                  <img src={qrUrl} alt="Verification QR" className="w-20 h-20 object-contain" />
                </div>
              )}
              <div className="text-left space-y-0.5 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Amazon DynamoDB Authenticated</span>
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                  Scan QR code with any camera to verify this record live against AWS API Gateway.
                </p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="font-serif italic text-base text-slate-800">Registrar General</div>
              <div className="w-40 h-0.5 bg-slate-400 ml-auto"></div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Authorized Signature & Seal</div>
            </div>

          </div>

          {/* Honest Disclaimer */}
          <div className="text-center pt-2 text-[10px] text-slate-400 no-print">
            Visual presentation document. Authoritative digital integrity is verified via Amazon DynamoDB table <code>CertificateRecords</code>.
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 no-print">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Preview
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Document (A4)</span>
          </button>
        </div>

      </div>

    </div>
  );
};
