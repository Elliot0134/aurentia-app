/**
 * Encryption Service
 * Handles encryption/decryption of sensitive credentials and API key management
 *
 * SECURITY NOTE:
 * - Phase 1: Using client-side encryption for webhook URLs (semi-public data)
 * - Phase 2: Will migrate to Supabase Vault for OAuth tokens (highly sensitive)
 * - Encryption key should be stored in environment variables, NOT in code
 */

import CryptoJS from 'crypto-js';
import type { IntegrationCredentials } from '@/types/integrationTypes';
import { API_KEY_PREFIXES } from '@/lib/integrationConstants';

// =====================================================
// CONFIGURATION
// =====================================================

/**
 * Get encryption key from environment
 * In production, this should be a strong, randomly generated key
 * stored securely in environment variables
 */
function getEncryptionKey(): string {
  // Try to get from environment variable
  const envKey = import.meta.env.VITE_ENCRYPTION_KEY;

  if (envKey) {
    return envKey;
  }

  // Fallback for development (NOT for production!)
  if (import.meta.env.DEV) {
    console.warn(
      '[EncryptionService] Using default encryption key in development. ' +
        'Set VITE_ENCRYPTION_KEY in .env for production!'
    );
    return 'aurentia-default-encryption-key-change-in-production';
  }

  throw new Error(
    'VITE_ENCRYPTION_KEY environment variable is required for encryption. ' +
      'Please set it in your .env file.'
  );
}

// =====================================================
// ENCRYPTION SERVICE CLASS
// =====================================================

class EncryptionService {
  private readonly encryptionKey: string;

  constructor() {
    this.encryptionKey = getEncryptionKey();
  }

  /**
   * Encrypt sensitive data before storing in database
   * Uses AES-256 encryption
   *
   * @param data - Plain object to encrypt
   * @returns Encrypted string
   */
  encrypt(data: IntegrationCredentials | Record<string, any>): string {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, this.encryptionKey).toString();
      return encrypted;
    } catch (error) {
      console.error('[EncryptionService] Encryption failed:', error);
      throw new Error('Failed to encrypt credentials');
    }
  }

  /**
   * Decrypt data when retrieving from database
   *
   * @param encryptedData - Encrypted string from database
   * @returns Decrypted object
   */
  decrypt<T = IntegrationCredentials>(encryptedData: string): T {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedString) {
        throw new Error('Decryption resulted in empty string');
      }

      return JSON.parse(decryptedString) as T;
    } catch (error) {
      console.error('[EncryptionService] Decryption failed:', error);
      throw new Error('Failed to decrypt credentials. Data may be corrupted or encryption key changed.');
    }
  }

  /**
   * Hash an API key using SHA-256 for secure storage
   * We store the hash, not the plaintext key
   *
   * @param key - The API key to hash
   * @returns SHA-256 hash of the key
   */
  async hashApiKey(key: string): Promise<string> {
    try {
      // Use Web Crypto API for hashing (browser standard)
      const encoder = new TextEncoder();
      const data = encoder.encode(key);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);

      // Convert buffer to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');

      return hashHex;
    } catch (error) {
      console.error('[EncryptionService] API key hashing failed:', error);
      throw new Error('Failed to hash API key');
    }
  }

  /**
   * Generate a secure random API key
   *
   * @param scope - The scope of the API key (personal or organization)
   * @returns Object containing the generated key and its prefix
   */
  generateApiKey(scope: 'personal' | 'organization' = 'personal'): {
    key: string;
    prefix: string;
  } {
    try {
      const prefix = scope === 'organization' ? API_KEY_PREFIXES.organization : API_KEY_PREFIXES.personal;

      // Generate 32 bytes of random data
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);

      // Convert to base62 string (alphanumeric)
      const base62Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let randomString = '';

      for (let i = 0; i < randomBytes.length; i++) {
        randomString += base62Chars[randomBytes[i] % base62Chars.length];
      }

      const key = `${prefix}_${randomString}`;

      return {
        key,
        prefix: key.substring(0, 12) // First 12 chars for display (e.g., "sk_live_XXXX")
      };
    } catch (error) {
      console.error('[EncryptionService] API key generation failed:', error);
      throw new Error('Failed to generate API key');
    }
  }

  /**
   * Verify an API key against its hash
   *
   * @param key - The API key to verify
   * @param hash - The stored hash to compare against
   * @returns True if the key matches the hash
   */
  async verifyApiKey(key: string, hash: string): Promise<boolean> {
    try {
      const keyHash = await this.hashApiKey(key);
      return keyHash === hash;
    } catch (error) {
      console.error('[EncryptionService] API key verification failed:', error);
      return false;
    }
  }

  /**
   * Generate a random webhook secret for HMAC signature verification
   *
   * @returns Random hex string (32 bytes = 64 characters)
   */
  generateWebhookSecret(): string {
    try {
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);

      // Convert to hex string
      return Array.from(randomBytes)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      console.error('[EncryptionService] Webhook secret generation failed:', error);
      throw new Error('Failed to generate webhook secret');
    }
  }

  /**
   * Generate HMAC signature for webhook payload
   * Used to verify webhook authenticity
   *
   * @param payload - The webhook payload (as string)
   * @param secret - The webhook secret
   * @returns HMAC-SHA256 signature
   */
  generateWebhookSignature(payload: string, secret: string): string {
    try {
      const hmac = CryptoJS.HmacSHA256(payload, secret);
      return hmac.toString(CryptoJS.enc.Hex);
    } catch (error) {
      console.error('[EncryptionService] Webhook signature generation failed:', error);
      throw new Error('Failed to generate webhook signature');
    }
  }

  /**
   * Verify webhook signature
   *
   * @param payload - The webhook payload (as string)
   * @param signature - The signature to verify
   * @param secret - The webhook secret
   * @returns True if signature is valid
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const expectedSignature = this.generateWebhookSignature(payload, secret);
      return signature === expectedSignature;
    } catch (error) {
      console.error('[EncryptionService] Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Securely compare two strings (timing-safe comparison)
   * Prevents timing attacks
   *
   * @param a - First string
   * @param b - Second string
   * @returns True if strings are equal
   */
  secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

