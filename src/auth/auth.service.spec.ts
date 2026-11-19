import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { BetterAuthFactory } from './better-auth.factory';

describe('AuthService', () => {
  let service: AuthService;

  const api = {
    signUpEmail: jest.fn(),
    signInEmail: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
  };

  const betterAuthFactory = {
    api: jest.fn().mockReturnValue(api),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    betterAuthFactory.api.mockReturnValue(api);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: BetterAuthFactory, useValue: betterAuthFactory },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('signup calls better-auth signUpEmail', async () => {
    api.signUpEmail.mockResolvedValue('ok');

    const dto = { email: 'a@b.com', name: 'A', password: 'pw123456' };
    await service.signup(dto as any);

    expect(api.signUpEmail).toHaveBeenCalledWith({
      body: dto,
      asResponse: true,
    });
  });

  it('signup propagates errors from better-auth', async () => {
    const error = new Error('signup failed');
    api.signUpEmail.mockRejectedValue(error);

    await expect(
      service.signup({
        email: 'a@b.com',
        name: 'A',
        password: 'password123',
      }),
    ).rejects.toBe(error);
  });

  it('signin calls better-auth signInEmail', async () => {
    api.signInEmail.mockResolvedValue('ok');

    await service.signin({ email: 'a@b.com', password: 'pw123456' } as any);

    expect(api.signInEmail).toHaveBeenCalledWith({
      body: { email: 'a@b.com', password: 'pw123456' },
      asResponse: true,
    });
  });

  it('signOut calls better-auth with request headers', async () => {
    api.signOut.mockResolvedValue('ok');
    const request = {
      headers: { cookie: 'session=abc', 'x-test': 'value' },
    } as Request;

    await service.signOut(request);

    const [options] = api.signOut.mock.calls[0];
    expect(options.asResponse).toBe(true);
    expect(options.headers.get('cookie')).toBe('session=abc');
    expect(options.headers.get('x-test')).toBe('value');
  });

  it('getSession calls better-auth with request headers', async () => {
    api.getSession.mockResolvedValue('ok');
    const request = {
      headers: { cookie: 'session=abc', 'x-test': 'value' },
    } as Request;

    await service.getSession(request);

    const [options] = api.getSession.mock.calls[0];
    expect(options.asResponse).toBe(true);
    expect(options.headers.get('cookie')).toBe('session=abc');
    expect(options.headers.get('x-test')).toBe('value');
  });

  it('forward copies set-cookie headers, status and body', async () => {
    const res: any = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    const headers = new Headers();
    headers.append('set-cookie', 'a=1; Path=/');
    const globalRes = new Response('{"ok":true}', { status: 201, headers });

    await service.forward(res, globalRes);

    expect(res.setHeader).toHaveBeenCalledWith('set-cookie', ['a=1; Path=/']);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.type).toHaveBeenCalledWith('application/json');
    expect(res.send).toHaveBeenCalledWith('{"ok":true}');
  });

  it('forward omits absent cookies and sends an empty JSON object for an empty body', async () => {
    const res: any = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    await service.forward(res, new Response(null, { status: 204 }));

    expect(res.setHeader).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.type).toHaveBeenCalledWith('application/json');
    expect(res.send).toHaveBeenCalledWith('{}');
  });

  it('forward propagates errors while reading the response body', async () => {
    const error = new Error('response body failed');
    const res: any = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    const globalRes = {
      headers: new Headers(),
      text: jest.fn().mockRejectedValue(error),
    } as unknown as Response;

    await expect(service.forward(res, globalRes)).rejects.toBe(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });
});
