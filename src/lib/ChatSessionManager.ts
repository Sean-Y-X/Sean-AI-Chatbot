class ChatSessionManager {
  private static instance: ChatSessionManager;
  private chatSessions: Map<string, string>;

  private constructor() {
    this.chatSessions = new Map();
  }

  public static getInstance(): ChatSessionManager {
    if (!ChatSessionManager.instance) {
      ChatSessionManager.instance = new ChatSessionManager();
    }
    return ChatSessionManager.instance;
  }

  public setLastInteraction(
    sessionId: string,
    lastInteractionId: string,
  ): void {
    this.chatSessions.set(sessionId, lastInteractionId);
  }

  public getLastInteraction(sessionId: string): string {
    return this.chatSessions.get(sessionId) || "";
  }

  public clearInteraction(sessionId: string): void {
    this.chatSessions.delete(sessionId);
  }
}

export const chatSessionManager = ChatSessionManager.getInstance();
