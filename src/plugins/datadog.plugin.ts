import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { GraphQLRequestContext } from 'apollo-server-core';
import httpContext from 'express-http-context';
import { StatsD } from 'hot-shots';
import logger from 'winston';

import { Plugin } from '@nestjs/apollo';

import { getExtractedInformationFromContext } from '../utils/getExtractedInformationFromContext.utils';

const statsD = new StatsD({
  globalTags: { env: process.env.APP_ENVIRONMENT ?? 'unknown' },
});

const SLOW_THRESHOLD = 1000;

const DatadogPlugin: ApolloServerPlugin = {
  async requestDidStart(): Promise<GraphQLRequestListener> {
    return {
      async executionDidStart(requestContext: GraphQLRequestContext): Promise<void> {
        httpContext.set('requestStartTimestamp', Date.now());

        const { datadogPrefix, tags } = getExtractedInformationFromContext(requestContext);

        statsD.increment(`${datadogPrefix}requests.count`, 1, 1, tags);
      },
      async didEncounterErrors(requestContext): Promise<void> {
        const { datadogPrefix, tags } = getExtractedInformationFromContext(requestContext);

        statsD.increment(`${datadogPrefix}errors.count`, 1, 1, tags);
      },
      async willSendResponse(requestContext: GraphQLRequestContext): Promise<void> {
        const requestDuration = Date.now() - httpContext.get('requestStartTimestamp');

        const { datadogPrefix, tags, variables, userAgent, operationName, operationType } = getExtractedInformationFromContext(requestContext);

        statsD.timing(`${datadogPrefix}requests.duration`, requestDuration, tags);
        if (requestDuration >= SLOW_THRESHOLD) {
          logger.child({ loggerName: 'slowGraphQL' }).info('GraphQL %s %s took %s ms. Variables %j , user-agent %s',
            operationType, operationName, requestDuration, variables, userAgent);
        }
      },
    };
  },
};

@Plugin()
export class DatadogNestPlugin implements ApolloServerPlugin {
  async requestDidStart(requestContext: GraphQLRequestContext): Promise<GraphQLRequestListener> {
    const listener = await DatadogPlugin.requestDidStart!(requestContext) as GraphQLRequestListener;

    return listener;
  }
}

export default DatadogPlugin;