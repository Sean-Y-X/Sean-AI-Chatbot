import { NextResponse } from "next/server";
import { MODEL_NAME } from "@/constants";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { getCvUrl } from "@/lib/cv";
import { genAi } from "@/lib/googleGenAi";
import { generateSystemInstruction } from "@/lib/system-instruction";

export async function POST() {
  try {
    const cvUrl = await getCvUrl();

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
          uri: cvUrl,
          mime_type: "application/pdf",
        },
      ],
    });

    const [{ conversationId }] = await db
      .insert(conversations)
      .values({ lastInteractionId: chat.id })
      .returning({ conversationId: conversations.id });

    return NextResponse.json({
      sessionId: conversationId,
      interactionId: chat.id,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Error creating session" },
      { status: 500 },
    );
  }
}
