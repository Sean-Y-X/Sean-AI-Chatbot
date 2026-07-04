import { CV_FILE_NAME, MODEL_NAME } from "@/constants";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { chatSessionManager } from "@/lib/ChatSessionManager";
import { genAi } from "@/lib/googleGenAi";
import { head } from "@vercel/blob";
import { NextResponse } from "next/server";
import { generateSystemInstruction } from "./system-instruction";

export async function POST() {
  try {
    const cvHeadBlob = await head(CV_FILE_NAME, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const chat = await genAi.interactions.create({
      model: MODEL_NAME,
      system_instruction: generateSystemInstruction(),
      input: [
        {
          type: "text",
          text: "This is the CV. Don't mention it in your response.",
        },
        {
          type: "document",
          uri: cvHeadBlob.url,
          mime_type: "application/pdf",
        },
      ],
    });

    const [{ conversationId }] = await db
      .insert(conversations)
      .values({})
      .returning({ conversationId: conversations.id });

    chatSessionManager.setLastInteraction(conversationId, chat.id);

    return NextResponse.json({ sessionId: conversationId, interactionId: chat.id });
  } catch (error) {
    console.error('Error creating session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error creating session';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}