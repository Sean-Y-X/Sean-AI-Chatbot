import { defineRelations } from "drizzle-orm";
import { conversations } from "./conversations";
import { messages } from "./messages";

export const relations = defineRelations({ conversations, messages }, (r) => ({
  messages: {
    conversation: r.one.conversations({
      from: r.messages.conversationId,
      to: r.conversations.id,
    }),
  },
}));
