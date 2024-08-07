import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const database = process.env.DB_NAME
const isProduction = process.env.NODE_ENV === 'production';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database,
  ssl: isProduction,
  logging: !isProduction,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};