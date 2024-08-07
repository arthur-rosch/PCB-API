import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Preference } from './preferences.entity';
import { PersonalInfo } from './personalinfo.entity';
import { Payment } from './payment.entity';

@Entity()
export class Scheduling {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Preference)
  @JoinColumn()
  preference: Preference;

  @OneToOne(() => PersonalInfo)
  @JoinColumn()
  personalInfo: PersonalInfo;

  @OneToOne(() => Payment)
  @JoinColumn()
  payment: Payment;
}
