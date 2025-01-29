// First, all jest.mock calls
const mockIncrement = jest.fn();
const mockTiming = jest.fn();

jest.mock('hot-shots', () => ({
  StatsD: jest.fn().mockReturnValue({
    increment: mockIncrement,
    timing: mockTiming,
  })
}));

jest.mock('../utils/getExtractedInformationFromContext.utils', () => ({
  getExtractedInformationFromContext: () => ({
    operationType: 'query',
    operationName: 'TestQuery',
    operationApolloName: 'TestQuery',
    datadogPrefix: 'graphql.',
    variables: {},
    userAgent: 'test-agent',
    tags: [
      'app_name:test-app',
      'operation:query.TestQuery',
      'operation_apollo:query.TestQuery',
    ],
  }),
}));

jest.mock('express-http-context2', () => ({
  set: jest.fn(),
  get: jest.fn(),
}));

jest.mock('winston', () => {
  const mLogger = {
    info: jest.fn(),
  };
  return {
    child: jest.fn(() => mLogger),
    createLogger: jest.fn(() => mLogger),
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      printf: jest.fn(),
    },
    transports: {
      Console: jest.fn(),
    },
    loggers: {
      get: jest.fn(() => mLogger),
    },
  };
});

// Then imports
import { GraphQLRequestListener } from '@apollo/server';
import httpContext from 'express-http-context2';
import DatadogPlugin from './datadog.plugin';
import { PluginContext } from '../types/context.types';

// Then test setup
const OLD_ENV = process.env;

describe('DatadogPlugin', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, APP_NAME: 'test-app' };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should increment requests.count on executionDidStart', async () => {
    const mockRequestContext = {} as any;

    if (DatadogPlugin.requestDidStart === undefined) {
      throw new Error('requestDidStart is undefined');
    }

    const listener = (await DatadogPlugin.requestDidStart(mockRequestContext)) as GraphQLRequestListener<PluginContext>;
    await listener.executionDidStart!(mockRequestContext);
    expect(mockIncrement).toHaveBeenCalledWith('graphql.requests.count', 1, 1, [
      'app_name:test-app',
      'operation:query.TestQuery',
      'operation_apollo:query.TestQuery'
    ]);
  });

  it('should increment errors.count on didEncounterErrors', async () => {
    const mockRequestContext = {} as any;

    if (DatadogPlugin.requestDidStart === undefined) {
      throw new Error('requestDidStart is undefined');
    }

    const listener = (await DatadogPlugin.requestDidStart(mockRequestContext)) as GraphQLRequestListener<PluginContext>;
    await listener.didEncounterErrors!(mockRequestContext);
    expect(mockIncrement).toHaveBeenCalledWith('graphql.errors.count', 1, 1, [
      'app_name:test-app',
      'operation:query.TestQuery',
      'operation_apollo:query.TestQuery'
    ]);
  });

  it('should log request duration on willSendResponse', async () => {
    (httpContext.get as jest.Mock).mockReturnValue(1000);
    const mockRequestContext = {} as any;
    jest.spyOn(Date, 'now').mockReturnValue(2000);

    if (DatadogPlugin.requestDidStart === undefined) {
      throw new Error('requestDidStart is undefined');
    }

    const listener = (await DatadogPlugin.requestDidStart(mockRequestContext)) as GraphQLRequestListener<PluginContext>;
    await listener.willSendResponse!(mockRequestContext);
    expect(mockTiming).toHaveBeenCalledWith('graphql.requests.duration', 1000, [
      'app_name:test-app',
      'operation:query.TestQuery',
      'operation_apollo:query.TestQuery'
    ]);
  });
});
