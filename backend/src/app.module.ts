import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenController, BallotController } from './app.controller';
import { TokenService, BallotService } from './app.service';
import { VoteRecord } from './entities/vote-record.entity';
// import { EthereumService } from './services/ethereum.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: 'votes.db',
        entities: [VoteRecord],
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([VoteRecord]),
  ],
  controllers: [TokenController, BallotController],
  providers: [TokenService, BallotService],
  // providers: [TokenService, BallotService, EthereumService],
})
export class AppModule {}
