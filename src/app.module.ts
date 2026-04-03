import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { DatabaseModule } from './configs/database.module';
import { AppConfigModule } from './configs/env.config.module';
import { JWTConfigModule } from './configs/jwt.config.module';
import { ThrottlerConfigModule } from './configs/throttler.config.module';
import { winstonConfig } from './configs/winston.config';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    WinstonModule.forRoot(winstonConfig),
    JWTConfigModule,
    ThrottlerConfigModule,
    AuthModule,
    CategoryModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
