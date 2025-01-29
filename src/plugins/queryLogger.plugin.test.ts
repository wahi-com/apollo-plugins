import QueryLoggerPlugin from './queryLogger.plugin';
import httpContext from 'express-http-context2';
import logger from 'winston';
import { OperationTypeNode } from 'graphql';

// Mock external libraries
jest.mock('express-http-context2', () => ({
  set: jest.fn(),
  get: jest.fn(),
}));

jest.mock('winston', () => ({
  log: jest.fn(),
}));

describe('QueryLoggerPlugin', () => {
  const mockContext = {
    contextValue: { user: { id: '123' } },
    operation: { operation: OperationTypeNode.QUERY },
    request: { http: { headers: new Map([['x-request-id', 'abc-123']]) as any } },
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should set initial log context on execution start', async () => {
    const plugin = QueryLoggerPlugin as any; // Typecasting for simplicity in accessing methods
    const requestDidStart = await plugin.requestDidStart(mockContext);
    await requestDidStart.executionDidStart(mockContext);

    expect(httpContext.set).toHaveBeenCalledWith('logContext', expect.any(Object));
    const logContext = (httpContext.set as jest.Mock).mock.calls[0][1];
    expect(logContext).toMatchObject({
      userId: '123',
      operationName: undefined, // This would be set in a real query
      operationType: 'query',
      requestId: 'abc-123',
    });
  });

  it('should log errors with winston on encountering errors', async () => {
    const plugin = QueryLoggerPlugin as any; // Simplify access
    const requestDidStart = await plugin.requestDidStart(mockContext);
    await requestDidStart.didEncounterErrors?.({
      ...mockContext,
      errors: [new Error('Test error')],
    });

    expect(logger.log).toHaveBeenCalledWith(
      expect.any(String), // 'warn' or 'error'
      expect.any(String), // Error message
      expect.any(Object) // Log object containing error details
    );
  });
});
