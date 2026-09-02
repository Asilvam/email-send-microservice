import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from './api-key.guard';

describe('ApiKeyGuard', () => {
  function createContext(headers: Record<string, string | string[] | undefined>): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    } as ExecutionContext;
  }

  function createGuard(configuredApiKey?: string): ApiKeyGuard {
    const configService = {
      get: jest.fn().mockReturnValue(configuredApiKey),
    } as unknown as ConfigService;

    return new ApiKeyGuard(configService);
  }

  it('accepts the documented X-Internal-API-Key header', () => {
    expect(createGuard('shared-key').canActivate(createContext({ 'x-internal-api-key': 'shared-key' }))).toBe(true);
  });

  it('keeps accepting the legacy X-Api-Key header', () => {
    expect(createGuard('shared-key').canActivate(createContext({ 'x-api-key': 'shared-key' }))).toBe(true);
  });

  it('rejects an invalid API key', () => {
    expect(() => createGuard('shared-key').canActivate(createContext({ 'x-internal-api-key': 'wrong-key' }))).toThrow(UnauthorizedException);
  });

  it('rejects a missing API key', () => {
    expect(() => createGuard('shared-key').canActivate(createContext({}))).toThrow(UnauthorizedException);
  });

  it('rejects non-string header values', () => {
    expect(() => createGuard('shared-key').canActivate(createContext({ 'x-internal-api-key': ['shared-key'] }))).toThrow(UnauthorizedException);
  });

  it('fails closed when INTERNAL_API_KEY is not configured', () => {
    expect(() => createGuard().canActivate(createContext({}))).toThrow(UnauthorizedException);
  });
});
