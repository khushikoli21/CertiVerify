/**
 * Types for CertiVerify - AWS Digital Certificate Verification System
 */

export type VerificationStatus = 'IDLE' | 'LOADING' | 'VALID' | 'REVOKED' | 'NOT_FOUND' | 'ERROR';

export interface CertificateData {
  certificateId: string;
  studentName?: string;
  course?: string;
  institution?: string;
  issueDate?: string;
  status: string;
  revokedAt?: string;
  revocationReason?: string;
  message?: string;
  rawResponse?: Record<string, unknown>;
}

export interface RegisterFormFields {
  studentName: string;
  course: string;
  institution: string;
  issueDate: string;
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
