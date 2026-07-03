import type { getKpis } from "@/lib/queries";
import { ACCOUNT_LABELS } from "@/lib/constants";
import type { AccountFilter } from "@/lib/queries";

type Kpis = Awaited<ReturnType<typeof getKpis>>;

function B({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold text-foreground">{children}</span>;
}

export function NarrativeSummary({ kpis, account }: { kpis: Kpis; account: AccountFilter }) {
  const who = account === "ALL" ? "Across both accounts" : ACCOUNT_LABELS[account as "KANTH" | "SHAKU"];

  if (kpis.connectionRequestsSent === 0) {
    return (
      <p className="text-[15px] leading-relaxed text-foreground/80">
        No outreach logged yet for {who === "Across both accounts" ? "either account" : who}. Click{" "}
        <B>Edit Outreach Numbers</B> to start tracking connection requests, or <B>Add Lead</B> to add your first
        prospect.
      </p>
    );
  }

  return (
    <div className="space-y-2 text-[15px] leading-relaxed text-foreground/80">
      <p>
        {who} reached out to <B>{kpis.connectionRequestsSent}</B> people on LinkedIn. <B>{kpis.acceptedConnections}</B>{" "}
        accepted the connection — a <B>{kpis.acceptanceRate.toFixed(0)}%</B> acceptance rate.
        {kpis.repliesReceived > 0 ? (
          <>
            {" "}
            <B>{kpis.repliesReceived}</B> replied back, giving a <B>{kpis.responseRate.toFixed(0)}%</B> response rate.
          </>
        ) : (
          " No replies yet."
        )}
      </p>
      <p>
        {kpis.discoveryCompleted > 0 ? (
          <>
            <B>{kpis.discoveryCompleted}</B> meeting{kpis.discoveryCompleted === 1 ? "" : "s"} completed so far
            {kpis.discoveryScheduled > kpis.discoveryCompleted && (
              <>
                , with <B>{kpis.discoveryScheduled - kpis.discoveryCompleted}</B> more scheduled
              </>
            )}
            .{" "}
          </>
        ) : kpis.discoveryScheduled > 0 ? (
          <>
            <B>{kpis.discoveryScheduled}</B> meeting{kpis.discoveryScheduled === 1 ? "" : "s"} scheduled, none
            completed yet.{" "}
          </>
        ) : (
          "No meetings booked yet. "
        )}
        {kpis.wonDeals > 0 ? (
          <>
            <B>{kpis.wonDeals}</B> deal{kpis.wonDeals === 1 ? "" : "s"} won so far
            {kpis.lostDeals > 0 && (
              <>
                {" "}
                ({kpis.lostDeals} lost)
              </>
            )}
            .
          </>
        ) : (
          "No deals closed yet."
        )}
      </p>
    </div>
  );
}
