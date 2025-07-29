import { chatSessionManager } from "@/lib/ChatSessionManager";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 },
      );
    }

    chatSessionManager.delete(sessionId);

    return NextResponse.json(
      { message: "Session deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error deleting session';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}