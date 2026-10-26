/**
 * CertiVerify Configuration
 * 
 * Cloud computing microproject: Digital Certificate Verification System Using AWS
 * Backend: Amazon API Gateway HTTP API -> AWS Lambda (CertificateVerificationAPI) -> Amazon DynamoDB (CertificateRecords)
 * Hosting: Amazon S3 Static Website Hosting
 */

// Amazon API Gateway HTTP API Invoke URL provided by the user:
export const DEFAULT_API_BASE_URL: string = "https://jgac25hwu6.execute-api.ap-south-1.amazonaws.com/prod";

// Amazon S3 Static Website Hosting URL placeholder:
// Once you create your S3 bucket (e.g. certiverify-frontend.s3-website.ap-south-1.amazonaws.com),
// replace this URL so generated QR codes point directly to your deployed S3 website.
export const DEFAULT_S3_WEBSITE_URL: string = "https://YOUR_S3_WEBSITE_URL";

/**
 * Resolves the active API Base URL.
 * Prioritizes runtime session override (for custom endpoint testing in the browser)
 * and falls back to DEFAULT_API_BASE_URL.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const sessionOverride = sessionStorage.getItem("certiverify_runtime_api_url");
    if (sessionOverride && sessionOverride.trim().length > 0) {
      return sessionOverride.trim().replace(/\/+$/, "");
    }
  }
  return DEFAULT_API_BASE_URL.trim().replace(/\/+$/, "");
}

/**
 * Resolves the S3 or deployed website URL for QR codes.
 * If set to default placeholder, falls back to current window origin if available.
 */
export function getS3WebsiteUrl(): string {
  if (typeof window !== "undefined") {
    const sessionOverride = sessionStorage.getItem("certiverify_runtime_s3_url");
    if (sessionOverride && sessionOverride.trim().length > 0) {
      return sessionOverride.trim().replace(/\/+$/, "");
    }
    if (DEFAULT_S3_WEBSITE_URL && DEFAULT_S3_WEBSITE_URL !== "https://YOUR_S3_WEBSITE_URL") {
      return DEFAULT_S3_WEBSITE_URL.trim().replace(/\/+$/, "");
    }
    if (window.location && window.location.origin) {
      return window.location.origin;
    }
  }
  return DEFAULT_S3_WEBSITE_URL;
}
