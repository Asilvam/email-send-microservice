import { Logger } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';

describe('EmailController', () => {
  let controller: EmailController;
  let sendEmail: jest.Mock;

  const email: SendEmailDto = {
    to: 'recipient@example.com',
    subject: 'Test subject',
    html: '<p>Test body</p>',
  };

  beforeEach(() => {
    sendEmail = jest.fn();
    controller = new EmailController({ sendEmail } as unknown as EmailService);
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the service health information', () => {
    expect(controller.healthCheck()).toEqual({
      status: 'OK',
      service: 'Email Send Microservice',
    });
  });

  it('delegates email delivery and returns a success response', async () => {
    sendEmail.mockResolvedValue(undefined);

    await expect(controller.sendEmail(email)).resolves.toEqual({
      message: 'Email sent successfully',
    });
    expect(sendEmail).toHaveBeenCalledWith(email);
  });

  it('propagates email delivery errors', async () => {
    sendEmail.mockRejectedValue(new Error('Delivery failed'));

    await expect(controller.sendEmail(email)).rejects.toThrow('Delivery failed');
  });
});
