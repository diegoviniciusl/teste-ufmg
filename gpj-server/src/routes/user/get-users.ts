import { FastifyPluginAsync, FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { defaultErrorReply } from '../../schemas/default-error-reply';
import { getUsersReplySchema } from '../../schemas/user/get-users';
import Options from '../../types/options';

const opts: { schema: FastifySchema } = {
  schema: {
    response: {
      200: getUsersReplySchema,
      400: defaultErrorReply,
    },
  },
};

const getUsers: FastifyPluginAsync<Options> = async (
  app,
  { prisma },
) => {
  app.get<{
    Reply: FromSchema<typeof getUsersReplySchema> | FromSchema<typeof defaultErrorReply>
  }>('/', opts, async (_req, rep) => {
    const users = await prisma.user.findMany({
      orderBy: {
        userId: 'desc',
      },
    });

    return rep.status(200).send(users);
  });
};

export default getUsers;
