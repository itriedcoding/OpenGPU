import Link from "next/link";
import { ArrowRight, DollarSign, Server, TrendingUp } from "lucide-react";

export function ProviderCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="gpu-gradient rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Earn Money with Your Idle GPUs
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Turn your underutilized GPU hardware into a revenue stream. Join
              hundreds of providers earning passive income on the OpenGPU network.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Up to $3/hr</div>
                  <div className="text-xs text-gray-400">per GPU earned</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Any GPU</div>
                  <div className="text-xs text-gray-400">RTX 3090 to H100</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Weekly Payouts</div>
                  <div className="text-xs text-gray-400">direct to your bank</div>
                </div>
              </div>
            </div>
            <Link
              href="/provider"
              className="mt-8 btn-primary inline-flex items-center gap-2"
            >
              Start Earning <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="hidden lg:block">
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <div className="text-sm text-gray-400 mb-4">Estimated Monthly Earnings</div>
              <div className="space-y-3">
                {[
                  { gpu: "RTX 4090", earnings: "$324" },
                  { gpu: "A100 80GB", earnings: "$1,080" },
                  { gpu: "H100 SXM", earnings: "$1,944" },
                ].map((item) => (
                  <div key={item.gpu} className="flex items-center justify-between">
                    <span className="text-sm text-white">{item.gpu}</span>
                    <span className="text-sm font-medium text-green-400">{item.earnings}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
                Based on 60% average utilization
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
