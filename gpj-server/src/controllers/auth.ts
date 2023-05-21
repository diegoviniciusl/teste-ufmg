import { FastifyPluginAsync } from 'fastify';
import login from '../routes/auth/login';
import Options from '../types/options';

const authController: FastifyPluginAsync<Options> = async (
  app,
  options,
) => {
  const prefix = '/v1/auth';
  app.register(login, { ...options, prefix });
};

export default authController;
