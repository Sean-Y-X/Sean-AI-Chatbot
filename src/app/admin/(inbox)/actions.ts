"use server";

import { eq, isNotNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * Read markers are set to the conversation's own `lastMessageAt` rather than
 * `now()` so that both timestamps always come from the same clock. `now()` is
 * database time while `lastMessageAt` is written from application time in the
 * chat route; comparing the two means clock skew could leave a conversation
 * stuck permanently unread.
 *
 * This does not close the read-then-mark window: a message arriving between
 * the page render and this write bumps `lastMessageAt` and is marked read
 * unseen. Closing it would need the timestamp the page rendered at
 * (`set read_at = $renderedAt where last_message_at <= $renderedAt`).
 */
export async function markAsRead(conversationId: string) {
  await requireAdmin();

  await db
    .update(conversations)
    .set({ readAt: sql`${conversations.lastMessageAt}` })
    .where(eq(conversations.id, conversationId));

  revalidatePath("/admin");
}

export async function markAllAsRead() {
  await requireAdmin();

  await db
    .update(conversations)
    .set({ readAt: sql`${conversations.lastMessageAt}` })
    .where(isNotNull(conversations.lastMessageAt));

  revalidatePath("/admin");
}
