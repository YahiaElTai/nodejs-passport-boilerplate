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

describe('GET /api/v1/user/logout', () => {
  it('should logout user when authenticated', async () => {
    const userDraft = generateMock(UserLocalDraftSchema);

    const response = await api.post('/api/v1/dev/signup').send(userDraft);

    const cookie = response.headers['set-cookie'];

    await api.get('/api/v1/user/logout').set('Cookie', cookie).expect(200);
  });

  it('should return 401 when not authenticated', async () => {
    await api.get('/api/v1/user/logout').expect(401);
  });
});
