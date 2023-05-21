import { FastifyPluginAsync, FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { updateCompanyBodySchema, updateCompanyParamsSchema, updateCompanyReplySchema } from '../../schemas/company/update-company';
import { defaultErrorReply } from '../../schemas/default-error-reply';
import Options from '../../types/options';
import errorMessages from '../../utils/error-messages';

const opts: { schema: FastifySchema } = {
  schema: {
    params: updateCompanyParamsSchema,
    body: updateCompanyBodySchema,
    response: {
      200: updateCompanyReplySchema,
      400: defaultErrorReply,
    },
  },
};

const updateCompany: FastifyPluginAsync<Options> = async (
  app,
  { prisma },
) => {
  app.put<{
    Params: FromSchema<typeof updateCompanyParamsSchema>
    Body: FromSchema<typeof updateCompanyBodySchema>
    Reply: FromSchema<typeof updateCompanyReplySchema> | FromSchema<typeof defaultErrorReply>
  }>('/:companyId', opts, async (req, rep) => {
    const { params: { companyId }, body } = req;

    const company = await prisma.company.findUnique({
      where: {
        companyId,
      },
    });

    if (!company) {
      return rep.status(404).send();
    }

    if (body.taxNumber) {
      const foundCompanyTaxNumber = await prisma.company.findUnique({
        where: {
          taxNumber: body.taxNumber,
        },
      });

      if (foundCompanyTaxNumber && foundCompanyTaxNumber.companyId !== companyId) {
        return rep.status(400).send({ message: errorMessages.TAX_NUMBER_BELONGS_TO_A_COMPANY });
      }
    }

    const updatedCompany = await prisma.company.update({
      where: {
        companyId,
      },
      data: {
        ...body,
        email: body.email ?? null,
        notes: body.notes ?? null,
        phone: body.phone ?? null,
        taxNumber: body.taxNumber ?? null,
        receiptDescription: body.receiptDescription ?? null,
      },
    });

    return rep.status(200).send(updatedCompany);
  });
};

export default updateCompany;
