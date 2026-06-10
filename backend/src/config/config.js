require('dotenv').config();
const process = require('process');

const requiredEnv = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env variable: ${key}`);
  return value;
};

module.exports = {
  development: {
    username: requiredEnv('DB_USER'),
    password: requiredEnv('DB_PASSWORD'),
    database: requiredEnv('DB_NAME'),
    host: requiredEnv('DB_HOST'),
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
  },
};
