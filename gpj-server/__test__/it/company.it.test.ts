import requestHelper from '../helpers/requestHelper';
import createApp from '../../src/create-app';

const {
  post,
  get,
  server,
} = requestHelper(createApp());

describe('[IT] company', () => {
  afterAll(async () => {
    await server.close();
  });

  describe('GET /v1/company', () => {
    it('should return an empty list', async () => {
      const res = await get({ path: '/v1/company' });
      expect(res.status).toBe(200);
      expect(res.body).toBe([]);
    });
  });

  describe('POST /v1/company', () => {
    it('should create a new company', async () => {
      const company = {
        name: 'Teste LTDA',
        companyId: '123456789',
        phone: '123456789',
        taxNumber: '123456789',
        email: 'email@testeltda.com',
        password: '12345678',
      };
      const res = await post({ path: '/v1/company', params: company });
      expect(res.status).toBe(201);
    });
  });
});
