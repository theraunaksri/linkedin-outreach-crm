import type { getKpis } from "@/lib/queries";
import { Send, UserCheck, MessageCircle, CalendarClock, CalendarCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Kpis = Awaited<ReturnType<typeof getKpis>>;

function fmtPct(n: number) {
  return `${n.toFixed(0)}%`;
}

const COLORS = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
};

function HeroCard({
  icon: Icon,
  color,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  color: keyof typeof COLORS;
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border bg-card p-4 ring-1 ring-foreground/5">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", COLORS[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold tabular-nums leading-tight">{value}</div>
        <div className="text-sm font-medium text-foreground/80 leading-snug">{label}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export function HeroStats({ kpis }: { kpis: Kpis }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      <HeroCard icon={Send} color="blue" label="Connection Request Sent" value={kpis.connectionRequestsSent} />
      <HeroCard
        icon={UserCheck}
        color="indigo"
        label="Connected"
        value={kpis.acceptedConnections}
        sub={`${fmtPct(kpis.acceptanceRate)} acceptance rate`}
      />
      <HeroCard
        icon={MessageCircle}
        color="purple"
        label="Replied"
        value={kpis.repliesReceived}
        sub={`${fmtPct(kpis.responseRate)} response rate`}
      />
      <HeroCard icon={CalendarClock} color="orange" label="Meetings Scheduled" value={kpis.discoveryScheduled} />
      <HeroCard icon={CalendarCheck} color="amber" label="Meetings Held" value={kpis.discoveryCompleted} />
    </div>
  );
}
