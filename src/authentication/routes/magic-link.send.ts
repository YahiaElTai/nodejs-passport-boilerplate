import type { Handler } from 'express';

import User from '../repos/user-repo';
import { generateAndSendMagicLinkEmail } from '../utils';
import { UserMagicLinkDraftSchema } from '../validations';

const magicLinkSend: Handler = async (req, res) => {
  const { email, name } = UserMagicLinkDraftSchema.parse(req.body);

  const foundUser = await User.findUserByEmail(email);

  if (foundUser) {
    /**
     * if a user is found then it must contain an ID
     * because we are passing a user ID, this magic link email will be a login email
     */
    await generateAndSendMagicLinkEmail(foundUser);

    return res
      .status(200)
      .json({ message: 'Login magic link sent successfully' });
  }

  // because we are not passing a user ID, this magic link email will be a sign up email
  await generateAndSendMagicLinkEmail({ email, name });

  res.status(200).json({ message: 'Sign up magic link sent successfully' });
};

export default magicLinkSend;
