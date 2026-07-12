"use client";

import { formatCurrency } from "@/lib/utils";
import { DollarSign, Server, Activity, Plus, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";

const mockNodes = [
  { id: "n1", name: "RTX 4090 Node #1", gpu: "RTX 4090", status: "online", uptime: "99.98%", earnings: "$124.50" },
  { id: "n2", name: "A100 Node #1", gpu: "A100 80GB", status: "online", uptime: "99.95%", earnings: "$432.00" },
  { id: "n3", name: "RTX 3090 Node #1", gpu: "RTX 3090", status: "maintenance", uptime: "98.50%", earnings: "$56.20" },
];

export default function ProviderPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Provider Portal</h1>
          <p className="text-muted-foreground">Manage your GPU nodes and earnings.</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Node
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { icon: DollarSign, label: "Total Earnings", value: "$612.70", color: "text-green-400" },
          { icon: Server, label: "Active Nodes", value: "2", color: "text-primary" },
          { icon: Activity, label: "Avg Uptime", value: "99.48%", color: "text-secondary" },
          { icon: TrendingUp, label: "This Month", value: "$289.30", color: "text-green-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Earnings Overview</h2>
        <div className="h-48 flex items-end gap-2 px-4">
          {[65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50, 88].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-gradient-to-t from-primary to-secondary transition-all duration-500"
                style={{ height: `${h}%` }}
              />
              <span className="text-[10px] text-muted-foreground">
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">My Nodes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-medium text-muted-foreground">Node</th>
                <th className="pb-3 text-left font-medium text-muted-foreground">GPU</th>
                <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="pb-3 text-left font-medium text-muted-foreground">Uptime</th>
                <th className="pb-3 text-left font-medium text-muted-foreground">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {mockNodes.map((node) => (
                <tr key={node.id} className="border-b border-border/50">
                  <td className="py-3 font-medium text-foreground">{node.name}</td>
                  <td className="py-3 text-muted-foreground">{node.gpu}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      node.status === "online"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        node.status === "online" ? "bg-green-400" : "bg-yellow-400"
                      }`} />
                      {node.status === "online" ? "Online" : "Maintenance"}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">{node.uptime}</td>
                  <td className="py-3 text-green-400 font-medium">{node.earnings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">How to Become a Provider</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { step: "1", title: "Install the Agent", desc: "Run our open source agent on your machine with a single command." },
            { step: "2", title: "Configure Your GPUs", desc: "Select which GPUs to share and set your pricing." },
            { step: "3", title: "Start Earning", desc: "Your GPUs join the marketplace and start earning automatically." },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                {item.step}
              </div>
              <div>
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
