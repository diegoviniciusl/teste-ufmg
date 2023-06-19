import { PrismaClient } from '@prisma/client';
import createApp from '../../src/create-app';
import requestHelper from '../helpers/requestHelper';
import generateTestAuth from '../helpers/generateTestAuth';

let get: any;
let post: any;
let app: any;
let token: any;
let prisma: any;

describe('[IT] company', () => {
  beforeAll(async () => {
    app = await createApp();
    const helper = await requestHelper(app);
    get = helper.get;
    post = helper.post;
    process.env.JWT_SECRET = '12345678';
    prisma = new PrismaClient();
  });

  beforeEach(async () => {
    token = await generateTestAuth(prisma);
  })

  afterEach(async () => {
    await prisma.user.deleteMany({});
    await prisma.company.deleteMany({});
  })

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('GET /v1/company', () => {
    it('should return an empty list', async () => {
      const res = await get({ path: '/v1/company', auth: token });
      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual([]);
    });

    it('should return a created company', async () => {
      const company = {
        name: 'Teste LTDA',
        taxNumber: '11111111111',
        phone: '1234567890',
      };
      await prisma.company.create({ data: company });

      const res = await get({ path: '/v1/company', auth: token });
      expect(res.status).toBe(200);
      expect(res.body[0].name).toBe(company.name);
      expect(res.body[0].phone).toBe(company.phone);
      expect(res.body[0].taxNumber).toBe(company.taxNumber);
    });
  });

  describe('POST /v1/company', () => {
    it('should create a new company', async () => {
      const company = {
        name: 'Teste LTDA',
        companyId: '22222222222',
        phone: '1234567890',
        taxNumber: '12345678900',
        email: 'email@testeltda.com',
        password: '12345678',
      };
      const res = await post({ path: '/v1/company', params: company, auth: token });

      const companyCreated = await prisma.company.findUnique({
        where: {
          taxNumber: company.taxNumber,
        },
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        companyId: companyCreated.companyId,
        name: companyCreated.name,
        phone: companyCreated.phone,
        email: companyCreated.email,
      })
      expect(companyCreated.name).toBe(company.name);
      expect(companyCreated.phone).toBe(company.phone);
      expect(companyCreated.email).toBe(company.email);
    });

    it('should fail with bad request if tax number is not at least 11 characters', async () => {
      const company = {
        name: 'Teste LTDA',
        phone: '1234567890',
        taxNumber: '11',
        email: 'email@testeltda.com',
      };
      const res = await post({ path: '/v1/company', params: company, auth: token });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should fail if tax number already exists', async () => {
      const company = {
        name: 'Teste LTDA',
        phone: '1234567890',
        taxNumber: '11111111111',
        email: 'email@testeltda.com',
      };
      await prisma.company.create({ data: company })

      const res = await post({ path: '/v1/company', params: company, auth: token });

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('tax number already belongs to a company');
    });
  });
});
