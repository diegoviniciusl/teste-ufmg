import { FastifyPluginAsync, FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { defaultErrorReply } from '../../schemas/default-error-reply';
import { getCompaniesReplySchema } from '../../schemas/company/get-companies';
import Options from '../../types/options';

const opts: { schema: FastifySchema } = {
  schema: {
    response: {
      200: getCompaniesReplySchema,
      400: defaultErrorReply,
    },
  },
};

const getCompanies: FastifyPluginAsync<Options> = async (
  app,
  { prisma },
) => {
  app.get<{
    Reply: FromSchema<typeof getCompaniesReplySchema> | FromSchema<typeof defaultErrorReply>
  }>('/', opts, async (_req, rep) => {
    const companies = await prisma.company.findMany({
      orderBy: {
        companyId: 'desc',
      },
    });

    return rep.status(200).send(companies);
  });
};

export default getCompanies;
