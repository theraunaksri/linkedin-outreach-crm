"use client";

import { ResponsiveContainer, FunnelChart, Funnel, LabelList, Tooltip, Cell } from "recharts";

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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <FunnelChart>
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }} />
        <Funnel dataKey="value" data={data} isAnimationActive nameKey="name">
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
          <LabelList position="right" dataKey="name" fill="var(--foreground)" stroke="none" fontSize={13} offset={12} />
          <LabelList position="center" dataKey="value" fill="#fff" stroke="none" fontSize={14} fontWeight={700} />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
