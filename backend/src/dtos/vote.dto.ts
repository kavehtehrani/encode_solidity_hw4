import { ApiProperty } from '@nestjs/swagger';

export enum VoteUnit {
  ETH = 'eth',
  GWEI = 'gwei',
  WEI = 'wei',
}

export class VoteDto {
  @ApiProperty({ description: 'Proposal index to vote for' })
  proposalId: number;

  @ApiProperty({ description: 'Amount of voting power to use' })
  amount: number;

  @ApiProperty({
    description: 'Unit of the amount (eth, gwei, or wei)',
    enum: VoteUnit,
    default: VoteUnit.ETH,
  })
  unit: VoteUnit = VoteUnit.ETH;
}
