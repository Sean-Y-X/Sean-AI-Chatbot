import { chatSessionManager } from "@/lib/ChatSessionManager ";
import { NextResponse } from "next/server";

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
      return Response.error();
    }

    const result = await chat.sendMessage(
      messages.map(({ text }) => text).join("\n"),
    );
    const response = await result.response;

    return NextResponse.json({ text: response.text() });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.error();
  }
}