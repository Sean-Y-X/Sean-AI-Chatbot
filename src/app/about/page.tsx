import { Download, Github, Linkedin, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

const CONTACT_LINKS = [
  {
    label: "Download my résumé",
    href: "/api/download-cv",
    icon: Download,
    newTab: true,
  },
  {
    label: "Add me on LinkedIn",
    href: "https://www.linkedin.com/in/sean-yx/",
    icon: Linkedin,
    newTab: true,
  },
  {
    label: "Flick me an email",
    href: "mailto:zy05530@gmail.com",
    icon: Mail,
    newTab: false,
  },
];

const TECH_STACK = [
  { name: "Bun", url: "https://bun.sh" },
  { name: "DeepChat", url: "https://deepchat.dev" },
  { name: "Drizzle", url: "https://orm.drizzle.team" },
  { name: "Gemini", url: "https://deepmind.google/models/gemini/" },
  { name: "Neon", url: "https://neon.tech" },
  { name: "Next.js", url: "https://nextjs.org" },
  { name: "Shadcn/ui", url: "https://ui.shadcn.com" },
  { name: "Vercel", url: "https://vercel.com" },
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold mb-8 text-center">About Sean Xiao</h1>
      <div className="flex flex-wrap gap-4 mt-12 justify-between">
        {CONTACT_LINKS.map((link) => (
          <Button key={link.label} asChild variant="outline">
            <a
              href={link.href}
              target={link.newTab ? "_blank" : "_self"}
              rel={link.newTab ? "noopener noreferrer" : undefined}
            >
              <link.icon />
              <span>{link.label}</span>
            </a>
          </Button>
        ))}
      </div>
      <h1 className="text-4xl font-bold mb-8 text-center mt-24">
        About This Website
      </h1>

      <div className="space-y-8 mt-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TECH_STACK.map((tech) => (
              <li
                key={tech.name}
                className="bg-zinc-800/50 rounded-md py-2 hover:bg-zinc-700/50 transition-colors text-gray-300 hover:text-blue-400 text-center"
              >
                <a href={tech.url} target="_blank" rel="noopener noreferrer">
                  {tech.name}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Source Code</h2>
          <Button asChild variant="outline">
            <a
              href="https://github.com/Sean-Y-X/Sean-AI-Chatbot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github />
              <span>View on GitHub</span>
            </a>
          </Button>
        </section>
      </div>
    </div>
  );
}
