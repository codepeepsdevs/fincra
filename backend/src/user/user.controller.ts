import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { UserSerializer } from 'src/common/serializers/user.serializer';
import { FundAccountDto } from './dtos/fundAccount.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@Req() req: Request) {
    const user = req['user'] as UserSerializer;
    return this.userService.getMe(user.id);
  }

  @Get('conversion-history')
  getConversionHistory(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('period') period: string = 'all',
  ) {
    const user = req['user'] as UserSerializer;
    return this.userService.getConversionHistory(user.id, {
      page,
      limit,
      period,
    });
  }

  @Post('fund-account')
  fundAccount(@Req() req: Request, @Body() fundAccountDto: FundAccountDto) {
    const user = req['user'] as UserSerializer;
    return this.userService.fundAccount(user.id, fundAccountDto);
  }
}
