# Apollo Plugins

A collection of Apollo Server plugins by Wahi to enhance server functionality and provide seamless integrations.

## Installation

Using npm:

```bash
npm install @wahi/apollo-plugins
```

Or using Yarn:

```bash
yarn add @wahi/apollo-plugins
```

## Features

- **DatadogNestPlugin**: Monitors and logs the number of GraphQL requests, tracks and logs the number of GraphQL errors, and logs request durations, highlighting slow requests.

    - Request Metrics: Captures and increments a count of GraphQL requests, tagging them with relevant metadata for Datadog.
    - Error Tracking: Increments an error count in Datadog when a GraphQL request encounters errors, again tagging with relevant metadata.
    - Request Duration: Measures the duration of each GraphQL request, reporting the timing to Datadog. It also logs requests that exceed a specified slow threshold, providing detailed information such as operation type, operation name, variables, and user-agent.
    - Environment Tagging: Automatically tags all metrics with the environment the application is running in, defaulting to 'unknown' if not specified.
    - Slow Request Logging: Identifies slow GraphQL requests (taking more than 1000ms), logging detailed information to assist with debugging and performance optimization.

- **QueryLoggerNestPlugin**: The QueryLoggerNestPlugin is a custom Apollo Server plugin designed to enhance logging capabilities for GraphQL requests. It captures and logs detailed information about each GraphQL request, including operation names, types, user IDs, and request IDs. Additionally, it logs errors encountered during the execution of GraphQL operations, providing insights into the nature and source of these errors. 

    - Detailed Request Logging: Captures key details about GraphQL requests, such as operation name, operation type (query, mutation, subscription), user ID, and request ID.
    - Error Logging: Logs errors encountered during GraphQL request execution, including error messages, paths, and stack traces. It differentiates between warning and error levels based on the nature of the error.
    - Request Context Preservation: Utilizes express-http-context to maintain a request-scoped context, ensuring that logs can be correlated with specific request instances.
    - Flexible Integration: Designed to work with both Apollo Server and NestJS, making it a versatile choice for a wide range of GraphQL applications.

- _More plugins will be added in the future._

## Usage

1. Import the required plugins from the library.

```typescript
import { DatadogNestPlugin } from '@wahi/apollo-plugins';
```

2. Add `DatadogNestPlugin` to the `providers` array in your NestJS module:

```typescript
@Module({
  // ... other configurations
  providers: [
    DatadogNestPlugin,
    // ... other providers
  ],
})
export class YourModule { };
```

3. The plugins will now automatically integrate with your Apollo server instance within your NestJS application.

## Configuration

Ensure that the required dependencies and environment settings are correctly configured for the plugins. For instance, the DatadogNestPlugin requires the Datadog agent running in your environment and the necessary environment variables set for communication with Datadog.

## Upcoming Plugins

We're continuously working to expand the functionalities offered by our Apollo plugins. Stay tuned for more!

## Contributing

Contributions are always welcome! If you have a plugin idea, improvements, or optimizations, please feel free to submit a pull request.

## License

[MIT License](LICENSE.md)
