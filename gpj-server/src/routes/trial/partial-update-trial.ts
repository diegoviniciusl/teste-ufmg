import { PrismaClient, Trial } from '@prisma/client';
import { FastifyPluginAsync, FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { defaultErrorReply } from '../../schemas/default-error-reply';
import { partialUpdateTrialBodySchema, partialUpdateTrialParamsSchema, partialUpdateTrialReplySchema } from '../../schemas/trial/partial-update-trial';
import Options from '../../types/options';
import { findExtendedTrial } from '../../utils/trial/extended-trial-helper';
import getTrialOrderableStatus from '../../utils/trial/get-trial-orderable-status';

const opts: { schema: FastifySchema } = {
  schema: {
    params: partialUpdateTrialParamsSchema,
    body: partialUpdateTrialBodySchema,
    response: {
      200: partialUpdateTrialReplySchema,
      400: defaultErrorReply,
    },
  },
};

const hasExistingTrialNumber = async (prisma: PrismaClient, trialId: number, trialNumber?: string | null): Promise<boolean> => {
  if (!trialNumber) return false;

  const foundTrial = await prisma.trial.findFirst({
    where: {
      trialId: {
        not: trialId,
      },
      trialNumber,
    },
  });

  return !!foundTrial;
};

const partialUpdateTrial: FastifyPluginAsync<Options> = async (
  app,
  { prisma },
) => {
  app.patch<{
    Params: FromSchema<typeof partialUpdateTrialParamsSchema>
    Body: FromSchema<typeof partialUpdateTrialBodySchema>
    Reply: FromSchema<typeof partialUpdateTrialReplySchema> | FromSchema<typeof defaultErrorReply>
  }>('/:trialId', opts, async (req, rep) => {
    const { params: { trialId }, body, session } = req;

    if (body.clientId && !await prisma.company.findUnique({
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

    const foundTrial = await prisma.trial.findUnique({
      where: {
        trialId,
      },
    });

    if (!foundTrial) {
      return rep.status(404).send();
    }

    const foundTrialNumber = await hasExistingTrialNumber(prisma, trialId, body.trialNumber);

    await prisma.$transaction(async (tx) => {
      const trial: Trial = await tx.trial.update({
        where: {
          trialId,
        },
        data: {
          ...body,
          deadline: body.deadline ? new Date(body.deadline) : undefined,
          orderableStatus: body.status ? getTrialOrderableStatus(body.status) : undefined,
        },
      });

      if (foundTrial.status !== body.status) {
        await tx.trialHistory.create({
          data: {
            trialId,
            userId: session.user.userId,
            status: trial.status,
          },
        });
      }

      return trial;
    });

    const headers = { 'found-duplicated-trial': foundTrialNumber ? 'true' : 'false' };

    const extendedTrial = await findExtendedTrial(prisma, trialId);

    if (extendedTrial === null) {
      return rep.status(404).send();
    }

    return rep.status(200).headers(headers).send(extendedTrial);
  });
};

export default partialUpdateTrial;
