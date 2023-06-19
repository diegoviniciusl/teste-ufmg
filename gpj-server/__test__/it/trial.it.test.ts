import { PrismaClient, TaskType, TrialStatus } from '@prisma/client';
import createApp from '../../src/create-app';
import requestHelper from '../helpers/requestHelper';
import generateTestAuth from '../helpers/generateTestAuth';

let get: any;
let post: any;
let patch: any;
let app: any;
let token: any;
let prisma: any;

describe('[IT] trial', () => {
  beforeAll(async () => {
    app = await createApp();
    const helper = await requestHelper(app);
    get = helper.get;
    post = helper.post;
    patch = helper.patch;
    prisma = new PrismaClient();
  });

  beforeEach(async () => {
    process.env.JWT_SECRET = '12345678';
    token = await generateTestAuth(prisma);
  })

  afterEach(async () => {
    await prisma.trialHistory.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.trial.deleteMany({});
    await prisma.company.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  })

  describe('GET /v1/trial', () => {
    it('should return an empty list', async () => {
      const res = await get({ path: '/v1/trial', auth: token });
      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual([]);
    });
  });

  describe('PATCH /v1/trial', () => {
    it.each([
      TrialStatus.CHECKED,
      TrialStatus.IN_CONFERENCE,
      TrialStatus.IN_PROGRESS,
      TrialStatus.SENT,
      TrialStatus.TO_CHECK,
    ])('should update trial status to %p', async (trialStatus: TrialStatus) => {
      const company = {
        name: 'Teste LTDA',
      };
      const createdCompany = await prisma.company.create({ data: company });
      const createdTrial = await prisma.trial.create({
        data: {
          clientId: createdCompany.companyId,
          trialRequestedByOffice: false,
          taskType: TaskType.FINANCIAL_ANALYSIS,
          deadline: new Date(),
          status : TrialStatus.PENDING,
        },
      });

      const res = await patch({ path: `/v1/trial/${createdTrial.trialId}`, params: { status: trialStatus }, auth: token });

      const updatedTrial = await prisma.trial.findUnique({
        where: {
          trialId: createdTrial.trialId,
        },
      });

      expect(res.status).toBe(200);
      expect(updatedTrial.status).toBe(trialStatus);
      expect(res.body.trialId).toBe(updatedTrial.trialId);
    });
  });

  describe('POST /v1/trial', () => {
    it('should create a new trial', async () => {
      const createdCompany = await prisma.company.create({ data: {
        name: 'Teste LTDA',
        taxNumber: '44444444444',
      } });
      const trial = {
        clientId: createdCompany.companyId,
        trialRequestedByOffice: false,
        taskType: TaskType.FINANCIAL_ANALYSIS,
        deadline: new Date().toISOString().split('T')[0],
      };
      const res = await post({ path: '/v1/trial', params: trial, auth: token });
      expect(res.status).toBe(201);
    });

    it.each([
      null,
      undefined,
      '',
      'wrong value'      
    ])('should fail with 400 if taskType = %p', async (taskType) => {
      const createdCompany = await prisma.company.create({ data: {
        name: 'Teste LTDA',
      }});
      const trial = {
        clientId: createdCompany.companyId,
        trialRequestedByOffice: false,
        taskType,
        deadline: new Date().toISOString().split('T')[0],
      };
      const res = await post({ path: '/v1/trial', params: trial, auth: token });
      expect(res.status).toBe(400);
    });
  });
});
