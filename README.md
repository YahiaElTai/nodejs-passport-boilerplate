# Node.js Boilerplate

This project serves as a boilerplate for starting new Node.js projects, emphasizing a modular design approach, integration with a PostgreSQL database, and built-in authentication mechanisms. It's designed to kickstart development by providing a comprehensive setup that includes everything from user authentication to database management, all while following best practices for Node.js development.

## Getting Started

Follow these steps to set up the project on your local machine.

### Prerequisites

Before you begin, ensure you have the following software installed on your machine:

- **Node.js**: It's recommended to install Node.js using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) to easily switch between Node versions for different projects. Alternatively, you can [download Node.js](https://nodejs.org/) directly from the official website.
- **pnpm**: This project uses `pnpm` for package management, which offers faster, more efficient package installations. Install `pnpm` via [corepack](https://pnpm.io/installation#using-corepack), a tool included with Node.js to manage package managers.
- **Docker**: Docker is required for running the PostgreSQL database in a container, ensuring a consistent development environment across all team members. Install Docker Desktop from [Docker for Desktop](https://www.docker.com/products/docker-desktop) or choose another installation method that suits your setup.

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/YahiaElTai/nodejs-passport-boilerplate.git
   cd nodejs-passport-boilerplate
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Set up environment variables**:

   - Duplicate the `.env.example` file and rename it to `.env`.
   - Fill in the required values as described in the `.env` file.

4. **Start PostgreSQL instance**:
   This project uses `express-session` with a PostgreSQL store to maintain user sessions.

   - Ensure Docker is running.
   - Start the PostgreSQL instance using Docker Compose:
     ```bash
     docker compose up -d
     ```

5. **Start the development server**:
   ```bash
   pnpm dev
   ```

Your development server should now be running, and you can start building your features.
