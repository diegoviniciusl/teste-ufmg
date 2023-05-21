import { FastifyPluginAsync, FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { createCompanyBodySchema, createCompanyReplySchema } from '../../schemas/company/create-company';
import { defaultErrorReply } from '../../schemas/default-error-reply';
import Options from '../../types/options';
import errorMessages from '../../utils/error-messages';

const opts: { schema: FastifySchema } = {
  schema: {
    body: createCompanyBodySchema,
    response: {
      201: createCompanyReplySchema,
      400: defaultErrorReply,
    },
  },
};

const createCompany: FastifyPluginAsync<Options> = async (
  app,
  { prisma },
) => {
  app.post<{
    Body: FromSchema<typeof createCompanyBodySchema>
    Reply: FromSchema<typeof createCompanyReplySchema> | FromSchema<typeof defaultErrorReply>
  }>('/', opts, async (req, rep) => {
    const { body } = req;
    if (body.taxNumber && await prisma.company.findUnique({
      where: {
        taxNumber: body.taxNumber,
      },
    })) {
      return rep.status(400).send({ message: errorMessages.TAX_NUMBER_BELONGS_TO_A_COMPANY });
    }

    const company = await prisma.company.create({
      data: body,
    });

    return rep.status(201).send(company);
  });
};

export default createCompany;
