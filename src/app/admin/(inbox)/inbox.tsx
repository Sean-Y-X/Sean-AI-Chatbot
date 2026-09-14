"use client";

import { Star } from "lucide-react";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout } from "../login/actions";
import { markAllAsRead, markAsRead, setStarred } from "./actions";

export type ConversationSummary = {
  id: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
  preview: string | null;
  unread: boolean;
  starred: boolean;
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

// `Intl` resolves to the server's timezone (UTC in production) during the
// server render, and hydration keeps server-rendered text, so anything
// formatted in the first render would stay stuck in UTC. Waiting for mount
// makes every timestamp use the admin's own timezone.
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function StarButton({
  starred,
  onToggle,
  className,
}: {
  starred: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={starred}
      onClick={onToggle}
      className={cn(
        "cursor-pointer rounded-md p-1.5 transition-colors hover:bg-accent",
        starred ? "text-[#7F00FF]" : "text-muted-foreground",
        className,
      )}
    >
      <span className="sr-only">{starred ? "Unstar" : "Star"}</span>
      <Star
        className="size-4"
        fill={starred ? "currentColor" : "none"}
        aria-hidden="true"
      />
    </button>
  );
}

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
  const [starredOnly, setStarredOnly] = useState(false);
  const mounted = useMounted();

  // The star flips as soon as it is clicked; the server action only revalidates
  // the page afterwards, which would otherwise leave the icon stale for the
  // length of a round trip.
  const [items, applyStar] = useOptimistic(
    conversations,
    (state, change: { id: string; starred: boolean }) =>
      state.map((item) =>
        item.id === change.id ? { ...item, starred: change.starred } : item,
      ),
  );

  const unreadCount = items.filter((item) => item.unread).length;
  const starredCount = items.filter((item) => item.starred).length;
  // The detail pane keeps rendering a conversation the filter has hidden, so
  // the selection is looked up in the full list rather than the visible one.
  const selected = items.find((item) => item.id === selectedId) ?? null;
  const visible = starredOnly ? items.filter((item) => item.starred) : items;

  const toggleStar = (item: ConversationSummary) => {
    startTransition(async () => {
      applyStar({ id: item.id, starred: !item.starred });
      await setStarred(item.id, !item.starred);
    });
  };

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

      const item = conversations.find((conversation) => conversation.id === id);
      if (item?.unread) {
        startTransition(() => markAsRead(id));
      }
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
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
              aria-pressed={starredOnly}
              title={starredOnly ? "Show all" : "Show starred only"}
              className={cn("px-2", starredOnly && "bg-accent")}
              onClick={() => setStarredOnly((value) => !value)}
            >
              <span className="sr-only">
                {starredOnly ? "Show all conversations" : "Show starred only"}
              </span>
              <Star
                className={cn(starredOnly && "text-[#7F00FF]")}
                fill={starredOnly ? "currentColor" : "none"}
                aria-hidden="true"
              />
              {starredCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {starredCount}
                </span>
              )}
            </Button>
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

        {visible.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            {starredOnly
              ? "No starred conversations."
              : "No conversations yet."}
          </p>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {visible.map((item) => (
              <li key={item.id} className="relative border-b border-border">
                <button
                  type="button"
                  onClick={() => select(item.id)}
                  className={cn(
                    // `relative` anchors the sr-only span below: it is
                    // position:absolute, and without a positioned ancestor it
                    // resolves against the document, escaping the list's
                    // overflow clip and stretching the page.
                    // The right padding keeps the row text clear of the star
                    // button, which overlays the row rather than sitting inside
                    // it — a button cannot nest in a button.
                    "relative w-full cursor-pointer px-4 py-3 pr-12 text-left transition-colors hover:bg-accent",
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
                    >
                      {mounted
                        ? listTime.format(new Date(item.lastMessageAt))
                        : ""}
                    </time>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.messageCount}{" "}
                    {item.messageCount === 1 ? "message" : "messages"}
                  </p>
                </button>
                <StarButton
                  starred={item.starred}
                  onToggle={() => toggleStar(item)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                />
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
            <div className="flex min-w-0 items-center gap-2 border-b border-border px-4 py-3">
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
              <StarButton
                starred={selected.starred}
                onToggle={() => toggleStar(selected)}
                className="ml-auto shrink-0"
              />
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
