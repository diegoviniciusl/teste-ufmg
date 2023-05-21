export const defaultErrorReply = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
    },
  },
  required: ['message'],
  additionalProperties: false,
} as const;
