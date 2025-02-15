import { ChatStore } from '../chat-store';

export async function DELETE() {
  try {
    ChatStore.delete();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return Response.error();
  }
}
