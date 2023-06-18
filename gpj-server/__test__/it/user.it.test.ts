import { Role, PrismaClient } from '@prisma/client';
import createApp from '../../src/create-app';
import { generateAccessToken } from '../../src/utils/jwt-token-helper';
import requestHelper from '../helpers/requestHelper';

let get: any;
let post: any;
let app: any;
let token: any;

describe('[IT] user', () => {
  beforeAll(async () => {
    app = await createApp();
    const helper = await requestHelper(app);
    get = helper.get;
    post = helper.post;
    process.env.JWT_SECRET = '12345678';
    const prismaClient = new PrismaClient();
    const user = {
      userId: 1,
      name: 'Teste da Silva',
      email: 'email@teste.com',
      role: Role.ADMIN,
      active: true,
      phone: '123456789',
      password: '12345678',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await prismaClient.user.deleteMany({});
    await prismaClient.user.create({
      data: user,
    });
    token = `Bearer ${generateAccessToken(user)}`;
    console.log('token', token);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /v1/user', () => {
    it('should return an empty list', async () => {
      const res = await get({ path: '/v1/user', auth: token });
      expect(res.status).toBe(200);
      expect(res.body).toBe([]);
    });
  });

  describe.only('POST /v1/user', () => {
    it.only('should create a new user', async () => {
      const user = {
        name: 'Teste da Silva',
        email: 'email@test.com',
        password: '12345678',
        role: 'USER',
      };
      const res = await post({ path: '/v1/user', params: user, auth: token });
      expect(res.status).toBe(201);
    });
  });
});
