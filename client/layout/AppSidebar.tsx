"use client";
import { useLogout } from "@/api/loginApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Archive,
  ClipboardList,
  LayoutDashboard,
  ShoppingBasket,
  PackageSearch,
  Users,
  Receipt,
  Settings,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { open } = useSidebar();
  const { mutateAsync: logout } = useLogout();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: Receipt,
    },
    {
      title: "POS",
      url: "#",
      icon: ShoppingBasket,
    },
    {
      title: "Products",
      url: "/products",
      icon: PackageSearch,
    },
    {
      title: "Inventory",
      url: "#",
      icon: Archive,
    },
    {
      title: "Employees",
      url: "/employees",
      icon: Users,
    },
    {
      title: "Reports",
      url: "#",
      icon: ClipboardList,
    },
  ];
  async function handleLogout(): Promise<void> {
    let res = await logout();
    if (res.success) router.push("/login");
  }

  return (
    <Sidebar collapsible="icon" className="py-4">
      <SidebarHeader className="flex flex-row items-center justify-between px-3 mb-2">
        {open && <h1 className="text-lg font-bold ml-3">Stocky</h1>}
        <SidebarTrigger className="border-0 [&>svg]:!size-6 hover:bg-primary/10 w-12 h-12" />
      </SidebarHeader>
      <SidebarContent className="flex flex-col justify-between h-full">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="h-full gap-2">
              {menuItems.map((item) => (
                <SidebarMenuItem
                  onClick={() => router.push(item.url)}
                  key={item.title}
                  className={`hover:bg-primary/10 rounded-lg px-3 py-2 ${
                    pathname == item.url ? "bg-primary hover:bg-primary" : ""
                  }`}
                >
                  <SidebarMenuButton
                    tooltip={{
                      children: item.title,
                      className: "text-primary-foreground bg-primary",
                    }}
                    className="hover:bg-transparent active:bg-transparent data-[active=true]:bg-transparent data-[state=active]:bg-transparent hover:text-inherit active:text-inherit data-[active=true]:text-inherit data-[state=active]:text-inherit"
                  >
                    <div>
                      <item.icon
                        className={
                          pathname == item.url ? "text-primary-foreground" : ""
                        }
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        pathname == item.url ? "text-primary-foreground" : ""
                      }`}
                    >
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="h-full gap-2">
              <SidebarMenuItem
                onClick={() => router.push("/settings")}
                className={`hover:bg-primary/10 rounded-lg px-3 py-2 ${
                  pathname == "/settings" ? "bg-primary hover:bg-primary" : ""
                }`}
              >
                <SidebarMenuButton
                  tooltip={{
                    children: "Settings",
                    className: "text-primary-foreground bg-primary",
                  }}
                  className="hover:bg-transparent active:bg-transparent data-[active=true]:bg-transparent data-[state=active]:bg-transparent hover:text-inherit active:text-inherit data-[active=true]:text-inherit data-[state=active]:text-inherit"
                >
                  <div>
                    <Settings
                      className={`text-sm font-medium ${
                        pathname == "/settings" ? "text-primary-foreground" : ""
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      pathname == "/settings" ? "text-primary-foreground" : ""
                    }`}
                  >
                    Settings
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="hover:bg-primary/10 rounded-lg px-3 py-2">
                <SidebarMenuButton
                  tooltip={{
                    children: "Logout",
                    className: "text-primary-foreground bg-primary",
                  }}
                  className="hover:bg-transparent active:bg-transparent data-[active=true]:bg-transparent data-[state=active]:bg-transparent hover:text-inherit active:text-inherit data-[active=true]:text-inherit data-[state=active]:text-inherit"
                  asChild
                >
                  <Dialog>
                    <DialogTrigger className="cursor-pointer flex items-center gap-2 p-2 w-full">
                      <div>
                        <LogOut />
                      </div>
                      <span className="text-sm font-medium">Logout</span>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Are you sure you want to logout?
                        </DialogTitle>
                      </DialogHeader>
                      <DialogDescription>
                        You will be logged out of your account, you will need to
                        login again to use the system.
                      </DialogDescription>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          variant="destructive"
                          onClick={handleLogout}
                        >
                          Logout
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
