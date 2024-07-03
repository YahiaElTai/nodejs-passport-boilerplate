import type { User } from '../validations';

import crypto from 'node:crypto';

export const removePassword = (user: User) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const uuidv4 = (): string => crypto.randomUUID();
