import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { isEditUnlocked } from "@/lib/auth";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const editUnlocked = await isEditUnlocked();

  return (
    <div className="min-h-full">
      <Sidebar />
      <div className="md:pl-64 flex min-h-full flex-col">
        <Topbar editUnlocked={editUnlocked} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
