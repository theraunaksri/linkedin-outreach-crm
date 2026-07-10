import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { getMonthlyMeetings } from "@/lib/queries";

type MonthlyMeetings = Awaited<ReturnType<typeof getMonthlyMeetings>>;

export function MonthlyMeetings({ months }: { months: MonthlyMeetings }) {
  if (months.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meetings by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No meetings marked complete yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meetings by Month</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">Who we met, grouped by month held.</p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {months.map((month) => (
          <div key={month.key} className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{month.monthLabel}</h3>
              <Badge variant="secondary">{month.count} meeting{month.count === 1 ? "" : "s"}</Badge>
            </div>
            <ul className="space-y-2">
              {month.people.map((p, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {p.name}
                    {p.companyName && <span className="text-muted-foreground font-normal"> · {p.companyName}</span>}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {p.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
