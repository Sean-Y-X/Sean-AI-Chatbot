import { chatSessionManager } from "@/lib/ChatSessionManager";
import { GoogleGenAI } from '@google/genai';
import { nanoid } from 'nanoid';
import { NextResponse } from "next/server";
import { SYSTEM_INSTRUCTION } from './system-instruction';

const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST() {
  try {
    const chat = genAi.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });
    const id = nanoid();

    chatSessionManager.add(id, chat);

    return NextResponse.json({ sessionId: id });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.error();
  }
}