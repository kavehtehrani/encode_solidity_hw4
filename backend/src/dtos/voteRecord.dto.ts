import { ApiProperty } from '@nestjs/swagger';

export class VoteRecordDto {
  @ApiProperty({ description: 'The voter address' })
  voter: string;

  @ApiProperty({ description: 'The proposal ID voted for' })
  proposalId: number;

  @ApiProperty({ description: 'Amount of voting power used' })
  amount: string;

  @ApiProperty({ description: 'Transaction hash of the vote' })
  transactionHash: string;

  @ApiProperty({ description: 'Timestamp of the vote' })
  timestamp: Date;
}
