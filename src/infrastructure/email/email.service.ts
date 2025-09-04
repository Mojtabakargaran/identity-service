import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MessagingService } from '../messaging/messaging.service';

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

  async sendVerificationEmail(email: string, fullName: string, tenantId: string): Promise<void> {
    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const frontendUrl = this.configService.get('app.frontendUrl');
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    const template = this.getEmailTemplate('verification');
    const html = template({
      fullName,
      verificationLink,
      hospitalName: 'Hosman Platform',
      supportEmail: this.configService.get('email.from'),
    });

    const mailOptions = {
      from: this.configService.get('email.from'),
      to: email,
      subject: 'Verify Your Email Address - Hosman Platform',
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      
      // Publish email sent event
      await this.publishEmailSentEvent(email, tenantId, verificationToken, expiresAt);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  }

  private getEmailTemplate(templateName: string): handlebars.TemplateDelegate {
    const templatePath = join(__dirname, '..', '..', '..', 'templates', 'emails', `${templateName}.hbs`);
    const templateContent = readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateContent);
  }

  private async publishEmailSentEvent(email: string, tenantId: string, verificationToken: string, expiresAt: Date): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: 'verification.email.sent',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: null, // Will be populated when user is available
        tenantId,
        email,
        verificationToken,
        expiresAt: expiresAt.toISOString(),
      },
    };

    await this.messagingService.publishEvent('notification-events', event);
  }
}
