import { and, asc, desc, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import Inbox from "./inbox";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  // Built with the query builder rather than a hand-written `sql` template:
  // inside a select field, a template renders columns unqualified, so the
  // outer `conversations.id` would silently bind to the subquery's own table.
  const firstUserMessage = db
    .select({ content: messages.content })
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, conversations.id),
        eq(messages.role, "user"),
      ),
    )
    .orderBy(asc(messages.createdAt))
    .limit(1);

  const rows = await db
    .select({
      id: conversations.id,
      createdAt: conversations.createdAt,
      lastMessageAt: conversations.lastMessageAt,
      readAt: conversations.readAt,
      messageCount: db.$count(
        messages,
        eq(messages.conversationId, conversations.id),
      ),
      // First thing the visitor actually typed, used as the list preview.
      preview: sql<string | null>`(${firstUserMessage})`,
    })
    .from(conversations)
    // Conversations are created on page load, before the visitor says
    // anything. Ones that never got a message aren't worth showing.
    .where(isNotNull(conversations.lastMessageAt))
    .orderBy(desc(conversations.lastMessageAt));

  const items = rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    lastMessageAt: (row.lastMessageAt ?? row.createdAt).toISOString(),
    messageCount: Number(row.messageCount),
    preview: row.preview,
    unread:
      row.readAt === null ||
      (row.lastMessageAt !== null && row.lastMessageAt > row.readAt),
  }));

  return <Inbox conversations={items} />;
}
