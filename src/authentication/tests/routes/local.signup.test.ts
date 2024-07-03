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

describe('POST /api/v1/dev/signup', () => {
  it('should sign up a new user using local strategy', async () => {
    const userDraft = generateMock(UserLocalDraftSchema);

    await api.post('/api/v1/dev/signup').send(userDraft).expect(201);
  });

  it('should set session cookie after successful sign up', async () => {
    const userDraft = generateMock(UserLocalDraftSchema);

    await api
      .post('/api/v1/dev/signup')
      .send(userDraft)
      .expect(201)
      .expect('Set-Cookie', /connect.sid=/);
  });

  it('should not allow duplicate sign ups', async () => {
    const userDraft = generateMock(UserLocalDraftSchema);

    await api.post('/api/v1/dev/signup').send(userDraft).expect(201);

    await api.post('/api/v1/dev/signup').send(userDraft).expect(400);
  });

  it('should return 400 when email is invalid', async () => {
    const userDraft = generateMock(UserLocalDraftSchema);

    await api
      .post('/api/v1/dev/signup')
      .send({
        name: userDraft.name,
        password: userDraft.password,
        email: 'not an email',
      })
      .expect(400);
  });

  it('should return 400 when password is too short', async () => {
    const userDraft = generateMock(UserLocalDraftSchema);

    await api
      .post('/api/v1/dev/signup')
      .send({
        name: userDraft.name,
        password: 'a',
        email: userDraft.email,
      })
      .expect(400);
  });
});
