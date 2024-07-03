import type { User, UserDraft } from "../../validations";

import { db } from "../../../database";

const UserRepository = {
  createUser: async (user: UserDraft) => {
    return db
      .insertInto("users")
      .values(user)
      .returningAll()
      .executeTakeFirst();
  },

  updateUserByEmail: async (email: string, user: Partial<User>) => {
    return db
      .updateTable("users")
      .set(user)
      .where("email", "=", email)
      .returningAll()
      .executeTakeFirst();
  },

  findUserByEmail: async (email: string) => {
    return db
      .selectFrom("users")
      .where("email", "=", email)
      .selectAll()
      .executeTakeFirst();
  },

  findUserById: async (userId: string) => {
    return db
      .selectFrom("users")
      .where("id", "=", userId)
      .selectAll()
      .executeTakeFirst();
  },

  findUserByGithubLogin: async (githubId: string) => {
    return db
      .selectFrom("users")
      .where("githubId", "=", githubId)
      .selectAll()
      .executeTakeFirst();
  },

  deleteUserById: async (userId: string) => {
    return db.deleteFrom("users").where("id", "=", userId).executeTakeFirst();
  },
};

export default UserRepository;
