import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { EventListenerService } from './user.eventListener.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, EventListenerService],
})
export class UserModule {}
