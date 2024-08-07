import { Controller,Post, Body, HttpCode, Get, Param,} from '@nestjs/common';
import { SchedulingService } from 'src/service/scheduling.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { PaymentService } from 'src/service/payment.service';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly schedulingService: SchedulingService,
    private readonly paymentService: PaymentService
  ) {}

  @Post('webhookPix')
  @ApiOperation({ summary: 'Process Webhook' })
  @ApiBody({ type: String })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully.' })
  @HttpCode(200)
  async processWebhook(@Body() response: any) {
    const { requestBody } = response
    await this.paymentService.processWebhook(requestBody);
    return;
  }

  @Get('checkStatusPayment/:PaymentId')
  @ApiOperation({ summary: 'Checking Status for Payment' })
  @ApiParam({ name: 'transactionalId', type: String })
  @ApiResponse({ status: 200, description: 'Checking Status for Payment.' })
  async checkStatusPayment(@Param('PaymentId') PaymentId: string) {
    const paymentStatus = await this.paymentService.checkStatus(PaymentId);
    return paymentStatus;
  }

  @Get('teste')
  async teste() {
    return 'CONSULTA BRASIL API';
  }

  @Post('schedulingRefund')
  @ApiOperation({ summary: 'Process CPF' })
  @ApiBody({ type: String })
  @ApiResponse({ status: 200, description: 'CPF processed successfully.' })
  async processRefund(@Body() response: any) {
    const { requestBody } = response
    return await this.paymentService.processWebhook(requestBody);
  }

}
