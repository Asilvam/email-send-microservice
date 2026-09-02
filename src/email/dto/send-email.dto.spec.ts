import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SendEmailDto } from './send-email.dto';

describe('SendEmailDto', () => {
  async function validateDto(values: Partial<SendEmailDto>) {
    return validate(plainToInstance(SendEmailDto, values));
  }

  it('accepts a valid email payload', async () => {
    const errors = await validateDto({
      to: 'recipient@example.com',
      subject: 'Test subject',
      html: '<p>Test body</p>',
    });

    expect(errors).toHaveLength(0);
  });

  it('accepts valid optional text and sender name fields', async () => {
    const errors = await validateDto({
      to: 'recipient@example.com',
      subject: 'Test subject',
      html: '<p>Test body</p>',
      text: 'Test body',
      fromName: 'Reservations',
    });

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid recipient address', async () => {
    const errors = await validateDto({
      to: 'not-an-email',
      subject: 'Test subject',
      html: '<p>Test body</p>',
    });

    expect(errors.some(({ property }) => property === 'to')).toBe(true);
  });

  it.each([
    ['subject', { to: 'recipient@example.com', subject: '', html: '<p>Body</p>' }],
    ['html', { to: 'recipient@example.com', subject: 'Subject', html: '' }],
  ])('rejects an empty %s', async (property, payload) => {
    const errors = await validateDto(payload);

    expect(errors.some((error) => error.property === property)).toBe(true);
  });

  it('rejects a sender name containing line breaks', async () => {
    const errors = await validateDto({
      to: 'recipient@example.com',
      subject: 'Test subject',
      html: '<p>Test body</p>',
      fromName: 'Reservations\r\nBcc: attacker@example.com',
    });

    expect(errors.some(({ property }) => property === 'fromName')).toBe(true);
  });

  it('rejects a sender name longer than 80 characters', async () => {
    const errors = await validateDto({
      to: 'recipient@example.com',
      subject: 'Test subject',
      html: '<p>Test body</p>',
      fromName: 'a'.repeat(81),
    });

    expect(errors.some(({ property }) => property === 'fromName')).toBe(true);
  });
});
