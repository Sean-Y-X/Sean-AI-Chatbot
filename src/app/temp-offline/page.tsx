import { Construction } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Chat Temporarily Offline",
  description: "The chat is temporarily offline while we wait on a fix.",
};

export default function TempOffline() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-8">
      <main className="flex max-w-[600px] flex-col items-center gap-6 text-center">
        <Construction className="h-12 w-12 text-amber-400" />
        <h1 className="text-4xl font-bold">Chat is temporarily offline</h1>
        <p className="text-zinc-400">
          The chat runs on the Gemini API, which currently has a reported bug.
          I've taken the chat down rather than leave you with a broken
          conversation, and it will be back as soon as Google ships a fix.
        </p>
        <p className="text-zinc-400">
          In the meantime, you can still find my résumé and contact details on
          the About page.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link href="/about">About &amp; contact</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
