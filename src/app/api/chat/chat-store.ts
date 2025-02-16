import type { ChatSession } from '@google/generative-ai';

declare global {
  var chatSessions: Map<string, ChatSession>;
}

if (!global.chatSessions) {
  global.chatSessions = new Map();
}

export const ChatStore = {
  create: (sessionId: string, session: ChatSession): void => {
    global.chatSessions.set(sessionId, session);
  },

  get: (sessionId: string): ChatSession | null => {
    return global.chatSessions.get(sessionId) || null;
  },

  delete: (sessionId: string): void => {
    global.chatSessions.delete(sessionId);
  }
};