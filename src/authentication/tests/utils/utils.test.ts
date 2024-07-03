import { generateMock } from '@anatine/zod-mock';
import { UserSchema } from '../../validations';

import { describe, expect, it } from 'vitest';
import { removePassword } from '../../utils';

describe('removePassword util', () => {
  it('it should remove password from user object', () => {
    const user = generateMock(UserSchema);

    const result = removePassword(user);

    const { password, ...userWithoutPassword } = user;
    expect(result).toEqual(userWithoutPassword);
  });
});
