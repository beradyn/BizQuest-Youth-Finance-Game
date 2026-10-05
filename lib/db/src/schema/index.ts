import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const bizQuestAccounts = pgTable(
  "bizquest_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    gender: text("gender").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("bizquest_accounts_username_unique").on(table.username)],
);

export const bizQuestSessions = pgTable(
  "bizquest_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => bizQuestAccounts.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("bizquest_sessions_token_hash_unique").on(table.tokenHash),
    index("bizquest_sessions_account_id_idx").on(table.accountId),
    index("bizquest_sessions_expires_at_idx").on(table.expiresAt),
  ],
);