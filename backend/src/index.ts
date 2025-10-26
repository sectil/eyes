import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './routes';
import { Context } from './types';
import logger from './utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());

// CORS - Development modunda tüm origin'lere izin ver
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS?.split(',') 
      : true, // Development'ta tüm origin'lere izin ver
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later',
});
app.use('/trpc', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// TRPC endpoint
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }): Context => ({ req, res }),
    onError: ({ error, type, path, input, ctx, req }) => {
      logger.error('TRPC Error:', {
        type,
        path,
        error: error.message,
        code: error.code,
        input,
        userId: ctx?.user?.userId,
      });
    },
  })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error('Express Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
);

// Start server - Listen on all network interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`TRPC endpoint: http://localhost:${PORT}/trpc`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`Network access: http://192.168.1.12:${PORT}`);
  logger.info(`CORS: ${process.env.NODE_ENV === 'production' ? 'Restricted' : 'All origins allowed (dev mode)'}`);
});

export default app;
