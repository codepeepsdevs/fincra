import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];

    const configApiKey = this.configService.get<string>('API_KEY');

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    if (apiKey !== configApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    next();
  }
}
