
import { getExtractedInformationFromContext } from './getExtractedInformationFromContext.utils';

describe('getExtractedInformationFromContext', () => {

  beforeAll(() => {
    process.env.APP_NAME = 'app_name';
  });

  it('should extract information from context', () => {    
    const mockContext: any = {
      operation: {
        operation: 'query',
      },
      operationName: 'test_name',
      document: {
        definitions: [
          {
            kind: 'OperationDefinition',
            name: {
              value: 'test',
            },
          },
        ],
      },
      request: {
        variables: {
          test: 'test',
        },
      },
      context: {
        req: {
          headers: {
            'user-agent': 'test',
          },
        },
      },
    };

    const expected: any = {
      operationType: 'query',
      operationName: 'test_name',
      operationApolloName: 'test',
      datadogPrefix: `graphql.`,
      variables: {
        test: 'test',
      },
      userAgent: 'test',
      tags: [
        'app_name:app_name',
        'operation:query.test_name',
        'operation_apollo:query.test',
      ],
    };

    const result = getExtractedInformationFromContext(mockContext);

    expect(result).toEqual(expected);
  });
});
