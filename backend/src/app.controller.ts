import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TokenService, BallotService } from './app.service';
import { MintTokenDto } from './dtos/mintToken.dto';
import { ApiTags } from '@nestjs/swagger';
import { VoteDto } from './dtos/vote.dto';
import { SetTargetBlockDto } from './dtos/setTargetBlock.dto';

@ApiTags('Token')
@Controller()
export class TokenController {
  constructor(private readonly appService: TokenService) {}

  @Get('contract-address')
  getContractAddress() {
    return { result: this.appService.getContractAddress() };
  }

  @Get('token-name')
  async getTokenName() {
    return { result: await this.appService.getTokenName() };
  }

  @Get('total-supply')
  async getTotalSupply() {
    return { result: await this.appService.getTotalSupply() };
  }

  @Get('token-balance/:address')
  async getTokenBalance(@Param('address') address: string) {
    return { result: await this.appService.getTokenBalance(address) };
  }

  @Get('server-wallet-address')
  getServerWalletAddress() {
    return { result: this.appService.getServerWalletAddress() };
  }

  @Get('check-minter-role')
  async checkMinterRole(@Query('address') address: string) {
    return { result: await this.appService.checkMinterRole(address) };
  }

  @Post('mint-tokens')
  async mintTokens(@Body() body: MintTokenDto) {
    return { result: await this.appService.mintTokens(body.amount) };
  }

  @Post('self-delegate')
  async selfDelegate() {
    return { result: await this.appService.selfDelegate() };
  }
}

@ApiTags('Ballot')
@Controller()
export class BallotController {
  constructor(private readonly appService: BallotService) {}

  @Get('ballot-address')
  getContractAddress() {
    return { result: this.appService.getContractAddress() };
  }

  @Get('ballot/proposals')
  async getProposals() {
    return await this.appService.getProposals();
  }

  @Get('ballot/winner')
  async getWinningProposal() {
    return await this.appService.getWinningProposal();
  }

  @Get('ballot/target-block')
  async getTargetBlockNumber() {
    const blockNumber = await this.appService.getTargetBlockNumber();
    return { result: blockNumber };
  }

  @Get('ballot/voting-power/:address')
  async getVotingPower(@Param('address') address: string) {
    const votingPower = await this.appService.getVotingPower(address);
    return { result: votingPower };
  }

  @Post('ballot/vote')
  async vote(@Body() body: VoteDto) {
    const tx = await this.appService.vote(
      body.proposalId,
      body.amount,
      body.unit,
    );
    return { result: tx };
  }

  @Post('ballot/target-block')
  async setTargetBlockNumber(@Body() body: SetTargetBlockDto) {
    const tx = await this.appService.setTargetBlockNumber(body.blockNumber);
    return { result: tx };
  }

  @Get('ballot/voting-history/:address')
  async getVotingHistory(@Param('address') address: string) {
    return await this.appService.getVotingHistory(address);
  }
}
