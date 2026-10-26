/**
 * QR Code Generator Utility
 * Generates browser-side QR codes pointing to the S3 hosted verification URL
 */

import QRCode from 'qrcode';
import { getS3WebsiteUrl } from '../config.ts';

/**
 * Creates the official verification URL for a given certificate ID
 * pointing to the S3-hosted site with ?id=CERTIFICATE_ID
 */
export function getVerificationUrl(certificateId: string): string {
  const baseUrl = getS3WebsiteUrl().replace(/\/+$/, '');
  return `${baseUrl}/?id=${encodeURIComponent(certificateId.trim())}`;
}

/**
 * Generates a high-resolution QR code data URL in the browser
 */
export async function generateQrDataUrl(certificateId: string): Promise<string> {
  const targetUrl = getVerificationUrl(certificateId);
  try {
    const dataUrl = await QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a', // Navy / slate-900
        light: '#ffffff'  // Pure white background
      },
      errorCorrectionLevel: 'H'
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code', err);
    throw new Error('Could not generate QR code image.');
  }
}

/**
 * Downloads a QR data URL as a PNG file
 */
export function downloadQrCode(dataUrl: string, certificateId: string) {
  const link = document.createElement('a');
  link.download = `CertiVerify-QR-${certificateId}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
