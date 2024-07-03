import type { Handler } from 'express';

import bcrypt from 'bcrypt';
import { applicationLogger } from '../../shared/loggers';
import User from '../repos/user-repo';
import { removePassword } from '../utils';
import { UserLocalDraftSchema } from '../validations';

const localSignUp: Handler = async (req, res) => {
  const { success, data } = UserLocalDraftSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({ message: 'email or password is invalid.' });
  }

  const foundUser = await User.findUserByEmail(data.email);

  if (foundUser) {
    return res.status(400).json({ message: 'User with email already exists' });
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const createdUser = await User.createUser({
    email: data.email,
    password: hashedPassword,
    name: data.name,
  });

  if (!createdUser) {
    const message = 'Failed to create user with email and password';
    applicationLogger.error(message);

    return res.status(500).json({ message });
  }

  req.login(createdUser, (error) => {
    if (error) {
      const message =
        'Failed to login user after sign up with email and password';
      applicationLogger.error(message, error);

      return res.status(500).json({ message });
    }

    return res.status(201).json(removePassword(createdUser));
  });
};

export default localSignUp;
