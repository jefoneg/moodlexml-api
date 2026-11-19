jest.mock('better-auth', () => ({
  betterAuth: jest.fn().mockReturnValue({
    api: {},
    handler: jest.fn(),
  }),
}));

jest.mock('better-auth/adapters/prisma', () => ({
  prismaAdapter: jest.fn().mockReturnValue({ adapter: 'mock-prisma-adapter' }),
}));

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

describe('Auth Configuration', () => {
  const originalEnv = process.env;
  let auth: typeof import('./auth.config').auth;
  let betterAuth: jest.Mock;
  let prismaAdapter: jest.Mock;
  let PrismaService: jest.Mock;

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      GOOGLE_CLIENT_ID: 'test-google-client-id',
      GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
    };

    betterAuth = jest.requireMock('better-auth').betterAuth;
    prismaAdapter = jest.requireMock('better-auth/adapters/prisma').prismaAdapter;
    PrismaService = jest.requireMock('../prisma/prisma.service').PrismaService;
    ({ auth } = jest.requireActual('./auth.config'));
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(auth).toBeDefined();
  });

  it('should initialize PrismaService', () => {
    expect(PrismaService).toHaveBeenCalledTimes(1);
  });

  it('should configure Prisma adapter with PostgreSQL', () => {
    expect(prismaAdapter).toHaveBeenCalledWith(expect.any(Object), {
      provider: 'postgresql',
    });
  });

  it('should configure Google OAuth credentials', () => {
    expect(betterAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        socialProviders: {
          google: {
            clientId: 'test-google-client-id',
            clientSecret: 'test-google-client-secret',
          },
        },
      }),
    );
  });

  it('should configure trusted origins', () => {
    expect(betterAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        trustedOrigins: ['http://localhost:3000'],
      }),
    );
  });
});
