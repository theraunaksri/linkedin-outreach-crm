import { loginView } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link2 } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-3">
            <Link2 className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold">Opika CRM</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter the password to view the dashboard.</p>
        </div>

        <form action={loginView} className="space-y-4">
          <input type="hidden" name="next" value={params.next ?? "/"} />
          <div>
            <Label htmlFor="password" className="mb-1.5">Password</Label>
            <Input id="password" name="password" type="password" autoFocus required />
          </div>
          {params.error && <p className="text-sm text-destructive">Incorrect password. Try again.</p>}
          <Button type="submit" className="w-full">
            View Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
}
