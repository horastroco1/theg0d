export const security = {
  /**
   * Removes potentially dangerous characters and limits length.
   * Useful before sending data to APIs.
   */
  sanitizeInput: (input: string, maxLength = 500): string => {
    if (!input) return "";
    // Basic strip tags (not perfect, but helpful for simple text)
    let clean = input.replace(/<\/?[^>]+(>|$)/g, "");
    // Trim whitespace
    clean = clean.trim();
    // Truncate
    return clean.substring(0, maxLength);
  },

  /**
   * Simple client-side rate limiter using LocalStorage.
   * Limits user to N requests per M seconds.
   */
  checkRateLimit: (key: string, limit = 5, windowSeconds = 60): boolean => {
    if (typeof window === 'undefined') return true; // Server-side check skip

    const now = Date.now();
    const storageKey = `ratelimit_${key}`;
    const record = localStorage.getItem(storageKey);

    if (!record) {
      localStorage.setItem(storageKey, JSON.stringify({ count: 1, startTime: now }));
      return true;
    }

    const data = JSON.parse(record);
    
    // Reset window if time passed
    if (now - data.startTime > windowSeconds * 1000) {
      localStorage.setItem(storageKey, JSON.stringify({ count: 1, startTime: now }));
      return true;
    }

    // Check limit
    if (data.count >= limit) {
      return false;
    }

    // Increment
    data.count++;
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  }
};

