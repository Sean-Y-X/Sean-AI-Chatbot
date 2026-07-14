import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { MODEL_NAME } from "@/constants";
import { db } from "@/db";
import { conversations, messages as messagesTable } from "@/db/schema";
import { genAi } from "@/lib/googleGenAi";
import { generateSystemInstruction } from "@/lib/system-instruction";

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

    if (!sessionId || !Array.isArray(messages) || !messages.length) {
      return NextResponse.json(
        {
          error: "A sessionId and a non-empty messages array are required",
        },
        { status: 400 },
      );
    }

    const newMessage = messages[messages.length - 1];

    const [conversation] = await db
      .select({ lastInteractionId: conversations.lastInteractionId })
      .from(conversations)
      .where(eq(conversations.id, sessionId));

    if (!conversation?.lastInteractionId) {
      return NextResponse.json(
        { error: "Chat Session not found" },
        { status: 404 },
      );
    }

    const lastInteractionId = conversation.lastInteractionId;

    const [response] = await Promise.all([
      genAi.interactions.create({
        model: MODEL_NAME,
        system_instruction: generateSystemInstruction(),
        input: {
          type: "text",
          text: newMessage.text,
        },
        previous_interaction_id: lastInteractionId,
      }),
      db.insert(messagesTable).values({
        conversationId: sessionId,
        role: "user",
        content: newMessage.text || "",
      }),
    ]);

    await Promise.all([
      db
        .update(conversations)
        .set({ lastInteractionId: response.id })
        .where(eq(conversations.id, sessionId)),
      db.insert(messagesTable).values({
        conversationId: sessionId,
        role: "ai",
        content: response.output_text || "",
      }),
    ]);

    return NextResponse.json({ text: response.output_text });
  } catch (error) {
    console.error("Error getting chat response:", error);
    return NextResponse.json(
      { error: "Error getting chat response" },
      { status: 500 },
    );
  }
}
