"use client";
import React, { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/layout/AppSidebar";
import { useGetSetupStatus } from "@/api/setupApi";
import { useRouter } from "next/navigation";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: status, isSuccess } = useGetSetupStatus();
  const router = useRouter();

  useEffect(() => {
    if (status?.success && !status.data.isSetupComplete) {
      router.push("/setup");
    }
  }, [isSuccess]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-8 mx-auto w-full max-w-6xl">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
