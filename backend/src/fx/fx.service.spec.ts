import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { FxService } from './fx.service';
import { ConvertDto } from './dtos/convert.dto';
import { UserSerializer } from '@/common/serializers/user.serializer';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FxService', () => {
  let service: FxService;
  let configService: ConfigService;
  let prismaService: PrismaService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockPrismaService = {
    account: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    conversionHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FxService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FxService>(FxService);
    configService = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConversionRate', () => {
    const mockApiKey = 'test-api-key';
    const mockBaseUrl = 'https://api.exchangerate-api.com/v1';
    const mockResponse = {
      data: {
        success: true,
        quotes: {
          USDNGN: 1500.5,
        },
      },
    };

    beforeEach(() => {
      mockConfigService.get
        .mockReturnValueOnce(mockApiKey)
        .mockReturnValueOnce(mockBaseUrl);
    });

    it('should successfully get conversion rate', async () => {
      const amount = 100;
      const from = 'USD';
      const to = 'NGN';
      const expectedRate = 1500.5;
      const expectedConvertedAmount = amount * expectedRate;

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getConversionRate(amount, from, to);

      expect(mockedAxios.get).toHaveBeenCalledWith(`${mockBaseUrl}/live`, {
        params: {
          access_key: mockApiKey,
          currencies: to,
          source: from,
        },
      });

      expect(result).toEqual({
        message: 'Conversion rate fetched successfully',
        statusCode: 200,
        data: {
          amount: expectedConvertedAmount,
          rate: expectedRate,
        },
      });
    });

    it('should throw InternalServerErrorException when API call fails', async () => {
      const amount = 100;
      const from = 'USD';
      const to = 'NGN';

      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(service.getConversionRate(amount, from, to)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(`${mockBaseUrl}/live`, {
        params: {
          access_key: mockApiKey,
          currencies: to,
          source: from,
        },
      });
    });

    it('should throw InternalServerErrorException when API returns success: false', async () => {
      const amount = 100;
      const from = 'USD';
      const to = 'NGN';

      mockedAxios.get.mockResolvedValue({
        data: {
          success: false,
          error: {
            info: 'Invalid API key',
          },
        },
      });

      await expect(service.getConversionRate(amount, from, to)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle missing quote data', async () => {
      const amount = 100;
      const from = 'USD';
      const to = 'NGN';

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          quotes: {},
        },
      });

      await expect(service.getConversionRate(amount, from, to)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('convertAmount', () => {
    const mockUser: UserSerializer = new UserSerializer({
      id: 1,
      fullname: 'John Doe',
      email: 'john@example.com',
    });

    const mockConvertDto: ConvertDto = {
      amount: 100,
      from: 'USD' as any,
      to: 'NGN' as any,
      rate: 1500.5,
    };

    const mockFromAccount = {
      id: 1,
      userId: 1,
      currency: 'USD',
      balance: 500,
    };

    const mockToAccount = {
      id: 2,
      userId: 1,
      currency: 'NGN',
      balance: 10000,
    };

    beforeEach(() => {
      mockPrismaService.account.findFirst.mockResolvedValue(mockFromAccount);
      mockPrismaService.account.update.mockResolvedValue({});
      mockPrismaService.conversionHistory.create.mockResolvedValue({});
      mockPrismaService.$transaction.mockResolvedValue([]);
    });

    it('should successfully convert amount', async () => {
      const result = await service.convertAmount(mockConvertDto, mockUser);

      expect(mockPrismaService.account.findFirst).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.account.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUser.id, currency: mockConvertDto.from },
      });
      expect(mockPrismaService.account.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUser.id, currency: mockConvertDto.to },
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalledWith([
        mockPrismaService.account.update({
          where: { id: mockFromAccount.id },
          data: { balance: { decrement: mockConvertDto.amount } },
        }),
        mockPrismaService.account.update({
          where: { id: mockToAccount.id },
          data: {
            balance: { increment: mockConvertDto.amount * mockConvertDto.rate },
          },
        }),
        mockPrismaService.conversionHistory.create({
          data: {
            userId: mockUser.id,
            fromCurrency: mockConvertDto.from,
            toCurrency: mockConvertDto.to,
            rate: mockConvertDto.rate,
            amount: mockConvertDto.amount,
          },
        }),
      ]);

      expect(result).toEqual({
        message: 'Conversion successful',
        statusCode: 200,
      });
    });

    it('should throw NotFoundException when from account not found', async () => {
      mockPrismaService.account.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockToAccount);

      await expect(
        service.convertAmount(mockConvertDto, mockUser),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.account.findFirst).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when to account not found', async () => {
      mockPrismaService.account.findFirst
        .mockResolvedValueOnce(mockFromAccount)
        .mockResolvedValueOnce(null);

      await expect(
        service.convertAmount(mockConvertDto, mockUser),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.account.findFirst).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when insufficient balance', async () => {
      const insufficientBalanceAccount = {
        ...mockFromAccount,
        balance: 50,
      };

      mockPrismaService.account.findFirst
        .mockResolvedValueOnce(insufficientBalanceAccount)
        .mockResolvedValueOnce(mockToAccount);

      await expect(
        service.convertAmount(mockConvertDto, mockUser),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.account.findFirst).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should handle exact balance conversion', async () => {
      const exactBalanceAccount = {
        ...mockFromAccount,
        balance: 100,
      };

      mockPrismaService.account.findFirst
        .mockResolvedValueOnce(exactBalanceAccount)
        .mockResolvedValueOnce(mockToAccount);

      const result = await service.convertAmount(mockConvertDto, mockUser);

      expect(result).toEqual({
        message: 'Conversion successful',
        statusCode: 200,
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should handle transaction failure', async () => {
      mockPrismaService.$transaction.mockRejectedValue(
        new Error('Transaction failed'),
      );

      await expect(
        service.convertAmount(mockConvertDto, mockUser),
      ).rejects.toThrow('Transaction failed');

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should calculate converted amount correctly', async () => {
      const customConvertDto: ConvertDto = {
        amount: 50,
        from: 'EUR' as any,
        to: 'USD' as any,
        rate: 1.1,
      };

      await service.convertAmount(customConvertDto, mockUser);

      const expectedConvertedAmount = 50 * 1.1;

      expect(mockPrismaService.$transaction).toHaveBeenCalledWith([
        mockPrismaService.account.update({
          where: { id: mockFromAccount.id },
          data: { balance: { decrement: 50 } },
        }),
        mockPrismaService.account.update({
          where: { id: mockToAccount.id },
          data: { balance: { increment: expectedConvertedAmount } },
        }),
        mockPrismaService.conversionHistory.create({
          data: {
            userId: mockUser.id,
            fromCurrency: 'EUR',
            toCurrency: 'USD',
            rate: 1.1,
            amount: 50,
          },
        }),
      ]);
    });
  });
});
