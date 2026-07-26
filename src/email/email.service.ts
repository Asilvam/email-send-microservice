import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(sendEmailDto: SendEmailDto) {
    const { to, subject, html, text, fromName } = sendEmailDto;
    const mailFrom = this.configService.getOrThrow<string>('MAIL_FROM');
    const defaultFromName = this.configService.get<string>('MAIL_FROM_NAME', 'Email Notifications');
    const senderName = fromName?.trim() || defaultFromName;

    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html,
        from: `"${senderName}" <${mailFrom}>`,
        ...(text !== undefined ? { text } : {}),
      });
      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send email to ${to}: ${message}`, stack);
      throw new Error(`Failed to send email: ${message}`);
    }
  }
}
