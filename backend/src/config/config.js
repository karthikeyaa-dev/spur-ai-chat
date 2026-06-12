require('dotenv').config();

const getEnv = (key, defaultValue = undefined, required = false) => {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value || defaultValue;
};

module.exports = {
  development: {
    username: getEnv('DB_USER', 'postgres'),
    password: getEnv('DB_PASSWORD', ''),
    database: getEnv('DB_NAME', 'spur_ai_chat'),
    host: getEnv('DB_HOST', 'localhost'),
    port: getEnv('DB_PORT', 5432),
    dialect: 'postgres',
  },
};
