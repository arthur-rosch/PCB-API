import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Preference {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  postoAtendimento: string;

  @Column()
  diaPreferencial1: Date;

  @Column()
  turnoPreferencial1: string;

  @Column()
  diaPreferencial2: Date;

  @Column()
  turnoPreferencial2: string;
}
