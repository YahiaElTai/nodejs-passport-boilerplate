import { generateMock } from '@anatine/zod-mock';
import request, { type Agent } from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import configureServer from '../../../configure-server';
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

describe('GET /api/v1/user', () => {
  it('should fetch user when authenticated', async () => {
    const userDraft = generateMock(UserLocalDraftSchema);

    const signUpResponse = await api.post('/api/v1/dev/signup').send(userDraft);

    const cookie = signUpResponse.headers['set-cookie'];

    const response = await api
      .get('/api/v1/user')
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body).toEqual({
      id: expect.any(String),
      email: userDraft.email,
      name: userDraft.name,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      githubId: null,
      googleId: null,
      avatarUrl: null,
      isEmailVerified: false,
    });
  });

  it('should return 401 when not authenticated', async () => {
    const userDraft = generateMock(UserLocalDraftSchema);

    await api.post('/api/v1/dev/signup').send(userDraft);

    await api.get('/api/v1/user').expect(401);
  });
});
