import pg, { type Pool } from 'pg';
import envVariables from '../environment-variables';
import { applicationLogger } from '../shared/loggers';

const DEFAULT_OPTS = {
  host: envVariables.POSTGRES_HOST,
  database: envVariables.POSTGRES_DB,
  user: envVariables.POSTGRES_USER,
  password: envVariables.POSTGRES_PASSWORD,
  port: envVariables.POSTGRES_PORT,
};

class PGPool {
  pool: Pool | null = null;

  async connect(options = DEFAULT_OPTS) {
    if (this.pool) {
      throw new Error(
        'Pool is already connected. Consider closing the connection first.',
      );
    }

    this.pool = new pg.Pool(options);

    // Test connection
    await this.pool.query('SELECT 1 + 1;');

    this.pool.on('error', (err) => {
      applicationLogger.error('Unexpected error happened on PG pool', err);
    });

    return this.pool;
  }

  async end() {
    if (!this.pool) {
      throw new Error('Pool is not connected');
    }

    await this.pool.end();

    this.pool = null;

    return null;
  }

  get() {
    if (!this.pool) {
      throw new Error('Pool is not connected');
    }

    return this.pool;
  }
}

// Singleton instance of the pool to be used across the application
export default new PGPool();
