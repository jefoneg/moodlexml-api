
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import type { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const mockRequest = {
    headers: {},
    body: {},
    cookies: {},
  } as unknown as Request;

  const mockAuthResult = {
    status: 200,
    body: { message: 'Success' },
  };

  const mockForwardResult = {
    success: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            signin: jest.fn(),
            signOut: jest.fn(),
            getSession: jest.fn(),
            forward: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('signUp', () => {
    it('should sign up a user and forward the response', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      } as SignUpDto;

      authService.signup.mockResolvedValue(mockAuthResult as any);
      authService.forward.mockReturnValue(mockForwardResult as any);

      const result = await controller.signUp(dto, mockResponse);

      expect(authService.signup).toHaveBeenCalledWith(dto);
      expect(authService.forward).toHaveBeenCalledWith(
        mockResponse,
        mockAuthResult,
      );
      expect(result).toBe(mockForwardResult);
    });

    it('propagates signup errors without forwarding a response', async () => {
      const error = new Error('signup failed');
      authService.signup.mockRejectedValue(error);

      await expect(
        controller.signUp(
          {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'Password123!',
          } as SignUpDto,
          mockResponse,
        ),
      ).rejects.toBe(error);

      expect(authService.forward).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('should sign in a user and forward the response', async () => {
      const dto = {
        email: 'john@example.com',
        password: 'Password123!',
      } as SignInDto;

      authService.signin.mockResolvedValue(mockAuthResult as any);
      authService.forward.mockReturnValue(mockForwardResult as any);

      const result = await controller.signIn(dto, mockResponse);

      expect(authService.signin).toHaveBeenCalledWith(dto);
      expect(authService.forward).toHaveBeenCalledWith(
        mockResponse,
        mockAuthResult,
      );
      expect(result).toBe(mockForwardResult);
    });
  });

  describe('signOut', () => {
    it('should sign out a user and forward the response', async () => {
      authService.signOut.mockResolvedValue(mockAuthResult as any);
      authService.forward.mockReturnValue(mockForwardResult as any);

      const result = await controller.signOut(mockRequest, mockResponse);

      expect(authService.signOut).toHaveBeenCalledWith(mockRequest);
      expect(authService.forward).toHaveBeenCalledWith(
        mockResponse,
        mockAuthResult,
      );
      expect(result).toBe(mockForwardResult);
    });
  });

  describe('session', () => {
    it('should retrieve the current session and forward the response', async () => {
      authService.getSession.mockResolvedValue(mockAuthResult as any);
      authService.forward.mockReturnValue(mockForwardResult as any);

      const result = await controller.session(mockRequest, mockResponse);

      expect(authService.getSession).toHaveBeenCalledWith(mockRequest);
      expect(authService.forward).toHaveBeenCalledWith(
        mockResponse,
        mockAuthResult,
      );
      expect(result).toBe(mockForwardResult);
    });
  });
});
