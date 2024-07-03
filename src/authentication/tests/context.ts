import { exec } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import migrate from 'node-pg-migrate';
import pg from 'pg';
import SQL from 'sql-template-strings';
import PGPool from '../../database/pool';
import envVariables from '../../environment-variables';

const TEST_DEFAULT_OPTS = {
  host: envVariables.POSTGRES_HOST,
  database: envVariables.POSTGRES_TEST_DB,
  user: envVariables.POSTGRES_USER,
  password: envVariables.POSTGRES_PASSWORD,
  port: envVariables.POSTGRES_PORT,
};

class Context {
  roleName: string;

  async build() {
    // 2. connect to DB test as usual
    const pool = await PGPool.connect(TEST_DEFAULT_OPTS);

    // 3. create a new role in PG
    await pool.query(
      SQL`CREATE ROLE `
        .append(pg.escapeIdentifier(this.roleName))
        .append(SQL` WITH LOGIN PASSWORD `)
        .append(pg.escapeLiteral(this.roleName)),
    );

    // 4. create a new schema in PG with same name as role
    await pool.query(
      SQL`CREATE SCHEMA IF NOT EXISTS`
        .append(pg.escapeIdentifier(this.roleName))
        .append(SQL` AUTHORIZATION `)
        .append(pg.escapeIdentifier(this.roleName)),
    );

    // 5. disconnect from PG
    await PGPool.end();

    // 6. create pg pool to peformn migrations using the new role
    const migratePool = await PGPool.connect({
      host: envVariables.POSTGRES_HOST,
      database: envVariables.POSTGRES_TEST_DB,
      user: this.roleName,
      password: this.roleName,
      port: envVariables.POSTGRES_PORT,
    });

    // 6. run our migations in the new schema
    const client = await migratePool.connect(); // client is required from the pool by node-pg-migrate
    await migrate({
      schema: this.roleName,
      log: () => {},
      noLock: true,
      dir: 'migrations',
      direction: 'up',
      migrationsTable: 'pgmigrations',
      dbClient: client,
    });

    // release the client back to the pool
    client.release();

    await PGPool.end();

    // 7. connect to PG as the newly created role
    return PGPool.connect({
      host: envVariables.POSTGRES_HOST,
      database: envVariables.POSTGRES_TEST_DB,
      user: this.roleName,
      password: this.roleName,
      port: envVariables.POSTGRES_PORT,
    });
  }

  async close() {
    // Disconnect from PG
    await PGPool.end();

    // Reconnect as our admin connection
    const pool = await PGPool.connect(TEST_DEFAULT_OPTS);

    // Delete the role and schema we created
    await pool.query(
      SQL`DROP SCHEMA `
        .append(pg.escapeIdentifier(this.roleName))
        .append(SQL` CASCADE;`),
    );
    await pool.query(
      SQL`DROP ROLE `.append(pg.escapeIdentifier(this.roleName)),
    );

    // Disconnect
    await PGPool.end();
  }

  async reset() {
    const pool = PGPool.get();

    if (!pool) {
      throw new Error('Pool is not connected');
    }

    await pool.query('DELETE FROM users;');
  }

  constructor() {
    // 1. generate a random role name that we can use to connect to PG
    const roleName = `a${randomBytes(4).toString('hex')}`;
    this.roleName = roleName;
  }
}

export default Context;
