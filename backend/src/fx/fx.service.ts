import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConvertDto } from './dtos/convert.dto';
import { UserSerializer } from 'src/common/serializers/user.serializer';

@Injectable()
export class FxService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async getConversionRate(amount: number, from: string, to: string) {
    const apiKey = this.configService.get('EXCHANGE_RATE_API_KEY');
    const url = this.configService.get('EXCHANGE_BASE_URL') + '/live';

    try {
      const response = await axios.get(url, {
        params: {
          access_key: apiKey,
          currencies: to,
          source: from,
        },
      });

      const data = response.data;

      if (!data.success) throw new Error('Failed to get conversion rate');

      const rate = data.quotes[`${from}${to}`];
      const convertedAmount = rate * amount;

      return {
        message: 'Conversion rate fetched successfully',
        statusCode: HttpStatus.OK,
        data: {
          amount: convertedAmount,
          rate,
        },
      };
    } catch (error) {
      console.log('Error fetching conversion rate', error);
      throw new InternalServerErrorException('Failed to get conversion rate');
    }
  }

  async convertAmount(convertDto: ConvertDto, user: UserSerializer) {
    const { amount, from, to, rate } = convertDto;

    const convertedAmount = amount * rate;

    const [fromAccount, toAccount] = await Promise.all([
      this.prisma.account.findFirst({
        where: { userId: user.id, currency: from },
      }),
      this.prisma.account.findFirst({
        where: { userId: user.id, currency: to },
      }),
    ]);

    if (!fromAccount || !toAccount) {
      throw new NotFoundException(
        `Account with this currency ${from} or ${to} not found for this user`,
      );
    }

    if (fromAccount?.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    await this.prisma.$transaction([
      this.prisma.account.update({
        where: { id: fromAccount.id },
        data: { balance: { decrement: amount } },
      }),
      this.prisma.account.update({
        where: { id: toAccount.id },
        data: { balance: { increment: convertedAmount } },
      }),
      this.prisma.conversionHistory.create({
        data: {
          userId: user.id,
          fromCurrency: from,
          toCurrency: to,
          rate,
          amount,
        },
      }),
    ]);

    return {
      message: 'Conversion successful',
      statusCode: HttpStatus.OK,
    };
  }
}
