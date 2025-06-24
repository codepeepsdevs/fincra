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

    return accounts;
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

    const conversionHistory = await this.prisma.conversionHistory.findMany({
      where,
      skip: Number(skip),
      take: Number(take),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      message: 'Conversion history fetched successfully',
      statusCode: HttpStatus.OK,
      data: conversionHistory,
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

  // private generateTrendData = (rsvps: any[], period: string = '7d') => {
  //   const trendMap = new Map();

  //   // Parse period parameter (e.g., "7d", "1m", "3m", "1y")
  //   const periodMatch = period.match(/^(\d+)([dmy])$/);
  //   if (!periodMatch) {
  //     throw new Error(
  //       "Invalid period format. Use format like '7d', '1m', '3m', '1y'",
  //     );
  //   }

  //   const amount = parseInt(periodMatch[1]);
  //   const unit = periodMatch[2];

  //   console.log('amount', amount);
  //   console.log('unit', unit);
  //   let startDate: moment.Moment;
  //   let interval: string;
  //   let dateFormat: string;

  //   switch (unit) {
  //     case 'd':
  //       startDate = moment().subtract(amount, 'days');
  //       interval = 'days';
  //       dateFormat = 'YYYY-MM-DD';
  //       break;
  //     case 'm':
  //       startDate = moment().subtract(amount, 'months');
  //       interval = 'months';
  //       dateFormat = 'YYYY-MM';
  //       break;
  //     case 'y':
  //       startDate = moment().subtract(amount, 'years');
  //       interval = 'years';
  //       dateFormat = 'YYYY';
  //       break;
  //     default:
  //       throw new Error(
  //         "Invalid time unit. Use 'd' for days, 'm' for months, 'y' for years",
  //       );
  //   }

  //   // Initialize trend data for the specified period
  //   const currentDate = moment();
  //   let current = startDate.clone();

  //   while (current.isSameOrBefore(currentDate)) {
  //     const dateKey = current.format(dateFormat);
  //     trendMap.set(dateKey, {
  //       date: dateKey,
  //       going: 0,
  //       interested: 0,
  //       not_attending: 0,
  //     });

  //     // Move to next interval
  //     current.add(1, interval as any);
  //   }

  //   // Count RSVPs by date
  //   rsvps.forEach((rsvp) => {
  //     const rsvpDate = moment(rsvp.created_at);
  //     let dateKey: string;

  //     // Format date based on interval
  //     switch (interval) {
  //       case 'days':
  //         dateKey = rsvpDate.format('YYYY-MM-DD');
  //         break;
  //       case 'months':
  //         dateKey = rsvpDate.format('YYYY-MM');
  //         break;
  //       case 'years':
  //         dateKey = rsvpDate.format('YYYY');
  //         break;
  //       default:
  //         dateKey = rsvpDate.format('YYYY-MM-DD');
  //     }

  //     if (trendMap.has(dateKey)) {
  //       const current = trendMap.get(dateKey);
  //       if (rsvp.rsvp_type === 'attending') {
  //         current.going += 1;
  //       } else if (rsvp.rsvp_type === 'interested') {
  //         current.interested += 1;
  //       } else if (rsvp.rsvp_type === 'not_attending') {
  //         current.not_attending += 1;
  //       }
  //     }
  //   });

  //   return Array.from(trendMap.values()).sort((a, b) => {
  //     const dateA = moment(a.date, dateFormat);
  //     const dateB = moment(b.date, dateFormat);
  //     return dateA.diff(dateB);
  //   });
  // };
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
    let interval: string;
    let dateFormat: string;

    switch (unit) {
      case 'd':
        startDate = moment().subtract(amount, 'days');
        interval = 'days';
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'm':
        startDate = moment().subtract(amount, 'months');
        interval = 'months';
        dateFormat = 'YYYY-MM';
        break;
      case 'y':
        startDate = moment().subtract(amount, 'years');
        interval = 'years';
        dateFormat = 'YYYY';
        break;
      default:
        throw new Error(
          "Invalid time unit. Use 'd' for days, 'm' for months, 'y' for years",
        );
    }

    return {
      startDate,
      interval,
      dateFormat,
      currentDate: moment(),
    };
  }
}
