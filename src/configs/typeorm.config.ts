import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const database = process.env.DB_NAME;
const isProduction = process.env.NODE_ENV === 'production';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: String(process.env.DB_USERNAME),
  password: String(process.env.DB_PASSWORD),
  database,
  ssl: isProduction // Habilitar SSL apenas em produção
    ? {
        rejectUnauthorized: false, // Ajuste para true se você tiver um certificado de CA válido
      }
    : false,
  logging: !isProduction,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};
