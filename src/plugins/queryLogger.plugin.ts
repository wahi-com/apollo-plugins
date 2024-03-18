import { ApolloServerPlugin , GraphQLRequestListener } from 'apollo-server-plugin-base';
import { GraphQLRequestContext } from 'apollo-server-core';
import httpContext from 'express-http-context';
import logger from 'winston';
import { Plugin } from '@nestjs/apollo';

interface GQLRequestData {
  operationName?: string | null,
  operationType?: string,
  userId?: string;
  requestId?: string;
}

const QueryLoggerPlugin: ApolloServerPlugin = {

  async requestDidStart(requestContext: GraphQLRequestContext): Promise<GraphQLRequestListener> {

    const logObj: GQLRequestData = {
      userId: requestContext.context.user?.id,
    };

    return {
      async executionDidStart(requestContext): Promise<void> {
        const { operationName } = requestContext;
        // `query`, `mutation` or `subscription`
        const { operation: operationType } = requestContext.operation;

        const requestId = requestContext.request.http?.headers.get('x-request-id');
        logObj.operationName = operationName;
        logObj.operationType = operationType;

        if (requestId) { logObj.requestId = requestId; }

        let logContext = httpContext.get('logContext');
        if (!logContext) {
          logContext = {};
          httpContext.set('logContext', logContext);
        }

        Object.assign(logContext, logObj);
      },
      async didEncounterErrors(requestContext): Promise<void> {
        const { errors } = requestContext;

        let level = 'warn';

        const errorData = errors.map(err => {
          const { message, path, stack } = err;
          const originalError: Error & { extensions?: any } | null | undefined = err.originalError;
          const stacktrace = originalError?.extensions?.exception?.stacktrace || stack; // `stack` may not be very useful

          if (!originalError || originalError?.name !== 'CustomValidationError') {
            level = 'error';
          }

          return { message, path, stacktrace };
        });

        logger.log(level, errors[0]?.message, {
          ...logObj,
          errors: errorData,
        });

      },
    };
  },
};

@Plugin()
export class QueryLoggerNestPlugin implements ApolloServerPlugin {
  async requestDidStart(requestContext: GraphQLRequestContext): Promise<GraphQLRequestListener> {
    const listener = await QueryLoggerPlugin.requestDidStart!(requestContext) as GraphQLRequestListener;

    return listener;
  }
}

export default QueryLoggerPlugin;
