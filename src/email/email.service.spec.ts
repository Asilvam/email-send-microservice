import { Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let sendMail: jest.Mock;

  const values: Record<string, string> = {
    MAIL_FROM: 'notifications@example.com',
    MAIL_FROM_NAME: 'Default Sender',
  };

  beforeEach(() => {
    sendMail = jest.fn().mockResolvedValue({ messageId: 'message-id' });
    const mailerService = { sendMail } as unknown as MailerService;
    const configService = {
      getOrThrow: jest.fn((key: string) => values[key]),
      get: jest.fn((key: string, fallback?: string) => values[key] ?? fallback),
    } as unknown as ConfigService;

    service = new EmailService(mailerService, configService);
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the sender name supplied by barber-back', async () => {
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

  it('falls back when the supplied sender name is blank', async () => {
    await service.sendEmail({
      to: 'client@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
      fromName: '   ',
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"Default Sender" <notifications@example.com>',
      }),
    );
  });

  it('passes the optional plain-text body to the mail provider', async () => {
    await service.sendEmail({
      to: 'client@example.com',
      subject: 'Confirma tu reserva',
      html: '<p>Confirma tu reserva</p>',
      text: 'Confirma tu reserva usando el enlace del correo.',
      fromName: 'Barber',
    });

    expect(sendMail).toHaveBeenCalledWith({
      to: 'client@example.com',
      subject: 'Confirma tu reserva',
      html: '<p>Confirma tu reserva</p>',
      text: 'Confirma tu reserva usando el enlace del correo.',
      from: '"Barber" <notifications@example.com>',
    });
  });

  it('throws a contextual error when the mail provider fails', async () => {
    sendMail.mockRejectedValue(new Error('SMTP unavailable'));

    await expect(
      service.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test subject',
        html: '<p>Test body</p>',
      }),
    ).rejects.toThrow('Failed to send email: SMTP unavailable');
  });

  it('delivers the CTQ recovery URL unchanged without knowing a frontend configuration', async () => {
    const link = 'https://ctq.serviciosasm.cl/restablecer-contrasena#token=isolated-fixture';
    const html = `<a href="${link}">Restablecer contrasena</a>`;
    const text = `Restablecer contrasena: ${link}`;
    await service.sendEmail({ to: 'fixture@example.invalid', subject: 'CTQ recovery fixture', html, text });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ html, text }));
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it('normalizes non-Error provider failures', async () => {
    sendMail.mockRejectedValue('SMTP unavailable');

    await expect(
      service.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test subject',
        html: '<p>Test body</p>',
      }),
    ).rejects.toThrow('Failed to send email: SMTP unavailable');
  });
});
