// SMS Service for sending OTP
// This is a placeholder implementation. Replace with actual SMS provider (Twilio, etc.)

export interface SMSProvider {
  sendOTP(phoneNumber: string, otp: string): Promise<boolean>;
}

class TwilioSMSProvider implements SMSProvider {
  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    try {
      // TODO: Implement Twilio SMS sending
      console.log(`Sending OTP ${otp} to ${phoneNumber}`);
      
      // For development, just log the OTP
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
        return true;
      }
      
      // Production implementation would go here
      // const client = require('twilio')(accountSid, authToken);
      // await client.messages.create({
      //   body: `Your verification code is: ${otp}`,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phoneNumber
      // });
      
      return true;
    } catch (error) {
      console.error('SMS sending error:', error);
      return false;
    }
  }
}

class MockSMSProvider implements SMSProvider {
  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    console.log(`[MOCK SMS] OTP for ${phoneNumber}: ${otp}`);
    return true;
  }
}

export const smsProvider: SMSProvider = 
  process.env.SMS_PROVIDER === 'twilio' 
    ? new TwilioSMSProvider() 
    : new MockSMSProvider();
