"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const INTRO_TEXT = "G'day, mate! How may I help you today?";

export default function Chat() {
  // Create the session in the background so the UI renders immediately; the
  // first send awaits this promise.
  const sessionIdPromise = useRef<Promise<string> | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: () => {
      toast("Something went wrong", {
        description: "Please refresh the page and try again.",
        action: {
          label: "Refresh",
          onClick: () => window.location.reload(),
        },
        duration: Number.POSITIVE_INFINITY,
      });
    },
  });

  useEffect(() => {
    sessionIdPromise.current = (async () => {
      const response = await fetch("/api/chat/create", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to create session");
      }
      const { sessionId } = await response.json();
      return sessionId as string;
    })();

    sessionIdPromise.current.catch((error) => {
      console.error("Error creating session:", error);
    });
  }, []);

  // Keep the latest message in view as content streams in.
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new content
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || status !== "ready") return;
    setInput("");

    try {
      const sessionId = await sessionIdPromise.current;
      sendMessage({ text }, { body: { sessionId } });
    } catch {
      toast("Something went wrong", {
        description: "Please refresh the page and try again.",
      });
    }
  };

  const isBusy = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col overflow-hidden items-center justify-center h-[calc(100dvh-80px)]">
      <div className="flex flex-col gap-6 w-full h-4/5 px-4 lg:h-8/9 lg:w-3/4">
        <div className="flex flex-col flex-1 min-h-0 rounded-[10px] border border-[#545454] bg-black pb-2.5">
          <div
            ref={scrollRef}
            className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto p-4"
          >
            <div className="self-start max-w-[80%] rounded-2xl bg-[#545454] px-4 py-2 text-white whitespace-pre-wrap break-words">
              {INTRO_TEXT}
            </div>

            {messages.map((message) => {
              const text = message.parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("");

              return (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "self-end max-w-[80%] rounded-2xl bg-[#7F00FF] px-4 py-2 text-white whitespace-pre-wrap break-words"
                      : "self-start max-w-[80%] rounded-2xl bg-[#545454] px-4 py-2 text-white whitespace-pre-wrap break-words"
                  }
                >
                  {text}
                </div>
              );
            })}

            {status === "submitted" && (
              <div className="self-start max-w-[80%] rounded-2xl bg-[#545454] px-4 py-2 text-white">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">•</span>
                  <span className="animate-bounce [animation-delay:150ms]">
                    •
                  </span>
                  <span className="animate-bounce [animation-delay:300ms]">
                    •
                  </span>
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 px-2.5">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-[#545454] bg-black px-3 py-2.5 text-white outline-none placeholder:text-[#8a8a8a]"
            />
            <button
              type="submit"
              disabled={isBusy || !input.trim()}
              className="rounded-lg bg-[#7F00FF] px-4 py-2.5 text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
