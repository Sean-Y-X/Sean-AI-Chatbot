import type { ChatSession } from "@google/generative-ai";

class ChatSessionManager {
  private static instance: ChatSessionManager;
  private chatSessions: Map<string, ChatSession>;

  private constructor() {
    this.chatSessions = new Map();
  }

  public static getInstance(): ChatSessionManager {
    if (!ChatSessionManager.instance) {
      ChatSessionManager.instance = new ChatSessionManager();
    }
    return ChatSessionManager.instance;
  }

  public add(sessionId: string, session: ChatSession): void {
    this.chatSessions.set(sessionId, session);
  }

  public get(sessionId: string): ChatSession | null {
    return this.chatSessions.get(sessionId) || null;
  }

  public delete(sessionId: string): void {
    this.chatSessions.delete(sessionId);
  }

  public getAll(): Map<string, ChatSession> {
    return this.chatSessions;
  }
}

export const chatSessionManager = ChatSessionManager.getInstance();
