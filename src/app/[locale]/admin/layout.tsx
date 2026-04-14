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
    <div className="-mt-[70px]">
      <AdminLayoutClient user={session.user}>
        {children}
      </AdminLayoutClient>
    </div>
  );
}
