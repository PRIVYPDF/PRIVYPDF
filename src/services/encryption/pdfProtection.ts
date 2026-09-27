import { PDFDocument } from 'pdf-lib';
import { encryptPDF, EncryptPDFOptions, AlreadyEncryptedError } from '@pdfsmaller/pdf-encrypt';

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  feedback: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  if (!password) {
    return { score: 0, label: 'Very Weak', feedback: ['Enter a password'] };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase and lowercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters (!@#$%...)');

  const labels: PasswordStrength['label'][] = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];

  return {
    score,
    label: labels[score],
    feedback,
  };
}

/**
 * Client-Side PDF Password Encryption:
 * Applies genuine PDF specification password encryption (AES-256 standard with RC4 fallback)
 * right inside your local browser sandbox via the Web Crypto API.
 */
export async function protectPdfDocument(
  pdfBytes: ArrayBuffer,
  userPassword: string,
  permissions: {
    allowPrinting?: boolean;
    allowCopying?: boolean;
    allowModifying?: boolean;
    algorithm?: 'AES-256' | 'RC4';
  } = {}
): Promise<{ protectedBytes: Uint8Array; notice: string }> {
  // First load document to embed metadata and sanitize structure
  const doc = await PDFDocument.load(pdfBytes);
  doc.setTitle(`Protected Document (${new Date().toLocaleDateString()})`);
  doc.setProducer('PrivyPDF Local Privacy Engine');
  doc.setCreator('PrivyPDF Browser Sandbox');

  const preparedBytes = await doc.save({ useObjectStreams: false });

  const encryptOptions: EncryptPDFOptions = {
    algorithm: permissions.algorithm || 'AES-256',
    allowPrinting: permissions.allowPrinting ?? true,
    allowCopying: permissions.allowCopying ?? false,
    allowModifying: permissions.allowModifying ?? false,
    allowHighQualityPrint: permissions.allowPrinting ?? true,
    allowExtraction: permissions.allowCopying ?? false,
  };

  try {
    const encrypted = await encryptPDF(preparedBytes, userPassword, encryptOptions);
    return {
      protectedBytes: encrypted,
      notice: `Genuine ${encryptOptions.algorithm} PDF password protection applied locally in your browser.`,
    };
  } catch (err) {
    if (err instanceof AlreadyEncryptedError) {
      throw new Error('This PDF document is already encrypted or password-protected.');
    }
    // If Web Crypto AES-256 is restricted in insecure context, fallback to RC4
    if (encryptOptions.algorithm === 'AES-256') {
      try {
        const rc4Encrypted = await encryptPDF(preparedBytes, userPassword, {
          ...encryptOptions,
          algorithm: 'RC4',
        });
        return {
          protectedBytes: rc4Encrypted,
          notice: 'Genuine RC4 128-bit PDF password protection applied locally in your browser.',
        };
      } catch (rc4Err) {
        console.error('RC4 Encryption error:', rc4Err);
      }
    }
    throw new Error('Unable to encrypt PDF. Please check your password characters and try again.');
  }
}
