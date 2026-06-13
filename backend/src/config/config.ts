import dotenv from 'dotenv';
import { Options } from 'sequelize';

dotenv.config();

const getEnv = (key: string, defaultValue: any = undefined, required: boolean = false): any => {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value || defaultValue;
};

interface SequelizeConfig {
  development: Options;
  test?: Options;
  production?: Options;
}

const config: SequelizeConfig = {
  development: {
    username: getEnv('DB_USER', 'postgres'),
    password: getEnv('DB_PASSWORD', undefined, true),
    database: getEnv('DB_NAME', 'spur_ai_chat'),
    host: getEnv('DB_HOST', 'localhost'),
    port: parseInt(getEnv('DB_PORT', 5432)),
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    username: getEnv('DB_USER', 'postgres'),
    password: getEnv('DB_PASSWORD'),
    database: getEnv('DB_NAME_TEST', 'spur_ai_chat_test'),
    host: getEnv('DB_HOST', 'localhost'),
    port: parseInt(getEnv('DB_PORT', 5432)),
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: getEnv('DB_USER'),
    password: getEnv('DB_PASSWORD'),
    database: getEnv('DB_NAME'),
    host: getEnv('DB_HOST'),
    port: parseInt(getEnv('DB_PORT', 5432)),
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 60000,
      idle: 10000,
    },
  },
};

export = config;
