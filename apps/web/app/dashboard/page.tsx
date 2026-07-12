"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import { fetchUserRentals, stopRental } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Rental } from "@/lib/types";
import { Server, DollarSign, HardDrive, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && token) {
      loadRentals();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  async function loadRentals() {
    try {
      setLoading(true);
      const data = await fetchUserRentals(token!);
      setRentals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStopRental(rentalId: string) {
    if (!token) return;
    try {
      await stopRental(rentalId, token);
      await loadRentals();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
        <Link href="/auth/signin" className="btn-primary mt-4 inline-flex items-center gap-2">
          Sign In
        </Link>
      </div>
    );
  }

  const normalizedRentals = rentals.map((r: any) => ({
    ...r,
    gpuName: r.gpuName || r.gpuNode?.name || r.gpuNode?.model || "Unknown GPU",
  }));
  const activeRentals = normalizedRentals.filter((r) => r.status === "active");
  const completedRentals = normalizedRentals.filter((r) => r.status === "completed");
  const totalSpent = normalizedRentals.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const totalHours = normalizedRentals.reduce((sum, r) => sum + (r.totalHours || 0), 0);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name || "User"}</h1>
        <p className="text-muted-foreground">Manage your GPU rentals and account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { icon: Server, label: "Active Rentals", value: activeRentals.length.toString(), color: "text-primary" },
          { icon: DollarSign, label: "Total Spent", value: formatCurrency(totalSpent), color: "text-green-400" },
          { icon: HardDrive, label: "Hours Used", value: totalHours.toFixed(1), color: "text-secondary" },
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Active Rentals</h2>
          <Link href="/gpus" className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-1">
            <Plus className="h-4 w-4" /> New Rental
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-6 w-6 text-primary animate-spin" />
            <p className="mt-2 text-sm text-muted-foreground">Loading rentals...</p>
          </div>
        ) : activeRentals.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            No active rentals. <Link href="/gpus" className="text-primary hover:text-primary-400">Browse GPUs</Link> to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">GPU</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Cost</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Hours</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeRentals.map((rental) => (
                  <tr key={rental.id} className="border-b border-border/50">
                    <td className="py-3 font-medium text-foreground">{rental.gpuName || rental.gpuNodeId}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Active
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">{formatCurrency(rental.totalCost || 0)}</td>
                    <td className="py-3 text-muted-foreground">{(rental.totalHours || 0).toFixed(1)}h</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleStopRental(rental.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Stop
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent History</h2>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-6 w-6 text-primary animate-spin" />
          </div>
        ) : completedRentals.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">No completed rentals yet.</p>
        ) : (
          <div className="space-y-3">
            {completedRentals.slice(0, 5).map((rental) => (
              <div key={rental.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{rental.gpuName || rental.gpuNodeId}</div>
                  <div className="text-xs text-muted-foreground">{(rental.totalHours || 0).toFixed(1)} hours used</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">{formatCurrency(rental.totalCost || 0)}</div>
                  <div className="text-xs text-muted-foreground capitalize">{rental.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
