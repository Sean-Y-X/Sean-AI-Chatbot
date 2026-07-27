import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { MODEL_NAME } from "@/constants";
import { db } from "@/db";
import { conversations, messages as messagesTable } from "@/db/schema";
import { genAi } from "@/lib/googleGenAi";
import { generateSystemInstruction } from "@/lib/system-instruction";

type RequestBody = {
  messages: UIMessage[];
  sessionId: string;
};

// Concatenate the text parts of a UI message into a plain string.
function getMessageText(message: UIMessage | undefined): string {
  if (!message) return "";
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export async function POST(request: Request) {
  const { sessionId, messages }: RequestBody = await request.json();

  if (!sessionId || !Array.isArray(messages) || !messages.length) {
    return NextResponse.json(
      { error: "A sessionId and a non-empty messages array are required" },
      { status: 400 },
    );
  }

  const userText = getMessageText(messages.at(-1));

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

  // Persist the user message before streaming the response.
  await db.insert(messagesTable).values({
    conversationId: sessionId,
    role: "user",
    content: userText,
  });

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const geminiStream = await genAi.interactions.create({
        model: MODEL_NAME,
        system_instruction: generateSystemInstruction(),
        input: { type: "text", text: userText },
        previous_interaction_id: lastInteractionId,
        stream: true,
      });

      const textId = crypto.randomUUID();
      writer.write({ type: "text-start", id: textId });

      let fullText = "";
      let newInteractionId = lastInteractionId;

      for await (const event of geminiStream) {
        if (event.event_type === "step.delta" && event.delta.type === "text") {
          fullText += event.delta.text;
          writer.write({
            type: "text-delta",
            id: textId,
            delta: event.delta.text,
          });
        } else if (
          event.event_type === "interaction.created" ||
          event.event_type === "interaction.completed"
        ) {
          newInteractionId = event.interaction.id;
        }
      }

      writer.write({ type: "text-end", id: textId });

      // Persist the assistant reply and advance the conversation pointer.
      await Promise.all([
        db
          .update(conversations)
          .set({ lastInteractionId: newInteractionId })
          .where(eq(conversations.id, sessionId)),
        db.insert(messagesTable).values({
          conversationId: sessionId,
          role: "ai",
          content: fullText,
        }),
      ]);
    },
    onError: (error) => {
      console.error("Error getting chat response:", error);
      return "Error getting chat response";
    },
  });

  return createUIMessageStreamResponse({ stream });
}
