import { Module, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_PIPE, APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LoggerService } from '../common/logger.service';
import { DynamicDatabaseModule } from '../dynamic-database/dynamic-database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    DynamicDatabaseModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { 
          expiresIn: configService.get('jwt.expiresIn') 
        },
      }),
      global: true, // This should make JwtService available globally
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    LoggerService,
    ConfigService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
  exports: [AuthService, AuthGuard, JwtModule], // Export JwtModule to make JwtService available
})
export class AuthModule {}
