import { JsonWebTokenError } from 'jsonwebtoken';
import { Strategy } from 'passport-custom';

import { BadRequestError, GenericError } from '../../shared/errors';
import { applicationLogger } from '../../shared/loggers';
import { JWT_PURPOSES } from '../constants';
import User from '../repos/user-repo';
import { uuidv4, verifyJWTToken } from '../utils';
import { TokenQueryParamSchema } from '../validations';

const MagicLinkStrategy = new Strategy(async (req, cb) => {
  try {
    const validatedToken = TokenQueryParamSchema.safeParse(req.query);

    if (!validatedToken.success) {
      /**
       * In case the token is not present or invalid then possibly it's an issue with the email sent
       * So we log the error for debugging and send a bad request error to the user
       */
      applicationLogger.error(validatedToken.error.message, {
        error: validatedToken.error,
        path: req.path,
        method: req.method,
      });
      return cb(
        new BadRequestError('Incorrect or invalid link. Please try again'),
      );
    }

    // Verify the JWT token for expiration and correctness
    const payload = await verifyJWTToken(validatedToken.data.token);

    // Check if the token is for sign up user
    if (
      payload.claims?.purpose &&
      payload.claims.purpose === JWT_PURPOSES.MAGIC_LINK_SIGN_UP
    ) {
      const foundUser = await User.findUserByEmail(payload.claims?.email);

      if (foundUser) {
        return cb(
          new BadRequestError(
            'User with email already exists. Please login instead.',
          ),
        );
      }

      const createdUser = await User.createUser({
        email: payload.claims.email,
        name: payload.claims?.name,
      });

      return cb(null, createdUser);
    }

    if (
      payload.claims?.purpose &&
      payload.claims.purpose === JWT_PURPOSES.MAGIC_LINK_LOGIN
    ) {
      const foundUser = await User.findUserByEmail(payload.claims?.email);

      if (!foundUser) {
        return cb(
          new BadRequestError(
            'User with email does not exist. Please sign up first.',
          ),
        );
      }

      // verify that the `sub` of the token matches the user id
      if (foundUser.id !== payload.sub) {
        return cb(new BadRequestError('Invalid token provided'));
      }

      return cb(null, foundUser);
    }
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return cb(
        new BadRequestError(
          'Link has expired or is invalid. Please try again.',
        ),
      );
    }

    if (error instanceof Error) {
      return cb(error);
    }

    return cb(new GenericError('Failed to authenticate with magic link'));
  }
});

export default MagicLinkStrategy;
