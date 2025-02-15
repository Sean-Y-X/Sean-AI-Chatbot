import { ChatStore } from './chat-store';

type Message = {
  text: string;
  role: string;
};

type RequestBody = {
  messages: Message[];
};

export async function POST(request: Request) {
  try {
    const { messages }: RequestBody = await request.json();

    const chat = ChatStore.get();
    if (!chat) {
      return Response.json({ error: 'Chat session not found' }, { status: 404 });
    }

    const result = await chat.sendMessage(messages.map(({ text }) => text).join("\n"));
    const response = await result.response;

    return Response.json({ text: response.text() });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}