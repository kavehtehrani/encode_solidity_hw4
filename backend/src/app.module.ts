import { Module } from '@nestjs/common';
import { TokenController, BallotController } from './app.controller';
import { TokenService, BallotService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [TokenController, BallotController],
  providers: [TokenService, BallotService],
})
export class AppModule {}
