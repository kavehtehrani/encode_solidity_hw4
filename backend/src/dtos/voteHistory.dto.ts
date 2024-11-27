import { ApiProperty } from '@nestjs/swagger';

export class VoteHistoryResponseDto {
  @ApiProperty({ description: 'The voter address' })
  voter: string;

  @ApiProperty({ description: 'Amount of voting power spent' })
  votePowerSpent: string;

  @ApiProperty({ description: 'Remaining voting power' })
  remainingVotePower: string;

  @ApiProperty({ description: 'Array of votes cast' })
  votes: {
    proposalName: string;
    proposalId: number;
    voteCount: string;
  }[];
}
