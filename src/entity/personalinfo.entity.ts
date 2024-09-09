import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PersonalInfo {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  estado: string;

  @Column({ nullable: false })
  cidade: string;

  @Column({ nullable: false })
  cpf: string;

  @Column()
  estadoEmissorRg: string;

  @Column({ nullable: false })
  nomeCompleto: string;

  @Column()
  dataNascimento: Date;

  @Column()
  email: string;

  @Column()
  telefone: string;

  @Column()
  sexo: string;

  @Column({ nullable: false })
  servico: string;

  @Column({ type: 'jsonb', nullable: true })
  extraInfo: Record<string, any>;

  @Column({ nullable: true, default: '' })
  login: string;

  @Column({ nullable: true, default: '' })
  senha: string;

  // Campo para termo de coleta de dados sensíveis (CPF, RG, etc.)
  @Column({ type: 'boolean', default: false, nullable: true })
  termoColetaDadosSensiveis: boolean;

  // Campo para termo de uso do login do GOV
  @Column({ type: 'boolean', default: false, nullable: true })
  termoLoginGov: boolean;
}
