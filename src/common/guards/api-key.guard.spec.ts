import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from './api-key.guard';

function contextWithHeaders(headers: Record<string, string>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as ExecutionContext;
}

describe('ApiKeyGuard', () => {
  it('accepts the documented internal API key header', () => {
    const config = {
      get: jest.fn().mockReturnValue('shared-key'),
    } as unknown as ConfigService;
    const guard = new ApiKeyGuard(config);

    expect(guard.canActivate(contextWithHeaders({ 'x-internal-api-key': 'shared-key' }))).toBe(true);
  });

  it('keeps accepting the legacy x-api-key header', () => {
    const config = {
      get: jest.fn().mockReturnValue('shared-key'),
    } as unknown as ConfigService;
    const guard = new ApiKeyGuard(config);

    expect(guard.canActivate(contextWithHeaders({ 'x-api-key': 'shared-key' }))).toBe(true);
  });

  it('rejects requests when the server key is not configured', () => {
    const config = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;
    const guard = new ApiKeyGuard(config);

    expect(() => guard.canActivate(contextWithHeaders({}))).toThrow(UnauthorizedException);
  });

  it('rejects an invalid key', () => {
    const config = {
      get: jest.fn().mockReturnValue('shared-key'),
    } as unknown as ConfigService;
    const guard = new ApiKeyGuard(config);

    expect(() => guard.canActivate(contextWithHeaders({ 'x-internal-api-key': 'wrong-key' }))).toThrow(UnauthorizedException);
  });
});
