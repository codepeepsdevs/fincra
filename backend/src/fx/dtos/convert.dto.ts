import { Currency } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ConvertDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(Currency)
  from: Currency;

  @IsNotEmpty()
  @IsEnum(Currency)
  to: Currency;

  @IsNotEmpty()
  @IsNumber()
  rate: number;
}
