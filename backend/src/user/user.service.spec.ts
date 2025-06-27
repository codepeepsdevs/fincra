import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { Currency } from '@prisma/client';
import { UserService } from './user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { UserSerializer } from '@/common/serializers/user.serializer';
import { FundAccountDto } from './dtos/fundAccount.dto';
import * as moment from 'moment';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    account: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    conversionHistory: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMe', () => {
    it('should return user data successfully', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        accounts: [{ id: 1, userId, currency: Currency.USD, balance: 1000 }],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getMe(userId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { accounts: true },
      });
      expect(result.message).toBe('User fetched successfully');
      expect(result.data).toBeInstanceOf(UserSerializer);
      expect(result.data.id).toBe(userId);
      expect(result.data.fullname).toBe('John Doe');
      expect(result.data.email).toBe('john@example.com');
    });

    it('should handle user not found', async () => {
      const userId = 999;
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe(userId)).rejects.toThrow(NotFoundException);
      await expect(service.getMe(userId)).rejects.toThrow('User not found');
    });
  });

  describe('getUserAccounts', () => {
    it('should return user accounts successfully', async () => {
      const userId = 1;
      const mockAccounts = [
        { id: 1, userId, currency: Currency.USD, balance: 1000 },
        { id: 2, userId, currency: Currency.EUR, balance: 500 },
      ];

      mockPrismaService.account.findMany.mockResolvedValue(mockAccounts);

      const result = await service.getUserAccounts(userId);

      expect(mockPrismaService.account.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result.message).toBe('Accounts fetched successfully');
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.data).toEqual(mockAccounts);
    });

    it('should return empty array when no accounts found', async () => {
      const userId = 1;
      mockPrismaService.account.findMany.mockResolvedValue([]);

      const result = await service.getUserAccounts(userId);

      expect(result.data).toEqual([]);
    });
  });

  describe('createBulkAccount', () => {
    it('should create multiple accounts successfully', async () => {
      const payload = [
        { userId: 1, currency: Currency.USD },
        { userId: 1, currency: Currency.EUR },
      ];
      const mockResult = { count: 2 };

      mockPrismaService.account.createMany.mockResolvedValue(mockResult);

      const result = await service.createBulkAccount(payload);

      expect(mockPrismaService.account.createMany).toHaveBeenCalledWith({
        data: payload,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUserAccountByCurrency', () => {
    it('should return account for specific currency', async () => {
      const userId = 1;
      const currency = Currency.USD;
      const mockAccount = {
        id: 1,
        userId,
        currency,
        balance: 1000,
      };

      mockPrismaService.account.findFirst.mockResolvedValue(mockAccount);

      const result = await service.getUserAccountByCurrency(userId, currency);

      expect(mockPrismaService.account.findFirst).toHaveBeenCalledWith({
        where: { userId, currency },
      });
      expect(result).toEqual(mockAccount);
    });

    it('should return null when account not found', async () => {
      const userId = 1;
      const currency = Currency.USD;

      mockPrismaService.account.findFirst.mockResolvedValue(null);

      const result = await service.getUserAccountByCurrency(userId, currency);

      expect(result).toBeNull();
    });
  });

  describe('getConversionHistory', () => {
    it('should return conversion history with pagination for all period', async () => {
      const userId = 1;
      const queryOptions = { page: 1, limit: 10, period: 'all' };
      const mockConversions = [
        { id: 1, userId, amount: 100, rate: 1.2, toCurrency: Currency.EUR },
      ];
      const totalCount = 1;

      mockPrismaService.conversionHistory.findMany.mockResolvedValue(
        mockConversions,
      );
      mockPrismaService.conversionHistory.count.mockResolvedValue(totalCount);

      const result = await service.getConversionHistory(userId, queryOptions);

      expect(mockPrismaService.conversionHistory.findMany).toHaveBeenCalledWith(
        {
          where: { userId },
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      );
      expect(result.message).toBe('Conversion history fetched successfully');
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.data.conversionHistory).toEqual(mockConversions);
      expect(result.data.pagination).toEqual({
        page: 1,
        limit: 10,
        totalPages: 1,
        totalItems: 1,
      });
    });

    it('should return conversion history with date filter', async () => {
      const userId = 1;
      const queryOptions = { page: 1, limit: 10, period: '7d' };

      const currentDate = moment('2023-01-08');
      const startDate = moment('2023-01-01');

      jest.spyOn(moment, 'now').mockReturnValue(currentDate.valueOf());

      const mockConversions = [];
      const totalCount = 0;

      mockPrismaService.conversionHistory.findMany.mockResolvedValue(
        mockConversions,
      );
      mockPrismaService.conversionHistory.count.mockResolvedValue(totalCount);

      const result = await service.getConversionHistory(userId, queryOptions);

      expect(mockPrismaService.conversionHistory.findMany).toHaveBeenCalledWith(
        {
          where: {
            userId,
            createdAt: {
              gte: startDate.toDate(),
              lte: currentDate.toDate(),
            },
          },
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      );

      jest.restoreAllMocks();
    });
  });

  describe('getConversionStats', () => {
    it('should return conversion stats for valid period', async () => {
      const userId = 1;
      const period = '7d';

      const currentDate = moment('2023-01-08');
      const startDate = moment('2023-01-01');

      jest.spyOn(moment, 'now').mockReturnValue(currentDate.valueOf());

      const mockConversions = [
        {
          id: 1,
          userId,
          amount: 100,
          rate: 1.2,
          toCurrency: Currency.EUR,
          createdAt: new Date('2023-01-01'),
        },
        {
          id: 2,
          userId,
          amount: 200,
          rate: 0.8,
          toCurrency: Currency.USD,
          createdAt: new Date('2023-01-01'),
        },
      ];

      mockPrismaService.conversionHistory.findMany.mockResolvedValue(
        mockConversions,
      );

      const result = await service.getConversionStats(userId, period);

      expect(mockPrismaService.conversionHistory.findMany).toHaveBeenCalledWith(
        {
          where: {
            userId,
            createdAt: {
              gte: startDate.toDate(),
              lte: currentDate.toDate(),
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      );

      expect(result.message).toBe('Conversion stats fetched successfully');
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        date: '2023-01-01',
        USD: 160,
        EUR: 120,
        GBP: 0,
        NGN: 0,
      });

      jest.restoreAllMocks();
    });

    it('should throw error for invalid period format', async () => {
      const userId = 1;
      const period = 'invalid';

      await expect(service.getConversionStats(userId, period)).rejects.toThrow(
        'Invalid period format. Use format like "7d", "1m", "3m", "1y"',
      );
    });
  });

  describe('fundAccount', () => {
    it('should fund account successfully', async () => {
      const userId = 1;
      const fundAccountDto: FundAccountDto = {
        amount: 500,
        currency: Currency.USD,
      };
      const mockAccount = {
        id: 1,
        userId,
        currency: Currency.USD,
        balance: 1000,
      };
      const mockUpdatedAccount = {
        ...mockAccount,
        balance: 1500,
      };

      mockPrismaService.account.findFirst.mockResolvedValue(mockAccount);
      mockPrismaService.account.update.mockResolvedValue(mockUpdatedAccount);

      const result = await service.fundAccount(userId, fundAccountDto);

      expect(mockPrismaService.account.findFirst).toHaveBeenCalledWith({
        where: { userId, currency: Currency.USD },
      });
      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: mockAccount.id },
        data: { balance: { increment: 500 } },
      });
      expect(result.message).toBe('Account funded successfully');
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.data).toEqual(mockUpdatedAccount);
    });

    it('should throw NotFoundException when account not found', async () => {
      const userId = 1;
      const fundAccountDto: FundAccountDto = {
        amount: 500,
        currency: Currency.USD,
      };

      mockPrismaService.account.findFirst.mockResolvedValue(null);

      await expect(service.fundAccount(userId, fundAccountDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.fundAccount(userId, fundAccountDto)).rejects.toThrow(
        'Account not found',
      );
    });
  });

  describe('parsePeriod (private method)', () => {
    it('should parse days correctly', () => {
      const period = '7d';
      const result = service['parsePeriod'](period);

      expect(result.startDate).toBeDefined();
      expect(result.currentDate).toBeDefined();
    });

    it('should parse months correctly', () => {
      const period = '3m';
      const result = service['parsePeriod'](period);

      expect(result.startDate).toBeDefined();
      expect(result.currentDate).toBeDefined();
    });

    it('should parse years correctly', () => {
      const period = '1y';
      const result = service['parsePeriod'](period);

      expect(result.startDate).toBeDefined();
      expect(result.currentDate).toBeDefined();
    });

    it('should throw error for invalid period format', () => {
      const period = 'invalid';

      expect(() => service['parsePeriod'](period)).toThrow(
        'Invalid period format. Use format like "7d", "1m", "3m", "1y"',
      );
    });

    it('should throw error for invalid time unit', () => {
      const period = '7w';

      expect(() => service['parsePeriod'](period)).toThrow(
        'Invalid period format. Use format like "7d", "1m", "3m", "1y"',
      );
    });
  });
});
