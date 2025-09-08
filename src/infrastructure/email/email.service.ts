import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MessagingService } from '../messaging/messaging.service';
import { Language } from '../../shared/enums/language.enum';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private messagingService: MessagingService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      secure: false,
      auth: {
        user: this.configService.get('email.auth.user'),
        pass: this.configService.get('email.auth.pass'),
      },
    });
  }

  async sendVerificationEmail(email: string, fullName: string, tenantId: string, userId: string, preferredLanguage: Language = Language.ENGLISH): Promise<void> {
    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const frontendUrl = this.configService.get('app.frontendUrl');
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    const template = this.getEmailTemplate('verification', preferredLanguage);
    const emailContent = this.getEmailContent(preferredLanguage);
    const html = template({
      fullName,
      verificationLink,
      hospitalName: emailContent.hospitalName,
      supportEmail: this.configService.get('email.from'),
      ...emailContent,
    });

    const mailOptions = {
      from: this.configService.get('email.from'),
      to: email,
      subject: emailContent.subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      
      // Publish email sent event
      await this.publishEmailSentEvent(email, tenantId, userId, verificationToken, expiresAt, preferredLanguage);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  }

  private getEmailTemplate(templateName: string, language: Language = Language.ENGLISH): handlebars.TemplateDelegate {
    const languageCode = language === Language.ENGLISH ? 'en' : 'fa';
    const templatePath = join(__dirname, '..', '..', '..', 'templates', 'emails', languageCode, `${templateName}.hbs`);
    const templateContent = readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateContent);
  }

  private getEmailContent(language: Language): any {
    const content = {
      [Language.ENGLISH]: {
        hospitalName: 'Hosman Platform',
        subject: 'Verify Your Email Address - Hosman Platform',
        welcome: 'Welcome',
        thankYou: 'Thank you for registering with',
        verifyMessage: 'To complete your registration and secure your account, please verify your email address by clicking the button below:',
        verifyButton: 'Verify Email Address',
        linkMessage: 'If the button above doesn\'t work, copy and paste this link into your browser:',
        warningTitle: 'Important:',
        warningMessage: 'This verification link will expire in 24 hours for your security. If you didn\'t request this registration, please ignore this email.',
        accessMessage: 'Once verified, you\'ll have full access to your hospital management platform.',
        supportMessage: 'If you have any questions or need assistance, please don\'t hesitate to contact our support team.',
        regards: 'Best regards,',
        supportTeam: 'Support Team',
        footerLine1: 'This email was sent to verify your account registration.',
        footerLine2: 'If you have questions, contact us at',
        footerLine3: 'All rights reserved.',
      },
      [Language.FARSI]: {
        hospitalName: 'پلتفرم هاسمن',
        subject: 'تأیید آدرس ایمیل شما - پلتفرم هاسمن',
        welcome: 'خوش آمدید',
        thankYou: 'از ثبت نام شما در',
        verifyMessage: 'برای تکمیل ثبت نام و ایمن سازی حساب کاربری خود، لطفاً آدرس ایمیل خود را با کلیک روی دکمه زیر تأیید کنید:',
        verifyButton: 'تأیید آدرس ایمیل',
        linkMessage: 'اگر دکمه بالا کار نمی‌کند، این لینک را کپی کرده و در مرورگر خود قرار دهید:',
        warningTitle: 'مهم:',
        warningMessage: 'این لینک تأیید برای امنیت شما تا 24 ساعت اعتبار دارد. اگر شما درخواست این ثبت نام را نکرده‌اید، لطفاً این ایمیل را نادیده بگیرید.',
        accessMessage: 'پس از تأیید، دسترسی کامل به پلتفرم مدیریت بیمارستان خود خواهید داشت.',
        supportMessage: 'اگر سوالی دارید یا به کمک نیاز دارید، لطفاً با تیم پشتیبانی ما تماس بگیرید.',
        regards: 'با احترام،',
        supportTeam: 'تیم پشتیبانی',
        footerLine1: 'این ایمیل برای تأیید ثبت نام حساب کاربری شما ارسال شده است.',
        footerLine2: 'اگر سوالی دارید، با ما تماس بگیرید',
        footerLine3: 'تمامی حقوق محفوظ است.',
      },
    };

    return content[language] || content[Language.ENGLISH];
  }

  private async publishEmailSentEvent(email: string, tenantId: string, userId: string, verificationToken: string, expiresAt: Date, language: Language = Language.ENGLISH): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'verification.email.sent',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: userId,
        tenantId,
        email,
        verificationToken,
        language,
        expiresAt: expiresAt.toISOString(),
      },
    };

    await this.messagingService.publishEvent('notification-events', event);
  }
}
