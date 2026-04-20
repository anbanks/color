"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import {
  Monitor,
  SwatchBook,
  Timer,
  Tags,
  ScrollText,
  Settings,
  LogOut,
  ChevronUp,
  User,
} from "lucide-react";
import { LogoDrop } from "@/components/logo-drop";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const base = `${prefix}/admin`;

  const navItems = [
    { href: "", label: t.admin.dashboard, icon: Monitor },
    { href: "/palettes", label: t.admin.palettesTitle, icon: SwatchBook },
    { href: "/queue", label: "Queue", icon: Timer },
    { href: "/tags", label: "Tags", icon: Tags },
    { href: "/logs", label: "Logs", icon: ScrollText },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon" className="bg-[#ffffff] dark:bg-[#1a1a1a] border-r border-gray-200/60 dark:border-white/[0.06] [&_*:focus-visible]:ring-0 [&_*:focus-visible]:outline-none">
      <SidebarHeader>
        <Link
          href={base}
          className="logo flex items-center gap-2.5 px-2 py-2 text-sidebar-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <LogoDrop className="h-[30px] w-[30px] shrink-0" />
          <span className="truncate text-[19px] font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Color Grid
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const href = `${base}${item.href}`;
                const isActive =
                  item.href === ""
                    ? pathname === base || pathname === `${base}/`
                    : pathname.startsWith(href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      size="lg"
                      render={<Link href={href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className="text-[15px] [&>svg]:size-5 group-data-[collapsible=icon]:justify-center"
                    >
                      <Icon />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <SidebarMenuButton
                size="lg"
                render={<DropdownMenuTrigger />}
                tooltip={user.name || user.email || "Account"}
                className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
              >
                <div className="bg-sidebar-accent text-sidebar-accent-foreground flex aspect-square size-8 items-center justify-center rounded-full text-xs font-semibold">
                  {user.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              >
                <DropdownMenuItem
                  render={<Link href={`${prefix}/account`} />}
                  className="cursor-pointer"
                >
                  <User className="mr-2 size-4" />
                  {t.menu.myAccount}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 size-4" />
                  {t.menu.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
