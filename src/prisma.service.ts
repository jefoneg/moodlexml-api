import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client/extension';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('Connection with the database is required.');
    }

    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter });
  }
}
