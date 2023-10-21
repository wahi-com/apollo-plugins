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
