import { FastifyPluginAsync, FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { defaultErrorReply } from '../../schemas/default-error-reply';
import { createUserBodySchema, createUserReplySchema } from '../../schemas/user/create-user';
import Options from '../../types/options';
import errorMessages from '../../utils/error-messages';
import { hashMessage } from '../../utils/hash-helper';

const opts: { schema: FastifySchema } = {
  schema: {
    body: createUserBodySchema,
    response: {
      201: createUserReplySchema,
      400: defaultErrorReply,
    },
  },
};

const createUser: FastifyPluginAsync<Options> = async (
  app,
  { prisma },
) => {
  app.post<{
    Body: FromSchema<typeof createUserBodySchema>
    Reply: FromSchema<typeof createUserReplySchema> | FromSchema<typeof defaultErrorReply>
  }>('/', opts, async (req, rep) => {
    const { body } = req;

    const foundEmailUser = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (foundEmailUser) {
      return rep.status(400).send({ message: errorMessages.EMAIL_BELONGS_TO_A_USER });
    }

    const user = await prisma.user.create({
      data: {
        ...body,
        password: hashMessage(body.password),
      },
    });

    return rep.status(201).send(user);
  });
};

export default createUser;
