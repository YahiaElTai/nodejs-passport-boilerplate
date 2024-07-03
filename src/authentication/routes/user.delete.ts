import type { Handler } from 'express';

import { GENERIC_ERROR_MESSAGE, isProduction } from '../../shared/constants';
import { applicationLogger } from '../../shared/loggers';
import User from '../repos/user-repo';
import { UserSessionSchema } from '../validations';

const deleteUser: Handler = async (req, res) => {
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

  await User.deleteUserById(foundUser.id);

  /**
   * Calling req.logout doesn't allow for clearning the cookie, it only destorys the session.
   * So, we need to manually destroy the session and clear the cookie.
   * Note: The session is destroyed before clearing the cookie to prevent the session from being re-created.
   */
  req.session.destroy((error) => {
    if (error) {
      applicationLogger.error(
        'Failed to destroy session after successfully deleting the user',
        { cause: error },
      );

      return res.status(200).json({ message: 'User deleted successfully' });
    }

    res.clearCookie('connect.sid', {
      httpOnly: true,
      secure: isProduction,
    });

    // Once the session is destroyed and the cookie is cleared, send a success response
    return res.status(200).json({ message: 'User deleted successfully' });
  });
};

export default deleteUser;
