import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SignUpDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserCreatedEvent } from '@/common/events/userCreatedEvent';
import { UserSerializer } from '@/common/serializers/user.serializer';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let eventEmitter: EventEmitter2;
  let prismaService: PrismaService;

  const mockUser = {
    id: 1,
    fullname: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSignUpDto: SignUpDto = {
    fullname: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  };

  const mockLoginDto: LoginDto = {
    email: 'john@example.com',
    password: 'password123',
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
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
          provide: EventEmitter2,
          useValue: {
            emitAsync: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should successfully create a new user', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.user.create = jest.fn().mockResolvedValue(mockUser);
      eventEmitter.emitAsync = jest.fn().mockResolvedValue(undefined);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      const result = await service.signup(mockSignUpDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockSignUpDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockSignUpDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          fullname: mockSignUpDto.fullname,
          email: mockSignUpDto.email,
          password: 'hashedPassword',
        },
      });
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        'user.created',
        new UserCreatedEvent(mockUser.id),
      );
      expect(result).toEqual({
        message: 'User created successfully',
        statusCode: 201,
        user: new UserSerializer(mockUser),
      });
    });

    it('should throw ConflictException when user with email already exists', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      await expect(service.signup(mockSignUpDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.signup(mockSignUpDto)).rejects.toThrow(
        'User with email already exists',
      );
      expect(prismaService.user.create).not.toHaveBeenCalled();
      expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
    });

    it('should handle bcrypt hash errors', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      jest
        .spyOn(bcrypt, 'hash')
        .mockRejectedValue(new Error('Hash error') as never);

      await expect(service.signup(mockSignUpDto)).rejects.toThrow('Hash error');
      expect(prismaService.user.create).not.toHaveBeenCalled();
      expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
    });

    it('should handle database creation errors', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.user.create = jest
        .fn()
        .mockRejectedValue(new Error('Database error') as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      await expect(service.signup(mockSignUpDto)).rejects.toThrow(
        'Database error',
      );
      expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockToken = 'jwt-token';
      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jwtService.signAsync = jest.fn().mockResolvedValue(mockToken);

      const result = await service.login(mockLoginDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockLoginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        message: 'Login successful',
        statusCode: 200,
        data: {
          user: new UserSerializer(mockUser),
          token: mockToken,
        },
      });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should handle bcrypt compare errors', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockRejectedValue(new Error('Compare error') as never);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        'Compare error',
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should handle JWT signing errors', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jwtService.signAsync = jest
        .fn()
        .mockRejectedValue(new Error('JWT error') as never);

      await expect(service.login(mockLoginDto)).rejects.toThrow('JWT error');
    });

    it('should handle empty password in login', async () => {
      const loginDtoWithEmptyPassword = { ...mockLoginDto, password: '' };
      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDtoWithEmptyPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDtoWithEmptyPassword)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty email in signup', async () => {
      const signupDtoWithEmptyEmail = { ...mockSignUpDto, email: '' };
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.signup(signupDtoWithEmptyEmail)).rejects.toThrow();
    });

    it('should handle special characters in email', async () => {
      const signupDtoWithSpecialEmail = {
        ...mockSignUpDto,
        email: 'test+tag@example.com',
      };
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.user.create = jest.fn().mockResolvedValue({
        ...mockUser,
        email: 'test+tag@example.com',
      });
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      const result = await service.signup(signupDtoWithSpecialEmail);

      expect(result.user.email).toBe('test+tag@example.com');
    });
  });
});
