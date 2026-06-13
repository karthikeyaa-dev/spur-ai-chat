import app from './app';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from parent directory FIRST
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug: Check if env is loaded
console.log('Environment loaded:');
console.log('  REDIS_HOST:', process.env.REDIS_HOST);
console.log('  REDIS_PORT:', process.env.REDIS_PORT);
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_NAME:', process.env.DB_NAME);

// Rest of your server code...
const PORT: number = parseInt(process.env.PORT || '3000', 10);

const startServer = (): void => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
