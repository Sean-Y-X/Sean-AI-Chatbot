import { CV_FILE_NAME } from "@/constants";
import { chatSessionManager } from "@/lib/ChatSessionManager";
import { GoogleGenAI } from '@google/genai';
import { head } from "@vercel/blob";
import { nanoid } from 'nanoid';
import { NextResponse } from "next/server";
import { generateSystemInstruction } from './system-instruction'
;

const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST() {
  try {
    const cvHeadBlob = await head(CV_FILE_NAME, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const pdfRes = await fetch(cvHeadBlob.url)
        .then((response) => response.arrayBuffer());

    const chat = genAi.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: generateSystemInstruction(),
      },
      history: [
        {
          parts: [{
            inlineData: {
              data: Buffer.from(pdfRes).toString("base64"),
              mimeType: 'application/pdf',
            }
          }],
          role: 'user',
        }
      ]
    });

    const id = nanoid();

    chatSessionManager.add(id, chat);

    return NextResponse.json({ sessionId: id });
  } catch (error) {
    console.error('Error creating session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error creating session';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}