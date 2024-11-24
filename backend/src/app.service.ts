import { Injectable } from '@nestjs/common';
import * as tokenJson from './assets/MyToken.json';
import * as ballotJson from './assets/TokenizedBallot.json';
import {
  createPublicClient,
  http,
  Address,
  formatEther,
  createWalletClient,
  parseEther,
  parseGwei,
} from 'viem';
import { sepolia } from 'viem/chains';
import { ConfigService } from '@nestjs/config';
import { privateKeyToAccount } from 'viem/accounts';
import { VoteUnit } from './dtos/vote.dto';
import { VoteHistoryResponseDto } from './dtos/voteHistory.dto';

@Injectable()
export class TokenService {
  publicClient;
  walletClient;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ALCHEMY_API_KEY');
    const rpcEndpoint = this.configService.get<string>('ALCHEMY_END_POINT');
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(`${rpcEndpoint}/${apiKey}`),
    });

    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}`);
    console.log(account);
    this.walletClient = createWalletClient({
      transport: http(`${rpcEndpoint}/${apiKey}`),
      chain: sepolia,
      account: account,
    });
  }

  getContractAddress(): Address {
    return this.configService.get<string>('TOKEN_ADDRESS') as Address;
  }

  async getTokenName(): Promise<string> {
    const name = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'name',
    });
    return name as string;
  }

  async getTotalSupply(): Promise<string> {
    const totalSupply = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'totalSupply',
    });
    return formatEther(totalSupply as bigint);
  }

  async getTokenBalance(address: string): Promise<string> {
    const symbol = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'symbol',
    });

    const balance = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'balanceOf',
      args: [address],
    });
    return `${formatEther(balance as bigint)} ${symbol}`;
  }

  getServerWalletAddress(): string {
    return this.walletClient.account.address;
  }

  async checkMinterRole(address: string): Promise<boolean> {
    const MINTER_ROLE = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'MINTER_ROLE',
    });

    return await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'hasRole',
      args: [MINTER_ROLE, address],
    });
  }

  async mintTokens(amount: Number): Promise<string> {
    const tx = await this.walletClient.writeContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'mint',
      args: [this.walletClient.account.address, parseEther(amount.toString())],
    });

    return `Transaction hash: ${tx}`;
  }

  async selfDelegate(): Promise<string> {
    const tx = await this.walletClient.writeContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'delegate',
      args: [this.walletClient.account.address],
    });
    return `Transaction hash: ${tx}`;
  }
}

@Injectable()
export class BallotService {
  publicClient;
  walletClient;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ALCHEMY_API_KEY');
    const rpcEndpoint = this.configService.get<string>('ALCHEMY_END_POINT');
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(`${rpcEndpoint}/${apiKey}`),
    });

    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}`);
    console.log(account);
    this.walletClient = createWalletClient({
      transport: http(`${rpcEndpoint}/${apiKey}`),
      chain: sepolia,
      account: account,
    });
  }

  getContractAddress(): Address {
    return this.configService.get<string>('BALLOT_ADDRESS') as Address;
  }

  async getProposals() {
    const proposalCount = (await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: ballotJson.abi,
      functionName: 'getProposalsCount',
    })) as number;

    const proposals = [];

    for (let i = 0; i < proposalCount; i++) {
      const proposal = await this.publicClient.readContract({
        address: this.getContractAddress(),
        abi: ballotJson.abi,
        functionName: 'proposals',
        args: [i],
      });

      // Convert bytes32 name to string and remove null characters
      const name = Buffer.from(proposal[0].slice(2), 'hex')
        .toString('utf8')
        .replace(/\0/g, '');

      proposals.push({
        name: name,
        voteCount: proposal[1].toString(),
      });
    }

    return proposals;
  }

  async getWinningProposal() {
    const [winningProposalId, hasTie] = (await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: ballotJson.abi,
      functionName: 'winningProposal',
    })) as [number, boolean];

    if (hasTie) {
      return { result: 'There is currently a tie' };
    }

    const winningProposal = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: ballotJson.abi,
      functionName: 'proposals',
      args: [winningProposalId],
    });

    const name = Buffer.from(winningProposal[0].slice(2), 'hex')
      .toString('utf8')
      .replace(/\0/g, '');

    return {
      proposalId: winningProposalId,
      name: name,
      voteCount: winningProposal[1].toString(),
    };
  }

  async getTargetBlockNumber(): Promise<number> {
    const targetBlock = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: ballotJson.abi,
      functionName: 'targetBlockNumber',
    });
    return Number(targetBlock);
  }

  async getVotingPower(address: string): Promise<string> {
    address = `0xe6DdDcbb2848983D9cAaB715611849E579759CB0` as Address;
    console.log(`Checking voting power for address: ${address}`);
    const votingPower = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: ballotJson.abi,
      functionName: 'getVotingPower',
      args: [address as Address],
    });
    console.log(`Raw voting power result: ${votingPower}`);
    return votingPower.toString();
  }

  async vote(
    proposalId: number,
    amount: number,
    unit: VoteUnit,
  ): Promise<string> {
    let parsedAmount: bigint;

    switch (unit) {
      case VoteUnit.ETH:
        parsedAmount = parseEther(amount.toString());
        break;
      case VoteUnit.GWEI:
        parsedAmount = parseGwei(amount.toString());
        break;
      case VoteUnit.WEI:
        parsedAmount = BigInt(amount);
        break;
      default:
        throw new Error('Invalid unit specified');
    }

    return await this.walletClient.writeContract({
      address: this.getContractAddress(),
      abi: ballotJson.abi,
      functionName: 'vote',
      args: [proposalId, parsedAmount],
    });
  }

  async setTargetBlockNumber(blockNumber: number): Promise<string> {
    return await this.walletClient.writeContract({
      address: this.getContractAddress(),
      abi: ballotJson.abi,
      functionName: 'setTargetBlockNumber',
      args: [blockNumber],
    });
  }

  async getVotingHistory(address: string): Promise<VoteHistoryResponseDto> {
    // Get total voting power spent
    const votePowerSpent = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: ballotJson.abi,
      functionName: 'votePowerSpent',
      args: [address as Address],
    });

    // Get remaining voting power
    const remainingVotePower = await this.getVotingPower(address);

    // Get all proposals to check votes
    const proposals = await this.getProposals();
    const votes = [];

    // For each proposal, check if the address has votes
    for (let i = 0; i < proposals.length; i++) {
      const proposal = proposals[i];
      // We consider a vote cast if the proposal has votes and the total spent power is > 0
      if (proposal.voteCount !== '0' && votePowerSpent > 0) {
        votes.push({
          proposalName: proposal.name,
          proposalId: i,
          voteCount: proposal.voteCount,
        });
      }
    }

    return {
      voter: address,
      votePowerSpent: votePowerSpent.toString(),
      remainingVotePower: remainingVotePower,
      votes: votes,
    };
  }
}
