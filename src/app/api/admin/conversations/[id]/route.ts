import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const rows = await db
      .select({
        id: messages.id,
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt));

    return NextResponse.json({
      messages: rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error loading conversation:", error);
    return NextResponse.json(
      { error: "Error loading conversation" },
      { status: 500 },
    );
  }
}
