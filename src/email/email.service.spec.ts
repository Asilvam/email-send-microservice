import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  const sendMail = jest.fn().mockResolvedValue(undefined);
  const mailerService = { sendMail } as unknown as MailerService;
  const values: Record<string, string> = {
    MAIL_FROM: 'notifications@example.com',
    MAIL_FROM_NAME: 'Default Sender',
  };
  const configService = {
    getOrThrow: jest.fn((key: string) => values[key]),
    get: jest.fn((key: string, fallback?: string) => values[key] ?? fallback),
  } as unknown as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the sender name supplied by barber-back', async () => {
    const service = new EmailService(mailerService, configService);

    await service.sendEmail({
      to: 'client@example.com',
      subject: 'Confirmación de reserva',
      html: '<p>Reserva creada</p>',
      fromName: 'Barber',
    });

    expect(sendMail).toHaveBeenCalledWith({
      to: 'client@example.com',
      subject: 'Confirmación de reserva',
      html: '<p>Reserva creada</p>',
      from: '"Barber" <notifications@example.com>',
    });
  });

  it('falls back to the configured sender name', async () => {
    const service = new EmailService(mailerService, configService);

    await service.sendEmail({
      to: 'client@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"Default Sender" <notifications@example.com>',
      }),
    );
  });
});
