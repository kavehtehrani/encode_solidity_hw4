import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class VoteRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  voter: string;

  @Column()
  proposalId: number;

  @Column()
  amount: string;

  @Column()
  transactionHash: string;

  @Column()
  timestamp: Date;
}
