import requestHelper from '../helpers/requestHelper';
import createApp from '../../src/create-app';

const {
  post,
  get,
  server,
} = requestHelper(createApp());

describe('[IT] trial', () => {
  afterAll(async () => {
    await server.close();
  });

  describe('GET /v1/trial', () => {
    it('should return an empty list', async () => {
      const res = await get({ path: '/v1/trial' });
      expect(res.status).toBe(200);
      expect(res.body).toBe([]);
    });
  });

  describe('POST /v1/trial', () => {
    it('should create a new trial', async () => {
      const trial = {
        clientId: '123456789',
        trialRequestedByOffice: false,
        taskType: 'TEST',
        deadline: new Date(),
      };
      const res = await post({ path: '/v1/trial', params: trial });
      expect(res.status).toBe(201);
    });
  });
});
