import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { FxService } from './fx.service';
import { ConvertDto } from './dtos/convert.dto';
import { UserSerializer } from '@/common/serializers/user.serializer';

@Controller('fx')
export class FxController {
  constructor(private readonly fxService: FxService) {}

  @Get('rate')
  convert(
    @Query('amount') amount: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.fxService.getConversionRate(amount, from, to);
  }

  @Post('convert')
  convertAmount(@Body() convertDto: ConvertDto, @Req() req: Request) {
    const user = req['user'] as UserSerializer;
    return this.fxService.convertAmount(convertDto, user);
  }
}
