import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/en?auth=login");
  }

  if ((session.user as { role?: string }).role !== "admin") {
    redirect("/en");
  }

  return (
    <div className="-mt-[70px]">
      <AdminLayoutClient user={session.user}>
        {children}
      </AdminLayoutClient>
    </div>
  );
}
