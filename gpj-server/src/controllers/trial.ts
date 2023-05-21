import { Role } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import createTrial from '../routes/trial/create-trial';
import deleteTrial from '../routes/trial/delete-trial';
import getTrials from '../routes/trial/get-trials';
import getTrialsCsv from '../routes/trial/get-trials-csv';
import partialUpdateTrial from '../routes/trial/partial-update-trial';
import Options from '../types/options';
import authorizer from '../utils/authorizer';

const trialController: FastifyPluginAsync<Options> = async (
  app,
  options,
) => {
  const prefix = '/v1/trial';
  app.addHook('onRequest', authorizer([Role.ADMIN, Role.USER], options));
  app.register(createTrial, { ...options, prefix });
  app.register(getTrials, { ...options, prefix });
  app.register(partialUpdateTrial, { ...options, prefix });
  app.register(deleteTrial, { ...options, prefix });
  app.register(getTrialsCsv, { ...options, prefix });
};

export default trialController;
