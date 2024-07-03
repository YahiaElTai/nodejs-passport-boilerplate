import { generateMock } from '@anatine/zod-mock';
import request, { type Agent } from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
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

describe('POST /api/v1/dev/login/password', () => {
  it('should login a new user using local strategy', async () => {
    const userDraft = generateMock(UserLocalDraftSchema);

    await api.post('/api/v1/dev/signup').send(userDraft).expect(201);

    await api
      .post('/api/v1/dev/login/password')
      .send({ email: userDraft.email, password: userDraft.password })
      .expect(200)
      .expect('Set-Cookie', /connect.sid=/);
  });

  it('should return 400 when credentials are incorrect', async () => {
    const userDraft = generateMock(UserLocalDraftSchema);

    await api.post('/api/v1/dev/signup').send(userDraft).expect(201);

    const incorrectUserDraft = generateMock(UserLocalDraftSchema);
    await api
      .post('/api/v1/dev/login/password')
      .send(incorrectUserDraft)
      .expect(400);
  });

  it('should return 404 when password is missing', async () => {
    const userDraft = generateMock(UserLocalDraftSchema);

    await api.post('/api/v1/dev/signup').send(userDraft).expect(201);

    await api
      .post('/api/v1/dev/login/password')
      .send({ email: userDraft.email })
      .expect(400);
  });
});
