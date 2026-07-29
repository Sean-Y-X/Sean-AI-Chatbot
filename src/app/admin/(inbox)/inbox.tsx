"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout } from "../login/actions";
import { markAllAsRead, markAsRead } from "./actions";

export type ConversationSummary = {
  id: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
  preview: string | null;
  unread: boolean;
};

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  createdAt: string;
};

const listTime = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const fullTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function Inbox({
  conversations,
}: {
  conversations: ConversationSummary[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const unreadCount = conversations.filter((item) => item.unread).length;
  const selected = conversations.find((item) => item.id === selectedId) ?? null;

  // Always refetched rather than cached, so a conversation that grew since the
  // page was rendered never shows a stale transcript.
  const select = async (id: string) => {
    setSelectedId(id);
    setMessages([]);
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/conversations/${id}`);
      if (!response.ok) {
        throw new Error("Request failed");
      }
      const data = await response.json();
      setMessages(data.messages);
    } catch {
      setError("Couldn't load this conversation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-80px)] overflow-hidden">
      <aside
        className={cn(
          "w-full flex-col border-r border-border md:flex md:w-80 lg:w-96",
          selected ? "hidden" : "flex",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium">Inbox</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#7F00FF] px-2 py-0.5 text-xs text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              disabled={pending || unreadCount === 0}
              onClick={() => startTransition(() => markAllAsRead())}
            >
              Mark all read
            </Button>
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit">
                Log out
              </Button>
            </form>
          </div>
        </div>

        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No conversations yet.
          </p>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {conversations.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => select(item.id)}
                  className={cn(
                    // `relative` anchors the sr-only span below: it is
                    // position:absolute, and without a positioned ancestor it
                    // resolves against the document, escaping the list's
                    // overflow clip and stretching the page.
                    "relative w-full cursor-pointer border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent",
                    item.id === selectedId && "bg-accent",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      {item.unread && (
                        <>
                          <span className="sr-only">Unread</span>
                          <span
                            className="size-2 shrink-0 rounded-full bg-[#7F00FF]"
                            aria-hidden="true"
                          />
                        </>
                      )}
                      <span
                        className={cn(
                          "truncate text-sm",
                          item.unread && "font-medium",
                        )}
                      >
                        {item.preview ?? "(no message)"}
                      </span>
                    </span>
                    <time
                      className="shrink-0 text-xs text-muted-foreground"
                      dateTime={item.lastMessageAt}
                      suppressHydrationWarning
                    >
                      {listTime.format(new Date(item.lastMessageAt))}
                    </time>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.messageCount}{" "}
                    {item.messageCount === 1 ? "message" : "messages"}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section
        className={cn(
          "min-w-0 flex-1 flex-col md:flex",
          selected ? "flex" : "hidden",
        )}
      >
        {selected === null ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Select a conversation.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setSelectedId(null)}
                >
                  ← Back
                </Button>
                <span
                  className="truncate text-sm text-muted-foreground"
                  suppressHydrationWarning
                >
                  Started {fullTime.format(new Date(selected.createdAt))}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={pending || !selected.unread}
                onClick={() => startTransition(() => markAsRead(selected.id))}
              >
                {selected.unread ? "Mark as read" : "Read"}
              </Button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {loading && (
                <p className="text-sm text-muted-foreground">Loading…</p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-3 py-2",
                      message.role === "user"
                        ? "bg-[#7F00FF] text-white"
                        : "bg-[#545454] text-white",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {message.content}
                    </p>
                    <time
                      className="mt-1 block text-[10px] opacity-70"
                      dateTime={message.createdAt}
                      suppressHydrationWarning
                    >
                      {fullTime.format(new Date(message.createdAt))}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
