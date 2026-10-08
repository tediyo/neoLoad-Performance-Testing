import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AppController } from './app.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'perf-secret-key-12345',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AppController, AuthController],
})
export class AppModule {}