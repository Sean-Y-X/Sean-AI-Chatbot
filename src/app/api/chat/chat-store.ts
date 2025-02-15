import type { ChatSession } from '@google/generative-ai';

declare global {
  var chatSession: ChatSession | null;
}

if (!global.chatSession) {
  global.chatSession = null;
}

export const ChatStore = {
  create: (session: ChatSession): void => {
    global.chatSession = session;
  },

  get: (): ChatSession | null => {
    return global.chatSession;
  },

  delete: (): void => {
    global.chatSession = null;
  }
};