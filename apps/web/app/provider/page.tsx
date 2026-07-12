"use client";

import { useAuth } from "@/lib/auth-context";
import { fetchProviderDashboard } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ProviderNode } from "@/lib/types";
import { DollarSign, Server, Activity, Plus, TrendingUp, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProviderPage() {
  const { token, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<{
    totalEarnings: number;
    activeNodes: number;
    avgUptime: number;
    thisMonth: number;
    nodes: ProviderNode[];
    monthlyEarnings: number[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, [token]);

  async function loadDashboard() {
    try {
      setLoading(true);
      const data = await fetchProviderDashboard(token || "");
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const nodes = stats?.nodes || [];
  const monthlyData = stats?.monthlyEarnings || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const maxMonthly = Math.max(...monthlyData, 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Provider Portal</h1>
          <p className="text-muted-foreground">Manage your GPU nodes and earnings.</p>
        </div>
        {isAuthenticated && (
          <button className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Node
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading provider data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">{error}</p>
          <button onClick={loadDashboard} className="btn-primary mt-4 text-sm px-4 py-2">Retry</button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4 mb-8">
            {[
              { icon: DollarSign, label: "Total Earnings", value: formatCurrency(stats?.totalEarnings || 0), color: "text-green-400" },
              { icon: Server, label: "Active Nodes", value: String(stats?.activeNodes || 0), color: "text-primary" },
              { icon: Activity, label: "Avg Uptime", value: `${(stats?.avgUptime || 0).toFixed(1)}%`, color: "text-secondary" },
              { icon: TrendingUp, label: "This Month", value: formatCurrency(stats?.thisMonth || 0), color: "text-green-400" },
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
              {monthlyData.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-primary to-secondary transition-all duration-500"
                    style={{ height: `${maxMonthly > 0 ? (h / maxMonthly) * 100 : 0}%` }}
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
            {nodes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No GPU nodes registered yet.</p>
                <p className="text-xs text-muted-foreground mt-2">Install the agent on your machine to start sharing your GPU.</p>
              </div>
            ) : (
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
                    {nodes.map((node) => (
                      <tr key={node.id} className="border-b border-border/50">
                        <td className="py-3 font-medium text-foreground">{node.name}</td>
                        <td className="py-3 text-muted-foreground">{node.gpu} · {node.vram}GB</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            node.status === "online" || node.status === "available"
                              ? "bg-green-500/10 text-green-400"
                              : node.status === "maintenance"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-red-500/10 text-red-400"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              node.status === "online" || node.status === "available" ? "bg-green-400" :
                              node.status === "maintenance" ? "bg-yellow-400" : "bg-red-400"
                            }`} />
                            {node.status === "online" || node.status === "available" ? "Online" :
                             node.status === "maintenance" ? "Maintenance" : "Offline"}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">{node.uptime}%</td>
                        <td className="py-3 text-green-400 font-medium">{formatCurrency(node.earnings)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
        </>
      )}
    </div>
  );
}
