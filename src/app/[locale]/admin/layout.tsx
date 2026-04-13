import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";

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
    <div className="min-h-screen bg-white dark:bg-[#111]" style={{ paddingTop: 0, marginTop: "-70px" }}>
      <AdminLayoutClient user={session.user}>
        {children}
      </AdminLayoutClient>
    </div>
  );
}
