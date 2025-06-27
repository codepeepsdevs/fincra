import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FxModule } from './fx/fx.module';
import { PrismaModule } from './prisma/prisma.module';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyMiddleware } from '@/common/middlewares/ApiKeyMiddleware';
import { JwtMiddleware } from '@/common/middlewares/JwtMiddleware';

@Module({
  imports: [
    AuthModule,
    UserModule,
    FxModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        API_KEY: Joi.string().required(),
        EXCHANGE_RATE_API_KEY: Joi.string().required(),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .exclude({
        path: 'health',
        method: RequestMethod.GET,
      })
      .forRoutes('*')
      .apply(JwtMiddleware)
      .exclude('auth/(.*)')
      .exclude({
        path: 'health',
        method: RequestMethod.GET,
      })
      .forRoutes('*');
  }
}
