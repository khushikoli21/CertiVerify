/**
 * Certificate Storage & Session Management Utility for CIAP
 * Manages genuine certificates verified or registered in the current browser session.
 * Does not fabricate backend data.
 */

import { CertificateData, SessionActivity } from '../types.ts';

const TRACKED_CERTS_KEY = 'ciap_tracked_certificates';
const SESSION_ACTIVITIES_KEY = 'ciap_session_activities';

/**
 * Returns genuine certificates tracked in this session.
 */
export function getTrackedCertificates(): CertificateData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(TRACKED_CERTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves or updates a genuine certificate record in session memory.
 */
export function trackCertificate(cert: CertificateData): CertificateData[] {
  if (typeof window === 'undefined' || !cert.certificateId) return [];
  try {
    const current = getTrackedCertificates();
    const index = current.findIndex(c => c.certificateId.toLowerCase() === cert.certificateId.toLowerCase());
    
    let updated: CertificateData[];
    if (index >= 0) {
      // Merge with existing record while updating with latest backend response
      updated = [...current];
      updated[index] = { ...updated[index], ...cert, verifiedAt: new Date().toLocaleString() };
    } else {
      updated = [{ ...cert, verifiedAt: new Date().toLocaleString() }, ...current];
    }

    sessionStorage.setItem(TRACKED_CERTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Updates the status of a tracked certificate (e.g. to REVOKED).
 */
export function updateTrackedCertificateStatus(certificateId: string, newStatus: string): CertificateData[] {
  if (typeof window === 'undefined' || !certificateId) return [];
  try {
    const current = getTrackedCertificates();
    const updated = current.map(c => {
      if (c.certificateId.toLowerCase() === certificateId.toLowerCase()) {
        return { ...c, status: newStatus, revokedAt: new Date().toLocaleString() };
      }
      return c;
    });
    sessionStorage.setItem(TRACKED_CERTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Removes a certificate from the tracked session list.
 */
export function removeTrackedCertificate(certificateId: string): CertificateData[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getTrackedCertificates();
    const updated = current.filter(c => c.certificateId.toLowerCase() !== certificateId.toLowerCase());
    sessionStorage.setItem(TRACKED_CERTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Calculates expiry indicators for a certificate.
 * Treat revoked certificates as revoked regardless of expiry.
 */
export function getCertificateExpiryInfo(cert: CertificateData): {
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysRemaining: number | null;
  displayStatus: 'VALID' | 'REVOKED' | 'EXPIRED' | 'EXPIRING_SOON';
} {
  const isRevoked = String(cert.status || '').toUpperCase().includes('REVOKE');
  if (isRevoked) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      daysRemaining: null,
      displayStatus: 'REVOKED'
    };
  }

  if (!cert.expiryDate) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      daysRemaining: null,
      displayStatus: 'VALID'
    };
  }

  const expiry = new Date(cert.expiryDate);
  if (isNaN(expiry.getTime())) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      daysRemaining: null,
      displayStatus: 'VALID'
    };
  }

  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      isExpired: true,
      isExpiringSoon: false,
      daysRemaining: diffDays,
      displayStatus: 'EXPIRED'
    };
  } else if (diffDays <= 30) {
    return {
      isExpired: false,
      isExpiringSoon: true,
      daysRemaining: diffDays,
      displayStatus: 'EXPIRING_SOON'
    };
  }

  return {
    isExpired: false,
    isExpiringSoon: false,
    daysRemaining: diffDays,
    displayStatus: 'VALID'
  };
}

/**
 * Session Activity Log Handlers
 */
export function getSessionActivities(): SessionActivity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(SESSION_ACTIVITIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function logSessionActivity(activity: Omit<SessionActivity, 'id' | 'timestamp'>): SessionActivity[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSessionActivities();
    const newActivity: SessionActivity = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    const updated = [newActivity, ...current].slice(0, 30); // Keep last 30 activities
    sessionStorage.setItem(SESSION_ACTIVITIES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearSessionActivities(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_ACTIVITIES_KEY);
  }
}
