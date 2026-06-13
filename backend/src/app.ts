import path from 'path';
import dotenv from 'dotenv';
import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { setupSwagger } from './config/swagger';
import conversationRoutes from './routes/conversation.routes';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app: Application = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Swagger documentation
setupSwagger(app);

// Routes - Fixed mounting
app.use('/api', conversationRoutes);  // Conversation routes under /api
app.use('/api/auth', authRoutes);      // Auth routes under /api/auth

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Spur AI Chat API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
