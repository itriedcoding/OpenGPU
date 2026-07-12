"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { mockRentals } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Server, DollarSign, HardDrive, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const activeRentals = mockRentals.filter((r) => r.status === "active");
  const totalSpent = mockRentals.reduce((sum, r) => sum + r.totalCost, 0);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome back, User</h1>
        <p className="text-muted-foreground">Manage your GPU rentals and account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { icon: Server, label: "Active Rentals", value: activeRentals.length.toString(), color: "text-primary" },
          { icon: DollarSign, label: "Total Spent", value: formatCurrency(totalSpent), color: "text-green-400" },
          { icon: HardDrive, label: "Hours Used", value: mockRentals.reduce((s, r) => s + r.hoursUsed, 0).toString(), color: "text-secondary" },
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
        {activeRentals.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">No active rentals.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">GPU</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Cost</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Hours</th>
                </tr>
              </thead>
              <tbody>
                {activeRentals.map((rental) => (
                  <tr key={rental.id} className="border-b border-border/50">
                    <td className="py-3 font-medium text-foreground">{rental.gpuName}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Active
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">{formatCurrency(rental.totalCost)}</td>
                    <td className="py-3 text-muted-foreground">{rental.hoursUsed}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent History</h2>
        <div className="space-y-3">
          {mockRentals.filter((r) => r.status === "completed").slice(0, 5).map((rental) => (
            <div key={rental.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
              <div>
                <div className="text-sm font-medium text-foreground">{rental.gpuName}</div>
                <div className="text-xs text-muted-foreground">{rental.hoursUsed} hours used</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">{formatCurrency(rental.totalCost)}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
