"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import DeepChat with ssr disabled
const DeepChat = dynamic(
  () => import("deep-chat-react").then((mod) => mod.DeepChat),
  { ssr: false },
);

export default function Chat() {
  const [sessionCreated, setSessionCreated] = useState<boolean>(false);

  useEffect(() => {
    // Create a new chat session when the component mounts
    fetch("/api/chat/create", {
      method: "POST",
    })
      .then((res) => res.json())
      .then(() => setSessionCreated(true))
      .catch(console.error);

    return () => {
      console.log("Deleting chat session");
      fetch("/api/chat/delete", {
        method: "DELETE",
      }).catch(console.error);
    };
  }, []);

  const connect = {
    url: "/api/chat",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const intro = {
    text: "Hello! I'm Sean. How may I help you?",
  };

  const chatStyles = {
    borderRadius: "10px",
    border: "solid 1px #545454",
    backgroundColor: "#000",
    padding: "12px 6px",
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

  return (
    <div className="flex items-center justify-center h-[calc(100vh-80px)] ">
      {sessionCreated ? (
        <div className="flex h-full w-full lg:w-1/2 lg:h-[calc(100vh-196px)]">
          <DeepChat
            connect={connect}
            introMessage={intro}
            style={chatStyles}
            // @ts-ignore
            messageStyles={messageStyles}
          />
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
}