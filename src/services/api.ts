/**
 * API service for CertiVerify
 * Interacts directly with Amazon API Gateway HTTP API
 */

import { getApiBaseUrl } from '../config.ts';
import { CertificateData, VerificationStatus } from '../types.ts';

export interface VerifyApiResponse {
  status: VerificationStatus;
  certificate?: CertificateData;
  error?: string;
  statusCode?: number;
}

export interface RegisterApiResponse {
  success: boolean;
  certificateId?: string;
  message?: string;
  error?: string;
  rawResponse?: Record<string, unknown>;
  statusCode?: number;
}

export interface RevokeApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  rawResponse?: Record<string, unknown>;
  statusCode?: number;
}

export interface ParsedLambdaResponse {
  statusCode: number;
  data: Record<string, unknown>;
  rawText: string;
  isProxyWrapped: boolean;
  error?: string;
}

/**
 * Normalizes status text from backend into standard VerificationStatus
 */
function normalizeStatus(backendStatus: string | undefined): VerificationStatus {
  if (!backendStatus) return 'VALID';
  const s = String(backendStatus).toUpperCase().trim();
  if (s.includes('REVOKE')) return 'REVOKED';
  if (s.includes('NOT FOUND') || s.includes('NOT_FOUND') || s.includes('INVALID') || s.includes('MISSING')) return 'NOT_FOUND';
  if (s.includes('VALID') || s.includes('ACTIVE') || s.includes('VERIFIED')) return 'VALID';
  return 'VALID';
}

/**
 * Robustly parses and unwraps AWS API Gateway / Lambda responses,
 * including proxy-wrapped responses where `body` is a JSON string.
 */
export function parseApiResponse(httpStatus: number, rawText: string): ParsedLambdaResponse {
  let effectiveStatusCode = httpStatus;
  let parsedJson: Record<string, unknown> = {};
  let isProxyWrapped = false;

  const trimmedText = rawText ? rawText.trim() : '';

  if (!trimmedText) {
    return {
      statusCode: httpStatus,
      data: {},
      rawText: '',
      isProxyWrapped: false,
      error: httpStatus >= 400 ? `HTTP ${httpStatus} error with empty response` : undefined
    };
  }

  try {
    const rawParsed = JSON.parse(trimmedText);
    if (rawParsed && typeof rawParsed === 'object' && !Array.isArray(rawParsed)) {
      parsedJson = rawParsed as Record<string, unknown>;
    } else {
      parsedJson = { value: rawParsed };
    }
  } catch {
    // Non-JSON plain text response
    return {
      statusCode: httpStatus,
      data: { message: trimmedText },
      rawText: trimmedText,
      isProxyWrapped: false,
      error: httpStatus >= 400 ? trimmedText : undefined
    };
  }

  // Handle AWS Lambda Proxy response format: { statusCode: 200, headers: {...}, body: "{...}" }
  if (
    typeof parsedJson.statusCode === 'number' &&
    ('body' in parsedJson || 'headers' in parsedJson)
  ) {
    isProxyWrapped = true;
    effectiveStatusCode = parsedJson.statusCode;

    // Body may be a stringified JSON string:
    if (typeof parsedJson.body === 'string') {
      try {
        const parsedBody = JSON.parse(parsedJson.body);
        if (parsedBody && typeof parsedBody === 'object' && !Array.isArray(parsedBody)) {
          parsedJson = { ...parsedJson, ...parsedBody, _proxyBody: parsedBody };
        } else {
          parsedJson = { ...parsedJson, message: parsedJson.body };
        }
      } catch {
        parsedJson = { ...parsedJson, message: parsedJson.body };
      }
    } else if (parsedJson.body && typeof parsedJson.body === 'object' && !Array.isArray(parsedJson.body)) {
      parsedJson = { ...parsedJson, ...(parsedJson.body as Record<string, unknown>) };
    }
  }

  // Extract explicit error if present
  let errorMsg: string | undefined;
  if (effectiveStatusCode >= 400) {
    errorMsg =
      (parsedJson.error as string) ||
      (parsedJson.errorMessage as string) ||
      (parsedJson.message as string) ||
      `AWS Lambda error (HTTP ${effectiveStatusCode})`;
  } else if (parsedJson.error && typeof parsedJson.error === 'string') {
    errorMsg = parsedJson.error;
  }

  return {
    statusCode: effectiveStatusCode,
    data: parsedJson,
    rawText,
    isProxyWrapped,
    error: errorMsg
  };
}

/**
 * Searches and extracts the certificate ID across standard and nested keys,
 * ensuring no empty or placeholder values are accepted.
 */
