import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let hashSpy: jest.SpyInstance;
  let compareSpy: jest.SpyInstance;
  let mockDatabase: { id: number; email: string; passwordHash: string };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    compareSpy = jest.spyOn(bcrypt, 'compare');
    hashSpy = jest.spyOn(bcrypt, 'hash');

    mockDatabase = {
      id: 1,
      email: 'existing@example.com',
      passwordHash:
        '$2b$10$hSZu1UjEp/cZX3.8Lm9WsOj2UsoR1GLA.zdrGxojdKX9FelPLyyl2',
    };

    mockPrismaService.user.findUnique.mockResolvedValue(mockDatabase);
    mockPrismaService.user.create.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should validate user successfully with correct credentials', async () => {
      const existingUser = {
        email: 'existing@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockDatabase);
      mockJwtService.sign.mockReturnValue('mockedAccessToken');

      const result = await authService.validateUser(existingUser);
      expect(result).toHaveProperty('accessToken', 'mockedAccessToken');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: existingUser.email },
      });
      expect(compareSpy).toHaveBeenCalledTimes(1);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockDatabase.id,
        email: mockDatabase.email,
      });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const nonExistentUserPayload = {
        email: 'nonexistent@example.com',
        password: 'somePassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockDatabase);

      await expect(
        authService.validateUser(nonExistentUserPayload),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: nonExistentUserPayload.email },
      });
      expect(compareSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const wrongPasswordPayload = {
        email: 'existing@example.com',
        password: 'wrongPassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockDatabase);

      await expect(
        authService.validateUser(wrongPasswordPayload),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: wrongPasswordPayload.email },
      });
      expect(compareSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('register', () => {
    it('should register user successfully with correct credentials', async () => {
      const newUserPayload = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockDatabase);
      mockJwtService.sign.mockReturnValue('mockedAccessToken');

      const result = await authService.register(newUserPayload);
      expect(hashSpy).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('accessToken', 'mockedAccessToken');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: newUserPayload.email },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: newUserPayload.email,
          passwordHash: expect.any(String) as string,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockDatabase.id,
        email: mockDatabase.email,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      const existingUser = {
        email: 'existing@example.com',
        password: 'correctPassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockDatabase);

      await expect(authService.register(existingUser)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: existingUser.email },
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
