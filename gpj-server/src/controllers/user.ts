import { Role } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import createUser from '../routes/user/create-user';
import getUsers from '../routes/user/get-users';
import partialUpdateUser from '../routes/user/partial-update-user';
import Options from '../types/options';
import authorizer from '../utils/authorizer';

const userController: FastifyPluginAsync<Options> = async (
  app,
  options,
) => {
  const prefix = '/v1/user';
  app.addHook('onRequest', authorizer([Role.ADMIN], options));
  app.register(createUser, { ...options, prefix });
  app.register(partialUpdateUser, { ...options, prefix });
  app.register(getUsers, { ...options, prefix });
};

export default userController;
