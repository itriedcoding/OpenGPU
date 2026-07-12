import { DocsLayout } from "@/components/DocsLayout";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <DocsLayout>
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Documentation</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-8">
        Everything you need to get started with OpenGPU.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {[
          { title: "Getting Started", description: "Learn the basics of OpenGPU and set up your first GPU rental.", href: "/docs/getting-started" },
          { title: "Installation", description: "Step-by-step guide to install and configure the OpenGPU agent.", href: "/docs/installation" },
          { title: "API Reference", description: "Complete API documentation for programmatic GPU management.", href: "/docs/api-reference" },
          { title: "Configuration", description: "Advanced configuration options and environment variables.", href: "/docs/configuration" },
        ].map((doc) => (
          <Link key={doc.href} href={doc.href} className="glass-panel p-6 card-hover group">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {doc.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{doc.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
              Read more <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12 glass-panel p-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Start</h2>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm text-muted-foreground">
          <div className="text-green-400"># Install the OpenGPU agent</div>
          <div className="text-foreground">npm install -g @opengpu/cli</div>
          <div className="mt-2 text-green-400"># Initialize and connect</div>
          <div className="text-foreground">opengpu init</div>
          <div className="mt-2 text-green-400"># Start sharing your GPU</div>
          <div className="text-foreground">opengpu start</div>
        </div>
      </div>
    </DocsLayout>
  );
}
