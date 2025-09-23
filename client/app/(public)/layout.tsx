"use client";
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/layout/AppSidebar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="px-8 py-4 grow">{children}</main>
    </SidebarProvider>
  );
}
