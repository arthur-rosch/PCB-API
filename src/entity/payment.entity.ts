import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  amount: string;

  @Column()
  paymentStatus: string;

  @Column()
  transactionId: string;

  @Column()
  debtorName: string;

  @Column()
  debtorDocument: string;

  @Column()
  additionalInformationValue: string;

  @Column({ default: false })
  emailSent: boolean; 

  @Column({ nullable: true })
  emailFailureReason: string; 

  @Column({ type: 'boolean', nullable: true, default: null })
  scheduledWithBOT: boolean | null;

  @Column({default: null})
  schedulingResult: string;
}
