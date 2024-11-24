import { ApiProperty } from '@nestjs/swagger';

export class SetTargetBlockDto {
  @ApiProperty({ description: 'New target block number' })
  blockNumber: number;
}
