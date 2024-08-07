import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scheduling } from '../entity/scheduling.entity';
import { PersonalInfo } from '../entity/personalinfo.entity';
import { Preference } from '../entity/preferences.entity';
import { HttpModule } from '@nestjs/axios'; 
import { PaymentService } from 'src/service/payment.service';
import { PaymentController } from 'src/controller/payment.controller';
import { SchedulingService } from 'src/service/scheduling.service';
import { Payment } from 'src/entity/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Scheduling, PersonalInfo, Preference, Payment]),
    HttpModule, 
  ],
  providers: [PaymentService, SchedulingService],
  controllers: [PaymentController],
  exports: [TypeOrmModule],
})
export class PaymentModule {}
