import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to SQLite database');

      // Log database info with proper BigInt handling
      const dbInfo = await this.$queryRaw`PRAGMA database_list`;
      this.logger.log(
        `Database info: ${JSON.stringify(dbInfo, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        )}`,
      );
    } catch (error) {
      this.logger.error('Failed to connect to SQLite database', error);
      throw error;
    }
  }
}
