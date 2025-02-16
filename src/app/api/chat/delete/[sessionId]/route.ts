import { NextResponse } from 'next/server';
import { ChatStore } from '../../chat-store';

export async function DELETE(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    ChatStore.delete(sessionId);

    return NextResponse.json(
      { message: 'Session deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.error();
  }
}