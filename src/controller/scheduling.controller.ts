import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
  Get,
  Param,
} from '@nestjs/common';
import { SchedulingService } from 'src/service/scheduling.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { Scheduling } from 'src/entity/scheduling.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@ApiTags('scheduling')
@Controller('scheduling')
export class SchedulingController {
  constructor(
    private readonly schedulingService: SchedulingService,
    @InjectRepository(Scheduling)
    private readonly schedulingRepository: Repository<Scheduling>,
  ) {}

  @Post('process-cpf')
  @ApiOperation({ summary: 'Process CPF' })
  @ApiResponse({ status: 200, description: 'CPF processed successfully.' })
  async processCPF(@Body() body: { cpf: string }) {
    const { cpf } = body;
    try {
      const result = await this.schedulingService.validateCPF(cpf);
      return result;
    } catch (error) {
      console.error('Erro ao processar CPF:', error);
      throw new InternalServerErrorException('Erro ao processar CPF');
    }
  }

  @Post('create-transaction')
  @ApiOperation({ summary: 'Create transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully.',
  })
  async createTransaction(@Body() createSchedulingDto: any) {
    const response = await this.schedulingService.create(createSchedulingDto);

    return response;
  }

  @Post('update-access-data')
  @ApiOperation({ summary: 'Update Access User' })
  @ApiResponse({ status: 201, description: 'Update GOV data.' })
  async updateDATAGov(@Body() dataUpdate: any) {
    const response = await this.schedulingService.updateDataAccess(dataUpdate);
    return response;
  }

  @Get('datasScheduling/:id')
  async triggerBOT(@Param('id') id: string) {
    const scheduling = await this.schedulingRepository
      .createQueryBuilder('scheduling')
      .leftJoinAndSelect('scheduling.payment', 'payment')
      .leftJoinAndSelect('scheduling.preference', 'preference')
      .leftJoinAndSelect('scheduling.personalInfo', 'personalInfo')
      .where('payment.id = :paymentId', { paymentId: id })
      .getOne();
    return scheduling;
  }

  @Post('/callback')
  async updateStatusSchedulingBOT(@Body() body: any) {
    const { result, error, id } = body;
    console.log('devolvi o resultado');
    if (error) {
      console.error(`Error received for request ${id}: ${error}`);
      await this.schedulingService.updateSchedulingDatasBOT(id, 'error', error);
    } else {
      console.log(`Result received for request ${id}:`, result);
      await this.schedulingService.updateSchedulingDatasBOT(
        id,
        'success',
        result,
      );
    }
  }
}
