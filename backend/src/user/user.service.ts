import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Currency } from '@prisma/client';
import { UserSerializer } from 'src/common/serializers/user.serializer';
import { PrismaService } from 'src/prisma/prisma.service';
import { FundAccountDto } from './dtos/fundAccount.dto';
import * as moment from 'moment';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
      },
    });

    return {
      message: 'User fetched successfully',
      data: new UserSerializer(user),
    };
  }

  async getUserAccounts(userId: number) {
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
      },
    });

    return {
      message: 'Accounts fetched successfully',
      statusCode: HttpStatus.OK,
      data: accounts,
    };
  }

  async createBulkAccount(payload: { userId: number; currency: Currency }[]) {
    const accounts = await this.prisma.account.createMany({
      data: payload,
    });

    return accounts;
  }

  async getUserAccountByCurrency(userId: number, currency: Currency) {
    const account = await this.prisma.account.findFirst({
      where: {
        userId,
        currency,
      },
    });

    return account;
  }

  async getConversionHistory(
    userId: number,
    queryOptions: {
      page: number;
      limit: number;
      period: string;
    },
  ) {
    const { page, limit } = queryOptions;

    const where = { userId };

    const skip = (page - 1) * limit;
    const take = limit;

    if (queryOptions.period !== 'all') {
      const { startDate, currentDate } = this.parsePeriod(queryOptions.period);

      where['createdAt'] = {
        gte: startDate.toDate(),
        lte: currentDate.toDate(),
      };
    }

    const [conversionHistory, totalConversionHistory] = await Promise.all([
      this.prisma.conversionHistory.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.conversionHistory.count({
        where,
      }),
    ]);

    return {
      message: 'Conversion history fetched successfully',
      statusCode: HttpStatus.OK,
      data: {
        conversionHistory,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalConversionHistory / limit),
          totalItems: totalConversionHistory,
        },
      },
    };
  }

  async getConversionStats(userId: number, period: string) {
    const { startDate, currentDate } = this.parsePeriod(period);

    // Get conversion history within the specified period
    const conversionHistory = await this.prisma.conversionHistory.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate.toDate(),
          lte: currentDate.toDate(),
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group conversions by date and aggregate by currency
    const conversionMap = new Map();

    conversionHistory.forEach((conversion) => {
      const dateKey = moment(conversion.createdAt).format('YYYY-MM-DD');

      if (!conversionMap.has(dateKey)) {
        conversionMap.set(dateKey, {
          date: dateKey,
          USD: 0,
          EUR: 0,
          GBP: 0,
          NGN: 0,
        });
      }

      const dayData = conversionMap.get(dateKey);

      // Add the converted amount to the target currency
      const convertedAmount = conversion.amount * conversion.rate;
      dayData[conversion.toCurrency] += convertedAmount;
    });

    // Convert map to array and sort by date
    const conversionData = Array.from(conversionMap.values()).sort((a, b) => {
      return moment(a.date).diff(moment(b.date));
    });

    return {
      message: 'Conversion stats fetched successfully',
      statusCode: HttpStatus.OK,
      data: conversionData,
    };
  }

  async fundAccount(userId: number, fundAccountDto: FundAccountDto) {
    const { amount, currency } = fundAccountDto;

    const account = await this.prisma.account.findFirst({
      where: { userId, currency },
    });

    if (!account) throw new NotFoundException('Account not found');

    const updatedAccount = await this.prisma.account.update({
      where: { id: account.id },
      data: { balance: { increment: amount } },
    });

    return {
      message: 'Account funded successfully',
      statusCode: HttpStatus.OK,
      data: updatedAccount,
    };
  }

  private parsePeriod(period: string) {
    const periodMatch = period.match(/^(\d+)([dmy])$/);
    if (!periodMatch) {
      throw new Error(
        'Invalid period format. Use format like "7d", "1m", "3m", "1y"',
      );
    }

    const amount = parseInt(periodMatch[1]);
    const unit = periodMatch[2];

    let startDate: moment.Moment;

    switch (unit) {
      case 'd':
        startDate = moment().subtract(amount, 'days');
        break;
      case 'm':
        startDate = moment().subtract(amount, 'months');
        break;
      case 'y':
        startDate = moment().subtract(amount, 'years');
        break;
      default:
        throw new Error(
          "Invalid time unit. Use 'd' for days, 'm' for months, 'y' for years",
        );
    }

    return {
      startDate,
      currentDate: moment(),
    };
  }
}
