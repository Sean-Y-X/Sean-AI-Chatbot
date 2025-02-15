import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center h-[calc(100vh-80px)] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Sean's AI Chatbot</h1>
        <p className="max-w-[600px] text-center sm:text-left">
          Hey there! My name is Sean Xiao. I'm a senior software engineer based
          in Sydney.
        </p>
        <p className="max-w-[600px] text-center sm:text-left">
          Wanna know more about me?
        </p>
        <Link href="/chat">
          <Button>Let's chat!</Button>
        </Link>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        © 2025 Sean Xiao
      </footer>
    </div>
  );
}
