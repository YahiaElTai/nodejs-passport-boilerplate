import type { User, UserMagicLinkDraft } from '../validations';

import envVariables from '../../environment-variables';
import { JWT_PURPOSES } from '../constants';
import {
  sendLoginMagicLinkEmail,
  sendSignUpMagicLinkEmail,
  sendVerificationEmail,
} from '../emails';
import { generateJWTToken } from './tokens';
import { uuidv4 } from './utils';

export const generateAndSendVerificationEmail = async (user: User) => {
  const emailverificationToken = await generateJWTToken({
    sub: user.id,
    expiresIn: '1d', // verification link expires in 1 day
    claims: {
      purpose: JWT_PURPOSES.EMAIL_VERIFICATION,
    },
  });

  const params = new URLSearchParams({ token: emailverificationToken });

  const link = `${envVariables.BACKEND_URL}/api/v1/email/verify/callback?${params}`;

  return sendVerificationEmail({
    email: user.email,
    name: user.name ?? '',
    link,
  });
};

export const generateAndSendMagicLinkEmail = async (
  user: UserMagicLinkDraft,
) => {
  /**
   * we generate a JWT token for the magic link which is valid for 10 minutes
   * if this is a sign up magic link, then we generate a random UUID for the `sub` claim
   * (useless thing but keeps the codebase consistent) as we always expect JWT to have `sub` claim defined as UUID
   */
  const magicLinkToken = await generateJWTToken({
    sub: user.id ?? uuidv4(),
    expiresIn: '10m',
    claims: {
      purpose: user.id
        ? JWT_PURPOSES.MAGIC_LINK_LOGIN
        : JWT_PURPOSES.MAGIC_LINK_SIGN_UP,
      email: user.email,
      name: user.name,
    },
  });

  const params = new URLSearchParams({ token: magicLinkToken });

  const link = `${envVariables.BACKEND_URL}/api/v1/auth/magic-link/callback?${params}`;

  if (user.id) {
    return sendLoginMagicLinkEmail({
      email: user.email,
      name: user.name ?? '',
      link,
    });
  }

  return sendSignUpMagicLinkEmail({
    email: user.email,
    name: user.name ?? '',
    link,
  });
};
