import { AppService } from './app.service';

describe('AppService', () => {
  it('returns the default service response', () => {
    expect(new AppService().getHello()).toBe('Hello World!');
  });
});
