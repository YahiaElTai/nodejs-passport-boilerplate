import type { SignTokenPayload, VerifyTokenPayload } from '../validations';

import jwt from 'jsonwebtoken';
import envVariables from '../../environment-variables';
import { GenericError } from '../../shared/errors';
import { defaultJWTExpiration } from '../constants';
import { VerifyTokenPayloadSchema } from '../validations';

// use callback version of jwt.sign to avoid blocking the event loop (use promise to make life easier)
export const generateJWTToken = (
  options: SignTokenPayload,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { claims: options.claims ?? {} },
      envVariables.JWT_SECRET,
      {
        expiresIn: options.expiresIn || defaultJWTExpiration,
        subject: options.sub,
        audience: envVariables.FRONTEND_URL,
        issuer: envVariables.BACKEND_URL,
      },
      (error, encoded) => {
        if (error) {
          reject(
            new GenericError('Token signing failed', {
              cause: error,
            }),
          );
        } else {
          if (!encoded) {
            reject(
              new GenericError('Token signing failed', {
                cause: 'No token encoded',
              }),
            );
          } else {
            resolve(encoded);
          }
        }
      },
    );
  });
};

export const verifyJWTToken = (token: string): Promise<VerifyTokenPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      envVariables.JWT_SECRET,
      {
        audience: envVariables.FRONTEND_URL,
        issuer: envVariables.BACKEND_URL,
      },
      (error, encoded) => {
        if (error) {
          reject(
            new GenericError('Token verification failed', {
              cause: error,
            }),
          );
        } else {
          const parsedPayload = VerifyTokenPayloadSchema.safeParse(encoded);

          if (!parsedPayload.success) {
            reject(
              new GenericError('Token verification failed', {
                cause: 'Invalid token payload',
              }),
            );
          } else {
            resolve(parsedPayload.data);
          }
        }
      },
    );
  });
};
