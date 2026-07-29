"use server";

import { eq, isNotNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";

/**
 * Read markers are set to the conversation's own `lastMessageAt` rather than
 * `now()`. A message that arrives between the page render and this write keeps
 * a later timestamp, so it stays unread instead of being silently swallowed.
 */
export async function markAsRead(conversationId: string) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorised");
  }

  await db
    .update(conversations)
    .set({ readAt: sql`${conversations.lastMessageAt}` })
    .where(eq(conversations.id, conversationId));

  revalidatePath("/admin");
}

export async function markAllAsRead() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorised");
  }

  await db
    .update(conversations)
    .set({ readAt: sql`${conversations.lastMessageAt}` })
    .where(isNotNull(conversations.lastMessageAt));

  revalidatePath("/admin");
}
