import { Test, TestingModule } from '@nestjs/testing';
import { AuthService as BetterAuthService } from '@thallesp/nestjs-better-auth';
import { BetterAuthFactory } from './better-auth.factory';

describe('BetterAuthFactory', () => {
  let factory: BetterAuthFactory;

  const betterAuthService = {
    api: { signInEmail: jest.fn(), signUpEmail: jest.fn() },
    instance: { options: { appName: 'test' } },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BetterAuthFactory,
        { provide: BetterAuthService, useValue: betterAuthService },
      ],
    }).compile();

    factory = module.get<BetterAuthFactory>(BetterAuthFactory);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  it('api() returns the better-auth api', () => {
    expect(factory.api()).toBe(betterAuthService.api);
  });

  it('instance() returns the better-auth instance', () => {
    expect(factory.instance()).toBe(betterAuthService.instance);
  });
});
