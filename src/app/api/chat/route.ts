import { chatSessionManager } from "@/lib/ChatSessionManager";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages as messagesTable } from "@/db/schema";

type Message = {
  text: string;
  role: string;
};

type RequestBody = {
  messages: Message[];
  sessionId: string;
};

export async function POST(request: Request) {
  try {
    const { sessionId, messages }: RequestBody = await request.json();

    const chat = chatSessionManager.get(sessionId);

    if (!chat) {
      return NextResponse.json(
        { error: "Chat Session not found" },
        { status: 500 },
      );
    }

    await db.insert(messagesTable).values({
      conversationId: sessionId,
      role: "user",
      content: messages[messages.length - 1]?.text || "",
    });

    const response = await chat.sendMessage({
      message: messages.map(({ text }) => text).join("\n"),
    });

    await db.insert(messagesTable).values([
      {
        conversationId: sessionId,
        role: "ai",
        content: response.text || "",
      },
    ]);

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error("Error getting chat response:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error getting chat response";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
