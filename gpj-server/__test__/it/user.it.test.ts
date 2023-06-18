import { Role, PrismaClient } from '@prisma/client';
import createApp from '../../src/create-app';
import { generateAccessToken } from '../../src/utils/jwt-token-helper';
import requestHelper from '../helpers/requestHelper';

let get: any;
let post: any;
let app: any;
let token: any;
let prisma: any;

describe('[IT] user', () => {
  beforeAll(async () => {
    app = await createApp();
    const helper = await requestHelper(app);
    get = helper.get;
    post = helper.post;
    process.env.JWT_SECRET = '12345678';
    prisma = new PrismaClient();

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

    await prisma.user.create({
      data: user,
    });

    token = `Bearer ${generateAccessToken(user)}`;
  });

  afterAll(async () => {
    await app.close();
    await prisma.user.deleteMany({});
  });

  describe('GET /v1/user', () => {
    it('should return single user', async () => {
      const res = await get({ path: '/v1/user', auth: token });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });

  describe('POST /v1/user', () => {
    it('should create a new user', async () => {
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
