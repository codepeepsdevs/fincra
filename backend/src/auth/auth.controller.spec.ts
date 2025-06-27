import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserSerializer } from '@/common/serializers/user.serializer';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    const signupDto: SignUpDto = {
      fullname: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      fullname: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const expectedResponse = {
      message: 'User created successfully',
      statusCode: 201,
      user: new UserSerializer(mockUser),
    };

    it('should successfully create a new user', async () => {
      mockAuthService.signup.mockResolvedValue(expectedResponse);

      const result = await controller.signup(signupDto);

      expect(authService.signup).toHaveBeenCalledWith(signupDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle user already exists error', async () => {
      const conflictError = new ConflictException(
        'User with email already exists',
      );
      mockAuthService.signup.mockRejectedValue(conflictError);

      await expect(controller.signup(signupDto)).rejects.toThrow(
        ConflictException,
      );
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
    });

    it('should handle validation errors from service', async () => {
      const validationError = new Error('Validation failed');
      mockAuthService.signup.mockRejectedValue(validationError);

      await expect(controller.signup(signupDto)).rejects.toThrow(Error);
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      fullname: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const expectedResponse = {
      message: 'Login successful',
      statusCode: 200,
      data: {
        user: new UserSerializer(mockUser),
        token: 'mock-jwt-token',
      },
    };

    it('should successfully login a user', async () => {
      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle invalid credentials error', async () => {
      const unauthorizedError = new UnauthorizedException(
        'Invalid credentials',
      );
      mockAuthService.login.mockRejectedValue(unauthorizedError);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle user not found error', async () => {
      const notFoundError = new UnauthorizedException('Invalid credentials');
      mockAuthService.login.mockRejectedValue(notFoundError);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle validation errors from service', async () => {
      const validationError = new Error('Validation failed');
      mockAuthService.login.mockRejectedValue(validationError);

      await expect(controller.login(loginDto)).rejects.toThrow(Error);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
