import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthParamsDto } from './dto/auth.dto';
import { Response } from 'express';
import { UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let mockResponse: Partial<Response>;

  const mockAuthService = {
    validateUser: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    mockResponse = {
      cookie: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginPayload: AuthParamsDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockAuthResult = {
      accessToken: 'mock-jwt-token',
    };

    it('should login user successfully in production environment', async () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_EXPIRATION = '3600';
      mockAuthService.validateUser.mockResolvedValue(mockAuthResult);

      const result = await controller.login(loginPayload, mockResponse as Response);

      expect(authService.validateUser).toHaveBeenCalledWith(loginPayload);
      expect(mockResponse.cookie).toHaveBeenCalledWith('access_token', mockAuthResult.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 3600000,
        path: '/',
      });
      expect(result).toEqual({ message: 'User logged successfully' });
    });

    it('should login user successfully in development environment', async () => {
      process.env.NODE_ENV = 'development';
      process.env.JWT_EXPIRATION = '7200';
      mockAuthService.validateUser.mockResolvedValue(mockAuthResult);

      const result = await controller.login(loginPayload, mockResponse as Response);

      expect(authService.validateUser).toHaveBeenCalledWith(loginPayload);
      expect(mockResponse.cookie).toHaveBeenCalledWith('access_token', mockAuthResult.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7200000,
        path: '/',
      });
      expect(result).toEqual({ message: 'User logged successfully' });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockAuthService.validateUser.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginPayload, mockResponse as Response))
        .rejects
        .toThrow(UnauthorizedException);
      
      expect(authService.validateUser).toHaveBeenCalledWith(loginPayload);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should handle service errors during user validation', async () => {
      mockAuthService.validateUser.mockRejectedValue(new Error('Service error'));

      await expect(controller.login(loginPayload, mockResponse as Response))
        .rejects
        .toThrow('Service error');
      
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const registerPayload: AuthParamsDto = {
      email: 'newuser@example.com',
      password: 'password123',
    };

    const mockAuthResult = {
      accessToken: 'mock-jwt-token',
    };

    it('should register user successfully in production environment', async () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_EXPIRATION = '3600';
      mockAuthService.register.mockResolvedValue(mockAuthResult);

      const result = await controller.register(registerPayload, mockResponse as Response);

      expect(authService.register).toHaveBeenCalledWith(registerPayload);
      expect(mockResponse.cookie).toHaveBeenCalledWith('access_token', mockAuthResult.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 3600000,
        path: '/',
      });
      expect(result).toEqual({ message: 'User registered successfully' });
    });

    it('should register user successfully in development environment', async () => {
      process.env.NODE_ENV = 'development';
      process.env.JWT_EXPIRATION = '7200';
      mockAuthService.register.mockResolvedValue(mockAuthResult);

      const result = await controller.register(registerPayload, mockResponse as Response);

      expect(authService.register).toHaveBeenCalledWith(registerPayload);
      expect(mockResponse.cookie).toHaveBeenCalledWith('access_token', mockAuthResult.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7200000,
        path: '/',
      });
      expect(result).toEqual({ message: 'User registered successfully' });
    });

    it('should throw ConflictException when email already exists', async () => {
      mockAuthService.register.mockRejectedValue(new ConflictException('Email is already in use'));

      await expect(controller.register(registerPayload, mockResponse as Response))
        .rejects
        .toThrow(ConflictException);
      
      expect(authService.register).toHaveBeenCalledWith(registerPayload);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      const invalidPayload = { email: 'test@example.com' } as AuthParamsDto;
      mockAuthService.register.mockRejectedValue(new BadRequestException('Missing required fields'));

      await expect(controller.register(invalidPayload, mockResponse as Response))
        .rejects
        .toThrow(BadRequestException);
      
      expect(authService.register).toHaveBeenCalledWith(invalidPayload);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should handle service errors during registration', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Database connection failed'));

      await expect(controller.register(registerPayload, mockResponse as Response))
        .rejects
        .toThrow('Database connection failed');
      
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.JWT_EXPIRATION;
  });
});
