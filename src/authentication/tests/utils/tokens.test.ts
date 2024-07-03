import {
  type SignTokenPayload,
  SignTokenPayloadSchema,
} from '../../validations';

import { generateMock } from '@anatine/zod-mock';
import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import envVariables from '../../../environment-variables';
import { GenericError } from '../../../shared/errors';
import { defaultJWTExpiration } from '../../constants';
import { generateJWTToken, verifyJWTToken } from '../../utils';

describe('JWT helpful functions', () => {
  describe('generateJWTToken', () => {
    it('should generate a JWT token', async () => {
      const payload = generateMock(SignTokenPayloadSchema, {
        stringMap: {
          expiresIn: () => defaultJWTExpiration,
        },
      });

      const token = await generateJWTToken(payload);

      expect(token).toBeTypeOf('string');
      expect(token.length).greaterThan(200);
    });

    it('should reject with an error if token signing fails', async () => {
      const invalidPayload = {
        sub: null,
        expiresIn: defaultJWTExpiration,
        claims: {},
      }; // Invalid payload to cause failure

      await expect(
        generateJWTToken(invalidPayload as unknown as SignTokenPayload),
      ).rejects.toThrow(GenericError);
    });
  });

  describe('verifyJWTToken', () => {
    it('should verify a JWT token', async () => {
      const payload = generateMock(SignTokenPayloadSchema, {
        stringMap: {
          expiresIn: () => defaultJWTExpiration,
        },
      });

      const token = jwt.sign(
        { claims: payload.claims },
        envVariables.JWT_SECRET,
        {
          expiresIn: payload.expiresIn,
          subject: payload.sub,
          audience: envVariables.FRONTEND_URL,
          issuer: envVariables.BACKEND_URL,
        },
      );

      const verifiedPayload = await verifyJWTToken(token);

      expect(verifiedPayload).toEqual({
        claims: payload.claims,
        iat: expect.any(Number),
        exp: expect.any(Number),
        sub: payload.sub,
        aud: envVariables.FRONTEND_URL,
        iss: envVariables.BACKEND_URL,
      });
    });

    it('should reject with an error if token verification fails', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(verifyJWTToken(invalidToken)).rejects.toThrow(GenericError);
    });
  });
});
