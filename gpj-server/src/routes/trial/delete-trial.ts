import { FastifyPluginAsync, FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { defaultErrorReply } from '../../schemas/default-error-reply';
import { deleteTrialParamsSchema } from '../../schemas/trial/delete-trial';
import Options from '../../types/options';

const opts: { schema: FastifySchema } = {
  schema: {
    params: deleteTrialParamsSchema,
    response: {
      204: {},
      400: defaultErrorReply,
    },
  },
};

const deleteTrial: FastifyPluginAsync<Options> = async (
  app,
  { prisma },
) => {
  app.delete<{
    Params: FromSchema<typeof deleteTrialParamsSchema>
    Reply: {} | FromSchema<typeof defaultErrorReply>
  }>('/:trialId', opts, async (req, rep) => {
    const { params: { trialId } } = req;

    if (!await prisma.trial.findUnique({
      where: {
        trialId,
      },
    })) {
      return rep.status(404).send();
    }

    await prisma.$transaction(async (tx) => {
      await tx.trialHistory.deleteMany({
        where: {
          trialId,
        },
      });

      await tx.trial.delete({
        where: {
          trialId,
        },
      });
    });

    return rep.status(204).send();
  });
};

export default deleteTrial;
