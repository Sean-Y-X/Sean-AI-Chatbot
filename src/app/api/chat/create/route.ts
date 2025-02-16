import { GoogleGenerativeAI } from '@google/generative-ai';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { ChatStore } from '../chat-store';
import { SYSTEM_INSTRUCTION } from './system-instruction';

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: SYSTEM_INSTRUCTION });

export async function POST() {
  try {
    const chat = model.startChat();
    const id = nanoid();
    ChatStore.create(id, chat);

    return NextResponse.json({ sessionId: id });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.error();
  }
}