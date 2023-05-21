import { Trial, TrialStatus } from '@prisma/client';
import { FastifyPluginAsync, FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { defaultErrorReply } from '../../schemas/default-error-reply';
import { createTrialBodySchema, createTrialReplySchema } from '../../schemas/trial/create-trial';
import Options from '../../types/options';
import { findExtendedTrial } from '../../utils/trial/extended-trial-helper';
import getTrialOrderableStatus from '../../utils/trial/get-trial-orderable-status';

const opts: { schema: FastifySchema } = {
  schema: {
    body: createTrialBodySchema,
    response: {
      201: createTrialReplySchema,
      400: defaultErrorReply,
    },
  },
};

const createTrial: FastifyPluginAsync<Options> = async (
  app,
  { prisma },
) => {
  app.post<{
    Body: FromSchema<typeof createTrialBodySchema>
    Reply: FromSchema<typeof createTrialReplySchema> | FromSchema<typeof defaultErrorReply>
  }>('/', opts, async (req, rep) => {
    const { body, session } = req;

    if (!await prisma.company.findUnique({
      where: {
        companyId: body.clientId,
      },
    })) {
      return rep.status(404).send();
    }
    if (body.officeId && !await prisma.company.findUnique({
      where: {
        companyId: body.officeId,
      },
    })) {
      return rep.status(404).send();
    }

    const foundTrialNumber = !body.trialNumber ? false : await prisma.trial.findFirst({
      where: {
        trialNumber: body.trialNumber,
      },
    });

    const { trialId } = await prisma.$transaction(async (tx) => {
      const trial: Trial = await tx.trial.create({
        data: {
          ...body,
          deadline: new Date(body.deadline),
          status: TrialStatus.PENDING,
          orderableStatus: getTrialOrderableStatus(TrialStatus.PENDING),
        },
      });

      await tx.trialHistory.create({
        data: {
          trialId: trial.trialId,
          userId: session.user.userId,
          status: trial.status,
        },
      });

      return trial;
    });

    const headers = { 'found-duplicated-trial': foundTrialNumber ? 'true' : 'false' };

    const extendedTrial = await findExtendedTrial(prisma, trialId);

    if (extendedTrial === null) {
      return rep.status(404).send();
    }

    return rep.status(201).headers(headers).send(extendedTrial);
  });
};

export default createTrial;
