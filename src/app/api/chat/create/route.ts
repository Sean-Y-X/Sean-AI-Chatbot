import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatStore } from '../chat-store';
import { SYSTEM_INSTRUCTION } from '../system-instruction';

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: SYSTEM_INSTRUCTION });

export async function POST() {
  try {
    const chat = model.startChat();
    ChatStore.create(chat);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return Response.error();
  }
}