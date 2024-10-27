// app.module.ts

import { Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './configs/typeorm.config';
import { SchedulingModule } from './modules/scheduling.modules';
import { PaymentModule } from './modules/payment.modules';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    SchedulingModule,
    PaymentModule,
  ],
})
export class AppModule implements NestModule {
  configure() {}
}
