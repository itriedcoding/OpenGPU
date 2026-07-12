import { DocsLayout } from "@/components/DocsLayout";

export default function ConfigurationPage() {
  return (
    <DocsLayout>
      <h1 className="text-3xl font-bold text-foreground mb-6">Configuration</h1>
      <p className="text-muted-foreground mb-8">
        Customize OpenGPU behavior through configuration files and environment variables.
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Configuration File</h2>
        <p className="text-muted-foreground mb-4">
          Create a <code className="rounded bg-muted px-1.5 py-0.5 text-sm">opengpu.config.json</code> in your project root:
        </p>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          <div className="text-foreground">{"{"}</div>
          <div className="text-foreground">  &quot;node&quot;: {"{"}</div>
          <div className="text-foreground">    &quot;name&quot;: &quot;my-gpu-node&quot;,</div>
          <div className="text-foreground">    &quot;region&quot;: &quot;us-east-1&quot;</div>
          <div className="text-foreground">  {"},"}</div>
          <div className="text-foreground">  &quot;gpus&quot;: ["0", "1"],</div>
          <div className="text-foreground">  &quot;maxConcurrentJobs&quot;: 2,</div>
          <div className="text-foreground">  &quot;pricing&quot;: {"{"}</div>
          <div className="text-foreground">    &quot;autoPrice&quot;: true,</div>
          <div className="text-foreground">    &quot;minPricePerHour&quot;: 0.50</div>
          <div className="text-foreground">  {"}"}</div>
          <div className="text-foreground">{"}"}</div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Environment Variables</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-medium text-muted-foreground">Variable</th>
                <th className="pb-3 text-left font-medium text-muted-foreground">Default</th>
                <th className="pb-3 text-left font-medium text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ["OPENGPU_API_KEY", "", "Your API authentication key"],
                ["OPENGPU_NODE_NAME", "default", "Name of your GPU node"],
                ["OPENGPU_REGION", "auto", "Deployment region"],
                ["OPENGPU_LOG_LEVEL", "info", "Logging verbosity (debug, info, warn, error)"],
                ["OPENGPU_MAX_JOBS", "1", "Maximum concurrent jobs per GPU"],
                ["OPENGPU_PORT", "8080", "Local agent API port"],
              ].map(([name, def, desc]) => (
                <tr key={name} className="border-b border-border/50">
                  <td className="py-2 font-mono text-xs text-foreground">{name}</td>
                  <td className="py-2 text-xs">{def || "—"}</td>
                  <td className="py-2 text-xs">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">GPU Selection</h2>
        <p className="text-muted-foreground mb-4">
          Control which GPUs are shared on the marketplace:
        </p>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          <div className="text-green-400"># List available GPUs</div>
          <div className="text-foreground">opengpu gpus list</div>
          <div className="mt-2 text-green-400"># Select specific GPUs (by index)</div>
          <div className="text-foreground">opengpu gpus select 0,1</div>
          <div className="mt-2 text-green-400"># Or select all</div>
          <div className="text-foreground">opengpu gpus select all</div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Network Configuration</h2>
        <p className="text-muted-foreground">
          For nodes behind firewalls, ensure ports 22 (SSH), 8080 (Agent API), and 49152-65535 (Dynamic)
          are open. Use the <code className="rounded bg-muted px-1.5 py-0.5 text-sm">--port</code> flag to
          change the default agent port.
        </p>
      </section>

      <section className="glass-panel p-6 bg-primary/5 border border-primary/20">
        <h3 className="font-semibold text-foreground mb-2">Security Note</h3>
        <p className="text-sm text-muted-foreground">
          Never commit your API key to version control. Use environment variables or the
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">opengpu auth</code> command for secure storage.
        </p>
      </section>
    </DocsLayout>
  );
}
