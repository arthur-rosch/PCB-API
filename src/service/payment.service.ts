import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import {
  CLIENT_ID,
  CLIENT_SECRET,
  VALUE_SCHEDULING,
  SECRET_BOT_KEY,
  VALUE_SCHEDULING_CNH,
} from 'src/configs/general.config';
import { Payment } from 'src/entity/payment.entity';
import { Scheduling } from 'src/entity/scheduling.entity';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import path from 'path';
import { readFileSync } from 'fs';
import * as Handlebars from 'handlebars';
import { PixRequest } from 'src/types';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentService {
  private readonly baseUrl = 'https://api.ezzebank.com/v2';
  private readonly transporter;
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Scheduling)
    private readonly schedulingRepository: Repository<Scheduling>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 587,
      secure: false,
      auth: {
        user: 'admin@portalconsultabrasil.com',
        pass: 'Meios2497*',
      },
    });
  }

  async generateToken(): Promise<string> {
    const clientId = CLIENT_ID;
    const clientSecret = CLIENT_SECRET;

    const authHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;

    const url = `${this.baseUrl}/oauth/token`;

    try {
      const response = await axios.post(url, 'grant_type=client_credentials', {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const accessToken = response.data.access_token;

      if (!accessToken) {
        throw new Error('Token de acesso não recebido');
      }

      return accessToken;
    } catch (error) {
      throw new Error(`Erro ao obter token de acesso: ${error.message}`);
    }
  }

  async createPIX({
    nome,
    documento,
    servico,
  }: {
    nome: string;
    documento: string;
    servico: string;
  }): Promise<{ image: string; copiaCola: string; paymentSave: Payment }> {
    const newPayment = new Payment();

    if (servico === 'CNH') {
      newPayment.amount = VALUE_SCHEDULING_CNH;
    } else {
      newPayment.amount = VALUE_SCHEDULING;
    }

    newPayment.transactionId = '';
    newPayment.additionalInformationValue = '';
    newPayment.debtorName = nome;
    newPayment.debtorDocument = documento;
    newPayment.paymentStatus = 'AUSENTE';
    const savedPayment = await this.paymentRepository.save(newPayment);

    const accessToken = await this.generateToken();
    const url = `${this.baseUrl}/pix/qrcode`;

    const payload = {
      amount: Number(newPayment.amount),
      payerQuestion: 'Pgto Consulta Brasil ref. agend. Poupa Tempo',
      external_id: newPayment.id,
      payer: {
        name: nome,
        document: documento,
      },
    };

    try {
      const response = await this.httpService
        .post(url, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
        .toPromise();

      const {
        transactionId,
        status,
        additionalInformation,
        emvqrcps,
        base64image,
      } = response.data;

      savedPayment.transactionId = transactionId;
      savedPayment.paymentStatus = status;
      savedPayment.additionalInformationValue = additionalInformation.value;

      const paymentSave = await this.paymentRepository.save(savedPayment);

      return {
        image: base64image,
        copiaCola: emvqrcps,
        paymentSave: paymentSave,
      };
    } catch (error) {
      console.error('error:', error);
      throw new Error(`Erro ao gerar QR Code PIX: ${error.message}`);
    }
  }

  async validateCPF(
    cpf: string,
  ): Promise<{ nome: string; dataDeNascimento: string }> {
    const url = `${this.baseUrl}/services/cpf?docNumber=${cpf}`;

    const accessToken = await this.generateToken();
    try {
      const response = await this.httpService
        .get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
        .toPromise();

      const dataDeNascimento = new Date(response.data.BirthDate)
        .toISOString()
        .split('T')[0];

      return {
        nome: response.data.name,
        dataDeNascimento: dataDeNascimento,
      };
    } catch (error) {
      console.error('Erro ao validar CPF:', error);
      throw new Error('Erro ao validar CPF');
    }
  }

  async processWebhook(responseBody: any): Promise<any> {
    try {
      const externalId = responseBody.external_id;

      const payment = await this.paymentRepository.findOneBy({
        id: externalId,
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      payment.paymentStatus = responseBody.transactionType;

      await this.paymentRepository.save(payment);

      return {
        status: 200,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return {
        status: 200,
        message: 'Webhook processed successfully',
      };
    }
  }

  async notificationSuporte(idPayment: any): Promise<string> {
    const infosPayment = await this.paymentRepository.findOneBy({
      id: idPayment,
    });
    const userInfos = await this.schedulingRepository.findOne({
      where: {
        payment: {
          id: infosPayment.id,
        },
      },
      relations: ['preference', 'personalInfo', 'payment'],
    });

    const formatarData = (data: Date) => {
      const date = new Date(data);
      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const ano = date.getFullYear().toString();
      return `${dia}/${mes}/${ano}`;
    };

    const preferenceFormatada = {
      ...userInfos.preference,
      diaPreferencial1: formatarData(userInfos.preference.diaPreferencial1),
      diaPreferencial2: formatarData(userInfos.preference.diaPreferencial2),
    };

    const personalInfoFormatada = {
      ...userInfos.personalInfo,
      dataNascimento: formatarData(userInfos.personalInfo.dataNascimento),
    };

    const userInfosFormatado = {
      ...userInfos,
      preference: preferenceFormatada,
      personalInfo: personalInfoFormatada,
    };

    try {
      const html = await this.renderEmailTemplate(userInfosFormatado);

      const responseSendEmail = await this.transporter.sendMail({
        from: 'admin@portalconsultabrasil.com',
        to: 'suporte@portalconsultabrasil.com',
        subject:
          userInfos.personalInfo.servico === 'CNH'
            ? 'Agendamento CNH - Informações Detalhadas'
            : 'Agendamento RG - Informações Detalhadas',
        html: html,
      });

      userInfos.payment.emailSent = true;

      await this.paymentRepository.save(userInfos.payment);
      return;
    } catch (error) {
      userInfos.payment.emailSent = true;
      userInfos.payment.emailFailureReason = error.message;
      await this.paymentRepository.save(userInfos.payment);
      throw new Error(`Erro ao enviar informações: ${error.message}`);
    }
  }

  async checkStatus(paymentId: any): Promise<any> {
    try {
      const userInfos = await this.schedulingRepository.findOne({
        where: {
          payment: {
            id: paymentId,
          },
        },
        relations: ['preference', 'personalInfo', 'payment'],
      });

      const payment = userInfos.payment;
      const personalInfo = userInfos.personalInfo;

      const formatedReturn = {
        amount: payment.amount,
        paymentStatus: payment.paymentStatus,
        id_protocolo: payment.id,
        nome: personalInfo.nomeCompleto,
        email: personalInfo.email,
        telefone: personalInfo.telefone,
        serviço: personalInfo.servico,
      };

      if (payment.paymentStatus === 'RECEIVEPIX') {
        return formatedReturn;
      } else {
        return { status: payment.paymentStatus };
      }
    } catch (error) {
      console.error('Erro ao checar status de Pagamento:', error);
      throw new Error(`Erro ao checar status de Pagamento: ${error.message}`);
    }
  }

  private renderEmailTemplate(data: any): string {
    let templatePath = '';

    if (data.personalInfo.servico === 'CNH') {
      templatePath = 'src/templates/activation_emailCNH.html';
    } else {
      templatePath = 'src/templates/activation_emailRG.html';
    }

    const htmlTemplate = readFileSync(templatePath, 'utf-8');

    const template = Handlebars.compile(htmlTemplate);
    const html = template({ user: data });

    return html;
  }

  async createPixSuitPay({
    servico,
    name,
    document,
    email,
  }: {
    servico: string;
    name: string;
    document: string;
    email: string;
  }): Promise<{
    image: string;
    copiaCola: string;
    paymentSave: Payment;
  }> {
    const newPayment = new Payment();
    const url = `https://sandbox.ws.suitpay.app/api/v1/gateway/request-qrcode`;

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 1);

    const amount =
      servico === 'CNH'
        ? Number(VALUE_SCHEDULING_CNH)
        : Number(VALUE_SCHEDULING);

    const payload: PixRequest = {
      requestNumber: randomUUID(),
      dueDate: dueDate.toISOString().split('T')[0],
      quantity: 1,
      value: amount,
      description: 'Pgto Consulta Brasil ref. agend. Poupa Tempo',
      amount,
      client: {
        name,
        document,
        email,
        address: {
          codIbge: '123',
          street: 'Rua Exemplo',
          number: '123',
          zipCode: '12345678',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
        },
      },
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          ci: 'edsonbetwiu_1715350298868',
          cs: 'b1819f34ddaf976968479c8a3fed578cf6c89b8bc17371d39b6d27c1e3de2d40c5aac3237e4c406cbe61fef0a01cb27e',
          'Content-Type': 'application/json',
        },
      });

      newPayment.debtorName = name;
      newPayment.amount = String(amount);
      newPayment.debtorDocument = document;
      newPayment.paymentStatus = 'AUSENTE';
      newPayment.additionalInformationValue = '';
      newPayment.transactionId = response.data.idTransaction;

      const paymentSave = await this.paymentRepository.save(newPayment);

      return {
        image: response.data.paymentCodeBase64,
        copiaCola: response.data.paymentCode,
        paymentSave: paymentSave,
      };
    } catch (error) {
      if (error.response) {
        // Quando a API responde com um erro (4xx, 5xx)
        console.error('Erro na resposta da SuitPay:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
        });
      } else if (error.request) {
        // Quando a requisição foi enviada mas não houve resposta
        console.error('Nenhuma resposta da SuitPay. Request:', error.request);
      } else {
        // Erro na configuração da requisição ou algo inesperado
        console.error(
          'Erro ao configurar a requisição para SuitPay:',
          error.message,
        );
      }

      // Lança um erro com uma mensagem específica para controle
      throw new Error(`Erro ao gerar PIX SuitPay: ${error.message}`);
    }
  }
}
