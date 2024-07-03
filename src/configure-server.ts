import type { Pool } from 'pg';

import compression from 'compression';
import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import express, { type Application } from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import helmet from 'helmet';
import noCache from 'nocache';
import passport from 'passport';
import authenticationRouter from './authentication';
import { cookieMaxAge } from './authentication/constants';
import envVariables from './environment-variables';
import {
  NOT_ALLOWED_BY_CORS,
  allowedOrigins,
  isProduction,
} from './shared/constants';
import { GenericError } from './shared/errors';
import { applicationLogger } from './shared/loggers';
import {
  accessLoggerMiddleware,
  errorHandlerMiddleware,
} from './shared/middlewares';

const configureServer = (pool: Pool): Application => {
  const app = express();

  /**
   * When the application does not face the internet directly but it's served
   * behind a proxy, we should enable `trust proxy` to be able to get the
   * correct IP address.
   *
   * Reference:
   * - https://expressjs.com/en/guide/behind-proxies.html
   * - http://expressjs.com/en/4x/api.html#trust.proxy.options.table
   */
  if (isProduction) {
    app.set('trust proxy', true);
  }

  const pgSession = connectPgSimple(session);

  const sessionStore = new pgSession({
    pool,
    // DO NOT CHANGE THIS TABLE NAME
    tableName: 'user_sessions',
    disableTouch: true,
    errorLog: applicationLogger.error,
  });

  app.use(
    session({
      /**
       * Changing the secret value will invalidate all existing sessions.
       * In order to rotate the secret without invalidating sessions, provide an array of secrets,
       * with the new secret as the first element of the array, and including previous secrets as the later elements.
       */
      secret: envVariables.SESSION_SECRETS_ARRAY,
      resave: false,
      saveUninitialized: false,
      unset: 'destroy',
      store: sessionStore,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: cookieMaxAge, // 3 days
        sameSite: isProduction ? 'none' : 'lax', // More permissive in non-production environments
      },
    }),
  );

  app.use(passport.session());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new GenericError(NOT_ALLOWED_BY_CORS));
        }
      },
      credentials: true, // Allows cookies and other credentials to be sent along with requests
      maxAge: 86400, // Cache duration for preflight requests (OPTIONS), in seconds (24 hours)
    }),
  );
  // Security middleware to set various HTTP headers for protection against common web vulnerabilities
  app.use(helmet());
  // Middleware to prevent caching by setting the `Cache-Control` header to `no-cache`
  app.use(noCache());
  app.use(compression());
  app.use(express.json());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds,
      limit: 100,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: 'You have reached your limit for API requests. Try again later.',
    }),
  );

  // Custom logging middleware to log all requests (access logs) to the server
  app.use(accessLoggerMiddleware);

  app.get('/', (_, res) => {
    res.json({ message: 'This is the API!' });
  });

  app.get('/api/v1/health', (_, res) => {
    const uptime = process.uptime();

    res.status(200).json({
      status: 'OK',
      uptime: `${Math.floor(uptime)}s`,
      timestamp: Date.now(),
    });
  });

  app.use(authenticationRouter);

  app.all('*', (_, res) => {
    return res.status(404).json({ message: 'path or method is incorrect' });
  });

  app.use(errorHandlerMiddleware);

  return app;
};

export default configureServer;
