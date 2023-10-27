import { GraphQLRequestContext } from 'apollo-server-core';

const getExtractedInformationFromContext = (requestContext: GraphQLRequestContext) => {
    const operationType = requestContext?.operation?.operation;
    const operationName = requestContext.operationName;
  
    const operationApolloName = requestContext.document?.definitions
      .filter((def: any) => def.kind === 'OperationDefinition')
      .map((def: any) => def.name?.value)
      .join(',');
  
    const variables = requestContext.request?.variables;
    const userAgent = requestContext.context?.req?.headers['user-agent'];
  
    return {
      operationType,
      operationName,
      operationApolloName,
      datadogPrefix: `graphql.`,
      variables,
      userAgent,
      tags: [
        `app_name:${process.env.APP_NAME}`,
        `operation:${operationType}.${operationName}`,
        `operation_apollo:${operationType}.${operationApolloName}`,
      ],
    };
};

export {
  getExtractedInformationFromContext,
};