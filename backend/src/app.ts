import path from 'path';
import dotenv from 'dotenv';
import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { setupSwagger } from './config/swagger';
import conversationRoutes from './routes/conversation.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import messageRoutes from './routes/message.routes';
import { authOptional, authRequired } from './middleware/auth';
import { authorize } from './middleware/authorize';

// Import Passport configuration
import './config/passport.config';

// Import database
import './models';
import sequelize from './models';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app: Application = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow server-to-server / curl / postman
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked CORS origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type','Authorization','X-Session-Id','X-User-Id'],
}));

// ==================== Middleware ====================
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ==================== Setup Swagger ====================
setupSwagger(app);

// ==================== Routes ====================
// 2. Public auth routes (register, login, refresh, verify-email, etc.)
app.use('/api/auth', authRoutes);

// 3. Conversation routes - with OPTIONAL auth (guest + authenticated)
app.use('/api/conversations', authOptional, conversationRoutes);

// 4. User routes - REQUIRED auth (admin only)
app.use('/api', authRequired, authorize('admin'), userRoutes);

app.use('/api', messageRoutes);

// ==================== Health Check ====================
app.get('/health', async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// ==================== Root Endpoint ====================
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Spur AI Chat API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// ==================== 404 Handler ====================
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// ==================== Error Handling ====================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
