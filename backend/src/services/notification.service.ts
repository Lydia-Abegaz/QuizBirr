import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Send transaction confirmation email
   */
  async sendTransactionConfirmation(userId: string, transaction: any) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phoneNumber: true }
      });

      if (!user) return;

      const email = `${user.phoneNumber.slice(-8)}@quizbirr.app`; // Generate email from phone
      
      const template = this.getTransactionTemplate(transaction);
      
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      console.log(`Transaction confirmation sent to ${email}`);
    } catch (error) {
      console.error('Send transaction confirmation error:', error);
    }
  }

  /**
   * Send withdrawal approval notification
   */
  async sendWithdrawalNotification(userId: string, amount: number, status: 'approved' | 'rejected') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phoneNumber: true }
      });

      if (!user) return;

      const email = `${user.phoneNumber.slice(-8)}@quizbirr.app`;
      
      const template = this.getWithdrawalTemplate(amount, status);
      
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      console.log(`Withdrawal notification sent to ${email}`);
    } catch (error) {
      console.error('Send withdrawal notification error:', error);
    }
  }

  /**
   * Send mystery box reward notification
   */
  async sendMysteryBoxNotification(userId: string, reward: any) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phoneNumber: true }
      });

      if (!user) return;

      const email = `${user.phoneNumber.slice(-8)}@quizbirr.app`;
      
      const template = this.getMysteryBoxTemplate(reward);
      
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      console.log(`Mystery box notification sent to ${email}`);
    } catch (error) {
      console.error('Send mystery box notification error:', error);
    }
  }

  private getTransactionTemplate(transaction: any): EmailTemplate {
    const isDeposit = transaction.type === 'deposit';
    const action = isDeposit ? 'Deposit' : 'Transaction';
    
    return {
      subject: `QuizBirr ${action} Confirmation - ${transaction.amount} ETB`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d0f12;">QuizBirr ${action} Confirmation</h2>
          <p>Your ${action.toLowerCase()} has been processed successfully.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Transaction Details:</h3>
            <p><strong>Amount:</strong> ${transaction.amount} ETB</p>
            <p><strong>Type:</strong> ${transaction.type}</p>
            <p><strong>Reference:</strong> ${transaction.reference}</p>
            <p><strong>Status:</strong> ${transaction.status}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>Thank you for using QuizBirr!</p>
        </div>
      `,
      text: `QuizBirr ${action} Confirmation\n\nAmount: ${transaction.amount} ETB\nReference: ${transaction.reference}\nStatus: ${transaction.status}`
    };
  }

  private getWithdrawalTemplate(amount: number, status: 'approved' | 'rejected'): EmailTemplate {
    const isApproved = status === 'approved';
    
    return {
      subject: `QuizBirr Withdrawal ${isApproved ? 'Approved' : 'Rejected'} - ${amount} ETB`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${isApproved ? '#28a745' : '#dc3545'};">
            Withdrawal ${isApproved ? 'Approved' : 'Rejected'}
          </h2>
          <p>Your withdrawal request for ${amount} ETB has been ${status}.</p>
          ${isApproved ? 
            '<p>Your money will be processed within 24 hours.</p>' : 
            '<p>Please contact support if you have questions about this decision.</p>'
          }
          <p>Thank you for using QuizBirr!</p>
        </div>
      `,
      text: `QuizBirr Withdrawal ${status}\n\nAmount: ${amount} ETB\nStatus: ${status}`
    };
  }

  private getMysteryBoxTemplate(reward: any): EmailTemplate {
    return {
      subject: `QuizBirr Mystery Box - You won ${reward.amount} ETB!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d0f12;">🎁 Mystery Box Reward!</h2>
          <p>Congratulations! You opened a mystery box and won:</p>
          <div style="background: linear-gradient(135deg, #ffd700, #ffed4e); padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <h1 style="color: #0d0f12; margin: 0; font-size: 2.5em;">${reward.amount} ETB</h1>
            <p style="color: #0d0f12; margin: 10px 0; font-weight: bold;">Reward Type: ${reward.type.toUpperCase()}</p>
          </div>
          <p>The reward has been added to your wallet balance.</p>
          <p>Keep playing to earn more rewards!</p>
        </div>
      `,
      text: `QuizBirr Mystery Box Reward!\n\nYou won ${reward.amount} ETB (${reward.type})\nThe reward has been added to your wallet.`
    };
  }
}

export const notificationService = new NotificationService();
