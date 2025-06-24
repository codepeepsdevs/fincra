import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Account, Currency } from '@prisma/client';
import { UserCreatedEvent } from 'src/common/events/userCreatedEvent';
import { UserService } from './user.service';

@Injectable()
export class EventListenerService {
  private readonly logger = new Logger(EventListenerService.name);
  constructor(private readonly userService: UserService) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(payload: UserCreatedEvent) {
    this.logger.log('User created event received:', payload.userId);

    // create a default account for the user
    const defaultCurrencies: Currency[] = ['USD', 'NGN', 'GBP', 'EUR'];

    const accounts = defaultCurrencies.map((currency) => ({
      userId: payload.userId,
      currency,
    }));

    await this.userService.createBulkAccount(accounts);

    this.logger.log(
      `Default accounts created successfully for user with id: ${payload.userId}`,
    );
  }
}
