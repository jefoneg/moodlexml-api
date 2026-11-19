import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AllowAnonymous, Public } from '@thallesp/nestjs-better-auth';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';

@Controller({ version: '1', path: 'account' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AllowAnonymous()
  @Post('signup')
  async signUp(@Body() dto: SignUpDto, @Res() res: Response) {
    const r = await this.authService.signup(dto);
    return this.authService.forward(res, r);
  }

  @AllowAnonymous()
  @Post('signin')
  async signIn(@Body() dto: SignInDto, @Res() res: Response) {
    const r = await this.authService.signin(dto);
    return this.authService.forward(res, r);
  }

  @Post('signout')
  async signOut(@Req() req: Request, @Res() res: Response) {
    const r = await this.authService.signOut(req);
    return this.authService.forward(res, r);
  }

  @Get('session')
  async session(@Req() req: Request, @Res() res: Response) {
    const r = await this.authService.getSession(req);
    return this.authService.forward(res, r);
  }
}
