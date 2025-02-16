"use client";

import { Loader } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// Dynamically import DeepChat with ssr disabled
const DeepChat = dynamic(
  () => import("deep-chat-react").then((mod) => mod.DeepChat),
  { ssr: false },
);

export default function Chat() {
  const [sessionId, setSessionId] = useState<string>("");
  const sessionIdRef = useRef<string>(sessionId);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    // Create a new chat session when the component mounts
    const createSession = async () => {
      try {
        const response = await fetch("/api/chat/create", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to create session");
        }

        const { sessionId } = await response.json();
        setSessionId(sessionId);
      } catch (error) {
        console.error("Error creating session:", error);
      }
    };

    createSession();

    return () => {
      // Delete the chat session when the component unmounts
      fetch(`/api/chat/${sessionIdRef.current}`, {
        method: "DELETE",
      }).catch(console.error);
    };
  }, []);

  const connect = useMemo(
    () => ({
      url: "/api/chat",
      headers: {
        "Content-Type": "application/json",
      },
      additionalBodyProps: {
        sessionId,
      },
    }),
    [sessionId],
  );

  const intro = {
    text: "G'day mate! How may I help you today?",
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
      bubble: { backgroundColor: "#545454", color: "white" },
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
    position: "inside-right" as const,
  };

  const onError = () => {
    toast("Something went wrong", {
      description: "Please refresh the page and try again.",
      action: {
        label: "Refresh",
        onClick: () => window.location.reload(),
      },
    });
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-80px)]">
      {sessionId ? (
        <div className="flex flex-col gap-6 w-full mx-4 h-[500px] lg:h-[calc(100vh-108px)] lg:w-2/3">
          <DeepChat
            className="order-2 lg:order-1"
            connect={connect}
            introMessage={intro}
            style={chatStyles}
            // @ts-ignore
            messageStyles={messageStyles}
            textInput={{ styles: textInputStyles }}
            submitButtonStyles={submitButtonStyles}
            onError={onError}
          />
          <p className="px-4 text-justify text-zinc-500 order-1 lg:order-2 mb-0 lg:mb-4">
            * Feel free to ask questions as this app only sends messages to
            Google Gemini; it doesn't store them. So the real Sean Xiao won't be
            able to see them.
          </p>
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
}