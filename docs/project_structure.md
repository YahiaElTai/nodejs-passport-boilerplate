# Project Structure

## Overview

This document outlines the architecture of our project, emphasizing a modular design approach that enhances maintainability, scalability, and clarity. It details the folder structure and explains the rationale behind the organization of services and shared resources.

## Folder Structure

Our project adopts a modular structure, where each module or service encapsulates specific functionalities related to a distinct domain. This design promotes a clear separation of concerns and allows individual features or services to evolve independently, thereby enhancing the overall modularity and flexibility of the application.

```bash
.
├── docs
├── migrations                         # PostgreSQL migration files
├── src
│   ├── database                       # global database configuration and initialization
│   ├── moduleName                     # example module demonstrating the typical structure
│   │   ├── repos                      # module-specific Data Layer Access
│   │   ├── emails                     # module-specific email functionality (different functions to send different emails specific to the module).
│   │   ├── errors                     # module-specific errors (following the same structure defined in the shared package)
│   │   ├── middlewares                # module-specific middlewares
│   │   ├── routes                     # module-specific route handlers
│   │   ├── types                      # module-specific TypeScript types and interfaces
│   │   ├── utils                      # module-specific utility functions
│   │   ├── constants.ts               # module-specific constants
│   │   └── index.ts                   # export point for route handlers and more
│   ├── shared                         # Shared resources used across the entire application
│   │   ├── emails                     # Provides a centralized properly typed function for sending emails already configured with SendGrid API
│   │   ├── errors                     # shared errors
│   │   ├── loggers                    # shared loggers
│   │   ├── middlewares                # shared middlewares
│   │   └── types                      # shared TypeScript types and interfaces
│   │   ├── utils                      # shared utility functions used across various modules
│   │   ├── constants.ts               # shared constants
│   ├── environment-variables.ts       # type-safe environment variables used across all modules
│   ├── server.ts                      # server entry point
├── .env                               # local environment variables file
├── .env.example                       # example template for environment variables
├── package.json                       # Manages dependencies and scripts
├── tsconfig.json                      # TypeScript configuration file
```

## Modular Design

The modular design approach provides several key benefits:

- **Isolation**: Each module functions independently with minimal dependencies on other parts of the application. This isolation simplifies updates and bug fixes by localizing changes to the relevant module.

- **Reusability**: Modules are designed to be reused across different parts of the application or even in different projects. Shared utilities and common functionalities are placed in the `shared` directory to avoid duplication and foster consistency.

- **Scalability**: As the application grows, new modules can be added with ease without impacting existing functionality. This scalability is crucial for maintaining performance and manageability in larger applications.

- **Maintainability**: A clear separation of concerns and encapsulation of functionalities make the codebase easier to understand and maintain. Each module's internal complexity is hidden from other modules, allowing developers to focus on specific areas without being overwhelmed by the entire codebase.

## Adding New Services

To add a new service, simply create a new folder at the same level as other modules in the `src` directory, following the established internal structure. This ensures consistency and facilitates integration into the existing ecosystem.
