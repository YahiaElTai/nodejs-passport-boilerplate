import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Pgmigrations {
  id: Generated<number>;
  name: string;
  runOn: Timestamp;
}

export interface Users {
  avatarUrl: string | null;
  createdAt: Generated<Timestamp | null>;
  email: string;
  githubId: string | null;
  googleId: string | null;
  id: Generated<string>;
  isEmailVerified: Generated<boolean | null>;
  name: string | null;
  password: string | null;
  updatedAt: Generated<Timestamp | null>;
}

export interface UserSessions {
  expire: Timestamp;
  sess: Json;
  sid: string;
}

export interface DB {
  pgmigrations: Pgmigrations;
  users: Users;
  userSessions: UserSessions;
}
