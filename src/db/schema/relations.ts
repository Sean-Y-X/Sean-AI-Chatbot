import { defineRelations } from "drizzle-orm";
import { messages } from "./messages";
import { conversations } from "./conversations";

export const relations = defineRelations({ conversations, messages }, (r) => ({
  messages: {
    conversation: r.one.conversations({
      from: r.messages.conversationId,
      to: r.conversations.id,
    }),
  },
}));
