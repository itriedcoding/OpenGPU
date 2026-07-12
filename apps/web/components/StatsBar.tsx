"use client";

import { useEffect, useState } from "react";
import { Cpu, Users, Activity } from "lucide-react";

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  { icon: Cpu, label: "GPUs Available", value: 10000, suffix: "+" },
  { icon: Users, label: "Active Providers", value: 500, suffix: "+" },
  { icon: Activity, label: "Uptime SLA", value: 99, suffix: ".9%" },
];

export function StatsBar() {
  return (
    <section className="relative -mt-8 z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="glass-panel grid grid-cols-1 divide-y sm:divide-y-0 sm:divide-x sm:grid-cols-3 p-6 sm:p-8">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-center gap-4 px-4 py-4 sm:py-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
