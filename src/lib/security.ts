export const security = {
  sanitizeInput: (input: string) => input.replace(/[<>]/g, ''),
  validate: (input: string) => true,
  checkRateLimit: (key: string, limit: number, window: number) => true
};
