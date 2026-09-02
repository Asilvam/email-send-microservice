import { ConfigService } from '@nestjs/config';
import { createMailerOptions } from './email.module';

describe('createMailerOptions', () => {
  function createConfig(overrides: Record<string, string | undefined> = {}): ConfigService {
    const values: Record<string, string | undefined> = {
      MAIL_HOST: 'smtp.example.com',
      MAIL_PORT: '587',
      MAIL_SECURE: 'false',
      MAIL_USER: 'smtp-user',
      MAIL_PASSWORD: 'smtp-password',
      MAIL_FROM_NAME: 'Reservations',
      MAIL_FROM: 'no-reply@example.com',
      ...overrides,
    };

    return {
      get: jest.fn((key: string, fallback?: string) => values[key] ?? fallback),
    } as unknown as ConfigService;
  }

  it('creates STARTTLS options for port 587', async () => {
    await expect(createMailerOptions(createConfig())).resolves.toEqual({
      transport: {
        host: 'smtp.example.com',
        pool: true,
        port: 587,
        secure: false,
        auth: {
          user: 'smtp-user',
          pass: 'smtp-password',
        },
      },
      defaults: {
        from: '"Reservations" <no-reply@example.com>',
      },
    });
  });

  it('uses the default sender name when MAIL_FROM_NAME is missing', async () => {
    const options = await createMailerOptions(createConfig({ MAIL_FROM_NAME: undefined }));

    expect(options.defaults.from).toBe('"Email Notifications" <no-reply@example.com>');
  });

  it('creates secure options for port 465', async () => {
    const options = await createMailerOptions(createConfig({ MAIL_PORT: '465', MAIL_SECURE: 'true' }));

    expect(options.transport).toMatchObject({ port: 465, secure: true });
  });

  it('rejects an insecure port 465 configuration', async () => {
    await expect(createMailerOptions(createConfig({ MAIL_PORT: '465' }))).rejects.toThrow('Puerto 465 requiere MAIL_SECURE=true');
  });

  it('rejects a secure port 587 configuration', async () => {
    await expect(createMailerOptions(createConfig({ MAIL_SECURE: 'true' }))).rejects.toThrow('Puerto 587 requiere MAIL_SECURE=false');
  });
});
