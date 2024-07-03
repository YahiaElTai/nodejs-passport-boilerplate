import type { NextFunction, Request, Response } from 'express';

import { accessLogger } from '../loggers';

const accessLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = (endTime - startTime) / 1000000n; // convert nanoseconds to milliseconds

    const { statusCode } = res;
    const { method, originalUrl } = req;

    accessLogger.info({
      message: `${method} ${originalUrl} ${statusCode} ${duration}ms`,
      duration: `${duration}ms`,
      statusCode,
      method,
      url: originalUrl,
      host: req.headers.host,
    });
  });

  next();
};

export default accessLoggerMiddleware;
