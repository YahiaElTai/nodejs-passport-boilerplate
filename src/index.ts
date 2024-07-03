import type { Server } from 'node:http';

import configureServer from './configure-server';
import PGPool from './database/pool';
import envVariables from './environment-variables';
import { applicationLogger } from './shared/loggers';

const PORT = envVariables.PORT || 8080;

let server: Server;

const main = async (): Promise<void> => {
  // 1. Connect to the PostgreSQL database
  const pool = await PGPool.connect();

  applicationLogger.info('Connected to PostgreSQL database 🚀');

  const app = configureServer(pool);

  // 2. Start the server
  server = app.listen(PORT, () => {
    applicationLogger.info(`Listening on http://localhost:${PORT} ⭐`);
  });
};

main().catch((error) => {
  applicationLogger.error('🚫 Error during startup', error);
  process.exit(1);
});

// Promisify the server close method to be able to close the server asynchronously
const closeHttpServer = (server: Server) => {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        return reject(err);
      }
      resolve(null);
    });
  });
};

/**
 * Gracefully shutdown the server when receiving termination signals (SIGINT, SIGTERM)
 * This allows the server to close existing connections to databases, caches,
 * and other external services before shutting down
 * This is important for ensuring no data is lost during the shutdown process
 */
const shutdownGracefully = async (signal: string) => {
  applicationLogger.debug(`${signal} signal received: closing HTTP server`);

  try {
    /**
     * Stops the server from accepting new connections and keeps existing
     * connections. This function is asynchronous, the server is finally closed
     * when all connections are ended and the server emits a `'close'` event.
     * The optional `callback` will be called once the `'close'` event occurs. Unlike
     * that event, it will be called with an `Error` as its only argument if the server
     * was not open when it was closed.
     */

    if (server) {
      await closeHttpServer(server); // Close the server
      applicationLogger.debug('HTTP server closed');
    }

    await PGPool.end();
    applicationLogger.debug('PostgreSQL database connection closed');

    setImmediate(() => process.exit(0));
  } catch (error) {
    applicationLogger.error('Error during shutdown:', error);
    setImmediate(() => process.exit(1));
  }
};

// Handle process termination signals
for (const signal of ['SIGTERM', 'SIGHUP', 'SIGINT']) {
  process.on(signal, () => shutdownGracefully(signal));
}

/**
 * Event listener for unhandled promise rejections.
 * Unhandled promise rejections can occur when a promise is rejected but not caught by a .catch() handler.
 * This is similar to uncaught exceptions but specific to Promises.
 */
process.on('unhandledRejection', (reason, promise) => {
  applicationLogger.error(
    'Unhandled Rejection at Promise:',
    promise,
    'reason:',
    reason,
  );
});
