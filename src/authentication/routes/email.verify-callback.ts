import type { Handler } from 'express';

import envVariables from '../../environment-variables';
import { GenericError } from '../../shared/errors';
import { JWT_PURPOSES } from '../constants';
import User from '../repos/user-repo';
import { verifyJWTToken } from '../utils';
import { TokenQueryParamSchema } from '../validations';

const verifyEmailCallback: Handler = async (req, res, next) => {
  try {
    const validatedToken = TokenQueryParamSchema.safeParse(req.query);

    if (!validatedToken.success) {
      return res.status(400).json({
        message: 'Incorrect or invalid link. Please request a new email',
      });
    }

    // Verify the JWT token
    const payload = await verifyJWTToken(validatedToken.data.token);

    // Check if the token is for email verification
    if (
      !payload.claims?.purpose ||
      payload.claims.purpose !== JWT_PURPOSES.EMAIL_VERIFICATION
    ) {
      return res.status(400).json({
        message:
          'Token provided is not for email verification. Please request a new verification email',
      });
    }

    // Find the user in the database
    const foundUser = await User.findUserById(payload.sub);

    // If the user is not found, throw a 404 error
    if (!foundUser) {
      return res.status(400).json({ message: 'Invalid token provided' });
    }

    // If the user is already verified, return a 204 status
    if (foundUser.isEmailVerified) {
      return res.status(204).send();
    }

    await User.updateUserByEmail(foundUser.email, {
      isEmailVerified: true,
    });

    // redirect to the frontend URL with the email-verified path to show a success message to the user
    res.redirect(`${envVariables.FRONTEND_URL}/email-verified`);
  } catch (error) {
    if (error instanceof GenericError) {
      return res
        .status(400)
        .json({ message: 'Link has expired or is invalid. Please try again.' });
    }

    // Pass any errors to the error handling middleware
    next(error);
  }
};

export default verifyEmailCallback;
