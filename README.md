# Moodle XML Generator API

The backend API for the AI Moodle XML Generator. It provides account and session
authentication for the frontend using NestJS, Better Auth, and PostgreSQL. Quiz
generation and Moodle XML export are not implemented by this API yet.

## Features

- Email and password sign-up, sign-in, sign-out, and session lookup.
- Google OAuth sign-in, restricted to Google accounts with Gmail addresses.
- Session and authentication cookies forwarded to the client.
- PostgreSQL persistence through Prisma.
- Better Auth's built-in routes mounted at `/api/auth`.

On sign-up, email verification is enabled, but the current verification callback
only logs the verification URL; email delivery is not configured.

## Tech Stack

- **NestJS 12** — API framework.
- **Better Auth** — authentication and session management.
- **Prisma 7** — database access and migrations.
- **PostgreSQL** — user, account, session, and verification storage.

## Getting Started

### 1. Install dependencies

Run this command from the backend project directory:

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and set the values:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/moodlexml?schema=public
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=replace_with_a_long_random_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
PORT=3001
```

`DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and the Google OAuth
credentials are used by the current application configuration. Keep secrets
private and do not commit `.env`.

Create the PostgreSQL database, then apply its migrations and generate the
Prisma client:

```bash
npx prisma migrate deploy --config prisma7.config.ts
npx prisma generate --config prisma7.config.ts
```

### 3. Start the API

```bash
# development with watch mode
npm run start:dev

# production build and start
npm run build
npm run start:prod
```

By default, the API listens on `http://localhost:3001`. Set `PORT` to change the
port. The root endpoint is `GET /api/v1` and returns a simple hello message.

## Authentication API

The account endpoints use the `/api/v1/account` prefix:

| Method | Path | Purpose | Request body |
| --- | --- | --- | --- |
| `POST` | `/api/v1/account/signup` | Create an email/password account | `{ "email": "person@example.com", "name": "Person", "password": "..." }` |
| `POST` | `/api/v1/account/signin` | Sign in with email/password | `{ "email": "person@example.com", "password": "..." }` |
| `POST` | `/api/v1/account/signout` | Sign out the current session | None |
| `GET` | `/api/v1/account/session` | Get the current session | None |

Sign-out and session requests use the session cookie returned by authentication.
The API also exposes Better Auth's built-in endpoints under `/api/auth`, including
the configured Google OAuth flow. See the [Better Auth API
documentation](https://www.better-auth.com/docs) for provider-flow details.

The API currently allows credentialed CORS requests from
`http://localhost:3000`, matching the frontend's local development address. For
deployment, update the CORS origin in `src/main.ts` and the trusted origin in
`src/auth/auth.module.ts` to match the deployed frontend.

## Tests

```bash
# unit tests
npm test

# end-to-end tests
npm run test:e2e

# coverage
npm run test:cov
```

## Data Handling

Account, session, and verification records are stored in the configured
PostgreSQL database. Authentication requests are handled by Better Auth. This
API does not currently accept quiz questions or answer keys, or send them to an
AI provider.
