import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthParamsDto } from './dto/auth.dto';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockUsers = [
    {
      id: 1,
      email: 'existing@example.com',
      passwordHash: '$2b$10$validHashedPassword',
    },
    {
      id: 2,
      email: 'another@example.com',
      passwordHash: '$2b$10$anotherHashedPassword',
    },
  ];

  const mockDatabase = {
    users: [...mockUsers],
    
    findUserByEmail: jest.fn((email: string) => {
      return mockDatabase.users.find(user => user.email === email) || null;
    }),
    
    createUser: jest.fn((userData: { email: string; passwordHash: string }) => {
      const newUser = {
        id: mockDatabase.users.length + 1,
        email: userData.email,
        passwordHash: userData.passwordHash,
      };
      mockDatabase.users.push(newUser);
      return newUser;
    }),
    
    reset: () => {
      mockDatabase.users = [...mockUsers];
    },
  };

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

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
    mockDatabase.reset();
    
    mockPrismaService.user.findUnique.mockImplementation(({ where }) => {
      return Promise.resolve(mockDatabase.findUserByEmail(where.email));
    });
    
    mockPrismaService.user.create.mockImplementation(({ data }) => {
      return Promise.resolve(mockDatabase.createUser(data));
    });
  });

  describe('validateUser', () => {
    const loginPayload: AuthParamsDto = {
      email: 'existing@example.com',
      password: 'correctPassword',
    };

    it('should validate user successfully with correct credentials', async () => {
      const expectedUser = mockDatabase.findUserByEmail(loginPayload.email);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.validateUser(loginPayload);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginPayload.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginPayload.password, expectedUser.passwordHash);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: expectedUser.id,
        email: expectedUser.email,
      });
      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
      });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const nonExistentUserPayload = {
        email: 'nonexistent@example.com',
        password: 'somePassword',
      };

      await expect(service.validateUser(nonExistentUserPayload))
        .rejects
        .toThrow(UnauthorizedException);
      
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: nonExistentUserPayload.email },
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const wrongPasswordPayload = {
        email: 'existing@example.com',
        password: 'wrongPassword',
      };
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.validateUser(wrongPasswordPayload))
        .rejects
        .toThrow(UnauthorizedException);
      
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: wrongPasswordPayload.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        wrongPasswordPayload.password,
        mockDatabase.findUserByEmail(wrongPasswordPayload.email).passwordHash
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const registerPayload: AuthParamsDto = {
      email: 'newuser@example.com',
      password: 'password123',
    };

    it('should register user successfully', async () => {
      const hashedPassword = '$2b$10$hashedNewPassword';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.register(registerPayload);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerPayload.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerPayload.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerPayload.email,
          passwordHash: hashedPassword,
        },
      });
      
      const createdUser = mockDatabase.findUserByEmail(registerPayload.email);
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(registerPayload.email);
      expect(createdUser.passwordHash).toBe(hashedPassword);
      
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: createdUser.id,
        email: createdUser.email,
      });
      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      const existingEmailPayload = {
        email: 'existing@example.com',
        password: 'password123',
      };

      await expect(service.register(existingEmailPayload))
        .rejects
        .toThrow(ConflictException);
      
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: existingEmailPayload.email },
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prismaService.user.create).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
