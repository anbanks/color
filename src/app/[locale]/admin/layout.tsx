import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/en/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111]" style={{ paddingTop: 0, marginTop: "-70px" }}>
      <div className="flex">
        <AdminSidebar user={session.user} />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
