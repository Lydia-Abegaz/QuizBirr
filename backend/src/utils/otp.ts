import crypto from 'crypto';

export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
};

export const getOTPExpiry = (minutes: number = 10): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

export const isOTPExpired = (expiry: Date): boolean => {
  return new Date() > expiry;
};

export const generateReferralCode = (length: number = 8): string => {
  return crypto.randomBytes(length).toString('hex').toUpperCase().slice(0, length);
};
