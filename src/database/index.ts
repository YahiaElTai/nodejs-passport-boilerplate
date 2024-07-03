import type { DB } from "./generated";

import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { applicationLogger } from "../shared/loggers";
export { sql } from "kysely";
import PGPool from "./pool";

const dialect = new PostgresDialect({ pool: async () => PGPool.get() });

// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
export const db = new Kysely<DB>({
  dialect,
  log(event) {
    if (event.level === "error") {
      applicationLogger.error("Query failed : ", {
        durationMs: event.queryDurationMillis,
        error: event.error,
        sql: event.query.sql,
      });
    } else {
      applicationLogger.info("Query executed : ", {
        durationMs: event.queryDurationMillis,
        sql: event.query.sql,
      });
    }
  },
  plugins: [new CamelCasePlugin()],
});
