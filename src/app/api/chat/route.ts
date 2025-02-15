import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_INSTRUCTION } from './system-instruction';

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: SYSTEM_INSTRUCTION });

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const chat = model.startChat();
    const result = await chat.sendMessage(messages[0].text);
    const response = await result.response;

    return Response.json({ text: response.text() });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}