import { Construction } from "lucide-react";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
      <Construction className="h-8 w-8 text-muted-foreground mb-3" />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        This section is coming next. Leads you add now will automatically feed into it once it&apos;s built.
      </p>
    </div>
  );
}
