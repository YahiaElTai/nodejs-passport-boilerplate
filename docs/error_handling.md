# Error Handling

## Overview

This project employs an "errors as values" stratgey where all validation done with zod is returned as values with
`z.safeParse` and return a response to the user immediately within the route.
This approach is easier to think about than always throwing errors and relying on a centralized error handling middleware.

We also have that in case we need to throw errors or unexpected errors happen.

## Error Handling Middleware

The `errorHandlerMiddleware` is an Express middleware function that intercepts errors thrown anywhere in the application. It determines the type of error and handles it accordingly, ensuring that all errors are logged and responded to in a consistent manner. The middleware is located at:

```bash
src/shared/middlewares/error-handler-middleware.ts
```

**Key Components:**

- **Validation Errors**: Captured primarily from Zod for input validation, these errors are directly communicated to the client with a 400 status code without logging, as they represent client-side mistakes.
- **Authentication Errors**: Errors from JWT handling are not logged but reported to the client with a 401 status code.
- **Custom Application Errors**: These are defined in our custom error classes and include both client (4xx) and server (5xx) errors. Client errors are not logged but reported to users, and server errors are logged more severely with error-level logging.
- **Fallback Handling**: Any uncaught errors are treated as 500 internal server errors, logged in full, and a generic error message is returned to the client.

## Custom Error Classes

Custom error classes extend a base `CustomError` class, which ensures they all include a `statusCode` and an optional `cause` for deeper diagnostic tracing. Each error class explicitly sets its own status code and optionally accepts a cause of the error for logging purposes. These classes are defined in:

```bash
src/shared/errors;
```

**Example Custom Error:**

```typescript
export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}
```

## Usage

Errors within the application are thrown using these custom error classes, allowing them to be caught by the error handling middleware uniformly. For example:

```javascript
if (existingUser) {
  throw new BadRequestError("Email is already in use or invalid");
}
```

## Logging

Logging is handled via the `applicationLogger` defined in `src/shared/loggers/application-logger.ts`, which uses Winston for managing log entries. This logger differentiates between various severity levels (info, warn, error), facilitating detailed logs for debugging while keeping the logs clean and relevant.

## Extending Error Handling

Modules can define their own custom errors under `/src/moduleName/errors` if specific error types are necessary for that module. These should extend from `CustomError` to maintain consistency. Adjustments to the global error handling logic can be made to accommodate module-specific behavior.

## Conclusion

This centralized and structured approach to error handling not only ensures consistency across the application but also simplifies maintenance and enhances the capability to diagnose issues effectively.
