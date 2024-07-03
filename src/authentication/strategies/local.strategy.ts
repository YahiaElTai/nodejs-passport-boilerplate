import bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';

import { BadRequestError, GenericError } from '../../shared/errors';
import User from '../repos/user-repo';

const localStrategy = new Strategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: true,
  },
  async (email, password, cb) => {
    try {
      const user = await User.findUserByEmail(email);

      if (!user) {
        return cb(
          new BadRequestError('User not found or incorrect credentials'),
        );
      }

      if (!user.password) {
        return cb(new BadRequestError('Incorrect email or password'));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return cb(new BadRequestError('Incorrect email or password'));
      }

      return cb(null, user);
    } catch (error) {
      if (error instanceof Error) {
        return cb(error);
      }

      return cb(
        new GenericError('Failed to authenticate with email and password'),
      );
    }
  },
);

export default localStrategy;
