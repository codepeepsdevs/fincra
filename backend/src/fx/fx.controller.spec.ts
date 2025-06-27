import { Test, TestingModule } from '@nestjs/testing';
import { FxController } from './fx.controller';
import { FxService } from './fx.service';
import { ConvertDto } from './dtos/convert.dto';
import { UserSerializer } from '@/common/serializers/user.serializer';
import { HttpStatus } from '@nestjs/common';

describe('FxController', () => {
  let controller: FxController;
  let fxService: FxService;

  const mockFxService = {
    getConversionRate: jest.fn(),
    convertAmount: jest.fn(),
  };

  const mockUser: UserSerializer = new UserSerializer({
    id: 1,
    fullname: 'John Doe',
    email: 'john@example.com',
  });

  const mockRequest = {
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FxController],
      providers: [
        {
          provide: FxService,
          useValue: mockFxService,
        },
      ],
    }).compile();

    controller = module.get<FxController>(FxController);
    fxService = module.get<FxService>(FxService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /fx/rate', () => {
    it('should return conversion rate successfully', async () => {
      const amount = 100;
      const from = 'USD';
      const to = 'EUR';
      const expectedResponse = {
        message: 'Conversion rate fetched successfully',
        statusCode: HttpStatus.OK,
        data: {
          amount: 85.5,
          rate: 0.855,
        },
      };

      mockFxService.getConversionRate.mockResolvedValue(expectedResponse);

      const result = await controller.convert(amount, from, to);

      expect(fxService.getConversionRate).toHaveBeenCalledWith(
        amount,
        from,
        to,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle service errors gracefully', async () => {
      const amount = 100;
      const from = 'USD';
      const to = 'EUR';
      const errorMessage = 'Failed to get conversion rate';

      mockFxService.getConversionRate.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.convert(amount, from, to)).rejects.toThrow(
        errorMessage,
      );
      expect(fxService.getConversionRate).toHaveBeenCalledWith(
        amount,
        from,
        to,
      );
    });

    it('should handle different currency pairs', async () => {
      const testCases = [
        { amount: 50, from: 'GBP', to: 'USD' },
        { amount: 200, from: 'EUR', to: 'JPY' },
        { amount: 75.5, from: 'CAD', to: 'AUD' },
      ];

      for (const testCase of testCases) {
        const expectedResponse = {
          message: 'Conversion rate fetched successfully',
          statusCode: HttpStatus.OK,
          data: {
            amount: testCase.amount * 1.2, // Mock rate
            rate: 1.2,
          },
        };

        mockFxService.getConversionRate.mockResolvedValue(expectedResponse);

        const result = await controller.convert(
          testCase.amount,
          testCase.from,
          testCase.to,
        );

        expect(fxService.getConversionRate).toHaveBeenCalledWith(
          testCase.amount,
          testCase.from,
          testCase.to,
        );
        expect(result).toEqual(expectedResponse);
      }
    });
  });

  describe('POST /fx/convert', () => {
    it('should convert amount successfully', async () => {
      const convertDto: ConvertDto = {
        amount: 100,
        from: 'USD',
        to: 'EUR',
        rate: 0.855,
      };

      const expectedResponse = {
        message: 'Conversion successful',
        statusCode: HttpStatus.OK,
      };

      mockFxService.convertAmount.mockResolvedValue(expectedResponse);

      const result = await controller.convertAmount(
        convertDto,
        mockRequest as any,
      );

      expect(fxService.convertAmount).toHaveBeenCalledWith(
        convertDto,
        mockUser,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle conversion with different amounts and currencies', async () => {
      const testCases = [
        {
          convertDto: { amount: 50, from: 'GBP', to: 'USD', rate: 1.25 },
        },
        {
          convertDto: { amount: 200.75, from: 'EUR', to: 'JPY', rate: 150.5 },
        },
        {
          convertDto: { amount: 1000, from: 'CAD', to: 'AUD', rate: 1.1 },
        },
      ];

      for (const testCase of testCases) {
        const expectedResponse = {
          message: 'Conversion successful',
          statusCode: HttpStatus.OK,
        };

        mockFxService.convertAmount.mockResolvedValue(expectedResponse);

        const result = await controller.convertAmount(
          testCase.convertDto as ConvertDto,
          mockRequest as any,
        );

        expect(fxService.convertAmount).toHaveBeenCalledWith(
          testCase.convertDto,
          mockUser,
        );
        expect(result).toEqual(expectedResponse);
      }
    });

    it('should handle service errors during conversion', async () => {
      const convertDto: ConvertDto = {
        amount: 100,
        from: 'USD',
        to: 'EUR',
        rate: 0.855,
      };

      const errorMessage = 'Insufficient balance';
      mockFxService.convertAmount.mockRejectedValue(new Error(errorMessage));

      await expect(
        controller.convertAmount(convertDto, mockRequest as any),
      ).rejects.toThrow(errorMessage);

      expect(fxService.convertAmount).toHaveBeenCalledWith(
        convertDto,
        mockUser,
      );
    });

    it('should extract user from request correctly', async () => {
      const convertDto: ConvertDto = {
        amount: 100,
        from: 'USD',
        to: 'EUR',
        rate: 0.855,
      };

      const differentUser = new UserSerializer({
        id: 2,
        fullname: 'Jane Smith',
        email: 'jane@example.com',
      });

      const differentRequest = {
        user: differentUser,
      };

      const expectedResponse = {
        message: 'Conversion successful',
        statusCode: HttpStatus.OK,
      };

      mockFxService.convertAmount.mockResolvedValue(expectedResponse);

      const result = await controller.convertAmount(
        convertDto,
        differentRequest as any,
      );

      expect(fxService.convertAmount).toHaveBeenCalledWith(
        convertDto,
        differentUser,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero amount in rate conversion', async () => {
      const amount = 0;
      const from = 'USD';
      const to = 'EUR';

      const expectedResponse = {
        message: 'Conversion rate fetched successfully',
        statusCode: HttpStatus.OK,
        data: {
          amount: 0,
          rate: 0.855,
        },
      };

      mockFxService.getConversionRate.mockResolvedValue(expectedResponse);

      const result = await controller.convert(amount, from, to);

      expect(fxService.getConversionRate).toHaveBeenCalledWith(
        amount,
        from,
        to,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle zero amount in conversion', async () => {
      const convertDto: ConvertDto = {
        amount: 0,
        from: 'USD',
        to: 'EUR',
        rate: 0.855,
      };

      const expectedResponse = {
        message: 'Conversion successful',
        statusCode: HttpStatus.OK,
      };

      mockFxService.convertAmount.mockResolvedValue(expectedResponse);

      const result = await controller.convertAmount(
        convertDto,
        mockRequest as any,
      );

      expect(fxService.convertAmount).toHaveBeenCalledWith(
        convertDto,
        mockUser,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle decimal amounts', async () => {
      const convertDto: ConvertDto = {
        amount: 99.99,
        from: 'USD',
        to: 'EUR',
        rate: 0.855,
      };

      const expectedResponse = {
        message: 'Conversion successful',
        statusCode: HttpStatus.OK,
      };

      mockFxService.convertAmount.mockResolvedValue(expectedResponse);

      const result = await controller.convertAmount(
        convertDto,
        mockRequest as any,
      );

      expect(fxService.convertAmount).toHaveBeenCalledWith(
        convertDto,
        mockUser,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
