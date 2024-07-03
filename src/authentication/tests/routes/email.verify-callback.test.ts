import { generateMock } from '@anatine/zod-mock';
import request, { type Agent } from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import configureServer from '../../../configure-server';
import envVariables from '../../../environment-variables';
import { JWT_PURPOSES } from '../../constants';
import { generateJWTToken } from '../../utils';
import { UserLocalDraftSchema } from '../../validations';
import Context from '../context';

const context = new Context();

let api: Agent;

beforeAll(async () => {
  const pool = await context.build();

  const app = configureServer(pool);
  api = request(app);
});

afterAll(async () => {
  await context.close();
});

beforeEach(async () => {
  await context.reset();
});

describe('GET /api/v1/email/verify/callback', () => {
  it('should verify user email address upon clicking the verification link', async () => {
    const userDraft = generateMock(UserLocalDraftSchema);

    const signUpResponse = await api
      .post('/api/v1/dev/signup')
      .send(userDraft)
      .expect(201);

    expect(signUpResponse.body.isEmailVerified).toEqual(false);

    const emailverificationToken = await generateJWTToken({
      sub: signUpResponse.body.id,
      expiresIn: '1d', // verification link expires in 1 day
      claims: {
        purpose: JWT_PURPOSES.EMAIL_VERIFICATION,
      },
    });

    const params = new URLSearchParams({ token: emailverificationToken });

    // This link is sent by email to the user but we can simulate that by generating our own JWT token and build the link
    const link = `/api/v1/email/verify/callback?${params}`;

    await api.get(link).expect(302);

    const cookie = signUpResponse.headers['set-cookie'];

    const userResponse = await api
      .get('/api/v1/user')
      .set('Cookie', cookie)
      .expect(200);

    expect(userResponse.body).toEqual({
      id: expect.any(String),
      email: userDraft.email,
      name: userDraft.name,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      githubId: null,
      googleId: null,
      avatarUrl: null,
      isEmailVerified: true,
    });
  });

  it('should return 400 if the token has expired', async () => {
    const userDraft = generateMock(UserLocalDraftSchema);

    const signUpResponse = await api
      .post('/api/v1/dev/signup')
      .send(userDraft)
      .expect(201);

    expect(signUpResponse.body.isEmailVerified).toEqual(false);

    const emailverificationToken = await generateJWTToken({
      sub: signUpResponse.body.id,
      expiresIn: '1', // verification link expires in 1 millisecond
      claims: {
        purpose: JWT_PURPOSES.EMAIL_VERIFICATION,
      },
    });

    const params = new URLSearchParams({ token: emailverificationToken });

    // This link is sent by email to the user but we can simulate that by generating our own JWT token and build the link
    const link = `/api/v1/email/verify/callback?${params}`;

    const response = await api.get(link).expect(400);

    expect(response.body.message).toEqual(
      'Link has expired or is invalid. Please try again.',
    );
  });

  it('should return 400 if no token is provided', async () => {
    const response = await api.get('/api/v1/email/verify/callback').expect(400);

    expect(response.body.message).toEqual(
      'Incorrect or invalid link. Please request a new email',
    );
  });
});
