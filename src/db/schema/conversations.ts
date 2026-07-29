import { desc } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // The most recent Gemini interaction id, used as `previous_interaction_id`
    // to continue the conversation. Persisted here so it survives across
    // serverless instances and redeploys.
    lastInteractionId: text("last_interaction_id"),
    // Timestamp of the newest message in this conversation. Denormalised from
    // `messages` so the admin inbox can sort and filter without an aggregate
    // join. Null means the conversation was created but never used.
    lastMessageAt: timestamp("last_message_at"),
    // How far the admin has read. A conversation is unread when it has messages
    // newer than this, so replying after a read makes it unread again. Null
    // means never read.
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // The admin inbox lists conversations newest-first.
    index("conversations_last_message_at_idx").on(desc(table.lastMessageAt)),
  ],
);
