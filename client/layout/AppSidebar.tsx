"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Archive,
  ClipboardList,
  DollarSign,
  House,
  Blocks,
  Truck,
} from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

export default function AppSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: House,
    },
    {
      title: "Sales",
      url: "#",
      icon: DollarSign,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Archive,
    },
    {
      title: "Reports",
      url: "#",
      icon: ClipboardList,
    },
    {
      title: "Categories",
      url: "#",
      icon: Blocks,
    },
    {
      title: "Suppliers",
      url: "#",
      icon: Truck,
    },
  ];
  return (
    <Sidebar collapsible="icon" className="py-4">
      <div className={`w-fit mb-2 ${open ? "self-end pe-2" : "self-center"}`}>
        <SidebarTrigger className="border-0 [&>svg]:!size-6 hover:bg-tertiary w-12 h-12" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="h-full gap-4">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title} className="w-full">
                  <SidebarMenuButton asChild className="hover:bg-tertiary h-16">
                    <a href={item.url}>
                      <div>
                        <item.icon
                          className={pathname == item.url ? "text-primary" : ""}
                        />
                      </div>
                      <span
                        className={`text-lg text-left ${
                          pathname == item.url
                            ? "font-bold text-xl text-primary"
                            : ""
                        }`}
                      >
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
