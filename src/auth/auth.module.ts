import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BetterAuthFactory } from './better-auth.factory';

@Module({
  imports: [
    PrismaModule,

    BetterAuthModule.forRootAsync({
      imports: [PrismaModule],
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => ({
        auth: betterAuth({
          baseURL: process.env.BETTER_AUTH_URL,
          basePath: '/api/auth',
          secret: process.env.BETTER_AUTH_SECRET,

          database: prismaAdapter(prisma, {
            provider: 'postgresql',
          }),

          session: {
            deferSessionRefresh: true,
          },

          emailAndPassword: {
            enabled: true,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            autoSignIn: true,
            // requireEmailVerification: true
          },

          emailVerification: {
            sendOnSignUp: true,
            sendVerificationEmail: async ({ user, url }) => {
              console.log(url);
            },
          },

          socialProviders: {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID!,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
              requireEmailVerification: true,
            },
          },

          user: {
            validateUserInfo: ({ user, source }) => {
              if (source.oauth?.providerId !== 'google') {
                return;
              }

              if (!user.email?.toLowerCase().endsWith('@gmail.com')) {
                return {
                  error: 'email_not_allowed',
                  errorDescription:
                    'Only Gmail accounts are allowed to register.',
                };
              }
            },
          },

          trustedOrigins: ['http://localhost:3000'],
        }),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, BetterAuthFactory],
})
export class AuthModule {}
