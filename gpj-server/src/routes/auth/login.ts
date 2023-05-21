import { FastifyPluginAsync, FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { defaultErrorReply } from '../../schemas/default-error-reply';
import { loginBodySchema, loginReplySchema } from '../../schemas/auth/login';
import Options from '../../types/options';
import { compareMessage } from '../../utils/hash-helper';
import { generateAccessToken } from '../../utils/jwt-token-helper';

const opts: { schema: FastifySchema } = {
  schema: {
    body: loginBodySchema,
    response: {
      200: loginReplySchema,
      400: defaultErrorReply,
      404: {} as const,
    },
  },
};

const login: FastifyPluginAsync<Options> = async (
  app,
  { prisma },
) => {
  app.post<{
    Body: FromSchema<typeof loginBodySchema>
    Reply: FromSchema<typeof loginReplySchema> | FromSchema<typeof defaultErrorReply>
  }>('/login', opts, async (req, rep) => {
    const { body } = req;

    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        active: true,
      },
    });
    if (!user) {
      return rep.status(404).send();
    }

    const validPassword = compareMessage(body.password, user.password);
    if (!validPassword) {
      return rep.status(404).send();
    }

    const accessToken = generateAccessToken(user);
    return rep.status(200).send({ accessToken });
  });
};

export default login;
