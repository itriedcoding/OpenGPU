import { DocsLayout } from "@/components/DocsLayout";

export default function ApiReferencePage() {
  return (
    <DocsLayout>
      <h1 className="text-3xl font-bold text-foreground mb-6">API Reference</h1>
      <p className="text-muted-foreground mb-8">
        Complete reference for the OpenGPU REST API. All endpoints require authentication via Bearer token.
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Base URL</h2>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm text-foreground">
          https://api.opengpu.io/v1
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Authentication</h2>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          <div className="text-green-400"># Include your API key in the Authorization header</div>
          <div className="text-foreground">Authorization: Bearer YOUR_API_KEY</div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Endpoints</h2>
        <div className="space-y-4">
          {[
            { method: "GET", path: "/gpus", description: "List all available GPUs" },
            { method: "GET", path: "/gpus/:id", description: "Get GPU details by ID" },
            { method: "POST", path: "/rentals", description: "Create a new GPU rental" },
            { method: "GET", path: "/rentals", description: "List your rentals" },
            { method: "DELETE", path: "/rentals/:id", description: "Cancel a rental" },
            { method: "POST", path: "/nodes", description: "Register a new GPU node" },
            { method: "GET", path: "/nodes", description: "List your registered nodes" },
            { method: "GET", path: "/earnings", description: "Get earnings summary" },
          ].map((endpoint) => (
            <div key={endpoint.path} className="glass-panel p-4 flex items-center gap-4">
              <span className={`shrink-0 rounded px-2 py-1 text-xs font-bold ${
                endpoint.method === "GET" ? "bg-green-500/10 text-green-400" :
                endpoint.method === "POST" ? "bg-blue-500/10 text-blue-400" :
                "bg-red-500/10 text-red-400"
              }`}>
                {endpoint.method}
              </span>
              <code className="text-sm text-foreground font-mono">{endpoint.path}</code>
              <span className="text-sm text-muted-foreground">{endpoint.description}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Example Request</h2>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          <div className="text-green-400"># List available GPUs</div>
          <div className="text-foreground">curl -H &quot;Authorization: Bearer YOUR_KEY&quot; \</div>
          <div className="text-foreground">  https://api.opengpu.io/v1/gpus</div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Response Format</h2>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          <div className="text-foreground">{"{"}</div>
          <div className="text-foreground">  &quot;data&quot;: [ ... ],</div>
          <div className="text-foreground">  &quot;meta&quot;: {"{"}</div>
          <div className="text-foreground">    &quot;total&quot;: 42,</div>
          <div className="text-foreground">    &quot;page&quot;: 1,</div>
          <div className="text-foreground">    &quot;per_page&quot;: 20</div>
          <div className="text-foreground">  {"}"}</div>
          <div className="text-foreground">{"}"}</div>
        </div>
      </section>

      <section className="glass-panel p-6 bg-primary/5 border border-primary/20">
        <h3 className="font-semibold text-foreground mb-2">Rate Limiting</h3>
        <p className="text-sm text-muted-foreground">
          API requests are limited to 1000 requests per minute per API key. Contact support for higher limits.
        </p>
      </section>
    </DocsLayout>
  );
}
