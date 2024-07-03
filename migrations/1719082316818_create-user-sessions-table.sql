-- Up Migration
CREATE TABLE user_sessions (
    sid text PRIMARY KEY NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) NOT NULL
);

CREATE INDEX IDX_user_sessions_expire ON user_sessions (expire);

-- Down Migration
DROP TABLE IF EXISTS user_sessions;
