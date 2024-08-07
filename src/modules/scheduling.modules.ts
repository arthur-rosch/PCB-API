import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingService } from 'src/service/scheduling.service';
import { SchedulingController } from 'src/controller/scheduling.controller';
import { Scheduling } from '../entity/scheduling.entity';
import { PersonalInfo } from '../entity/personalinfo.entity';
import { Preference } from '../entity/preferences.entity';
import { HttpModule } from '@nestjs/axios';
import { PaymentService } from 'src/service/payment.service';
import { Payment } from 'src/entity/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Scheduling, PersonalInfo, Preference, Payment]), 
    HttpModule,
  ],
  providers: [SchedulingService, PaymentService],
  controllers: [SchedulingController],
  exports: [TypeOrmModule], 
})
export class SchedulingModule {}
