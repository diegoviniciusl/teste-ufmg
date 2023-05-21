import { Role } from '@prisma/client';
import { FastifyPluginAsync, FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { defaultErrorReply } from '../../schemas/default-error-reply';
import { partialUpdateUserParamsSchema, partialUpdateUserBodySchema, partialUpdateUserReplySchema } from '../../schemas/user/partial-update-user';
import Options from '../../types/options';
import errorMessages from '../../utils/error-messages';
import { hashMessage } from '../../utils/hash-helper';

const opts: { schema: FastifySchema } = {
  schema: {
    params: partialUpdateUserParamsSchema,
    body: partialUpdateUserBodySchema,
    response: {
      200: partialUpdateUserReplySchema,
      400: defaultErrorReply,
    },
  },
};

const partialUpdateUser: FastifyPluginAsync<Options> = async (
  app,
  { prisma },
) => {
  app.patch<{
    Params: FromSchema<typeof partialUpdateUserParamsSchema>
    Body: FromSchema<typeof partialUpdateUserBodySchema>
    Reply: FromSchema<typeof partialUpdateUserReplySchema> | FromSchema<typeof defaultErrorReply>
  }>('/:userId', opts, async (req, rep) => {
    const { params: { userId }, body, session } = req;

    const user = await prisma.user.findUnique({
      where: {
        userId,
      },
    });

    if (!user) {
      return rep.status(404).send();
    }

    const foundEmailUser = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (foundEmailUser && foundEmailUser.userId !== userId) {
      return rep.status(400).send({ message: errorMessages.EMAIL_BELONGS_TO_A_USER });
    }

    if (userId === session.user.userId && !body.active) {
      return rep.status(400).send({ message: errorMessages.CAN_NOT_DEACTIVATE_OWN_USER });
    }

    if (userId === session.user.userId && body.role === Role.USER) {
      return rep.status(400).send({ message: errorMessages.CAN_NOT_REGRESS_OWN_PERMISSION });
    }

    const updatedUser = await prisma.user.update({
      where: {
        userId,
      },
      data: {
        ...body,
        password: body.password ? hashMessage(body.password) : undefined,
      },
    });

    return rep.status(200).send(updatedUser);
  });
};

export default partialUpdateUser;
