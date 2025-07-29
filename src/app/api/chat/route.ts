import { chatSessionManager } from "@/lib/ChatSessionManager";
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

    const response = await chat.sendMessage(
      {message: messages.map(({ text }) => text).join("\n")},
    );

    return NextResponse.json({ text: response.text });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error getting response';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}