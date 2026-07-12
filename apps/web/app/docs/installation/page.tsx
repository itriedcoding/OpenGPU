import { DocsLayout } from "@/components/DocsLayout";

export default function InstallationPage() {
  return (
    <DocsLayout>
      <h1 className="text-3xl font-bold text-foreground mb-6">Installation</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Using npm</h2>
        <p className="text-muted-foreground mb-4">Install the OpenGPU CLI globally:</p>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          <div className="text-green-400"># Install globally</div>
          <div className="text-foreground">npm install -g @opengpu/cli</div>
          <div className="mt-2 text-green-400"># Verify installation</div>
          <div className="text-foreground">opengpu --version</div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Using Docker</h2>
        <p className="text-muted-foreground mb-4">Run OpenGPU in a container:</p>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          <div className="text-green-400"># Pull the latest image</div>
          <div className="text-foreground">docker pull opengpu/agent:latest</div>
          <div className="mt-2 text-green-400"># Run with GPU access</div>
          <div className="text-foreground">docker run --gpus all -it opengpu/agent:latest</div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">System Requirements</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-medium text-muted-foreground">Component</th>
                <th className="pb-3 text-left font-medium text-muted-foreground">Minimum</th>
                <th className="pb-3 text-left font-medium text-muted-foreground">Recommended</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50"><td className="py-2">OS</td><td className="py-2">Ubuntu 20.04 / macOS 12</td><td className="py-2">Ubuntu 22.04 / macOS 14</td></tr>
              <tr className="border-b border-border/50"><td className="py-2">RAM</td><td className="py-2">8 GB</td><td className="py-2">16 GB+</td></tr>
              <tr className="border-b border-border/50"><td className="py-2">Disk</td><td className="py-2">10 GB free</td><td className="py-2">50 GB+ SSD</td></tr>
              <tr className="border-b border-border/50"><td className="py-2">Network</td><td className="py-2">5 Mbps</td><td className="py-2">100 Mbps+</td></tr>
              <tr><td className="py-2">GPU Driver</td><td className="py-2">NVIDIA 525+</td><td className="py-2">NVIDIA 535+</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Post-Installation</h2>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          <div className="text-green-400"># Initialize your node</div>
          <div className="text-foreground">opengpu init</div>
          <div className="mt-2 text-green-400"># Authenticate with your account</div>
          <div className="text-foreground">opengpu auth login</div>
          <div className="mt-2 text-green-400"># Check GPU detection</div>
          <div className="text-foreground">opengpu gpus list</div>
        </div>
      </section>
    </DocsLayout>
  );
}
