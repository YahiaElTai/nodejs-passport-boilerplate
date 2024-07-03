import type { Handler } from 'express';

import { GENERIC_ERROR_MESSAGE } from '../../shared/constants';
import { applicationLogger } from '../../shared/loggers';
import User from '../repos/user-repo';
import { generateAndSendVerificationEmail } from '../utils';
import { UserSessionSchema } from '../validations';

const resendEmail: Handler = async (req, res) => {
  // validate the user session from the request, and extract the user id and email
  const validatedSession = UserSessionSchema.safeParse(req.user);

  if (!validatedSession.success) {
    applicationLogger.warn('Missing auth context', {
      userContext: req.user,
      parsingError: validatedSession.error,
    });
    // if the session is missing or invalid even if the user is authenticated, return a 500 error
    return res.status(500).json({ message: GENERIC_ERROR_MESSAGE });
  }

  const foundUser = await User.findUserById(validatedSession.data.id);

  if (!foundUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  // If the user is already verified, do not resend the verification email
  if (foundUser.isEmailVerified) {
    return res.status(200).json({
      message: 'Email already verified. No need to resend verification email',
    });
  }

  /**
   * Asynchronously generate and send a verification email to the user.
   * This operation is performed asynchronously to improve response time by not blocking it.
   * If an error occurs during this process (e.g., the email service is down),
   * the error will be caught and logged, but it won't affect the response sent to the user.
   */
  generateAndSendVerificationEmail(foundUser).catch((error) => {
    applicationLogger.error(error.message, {
      tag: 'EmailVerificationError',
      cause: error?.cause,
      error,
      path: req.path,
      method: req.method,
    });
  });

  // Always delay the response to prevent timing attacks
  setTimeout(() => {
    res.status(200).json({ message: 'Verification email sent successfully' });
  }, 500);
};

export default resendEmail;
