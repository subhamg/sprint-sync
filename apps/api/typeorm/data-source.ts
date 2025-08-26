import 'reflect-metadata';
import path from 'node:path';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [path.resolve(__dirname, '../src/entities/*.ts')],
  migrations: [path.resolve(__dirname, './migrations/*.ts')],
});

export default dataSource;