export function extractCertificateId(data: Record<string, unknown>): string | null {
  if (!data || typeof data !== 'object') return null;

  // Direct candidate keys (standard, snake_case, PascalCase, uppercase)
  const candidateKeys = [
    'certificateId',
    'certificate_id',
    'CertificateId',
    'CertificateID',
    'certificateID',
    'certId',
    'cert_id',
    'CertId',
    'id',
    'ID',
    'Id'
  ];

  for (const key of candidateKeys) {
    const val = data[key];
    if (typeof val === 'string' && val.trim().length > 0 && val !== 'ID_NOT_RETURNED_BY_BACKEND') {
      return val.trim();
    }
    if (typeof val === 'number') {
      return String(val);
    }
  }

  // Check nested containers: item, record, certificate, data, result, _proxyBody
  const nestedKeys = ['item', 'record', 'certificate', 'data', 'result', '_proxyBody'];
  for (const nk of nestedKeys) {
    const nested = data[nk];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      const nestedId = extractCertificateId(nested as Record<string, unknown>);
      if (nestedId) return nestedId;
    }
  }

  // Extract from message if formatted as "Certificate [ID] registered..."
  if (typeof data.message === 'string') {
    const match = data.message.match(/\b(CERT-[A-Za-z0-9_-]+|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\b/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Verify a certificate by ID using GET /verify?id=THE_CERTIFICATE_ID
 */
export async function verifyCertificate(certificateId: string): Promise<VerifyApiResponse> {
  const trimmedId = certificateId.trim();
  if (!trimmedId) {
    return {
      status: 'ERROR',
      error: 'Please enter a valid certificate ID.'
    };
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/verify?id=${encodeURIComponent(trimmedId)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const rawText = await response.text();
    const parsed = parseApiResponse(response.status, rawText);
    const data = parsed.data;

    // Handle 404 or explicit NOT FOUND responses
    if (
      parsed.statusCode === 404 ||
      String(data.status).toUpperCase() === 'NOT FOUND' ||
      String(data.status).toUpperCase() === 'NOT_FOUND' ||
      (typeof data.message === 'string' && data.message.toLowerCase().includes('no certificate exists'))
    ) {
      return {
        status: 'NOT_FOUND',
        statusCode: parsed.statusCode,
        certificate: {
          certificateId: extractCertificateId(data) || trimmedId,
          status: 'NOT FOUND',
          message: (data.message as string) || 'No certificate exists with this ID in DynamoDB records.',
          rawResponse: data
        }
      };
    }

    // Handle 401/403 unauthorized
    if (parsed.statusCode === 401 || parsed.statusCode === 403) {
      return {
        status: 'ERROR',
        statusCode: parsed.statusCode,
        error: parsed.error || (data.error as string) || (data.message as string) || 'Unauthorized request to API Gateway.'
      };
    }

    // Handle server error responses (500, etc.)
    if (parsed.statusCode >= 400) {
      return {
        status: 'ERROR',
        statusCode: parsed.statusCode,
        error: parsed.error || `API Gateway returned HTTP ${parsed.statusCode}: ${response.statusText}`
      };
    }

    // Successfully retrieved certificate record
    const statusStr = (data.status as string) || 'VALID';
    const normalized = normalizeStatus(statusStr);

    const certificate: CertificateData = {
      certificateId: extractCertificateId(data) || trimmedId,
      studentName: (data.studentName as string) || (data.student_name as string) || (data.name as string),
      course: (data.course as string) || (data.courseName as string) || (data.program as string),
      institution: (data.institution as string) || (data.issuer as string) || (data.university as string),
      issueDate: (data.issueDate as string) || (data.issue_date as string) || (data.date as string),
      status: statusStr,
      revokedAt: (data.revokedAt as string) || (data.revoked_at as string) || (data.revocationDate as string),
      revocationReason: (data.revocationReason as string) || (data.reason as string),
      message: (data.message as string),
      rawResponse: data
    };

    return {
      status: normalized,
      statusCode: parsed.statusCode,
      certificate
    };

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const isCorsOrNetwork = errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('Load failed');

    return {
      status: 'ERROR',
      error: isCorsOrNetwork
        ? `Unable to connect to AWS API Gateway at "${baseUrl}". Ensure your API Gateway is accessible and CORS is enabled for origin "${typeof window !== 'undefined' ? window.location.origin : '*'}" with headers "content-type,x-admin-key".`
        : `Network error: ${errorMsg}`
    };
  }
}

/**
 * Register a new certificate using POST /register
 */
export async function registerCertificate(payload: {
  studentName: string;
  course: string;
  institution: string;
  issueDate: string;
  certificateId?: string;
  adminKey?: string;
}): Promise<RegisterApiResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/register`;

  const trimmedName = payload.studentName.trim();
  const trimmedCourse = payload.course.trim();
  const trimmedInstitution = payload.institution.trim();
  const trimmedDate = payload.issueDate.trim();
  const trimmedCustomId = payload.certificateId ? payload.certificateId.trim() : '';

  // Request payload providing all standard property formats
  const requestBody: Record<string, unknown> = {
    // Standard camelCase (preferred by JavaScript/TypeScript AWS SDK)
    studentName: trimmedName,
    course: trimmedCourse,
    institution: trimmedInstitution,
    issueDate: trimmedDate,

    // snake_case aliases (preferred by Python Boto3)
    student_name: trimmedName,
    issue_date: trimmedDate,

    // Short and PascalCase aliases
    name: trimmedName,
    date: trimmedDate,
    StudentName: trimmedName,
    Course: trimmedCourse,
    Institution: trimmedInstitution,
    IssueDate: trimmedDate
  };

  // If a custom certificate ID was provided by administrator, send it
  if (trimmedCustomId) {
    requestBody.certificateId = trimmedCustomId;
    requestBody.certificate_id = trimmedCustomId;
    requestBody.id = trimmedCustomId;
    requestBody.CertificateId = trimmedCustomId;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (payload.adminKey && payload.adminKey.trim()) {
    headers['X-Admin-Key'] = payload.adminKey.trim();
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    const rawText = await response.text();
    const parsed = parseApiResponse(response.status, rawText);
    const data = parsed.data;

    // Check for HTTP errors or Lambda proxy errors (400, 401, 500)
    if (parsed.statusCode >= 400 || parsed.error) {
      return {
        success: false,
        statusCode: parsed.statusCode,
        error: parsed.error || `Registration failed with status HTTP ${parsed.statusCode}`,
        rawResponse: data
      };
    }

    // Extract genuine certificate ID from response
    const certId = extractCertificateId(data);

    // CRITICAL: Genuine validation of returned certificate ID
    // Do NOT substitute placeholders. If backend did not return an ID, fail honestly!
    if (!certId || certId.trim().length === 0) {
      return {
        success: false,
        statusCode: parsed.statusCode,
        error: `AWS API Gateway returned HTTP ${parsed.statusCode}, but the response did not contain a valid 'certificateId'. Ensure your Lambda function includes 'certificateId' in the JSON return dictionary. Received: ${rawText.slice(0, 300)}`,
        rawResponse: data
      };
    }

    return {
      success: true,
      statusCode: parsed.statusCode,
      certificateId: certId,
      message: (data.message as string) || `Certificate ${certId} registered successfully in Amazon DynamoDB.`,
      rawResponse: data
    };

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const isCorsOrNetwork = errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError');

    return {
      success: false,
      error: isCorsOrNetwork
        ? `Unable to connect to AWS API Gateway at "${baseUrl}/register". Check internet connectivity and API Gateway CORS settings.`
        : `Network error: ${errorMsg}`
    };
  }
}

/**
 * Revoke an existing certificate using POST /revoke
 */
export async function revokeCertificate(payload: {
  certificateId: string;
  adminKey?: string;
}): Promise<RevokeApiResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/revoke`;

  const trimmedId = payload.certificateId.trim();

  // Send both id and certificateId keys
  const requestBody = {
    id: trimmedId,
    certificateId: trimmedId,
    certificate_id: trimmedId
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (payload.adminKey && payload.adminKey.trim()) {
    headers['X-Admin-Key'] = payload.adminKey.trim();
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    const rawText = await response.text();
    const parsed = parseApiResponse(response.status, rawText);
    const data = parsed.data;

    if (parsed.statusCode >= 400 || parsed.error) {
      return {
        success: false,
        statusCode: parsed.statusCode,
        error: parsed.error || `Revocation failed with status HTTP ${parsed.statusCode}`,
        rawResponse: data
      };
    }

    return {
      success: true,
      statusCode: parsed.statusCode,
      message: (data.message as string) || `Certificate ${trimmedId} was revoked successfully in Amazon DynamoDB.`,
      rawResponse: data
    };

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const isCorsOrNetwork = errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError');

    return {
      success: false,
      error: isCorsOrNetwork
        ? `Unable to connect to AWS API Gateway at "${baseUrl}/revoke". Check network connectivity and API Gateway CORS settings.`
        : `Network error: ${errorMsg}`
    };
  }
}
