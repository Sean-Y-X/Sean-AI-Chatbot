"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

// Dynamically import DeepChat with ssr disabled
const DeepChat = dynamic(
  () => import("deep-chat-react").then((mod) => mod.DeepChat),
  { ssr: false },
);

export default function Chat() {
  // Kick off session creation in the background and expose it as a promise so
  // the chat UI can render immediately. The first message send awaits this.
  const sessionIdPromise = useRef<Promise<string> | null>(null);

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

  const connect = useMemo(
    () => ({
      url: "/api/chat",
      headers: {
        "Content-Type": "application/json",
      },
    }),
    [],
  );

  // Inject the sessionId at send time, waiting for creation to finish if the
  // user sends before it's ready. Surface an error if it never succeeded.
  const requestInterceptor = async (requestDetails: {
    body: unknown;
    headers?: Record<string, string>;
  }) => {
    try {
      const sessionId = await (sessionIdPromise.current ??
        Promise.reject(new Error("Session not initialised")));
      return {
        ...requestDetails,
        body: {
          ...(requestDetails.body as Record<string, unknown>),
          sessionId,
        },
      };
    } catch {
      return { error: "Something went wrong. Please refresh and try again." };
    }
  };

  const intro = {
    text: "G'day, mate! How may I help you today?",
  };

  const chatStyles = {
    borderRadius: "10px",
    border: "solid 1px #545454",
    backgroundColor: "#000",
    paddingBottom: "10px",
    height: "100%",
    width: "100%",
  };

  const messageStyles = {
    default: {
      ai: { bubble: { backgroundColor: "#545454", color: "white" } },
      user: { bubble: { backgroundColor: "#7F00FF", color: "white" } },
    },
    loading: {
      message: {
        styles: {
          bubble: { backgroundColor: "#545454", color: "white" },
        },
      },
    },
  };

  const textInputStyles = {
    container: {
      borderRadius: "8px",
      border: "solid 1px #545454",
      backgroundColor: "#000",
      padding: "10px 6px",
      color: "white",
    },
  };

  const submitButtonStyles = {
    submit: {
      container: {
        default: {
          padding: "10px 6px",
        },
      },
    },
    position: "inside-end" as const,
  };

  const onError = () => {
    toast("Something went wrong", {
      description: "Please refresh the page and try again.",
      action: {
        label: "Refresh",
        onClick: () => window.location.reload(),
      },
      duration: Number.POSITIVE_INFINITY,
    });
  };

  return (
    <div className="flex flex-col overflow-hidden items-center justify-center h-[calc(100dvh-80px)]">
      <div className="flex flex-col gap-6 w-full h-4/5 px-4 lg:h-8/9 lg:w-3/4">
        <DeepChat
          className="order-2 lg:order-1"
          connect={connect}
          requestInterceptor={requestInterceptor}
          introMessage={intro}
          style={chatStyles}
          messageStyles={messageStyles}
          textInput={{ styles: textInputStyles }}
          submitButtonStyles={submitButtonStyles}
          onError={onError}
        />
      </div>
    </div>
  );
}
