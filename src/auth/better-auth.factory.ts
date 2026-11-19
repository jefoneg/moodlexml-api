import { Inject, Injectable } from '@nestjs/common';
import { AuthService as BetterAuthService } from '@thallesp/nestjs-better-auth';

@Injectable()
export class BetterAuthFactory {
  constructor(private readonly betterAuthService: BetterAuthService) {}

  public api() {
    return this.betterAuthService.api;
  }

  public  instance() {
    return this.betterAuthService.instance;
  }
}
