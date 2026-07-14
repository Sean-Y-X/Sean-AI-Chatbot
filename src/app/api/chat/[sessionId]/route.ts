import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { chatSessionManager } from "@/lib/ChatSessionManager";

export async function DELETE(
  _request: NextRequest,
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

    chatSessionManager.clearInteraction(sessionId);

    return NextResponse.json(
      { message: "Session deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting session:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error deleting session";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
