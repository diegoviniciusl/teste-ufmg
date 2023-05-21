import { Role } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import createCompany from '../routes/company/create-company';
import getCompanies from '../routes/company/get-companies';
import updateCompany from '../routes/company/update-company';
import Options from '../types/options';
import authorizer from '../utils/authorizer';

const companyController: FastifyPluginAsync<Options> = async (
  app,
  options,
) => {
  const prefix = '/v1/company';
  app.addHook('onRequest', authorizer([Role.ADMIN, Role.USER], options));
  app.register(createCompany, { ...options, prefix });
  app.register(updateCompany, { ...options, prefix });
  app.register(getCompanies, { ...options, prefix });
};

export default companyController;
