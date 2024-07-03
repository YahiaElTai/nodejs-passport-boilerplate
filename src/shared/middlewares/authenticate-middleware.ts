import type { NextFunction, Request, Response } from 'express';

const authenticateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Unauthorized');
  }

  next();
};

export default authenticateMiddleware;
