import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { conversations } from "./conversations";

export const roleEnum = pgEnum("message_role", ["user", "ai"]);

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id),
  role: roleEnum("role").notNull().default("user"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
