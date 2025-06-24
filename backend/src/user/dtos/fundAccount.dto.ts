import { Currency } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class FundAccountDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;
}
