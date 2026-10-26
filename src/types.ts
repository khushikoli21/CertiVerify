/**
 * Types for CIAP (Certificate Issuance and Authentication Platform)
 * Digital Certificate Verification System Using AWS
 */

export type VerificationStatus = 'IDLE' | 'LOADING' | 'VALID' | 'REVOKED' | 'NOT_FOUND' | 'ERROR';

export interface CertificateData {
  certificateId: string;
  studentName?: string;
  course?: string;
  institution?: string;
  issueDate?: string;
  expiryDate?: string;
  status: string; // 'VALID' | 'REVOKED' | 'EXPIRED' | etc.
  revokedAt?: string;
  revocationReason?: string;
  message?: string;
  verifiedAt?: string;
  rawResponse?: Record<string, unknown>;
}

export interface RegisterFormFields {
  studentName: string;
  course: string;
  institution: string;
  issueDate: string;
  expiryDate?: string;
  certificateId?: string;
  adminKey: string;
}

export interface RevokeFormFields {
  certificateId: string;
  adminKey: string;
}

export interface RegistrationSuccessResult {
  certificateId: string;
  message?: string;
  status?: string;
  rawResponse?: Record<string, unknown>;
}

export interface RevocationSuccessResult {
  certificateId: string;
  message?: string;
  status?: string;
  rawResponse?: Record<string, unknown>;
}

/**
 * In-session activity log record (clearly identified as session-based)
 */
export interface SessionActivity {
  id: string;
  type: 'VERIFY' | 'REGISTER' | 'REVOKE' | 'PRINT';
  certificateId: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  description: string;
  timestamp: string;
}

/**
 * Toast notification for real API and user actions
 */
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp?: number;
}

/**
 * UI Preferences (stored in browser session/local storage for UI state only)
 */
export interface UiPreferences {
  tableDensity: 'comfortable' | 'compact';
  autoCopyLinks: boolean;
  showActivityPanel: boolean;
}
