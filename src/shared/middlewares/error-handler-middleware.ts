import type { NextFunction, Request, Response } from 'express';

import { ZodError } from 'zod';

import { GENERIC_ERROR_MESSAGE, NOT_ALLOWED_BY_CORS } from '../constants';
import { CustomError } from '../errors';
import { applicationLogger } from '../loggers';

const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    /**
     * Handle validation errors from Zod (typically incorrect user input)
     * These are client errors, so we return them directly to the user without logging.
     */
    return res.status(400).json(err.errors);
  }

  // Handle client-side errors (4xx status codes) from custom errors
  if (
    err instanceof CustomError &&
    err.statusCode >= 400 &&
    err.statusCode < 500
  ) {
    return res.status(err.statusCode).json([{ message: err.message }]);
  }

  /**
   * Handle server-side errors (5xx status codes) from custom errors
   * Log these with full details including stack traces and send a generic message to maintain security.
   */
  if (err instanceof CustomError && err.statusCode >= 500) {
    applicationLogger.error(err.message, {
      tag: err.name,
      stack: err.stack,
      cause: err.cause,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json([
      {
        message:
          err.message === NOT_ALLOWED_BY_CORS
            ? err.message
            : GENERIC_ERROR_MESSAGE,
      },
    ]);
  }

  /**
   * Default error handling for unexpected error types
   * Log these errors fully and return a generic message to the user.
   */
  applicationLogger.error(err.message, {
    tag: 'UnknownError',
    stack: err.stack,
    cause: err.cause,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json([{ message: GENERIC_ERROR_MESSAGE }]);
};

export default errorHandlerMiddleware;
