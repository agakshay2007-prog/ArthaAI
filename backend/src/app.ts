import express, { Application, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import authRouter from './routes/auth.route.js';
import healthRouter from './routes/health.route.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { AppError } from './utils/apiError.js';

export const createApp = (): Application => {
  const app = express();

  // Trust first proxy (Render, Cloudflare, load balancers) for accurate client IPs and cookies
  app.set('trust proxy', 1);

  // Security HTTP headers tailored for API services
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  // Dynamic & resilient CORS configuration
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. curl, server-to-server, mobile)
      if (!origin) {
        return callback(null, true);
      }

      const isAllowedExplicitly = env.ALLOWED_ORIGINS.includes(origin);
      const isLocalhostDev =
        env.NODE_ENV === 'development' &&
        (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin));

      if (isAllowedExplicitly || isLocalhostDev) {
        return callback(null, true);
      }

      return callback(AppError.forbidden(`Origin ${origin} is not allowed by CORS policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 hours preflight cache
  };

  app.use(cors(corsOptions));

  // Request logger
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // Cookie parser for secure HttpOnly session tokens
  app.use(cookieParser());

  // Body parsers with strict size boundaries (1MB)
  app.use(express.json({ limit: env.BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: env.BODY_LIMIT }));

  // Root direct health redirects for container platforms
  app.get('/health', (_req: Request, res: Response) => {
    res.redirect(`${env.API_PREFIX}/health`);
  });
  app.get('/health/live', (_req: Request, res: Response) => {
    res.redirect(`${env.API_PREFIX}/health/live`);
  });
  app.get('/health/ready', (_req: Request, res: Response) => {
    res.redirect(`${env.API_PREFIX}/health/ready`);
  });

  // Mount central API router under configured API_PREFIX (default: /api)
  app.use(env.API_PREFIX, apiRouter);

  // Resilient fallback mounting: ensure /api is ALWAYS mounted even if API_PREFIX differs or is overridden
  if (env.API_PREFIX !== '/api') {
    app.use('/api', apiRouter);
  }

  // Defensive route mounting: allow direct /auth and /health paths
  app.use('/auth', authRouter);
  app.use('/health', healthRouter);

  // 404 Handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
