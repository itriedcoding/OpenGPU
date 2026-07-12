"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, Rocket, Download, Code, Settings, HelpCircle } from "lucide-react";

const docLinks = [
  { label: "Overview", href: "/docs", icon: BookOpen },
  { label: "Getting Started", href: "/docs/getting-started", icon: Rocket },
  { label: "Installation", href: "/docs/installation", icon: Download },
  { label: "API Reference", href: "/docs/api-reference", icon: Code },
  { label: "Configuration", href: "/docs/configuration", icon: Settings },
  { label: "FAQ", href: "/docs/faq", icon: HelpCircle },
];

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="glass-panel p-4 space-y-1">
            {docLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0 prose prose-invert max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}
