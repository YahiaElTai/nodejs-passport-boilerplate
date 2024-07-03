# Logging

## Overview

This project employs a robust logging system powered by Winston, a versatile logging library for Node.js. Logging is configured differently based on the environment to optimize for development convenience and production performance. This system helps in monitoring the application’s health, diagnosing issues, and understanding user behaviors through logs.

## Environments

- **Production**: Logs are structured in JSON format to be easily parsed by logging services and include detailed timestamps, error stacks, and minimal console output.
- **Development**: Logs are colorized for readability and include simple messages that allow for quick debugging.
- **Testing**: Logging is silenced to avoid clutter during test execution.

## Loggers

We use two primary loggers:

1. **Access Logger**: Logs all incoming HTTP requests.
2. **Application Logger**: Handles errors and general application logging.

## Logger Details

### Access Logger

The access logger is configured to log basic details about each HTTP request, including the method, URL, status code, and the response time in milliseconds. This logger is crucial for monitoring traffic and troubleshooting request-related issues.

It is defined here `src/shared/loggers/access-logger.ts`

**Usage**:

Embedded in an Express middleware, it logs each request upon completion.

```javascript
// src/shared/middlewares/access-logger-middleware.ts
import { accessLogger } from '../loggers';

const accessLoggerMiddleware = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  res.on('finish', () => {
    const duration = (process.hrtime.bigint() - startTime) / 1000000n; // nanoseconds to milliseconds
    accessLogger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });
  next();
};
```

### Application Logger

Handles error logging and other important application-level information. It provides richer context with stack traces in development and production.

Defined here `src/shared/loggers/application-logger.ts`

**Usage**:

Utilized primarily in error handling middleware to log exceptions and application errors, enriching logs with metadata such as HTTP method, URL, and status code.

## Best Practices

- **Structured Logging**: Always structure logs in a way that they can be easily parsed. This is vital for using log management tools and for efficient troubleshooting.
- **Environment-Sensitive Logging**: Configure logging levels and formats appropriate to each environment to balance detail and performance.
- **Secure Logging**: Ensure that logs do not contain sensitive information. Use filtering or masking if necessary.
- **Monitoring and Alerts**: Integrate logging with monitoring tools to set up alerts based on error logs or high-severity issues.

## Conclusion

Our logging configuration ensures that our application captures all necessary information in an efficient, readable, and secure manner, supporting rapid development and effective operation in production environments. This setup aids in maintaining a high level of observability and helps in quick issue resolution and performance monitoring.
