import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSerializer } from '@/common/serializers/user.serializer';
import { FundAccountDto } from './dtos/fundAccount.dto';
import { Currency } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUser: Partial<UserSerializer> = {
    id: 1,
    fullname: 'John Doe',
    email: 'john@example.com',
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockUserService = {
    getMe: jest.fn(),
    getUserAccounts: jest.fn(),
    getConversionStats: jest.fn(),
    getConversionHistory: jest.fn(),
    fundAccount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return user data', async () => {
      const expectedResponse = {
        message: 'User fetched successfully',
        data: mockUser,
      };

      mockUserService.getMe.mockResolvedValue(expectedResponse);

      const result = await controller.getMe(mockRequest as any);

      expect(userService.getMe).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getAccounts', () => {
    it('should return user accounts', async () => {
      const expectedResponse = {
        message: 'Accounts fetched successfully',
        statusCode: HttpStatus.OK,
        data: [
          { id: 1, userId: 1, currency: Currency.USD, balance: 1000 },
          { id: 2, userId: 1, currency: Currency.EUR, balance: 500 },
        ],
      };

      mockUserService.getUserAccounts.mockResolvedValue(expectedResponse);

      const result = await controller.getAccounts(mockRequest as any);

      expect(userService.getUserAccounts).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getConversionStats', () => {
    it('should return conversion stats with default period', async () => {
      const expectedResponse = {
        message: 'Conversion stats fetched successfully',
        statusCode: HttpStatus.OK,
        data: [{ date: '2024-01-01', USD: 100, EUR: 50, GBP: 25, NGN: 1000 }],
      };

      mockUserService.getConversionStats.mockResolvedValue(expectedResponse);

      const result = await controller.getConversionStats(mockRequest as any);

      expect(userService.getConversionStats).toHaveBeenCalledWith(
        mockUser.id,
        '7d',
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should return conversion stats with custom period', async () => {
      const period = '30d';
      const expectedResponse = {
        message: 'Conversion stats fetched successfully',
        statusCode: HttpStatus.OK,
        data: [{ date: '2024-01-01', USD: 200, EUR: 100, GBP: 50, NGN: 2000 }],
      };

      mockUserService.getConversionStats.mockResolvedValue(expectedResponse);

      const result = await controller.getConversionStats(
        mockRequest as any,
        period,
      );

      expect(userService.getConversionStats).toHaveBeenCalledWith(
        mockUser.id,
        period,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getConversionHistory', () => {
    it('should return conversion history with default parameters', async () => {
      const expectedResponse = {
        message: 'Conversion history fetched successfully',
        statusCode: HttpStatus.OK,
        data: {
          conversionHistory: [
            {
              id: 1,
              userId: 1,
              fromCurrency: Currency.USD,
              toCurrency: Currency.EUR,
              amount: 100,
              rate: 0.85,
              createdAt: new Date(),
            },
          ],
          pagination: {
            page: 1,
            limit: 10,
            totalPages: 1,
            totalItems: 1,
          },
        },
      };

      mockUserService.getConversionHistory.mockResolvedValue(expectedResponse);

      const result = await controller.getConversionHistory(mockRequest as any);

      expect(userService.getConversionHistory).toHaveBeenCalledWith(
        mockUser.id,
        {
          page: 1,
          limit: 10,
          period: 'all',
        },
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should return conversion history with custom parameters', async () => {
      const page = 2;
      const limit = 5;
      const period = '7d';
      const expectedResponse = {
        message: 'Conversion history fetched successfully',
        statusCode: HttpStatus.OK,
        data: {
          conversionHistory: [],
          pagination: {
            page: 2,
            limit: 5,
            totalPages: 0,
            totalItems: 0,
          },
        },
      };

      mockUserService.getConversionHistory.mockResolvedValue(expectedResponse);

      const result = await controller.getConversionHistory(
        mockRequest as any,
        page,
        limit,
        period,
      );

      expect(userService.getConversionHistory).toHaveBeenCalledWith(
        mockUser.id,
        {
          page,
          limit,
          period,
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('fundAccount', () => {
    it('should fund account successfully', async () => {
      const fundAccountDto: FundAccountDto = {
        amount: 1000,
        currency: Currency.USD,
      };

      const expectedResponse = {
        message: 'Account funded successfully',
        statusCode: HttpStatus.OK,
        data: {
          id: 1,
          userId: 1,
          currency: Currency.USD,
          balance: 2000,
        },
      };

      mockUserService.fundAccount.mockResolvedValue(expectedResponse);

      const result = await controller.fundAccount(
        mockRequest as any,
        fundAccountDto,
      );

      expect(userService.fundAccount).toHaveBeenCalledWith(
        mockUser.id,
        fundAccountDto,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle fund account with EUR currency', async () => {
      const fundAccountDto: FundAccountDto = {
        amount: 500,
        currency: Currency.EUR,
      };

      const expectedResponse = {
        message: 'Account funded successfully',
        statusCode: HttpStatus.OK,
        data: {
          id: 2,
          userId: 1,
          currency: Currency.EUR,
          balance: 1500,
        },
      };

      mockUserService.fundAccount.mockResolvedValue(expectedResponse);

      const result = await controller.fundAccount(
        mockRequest as any,
        fundAccountDto,
      );

      expect(userService.fundAccount).toHaveBeenCalledWith(
        mockUser.id,
        fundAccountDto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Error handling', () => {
    it('should handle service errors in getMe', async () => {
      const error = new Error('Database connection failed');
      mockUserService.getMe.mockRejectedValue(error);

      await expect(controller.getMe(mockRequest as any)).rejects.toThrow(error);
      expect(userService.getMe).toHaveBeenCalledWith(mockUser.id);
    });

    it('should handle service errors in fundAccount', async () => {
      const fundAccountDto: FundAccountDto = {
        amount: 1000,
        currency: Currency.USD,
      };
      const error = new Error('Account not found');
      mockUserService.fundAccount.mockRejectedValue(error);

      await expect(
        controller.fundAccount(mockRequest as any, fundAccountDto),
      ).rejects.toThrow(error);
      expect(userService.fundAccount).toHaveBeenCalledWith(
        mockUser.id,
        fundAccountDto,
      );
    });
  });
});
