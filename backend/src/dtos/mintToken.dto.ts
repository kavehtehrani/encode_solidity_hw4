import { ApiProperty } from '@nestjs/swagger';

export class MintTokenDto {
  @ApiProperty({
    type: Number,
    required: true,
    description: 'Amount of tokens to mint',
  })
  amount: number;
}
