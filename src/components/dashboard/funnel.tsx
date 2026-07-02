export function Funnel({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="space-y-1.5">
      {items.map((item) => {
        const pct = Math.max((item.value / max) * 100, item.value > 0 ? 4 : 0);
        return (
          <div key={item.label} className="flex items-center gap-3 rounded-md px-2 py-1.5">
            <div className="w-44 shrink-0 text-xs font-medium text-muted-foreground">{item.label}</div>
            <div className="flex-1 h-6 rounded bg-muted overflow-hidden">
              <div className="h-full rounded bg-primary/80 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums">{item.value}</div>
          </div>
        );
      })}
    </div>
  );
}
