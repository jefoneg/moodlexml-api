
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({})),
}));

describe('PrismaService', () => {
  let service: PrismaService;
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  describe('constructor', () => {
    it('should be defined', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

      service = new PrismaService();

      expect(service).toBeDefined();
    });

    it('should throw an error when DATABASE_URL is missing', () => {
      delete process.env.DATABASE_URL;

      expect(() => new PrismaService()).toThrow(
        'Connection with the database is required.',
      );
    });

    it('should initialize PrismaPg with the DATABASE_URL', () => {
      const databaseUrl =
        'postgresql://test:test@localhost:5432/test';

      process.env.DATABASE_URL = databaseUrl;

      new PrismaService();

      expect(PrismaPg).toHaveBeenCalledWith({
        connectionString: databaseUrl,
      });
    });

    it('should initialize PrismaClient with the PostgreSQL adapter', () => {
      process.env.DATABASE_URL =
        'postgresql://test:test@localhost:5432/test';

      new PrismaService();

      expect(PrismaClient).toHaveBeenCalledWith({
        adapter: expect.any(Object),
      });
    });
  });
});
