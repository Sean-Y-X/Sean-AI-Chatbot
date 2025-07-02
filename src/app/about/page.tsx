import { Github } from "lucide-react";

const TECH_STACK = [
  { name: "Bun", url: "https://bun.sh" },
  { name: "DeepChat", url: "https://deepchat.dev" },
  { name: "Gemini", url: "https://deepmind.google/technologies/gemini/" },
  { name: "Next.js", url: "https://nextjs.org" },
  { name: "Shadcn/ui", url: "https://ui.shadcn.com" },
  { name: "Vercel", url: "https://vercel.com" },
];


export default function About() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold mb-8 text-center">
        About This Website
      </h1>

      <div className="space-y-8 mt-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {TECH_STACK.map((tech) => (
              <li
                key={tech.name}
                className="bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-700/50 transition-colors"
              >
                <a
                  href={tech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {tech.name}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Source Code</h2>
          <a
            href="https://github.com/Sean-Y-X/Sean-AI-Chatbot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <Github className="w-6 h-6" />
            <span>View on GitHub</span>
          </a>
        </section>
      </div>

      <h1 className="text-4xl font-bold mt-16 mb-8 text-center">
        About The Developer
      </h1>

      <div className="space-y-8 mt-12">
        <p className="mb-4">
          Want a copy of my résumé?{" "}
          <a
            href="/api/download-cv"
            target="_blank"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Click here</span>
          </a>
        </p>
        <p className="mb-4">
          Flick me an email:{" "}
          <a
            href="mailto:zy05530@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>zy05530@gmail.com</span>
          </a>
        </p>
      </div>
    </div>
  );
}