import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BotMessageSquare, Menu } from "lucide-react";
import Link from "next/link";
import React from "react";

type Page = {
  title: string;
  link: string;
};

export default function NavBar({ pages }: { pages: Page[] }) {
  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary" size="icon" className="lg:hidden">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <BotMessageSquare className="h-8 w-8" />
          <div className="grid gap-2 py-6">
            {pages.map((page) => (
              <SheetClose asChild key={page.link}>
                <Link
                  href={page.link}
                  className="flex w-full items-center py-2 text-lg font-semibold"
                  prefetch={false}
                >
                  {page.title}
                </Link>
              </SheetClose>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      <div className="mr-6 hidden lg:flex">
        <BotMessageSquare className="h-8 w-8" />
      </div>
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          {pages.map((page) => (
            <NavigationMenuLink asChild key={page.link}>
              <Link
                href={page.link}
                className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-zinc-100/50 data-[state=open]:bg-zinc-100/50 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus:bg-zinc-800 dark:focus:text-zinc-50 dark:data-[active]:bg-zinc-800/50 dark:data-[state=open]:bg-zinc-800/50"
                prefetch={false}
              >
                {page.title}
              </Link>
            </NavigationMenuLink>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
