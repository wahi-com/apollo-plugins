import { GraphQLRequestListener } from 'apollo-server-plugin-base';
import httpContext from 'express-http-context';
import { StatsD } from 'hot-shots';

import DatadogPlugin from './datadog.plugin';

jest.mock('../utils/getExtractedInformationFromContext.utils', () => ({
  getExtractedInformationFromContext: () => ({
    datadogPrefix: 'prefix.',
    tags: ['tag1', 'tag2'],  
  }),
}));

jest.mock('express-http-context', () => {
  return {
    set: jest.fn(),
    get: jest.fn(),
  };
});

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
      Console: jest.fn(), // Mock the Console transport
    },
    loggers: {
      get: jest.fn(() => mLogger),
    },
  };
});

jest.mock('hot-shots');

describe('DatadogPlugin', () => {
  let statsDIncrementSpy: jest.SpyInstance;
  let statsDTimingSpy: jest.SpyInstance;

  beforeEach(() => {

    (StatsD as jest.Mock).mockImplementation(() => ({
      increment: jest.fn(),
      timing: jest.fn(),
    }));

    statsDIncrementSpy = jest.spyOn(StatsD.prototype, 'increment');
    statsDTimingSpy = jest.spyOn(StatsD.prototype, 'timing');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should increment requests.count on executionDidStart', async () => {
    const mockRequestContext = {} as any;

    if (DatadogPlugin.requestDidStart === undefined) {
      throw new Error('requestDidStart is undefined');
    }

    const listener = (await DatadogPlugin.requestDidStart(mockRequestContext)) as GraphQLRequestListener;
    await listener.executionDidStart!(mockRequestContext);
    expect(statsDIncrementSpy).toHaveBeenCalledWith('prefix.requests.count', 1, 1, ['tag1', 'tag2']);
  });

  it('should increment errors.count on didEncounterErrors', async () => {
    const mockRequestContext = {} as any;

    if (DatadogPlugin.requestDidStart === undefined) {
      throw new Error('requestDidStart is undefined');
    }

    const listener = (await DatadogPlugin.requestDidStart(mockRequestContext)) as GraphQLRequestListener;
    await listener.didEncounterErrors!(mockRequestContext);
    expect(statsDIncrementSpy).toHaveBeenCalledWith('prefix.errors.count', 1, 1, ['tag1', 'tag2']);
  });

  it('should log request duration on willSendResponse', async () => {
    (httpContext.get as jest.Mock).mockReturnValue(1000);
    const mockRequestContext = {} as any;
    jest.spyOn(Date, 'now').mockReturnValue(2000);

    if (DatadogPlugin.requestDidStart === undefined) {
      throw new Error('requestDidStart is undefined');
    }

    const listener = (await DatadogPlugin.requestDidStart(mockRequestContext)) as GraphQLRequestListener;
    await listener.willSendResponse!(mockRequestContext);
    expect(statsDTimingSpy).toHaveBeenCalledWith('prefix.requests.duration', 1000, ['tag1', 'tag2']);
  });

});
