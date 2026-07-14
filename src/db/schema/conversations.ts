import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  // The most recent Gemini interaction id, used as `previous_interaction_id`
  // to continue the conversation. Persisted here so it survives across
  // serverless instances and redeploys.
  lastInteractionId: text("last_interaction_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
