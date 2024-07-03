import type { Handler } from 'express';

import { GENERIC_ERROR_MESSAGE } from '../../shared/constants';
import { applicationLogger } from '../../shared/loggers';
import User from '../repos/user-repo';
import { removePassword } from '../utils';
import { UserSessionSchema } from '../validations';

const LocalLogin: Handler = async (req, res) => {
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

  res.status(200).json(removePassword(foundUser));
};

export default LocalLogin;
