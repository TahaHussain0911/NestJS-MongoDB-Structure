import { Injectable } from '@nestjs/common';
import { TypedConfigService } from 'src/config/typed-config.service';
import * as nodemailer from 'nodemailer';
import path from 'path';
import { renderFile } from 'ejs';
import { htmlToText } from 'html-to-text';

@Injectable()
export class MailService {
  private from: string;
  private baseUrl: string;

  constructor(private readonly config: TypedConfigService) {
    this.from = config.get('SMTP_EMAIL');
    this.baseUrl = config.get('BASE_URL');
  }

  private newTransport() {
    return nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      auth: {
        user: this.config.get('SMTP_EMAIL'),
        pass: this.config.get('SMTP_PASSWORD'),
      },
    });
  }

  async send(options: {
    email: string;
    subject: string;
    template: string;
    context?: Record<string, string>;
  }) {
    const { email, subject, template, context = {} } = options;

    const templatePath = path.join(__dirname, 'templates', `${template}.ejs`);
    const html = await renderFile(templatePath, {
      ...context,
      baseUrl: this.baseUrl,
    });
    await this.newTransport().sendMail({
      from: this.from,
      to: email,
      subject,
      html,
      text: htmlToText(html),
    });
  }

  async welcomeEmail(options: { email: string; [key: string]: string }) {
    await this.send({
      email: options.email,
      subject: options.subject || 'Welcome to our platform',
      template: 'welcome-user',
      context: options,
    });
  }

  async paymentSuccessEmail(options: {
    email: string;
    name: string;
    orderId: string;
    transactionId: string;
    totalAmount: number;
    currency: string;
  }) {
    await this.send({
      email: options.email,
      subject: `Payment Successful - Order #${options.orderId.substring(0, 8)}`,
      template: 'payment-success',
      context: {
        name: options.name,
        orderId: options.orderId,
        transactionId: options.transactionId,
        totalAmount: options.totalAmount.toString(),
        currency: options.currency,
      },
    });
  }
}
