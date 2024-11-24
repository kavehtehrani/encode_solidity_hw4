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
} from 'viem';
import { sepolia } from 'viem/chains';
import { ConfigService } from '@nestjs/config';
import { privateKeyToAccount } from 'viem/accounts';

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
}
