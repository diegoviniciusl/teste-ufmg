import { FastifyPluginAsync, FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { Prisma } from '@prisma/client';
import { Parser } from 'json2csv';
import { defaultErrorReply } from '../../schemas/default-error-reply';
import Options from '../../types/options';
import TrialOrderableColumn from '../../types/enums/trial-orderable-column';
import { includeForExtendedTrialQuery, parseExtendedTrial } from '../../utils/trial/extended-trial-helper';
import { getTrialsCsvReplySchema } from '../../schemas/trial/get-trials-csv';
import { formatDate, formatDateTime } from '../../utils/date-helper';
import getTrialSideLabel from '../../utils/translation/get-trial-side-label';
import getTaskTypeLabel from '../../utils/translation/get-task-type-label';
import getTrialStatusLabel from '../../utils/translation/get-trial-status-label';
import formatTrialNumber from '../../utils/trial/format-trial-number';

const opts: { schema: FastifySchema } = {
  schema: {
    response: {
      200: getTrialsCsvReplySchema,
      400: defaultErrorReply,
    },
  },
};

const getTrialsCsv: FastifyPluginAsync<Options> = async (
  app,
  { prisma },
) => {
  app.get<{
    Reply: FromSchema<typeof getTrialsCsvReplySchema> | FromSchema<typeof defaultErrorReply>
  }>('/csv', opts, async (_, rep) => {
    const trials = await prisma.trial.findMany({
      include: includeForExtendedTrialQuery,
      orderBy: [
        {
          [TrialOrderableColumn.STATUS]: Prisma.SortOrder.asc,
        },
        {
          deadline: Prisma.SortOrder.asc,
        },
      ],
    });

    const csvTrials = trials.map((trial) => {
      const extendedTrial = parseExtendedTrial(trial);

      return {
        ID: extendedTrial.trialId,
        'Status de Execução': getTrialStatusLabel(extendedTrial.status),
        Solicitante: extendedTrial.trialRequestedByOffice ? 'Escritório' : 'Cliente',
        Advogado: extendedTrial.lawyer,
        Email: extendedTrial.email,
        Serviço: getTaskTypeLabel(extendedTrial.taskType),
        'Número do Processo': extendedTrial.trialNumber ? formatTrialNumber(extendedTrial.trialNumber) : '',
        Prazo: formatDate(extendedTrial.deadline),
        Parte: getTrialSideLabel(extendedTrial.side),
        Autor: extendedTrial.plaintiff,
        Réu: extendedTrial.defendant,
        'Anotações Privadas': extendedTrial.privateAnnotations,
        'Anotações Públicas': extendedTrial.publicAnnotations,
        'Data de Criação': formatDateTime(extendedTrial.createdAt),
        Estado: extendedTrial.region,
        'Tipo do Processo': extendedTrial.trialType,
        'ID do Cliente': extendedTrial.client.companyId,
        'Nome do Cliente': extendedTrial.client.name,
        'ID do Escritório': extendedTrial.office?.companyId,
        'Nome do Escritório': extendedTrial.office?.name,
        'ID do Responsável': extendedTrial.user.userId,
        'Nome do Responsável': extendedTrial.user.name,
        'Email do Responsável': extendedTrial.user.email,
      };
    });

    const parser = new Parser();
    const csv = parser.parse(csvTrials);

    return rep.status(200).send(csv);
  });
};

export default getTrialsCsv;