/**
 * Singleton instance of EncryptionService
 * Use this throughout the application
 */
export const encryptionService = new EncryptionService();

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Mask sensitive data for display (e.g., API keys, webhook URLs)
 *
 * @param value - The value to mask
 * @param visibleChars - Number of characters to show at start and end
 * @returns Masked string
 */
export function maskSensitiveValue(value: string, visibleChars: number = 8): string {
  if (value.length <= visibleChars * 2) {
    return '•'.repeat(value.length);
  }

  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  const middle = '•'.repeat(Math.min(20, value.length - visibleChars * 2));

  return `${start}${middle}${end}`;
}

/**
 * Validate encryption key strength
 * Returns warnings if key is weak
 *
 * @param key - The encryption key to validate
 * @returns Array of warnings (empty if key is strong)
 */
export function validateEncryptionKey(key: string): string[] {
  const warnings: string[] = [];

  if (key.length < 32) {
    warnings.push('Encryption key should be at least 32 characters long');
  }

  if (!/[A-Z]/.test(key)) {
    warnings.push('Encryption key should contain uppercase letters');
  }

  if (!/[a-z]/.test(key)) {
    warnings.push('Encryption key should contain lowercase letters');
  }

  if (!/[0-9]/.test(key)) {
    warnings.push('Encryption key should contain numbers');
  }

  if (!/[^A-Za-z0-9]/.test(key)) {
    warnings.push('Encryption key should contain special characters');
  }

  if (key.includes('default') || key.includes('change') || key.includes('example')) {
    warnings.push('Encryption key appears to be a default/example key - use a unique key!');
  }

  return warnings;
}

// =====================================================
// TYPE GUARDS
// =====================================================

/**
 * Check if a value is encrypted (heuristic check)
 * Encrypted AES values typically contain base64 characters and are longer
 *
 * @param value - The value to check
 * @returns True if value appears to be encrypted
 */
export function isEncrypted(value: string): boolean {
  // AES encrypted values are typically base64-encoded and longer than plaintext
  // This is a heuristic check, not cryptographically secure
  return value.length > 50 && /^[A-Za-z0-9+/=]+$/.test(value);
}

/**
 * Check if a string is a valid API key format
 *
 * @param value - The value to check
 * @returns True if value matches API key format
 */
export function isValidApiKeyFormat(value: string): boolean {
  const validPrefixes = Object.values(API_KEY_PREFIXES);
  return validPrefixes.some((prefix) => value.startsWith(prefix + '_'));
}
