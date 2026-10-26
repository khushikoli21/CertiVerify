/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Navbar } from './components/Navbar.tsx';
import { DashboardSection } from './components/DashboardSection.tsx';
import { HomeSection } from './components/HomeSection.tsx';
import { VerifySection } from './components/VerifySection.tsx';
import { RegisterSection } from './components/RegisterSection.tsx';
import { RevokeSection } from './components/RevokeSection.tsx';
import { CertificateDetailsModal } from './components/CertificateDetailsModal.tsx';
import { CertificatePrintModal } from './components/CertificatePrintModal.tsx';
import { ArchitectureModal } from './components/ArchitectureModal.tsx';
import { ApiSettingsModal } from './components/ApiSettingsModal.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';

import { CertificateData, SessionActivity, ToastNotification } from './types.ts';
import { 
  getTrackedCertificates, 
  trackCertificate, 
  updateTrackedCertificateStatus, 
  removeTrackedCertificate,
  getSessionActivities,
  logSessionActivity,
  clearSessionActivities
} from './utils/certificateStorage.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'verify' | 'register' | 'revoke'>('home');
  const [targetCertId, setTargetCertId] = useState<string>('');
  
  // Tracked genuine certificates in session
  const [trackedCertificates, setTrackedCertificates] = useState<CertificateData[]>(() => getTrackedCertificates());
  
  // Session activities
  const [sessionActivities, setSessionActivities] = useState<SessionActivity[]>(() => getSessionActivities());
  
  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modals & Panels
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Certificate Modals
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // UI Preferences
  const [tableDensity, setTableDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [, setConfigKey] = useState(0);

  const addToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastNotification = { id, type, title, message };
    setToasts((prev) => [...prev.slice(-4), newToast]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check URL query parameter ?id=... on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');
      if (urlId && urlId.trim()) {
        const trimmed = urlId.trim();
        setTargetCertId(trimmed);
        setActiveTab('verify');
        addToast('info', 'QR Verification Query', `Loaded certificate ID ${trimmed} from query link.`);
      }
    }
  }, [addToast]);

  // Handler when certificate is verified
  const handleCertificateVerified = useCallback((cert: CertificateData) => {
    if (cert && cert.certificateId) {
      const updated = trackCertificate(cert);
      setTrackedCertificates(updated);

      const isRevoked = String(cert.status || '').toUpperCase().includes('REVOKE');
      const isNotFound = String(cert.status || '').toUpperCase().includes('NOT FOUND');

      const acts = logSessionActivity({
        type: 'VERIFY',
        certificateId: cert.certificateId,
        status: isRevoked ? 'WARNING' : isNotFound ? 'ERROR' : 'SUCCESS',
        description: isRevoked ? `Verified as REVOKED: ${cert.studentName || cert.certificateId}` : isNotFound ? `Not found in DynamoDB` : `Verified VALID: ${cert.studentName || cert.certificateId}`
      });
      setSessionActivities(acts);

      if (!isNotFound) {
        addToast(
          isRevoked ? 'warning' : 'success',
          isRevoked ? 'Certificate is REVOKED' : 'Certificate Authenticated',
          `Record for ${cert.certificateId} confirmed by Amazon DynamoDB.`
        );
      }
    }
  }, [addToast]);

  // Handler when certificate is registered
  const handleCertificateRegistered = useCallback((newCertId: string, certData?: Partial<CertificateData>) => {
    if (newCertId) {
      const fullRecord: CertificateData = {
        certificateId: newCertId,
        status: 'VALID',
        studentName: certData?.studentName,
        course: certData?.course,
        institution: certData?.institution,
        issueDate: certData?.issueDate,
        expiryDate: certData?.expiryDate
      };
      const updated = trackCertificate(fullRecord);
      setTrackedCertificates(updated);

      const acts = logSessionActivity({
        type: 'REGISTER',
        certificateId: newCertId,
        status: 'SUCCESS',
        description: `Registered new certificate: ${certData?.studentName || newCertId}`
      });
      setSessionActivities(acts);

      addToast('success', 'Registration Confirmed', `Certificate ${newCertId} saved to DynamoDB table CertificateRecords.`);
    }
  }, [addToast]);

  // Handler when certificate is revoked
  const handleCertificateRevoked = useCallback((revokedCertId: string) => {
    if (revokedCertId) {
      const updated = updateTrackedCertificateStatus(revokedCertId, 'REVOKED');
      setTrackedCertificates(updated);

      const acts = logSessionActivity({
        type: 'REVOKE',
        certificateId: revokedCertId,
        status: 'WARNING',
        description: `Marked certificate ${revokedCertId} as REVOKED`
      });
      setSessionActivities(acts);

      addToast('warning', 'Revocation Completed', `Certificate ${revokedCertId} status set to REVOKED in DynamoDB.`);
    }
  }, [addToast]);

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

  const handleOpenDetails = (cert: CertificateData) => {
    setSelectedCertificate(cert);
    setIsDetailsModalOpen(true);
  };

  const handleOpenPrintModal = (cert: CertificateData) => {
    setSelectedCertificate(cert);
    setIsPrintModalOpen(true);
    const acts = logSessionActivity({
      type: 'PRINT',
      certificateId: cert.certificateId,
      status: 'SUCCESS',
      description: `Opened print/PDF export preview for ${cert.certificateId}`
    });
    setSessionActivities(acts);
  };

  const handleClearTracked = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ciap_tracked_certificates');
      setTrackedCertificates([]);
      addToast('info', 'Tracked Records Cleared', 'Session certificate cache was reset.');
    }
  };

  const handleClearActivities = () => {
    clearSessionActivities();
    setSessionActivities([]);
  };

  const handleConfigUpdated = () => {
    setConfigKey((prev) => prev + 1);
    addToast('success', 'Settings Saved', 'AWS endpoint and UI preferences updated.');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 antialiased font-sans">
      
      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        trackedCount={trackedCertificates.length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Frame (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 sm:lg:pl-72 transition-all">
        
        {/* Top Header / Breadcrumbs Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenArchitecture={() => setIsArchitectureOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          activityCount={sessionActivities.length}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          
          {activeTab === 'dashboard' && (
            <DashboardSection
              trackedCertificates={trackedCertificates}
              sessionActivities={sessionActivities}
              onOpenDetails={handleOpenDetails}
              onQuickVerify={handleVerifySearch}
              onNavigateToTab={setActiveTab}
              onPrintCertificate={handleOpenPrintModal}
              onClearTracked={handleClearTracked}
              onClearActivities={handleClearActivities}
              tableDensity={tableDensity}
              onToggleDensity={() => setTableDensity((prev) => prev === 'comfortable' ? 'compact' : 'comfortable')}
              onOpenArchitecture={() => setIsArchitectureOpen(true)}
            />
          )}

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
              onCertificateVerified={handleCertificateVerified}
            />
          )}

          {activeTab === 'register' && (
            <RegisterSection
              onCertificateRegistered={(newId, certData) => handleCertificateRegistered(newId, certData)}
              onNavigateToVerify={handleNavigateToVerify}
            />
          )}

          {activeTab === 'revoke' && (
            <RevokeSection
              onNavigateToVerify={handleNavigateToVerify}
              onCertificateRevoked={handleCertificateRevoked}
            />
          )}

        </main>

        {/* Enterprise Dashboard Footer */}
        <footer className="bg-white border-t border-slate-200/90 py-8 mt-auto no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
            <div>
              <span className="font-extrabold text-slate-900">CertiVerify</span>
              <span className="text-slate-500 block sm:inline sm:ml-2">Certificate Issuance and Authentication Platform · AWS (S3, API Gateway, Lambda, DynamoDB)</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsArchitectureOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Architecture Spec
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Endpoint Settings
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* Certificate Details Specification Modal */}
      <CertificateDetailsModal
        certificate={selectedCertificate}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onVerifyInAws={(id) => {
          setIsDetailsModalOpen(false);
          handleVerifySearch(id);
        }}
        onRevokeCertificate={(id) => {
          setIsDetailsModalOpen(false);
          setActiveTab('revoke');
        }}
        onPrintCertificate={(cert) => {
          setIsDetailsModalOpen(false);
          handleOpenPrintModal(cert);
        }}
      />

      {/* A4 Printable Certificate Document Modal */}
      <CertificatePrintModal
        certificate={selectedCertificate}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* AWS Architecture & S3 Hosting Export Guide Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Settings & Preferences Modal */}
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigUpdated={handleConfigUpdated}
        tableDensity={tableDensity}
        onToggleDensity={() => setTableDensity((prev) => prev === 'comfortable' ? 'compact' : 'comfortable')}
        trackedCount={trackedCertificates.length}
        onClearTracked={handleClearTracked}
      />

      {/* Toast Notification Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />

    </div>
  );
}
