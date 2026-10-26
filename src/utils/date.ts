/**
 * Date and Expiration Utilities for CIAP Certificates
 */

import { CertificateData, CertificateBadgeStatus } from '../types.ts';

export interface ExpiryEvaluation {
  isExpired: boolean;
  daysRemaining: number | null;
  label: string;
  badgeStatus: CertificateBadgeStatus;
}

/**
 * Evaluates the expiration status of an optional expiry date string.
 */
export function evaluateExpiry(expiryDateStr: string | undefined): ExpiryEvaluation {
  if (!expiryDateStr || !expiryDateStr.trim()) {
    return {
      isExpired: false,
      daysRemaining: null,
      label: 'Permanent / No Expiration Date',
      badgeStatus: 'VALID'
    };
  }

  const expDate = new Date(expiryDateStr.trim());
  if (isNaN(expDate.getTime())) {
    return {
      isExpired: false,
      daysRemaining: null,
      label: expiryDateStr,
      badgeStatus: 'VALID'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays);
    return {
      isExpired: true,
      daysRemaining: diffDays,
      label: overdue === 1 ? 'Expired yesterday' : `Expired ${overdue} days ago`,
      badgeStatus: 'EXPIRED'
    };
  }

  if (diffDays === 0) {
    return {
      isExpired: false,
      daysRemaining: 0,
      label: 'Expires today',
      badgeStatus: 'EXPIRING_SOON'
    };
  }

  if (diffDays <= 30) {
    return {
      isExpired: false,
      daysRemaining: diffDays,
      label: `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      badgeStatus: 'EXPIRING_SOON'
    };
  }

  return {
    isExpired: false,
    daysRemaining: diffDays,
    label: `Valid (${diffDays} days remaining)`,
    badgeStatus: 'VALID'
  };
}

/**
 * Returns comprehensive badge display styling for any certificate,
 * ensuring REVOKED status strictly takes precedence over expiry.
 */
export function getCertificateBadgeConfig(cert: CertificateData): {
  type: CertificateBadgeStatus;
  label: string;
  badgeClasses: string;
  dotColor: string;
  description: string;
} {
  const statusUpper = (cert.status || '').toUpperCase().trim();

  // Rule 1: Revoked certificates are ALWAYS revoked, even if expiry is future
  if (statusUpper.includes('REVOKE')) {
    return {
      type: 'REVOKED',
      label: 'REVOKED',
      badgeClasses: 'bg-rose-50 text-rose-700 border border-rose-200/80',
      dotColor: 'bg-rose-500',
      description: cert.revokedAt ? `Revoked on ${cert.revokedAt}` : 'Invalidated in Amazon DynamoDB'
    };
  }

  // Rule 2: Check expiration if date present
  if (cert.expiryDate) {
    const evalResult = evaluateExpiry(cert.expiryDate);
    if (evalResult.isExpired) {
      return {
        type: 'EXPIRED',
        label: 'EXPIRED',
        badgeClasses: 'bg-slate-100 text-slate-700 border border-slate-300',
        dotColor: 'bg-slate-400',
        description: evalResult.label
      };
    }
    if (evalResult.badgeStatus === 'EXPIRING_SOON') {
      return {
        type: 'EXPIRING_SOON',
        label: 'EXPIRING SOON',
        badgeClasses: 'bg-amber-50 text-amber-700 border border-amber-200',
        dotColor: 'bg-amber-500',
        description: evalResult.label
      };
    }
  }

  // Rule 3: Valid status
  if (statusUpper.includes('VALID') || statusUpper.includes('ACTIVE') || statusUpper.includes('VERIFIED')) {
    return {
      type: 'VALID',
      label: 'VALID',
      badgeClasses: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
      dotColor: 'bg-emerald-500',
      description: 'Confirmed active in Amazon DynamoDB'
    };
  }

  if (statusUpper.includes('NOT FOUND')) {
    return {
      type: 'NOT_FOUND',
      label: 'NOT FOUND',
      badgeClasses: 'bg-amber-50 text-amber-800 border border-amber-300',
      dotColor: 'bg-amber-500',
      description: 'No record exists in DynamoDB'
    };
  }

  // Fallback
  return {
    type: 'VALID',
    label: statusUpper || 'ACTIVE',
    badgeClasses: 'bg-blue-50 text-blue-700 border border-blue-200',
    dotColor: 'bg-blue-500',
    description: 'Stored in DynamoDB'
  };
}
