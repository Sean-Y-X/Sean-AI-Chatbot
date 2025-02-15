import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_INSTRUCTION } from '../system-instruction';
import { ChatStore } from '../chat-store';

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: SYSTEM_INSTRUCTION });

export async function POST() {
  try {
    const chat = model.startChat();
    ChatStore.create(chat);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}