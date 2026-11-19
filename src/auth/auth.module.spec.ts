import 'reflect-metadata';
import { AuthModule } from './auth.module';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BetterAuthFactory } from './better-auth.factory';

jest.mock('@thallesp/nestjs-better-auth', () => ({
  AuthModule: {
    forRootAsync: jest.fn(() => ({ module: class MockBetterAuthModule {} })),
  },
  AuthService: class AuthService {},
}));

jest.mock('better-auth', () => ({
  betterAuth: jest.fn((config) => ({ __config: config })),
}));

jest.mock('better-auth/adapters/prisma', () => ({
  prismaAdapter: jest.fn(() => 'prisma-adapter'),
}));

jest.mock('./auth.controller', () => ({
  AuthController: class AuthController {},
}));

// forRootAsync runs once, when auth.module.ts is imported, so capture its
// options before any test clears the mocks.
const forRootAsyncOptions = (BetterAuthModule.forRootAsync as jest.Mock).mock
  .calls[0][0];

describe('AuthModule', () => {
  const prisma = {} as PrismaService;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      BETTER_AUTH_URL: 'http://localhost:4000',
      BETTER_AUTH_SECRET: 'test-secret',
      GOOGLE_CLIENT_ID: 'google-id',
      GOOGLE_CLIENT_SECRET: 'google-secret',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const buildConfig = () => {
    forRootAsyncOptions.useFactory(prisma);
    return (betterAuth as jest.Mock).mock.calls[0][0];
  };

  it('should be defined', () => {
    expect(AuthModule).toBeDefined();
  });

  it('registers the controller and providers', () => {
    expect(Reflect.getMetadata('controllers', AuthModule)).toEqual([
      AuthController,
    ]);

    const providers = Reflect.getMetadata('providers', AuthModule);
    expect(providers).toContain(AuthService);
    expect(providers).toContain(BetterAuthFactory);
  });

  it('imports PrismaModule and the better-auth module', () => {
    const imports = Reflect.getMetadata('imports', AuthModule);
    expect(imports).toContain(PrismaModule);
    expect(imports).toHaveLength(2);
  });

  it('configures forRootAsync with PrismaModule and PrismaService', () => {
    expect(forRootAsyncOptions.imports).toEqual([PrismaModule]);
    expect(forRootAsyncOptions.inject).toEqual([PrismaService]);
  });

  describe('better-auth config', () => {
    it('uses env values and the prisma adapter', () => {
      const config = buildConfig();

      expect(prismaAdapter).toHaveBeenCalledWith(prisma, {
        provider: 'postgresql',
      });
      expect(config).toMatchObject({
        baseURL: 'http://localhost:4000',
        basePath: '/api/auth',
        secret: 'test-secret',
        database: 'prisma-adapter',
        trustedOrigins: ['http://localhost:3000'],
      });
    });

    it('returns the betterAuth instance under `auth`', () => {
      const result = forRootAsyncOptions.useFactory(prisma);
      expect(result.auth).toEqual({ __config: expect.any(Object) });
    });

    it('enables email and password with length limits', () => {
      const config = buildConfig();

      expect(config.emailAndPassword).toMatchObject({
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true,
      });
      expect(config.session).toEqual({ deferSessionRefresh: true });
    });

    it('configures the google provider from env', () => {
      const config = buildConfig();

      expect(config.socialProviders.google).toEqual({
        clientId: 'google-id',
        clientSecret: 'google-secret',
        requireEmailVerification: true,
      });
    });

    it('sends verification on sign up and logs the url', async () => {
      const config = buildConfig();
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      expect(config.emailVerification.sendOnSignUp).toBe(true);

      await config.emailVerification.sendVerificationEmail({
        user: { email: 'a@gmail.com' },
        url: 'http://verify/me',
      });

      expect(logSpy).toHaveBeenCalledWith('http://verify/me');
      logSpy.mockRestore();
    });
  });

  describe('user.validateUserInfo', () => {
    const validate = (user: any, providerId?: string) =>
      buildConfig().user.validateUserInfo({
        user,
        source: providerId ? { oauth: { providerId } } : {},
      });

    it('skips validation for non-google sources', () => {
      expect(validate({ email: 'a@yahoo.com' }, 'github')).toBeUndefined();
      expect(validate({ email: 'a@yahoo.com' })).toBeUndefined();
    });

    it('allows gmail accounts from google', () => {
      expect(validate({ email: 'a@gmail.com' }, 'google')).toBeUndefined();
    });

    it('is case-insensitive on the email domain', () => {
      expect(validate({ email: 'A@GMAIL.COM' }, 'google')).toBeUndefined();
    });

    it('rejects non-gmail accounts from google', () => {
      expect(validate({ email: 'a@yahoo.com' }, 'google')).toEqual({
        error: 'email_not_allowed',
        errorDescription: 'Only Gmail accounts are allowed to register.',
      });
    });

    it('rejects google users with no email', () => {
      expect(validate({}, 'google')).toMatchObject({
        error: 'email_not_allowed',
      });
    });
  });
});
