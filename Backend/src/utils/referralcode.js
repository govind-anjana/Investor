export const generateReferralCode = (prefix) =>
  prefix + Math.random().toString(36).substring(2, 8).toUpperCase();