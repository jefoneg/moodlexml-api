import { Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request, Response } from 'express';
import { BetterAuthFactory } from './better-auth.factory';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(private readonly betterAuthFactory: BetterAuthFactory) {}

  public signup(dto: SignUpDto) {
    return this.betterAuthFactory.api().signUpEmail({
      body: { email: dto.email, name: dto.name, password: dto.password },
      asResponse: true,
    });
  }

  public signin(dto: SignInDto) {
    return this.betterAuthFactory.api().signInEmail({
      body: { email: dto.email, password: dto.password },
      asResponse: true,
    });
  }

  public signOut(request: Request) {
    return this.betterAuthFactory.api().signOut({
      headers: fromNodeHeaders(request.headers),
      asResponse: true,
    });
  }

  public getSession(request: Request) {
    return this.betterAuthFactory.api().getSession({
      headers: fromNodeHeaders(request.headers),
      asResponse: true,
    });
  }

  public async forward(res: Response, globalRes: globalThis.Response) {
    const cookies = globalRes.headers.getSetCookie();

    if (cookies.length) res.setHeader('set-cookie', cookies);

    const text = await globalRes.text();

    return res
      .status(globalRes.status)
      .type('application/json')
      .send(text || '{}');
  }
}
