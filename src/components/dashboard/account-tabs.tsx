import Link from "next/link";
import { ACCOUNT_LABELS, ACCOUNTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AccountFilter } from "@/lib/queries";

export function AccountTabs({ active, basePath = "/" }: { active: AccountFilter; basePath?: string }) {
  const tabs: { value: AccountFilter; label: string }[] = [
    { value: "ALL", label: "All Accounts" },
    ...ACCOUNTS.map((a) => ({ value: a, label: ACCOUNT_LABELS[a] })),
  ];

  return (
    <div className="inline-flex items-center rounded-lg bg-muted p-1 gap-1">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={tab.value === "ALL" ? basePath : `${basePath}?account=${tab.value}`}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            active === tab.value ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
