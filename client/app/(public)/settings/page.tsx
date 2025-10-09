"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetCombinedSettings } from "@/api/settingsApi";
import EditUserForm from "./editUserForm";
import EditShopForm from "./editShopForm";
import EditDatabaseForm from "./editDatabaseForm";

export default function Settings() {
  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCombinedSettings();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (isError || (settings && "error" in settings)) {
    const errorMessage =
      error?.message ||
      (settings && "error" in settings
        ? settings.error.message
        : "Unknown error");
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="mb-8 px-4">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <Card className="shadow-none">
          <CardHeader className="p-4 pb-2 border-b border-gray-200">
            <CardTitle className="text-2xl font-bold text-primary">
              Error Loading Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-destructive">
              Failed to load settings: {errorMessage}
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8 px-4">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <EditUserForm userData={settings?.data.user} />
        <EditShopForm shopData={settings?.data.shopInfo || undefined} />
        <EditDatabaseForm
          databaseData={settings?.data.databaseConfig || undefined}
        />
      </div>
    </div>
  );
}
