type FunnelDatum = { name: string; value: number; fill: string };

export function SimpleFunnelChart({ data }: { data: FunnelDatum[] }) {
  const allZero = data.every((d) => d.value === 0);

  if (allZero) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        Add numbers in <span className="font-medium text-foreground mx-1">Edit Outreach Numbers</span> to see your
        funnel here.
      </div>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="space-y-3 py-2">
      {data.map((d) => {
        const pct = Math.max((d.value / max) * 100, d.value > 0 ? 3 : 0);
        return (
          <div key={d.name} className="flex items-center gap-4">
            <div className="w-44 shrink-0 text-sm font-medium text-foreground/80 text-right">{d.name}</div>
            <div className="flex-1 h-8 rounded-lg bg-muted overflow-hidden">
              <div
                className="h-full rounded-lg flex items-center justify-end px-3 transition-all"
                style={{ width: `${pct}%`, backgroundColor: d.fill }}
              >
                {pct > 15 && <span className="text-sm font-semibold text-white tabular-nums">{d.value}</span>}
              </div>
            </div>
            {pct <= 15 && (
              <span className="w-8 shrink-0 text-sm font-semibold tabular-nums">{d.value}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
