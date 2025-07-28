import type { Chat } from "@google/genai";

class ChatSessionManager {
  private static instance: ChatSessionManager;
  private chatSessions: Map<string, Chat>;

  private constructor() {
    this.chatSessions = new Map();
  }

  public static getInstance(): ChatSessionManager {
    if (!ChatSessionManager.instance) {
      ChatSessionManager.instance = new ChatSessionManager();
    }
    return ChatSessionManager.instance;
  }

  public add(sessionId: string, chatSession: Chat): void {
    this.chatSessions.set(sessionId, chatSession);
  }

  public get(sessionId: string): Chat | null {
    return this.chatSessions.get(sessionId) || null;
  }

  public delete(sessionId: string): void {
    this.chatSessions.delete(sessionId);
  }

  public getAll(): Map<string, Chat> {
    return this.chatSessions;
  }
}

export const chatSessionManager = ChatSessionManager.getInstance();
