"use client";

import { DeepChat } from "deep-chat-react";
import { use } from "react";

export default function Chat() {
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
    border: "solid 2px #545454",
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
    <div className="flex items-center justify-center h-[calc(100vh-80px)]">
      <DeepChat
        connect={connect}
        introMessage={intro}
        style={chatStyles}
        // @ts-ignore
        messageStyles={messageStyles}
      />
    </div>
  );
}