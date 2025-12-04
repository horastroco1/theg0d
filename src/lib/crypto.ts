import CryptoJS from 'crypto-js';

export const cryptoService = {
  /**
   * Encrypts a message using the User's Identity Key.
   * Result is purely random bytes to anyone without the key.
   */
  encrypt: (text: string, secretKey: string): string => {
    if (!secretKey) return text;
    return CryptoJS.AES.encrypt(text, secretKey).toString();
  },

  /**
   * Decrypts a message.
   * Returns the original text if key is correct, or empty string if failed.
   */
  decrypt: (cipherText: string, secretKey: string): string => {
    if (!secretKey) return cipherText;
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText || "[ENCRYPTED DATA CORRUPTED]";
    } catch (e) {
      return "[LOCKED]";
    }
  }
};

