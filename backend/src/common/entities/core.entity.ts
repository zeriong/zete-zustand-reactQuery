import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import * as Validator from 'class-validator';

export class coreEntity {
  @ApiProperty({ type: Number })
  @PrimaryGeneratedColumn({ unsigned: true })
  @Validator.IsNumber()
  id: number;

  @ApiProperty({ type: Date })
  @CreateDateColumn()
  createAt: Date;

  @ApiProperty({ type: Date })
  @UpdateDateColumn()
  updateAt: Date;
}
