"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  useGetCombinedSettings,
  useUpdateDatabaseConfig,
} from "@/api/settingsApi";
import { useEffect } from "react";
import { toast } from "sonner";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { databaseConfigSchema } from "./schema";
import EditUserForm from "./editUserForm";
import EditShopForm from "./editShopForm";

export default function Settings() {
  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCombinedSettings();
  // Initialize forms

  const {
    register: registerDatabaseConfig,
    handleSubmit: handleSubmitDatabaseConfig,
    formState: { errors: databaseConfigErrors },
    reset: resetDatabaseConfig,
    setValue: setDatabaseConfigValue,
    watch: watchDatabaseConfig,
  } = useForm<z.infer<typeof databaseConfigSchema>>({
    resolver: zodResolver(databaseConfigSchema),
    defaultValues: {
      databaseType: "postgres",
      host: "",
      port: "5432",
      databaseName: "",
      tablePrefix: "",
      dbUsername: "",
      dbPassword: "",
      sslEnabled: "disabled",
    },
  });

  // Set default values when settings data is loaded
  useEffect(() => {
    if (settings && "data" in settings) {
      const dbData = settings.data.databaseConfig;

      if (dbData) {
        resetDatabaseConfig({
          databaseType: dbData.type || "postgres",
          host: dbData.host || "",
          port: dbData.port?.toString() || "5432",
          databaseName: dbData.database || "",
          tablePrefix: dbData.tablePrefix || "",
          dbUsername: dbData.username || "",
          dbPassword: dbData.password || "",
          sslEnabled: dbData.ssl ? "enabled" : "disabled",
        });
      }
    }
  }, [settings, resetDatabaseConfig]);

  const {
    mutate: updateDatabaseConfigMutation,
    isPending: isUpdatingDatabase,
  } = useUpdateDatabaseConfig();

  const handleDatabaseSubmit: SubmitHandler<
    z.infer<typeof databaseConfigSchema>
  > = (data) => {
    const dbData = {
      type: data.databaseType,
      host: data.host,
      port: data.port,
      username: data.dbUsername,
      password: data.dbPassword || "",
      database: data.databaseName,
      ssl: data.sslEnabled === "enabled",
      tablePrefix: data.tablePrefix || "",
    };

    updateDatabaseConfigMutation(dbData, {
      onSuccess: () => {
        toast.success("Database configuration updated successfully");
        refetch(); // Refresh settings data after update
      },
      onError: (error) => {
        toast.error(
          `Failed to update database configuration: ${error.message}`
        );
      },
    });
  };

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
        {/* User Profile Section */}
        <EditUserForm userData={settings?.data.user} refetch={refetch} />

        {/* Shop Info Section */}
        <EditShopForm
          shopData={settings?.data.shopInfo || undefined}
          refetch={refetch}
        />

        {/* Database Connection Section */}
        <Card className="shadow-none">
          <CardHeader className="p-4 pb-2 border-b border-gray-200">
            <CardTitle className="text-2xl font-bold text-primary">
              Database Connection
            </CardTitle>
            <CardDescription>
              Configure your database connection settings
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitDatabaseConfig(handleDatabaseSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="databaseType">Database Type</Label>
                  <Select
                    value={watchDatabaseConfig("databaseType")}
                    onValueChange={(value) =>
                      setDatabaseConfigValue("databaseType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select database type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgres">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                    </SelectContent>
                  </Select>
                  {databaseConfigErrors.databaseType && (
                    <p className="text-destructive text-sm mt-1">
                      {databaseConfigErrors.databaseType.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input id="port" {...registerDatabaseConfig("port")} />
                  {databaseConfigErrors.port && (
                    <p className="text-destructive text-sm mt-1">
                      {databaseConfigErrors.port.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input id="host" {...registerDatabaseConfig("host")} />
                {databaseConfigErrors.host && (
                  <p className="text-destructive text-sm mt-1">
                    {databaseConfigErrors.host.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="databaseName">Database Name</Label>
                <Input
                  id="databaseName"
                  {...registerDatabaseConfig("databaseName")}
                />
                {databaseConfigErrors.databaseName && (
                  <p className="text-destructive text-sm mt-1">
                    {databaseConfigErrors.databaseName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tablePrefix">Table Prefix</Label>
                <Input
                  id="tablePrefix"
                  {...registerDatabaseConfig("tablePrefix")}
                />
                {databaseConfigErrors.tablePrefix && (
                  <p className="text-destructive text-sm mt-1">
                    {databaseConfigErrors.tablePrefix.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dbUsername">Username</Label>
                  <Input
                    id="dbUsername"
                    {...registerDatabaseConfig("dbUsername")}
                  />
                  {databaseConfigErrors.dbUsername && (
                    <p className="text-destructive text-sm mt-1">
                      {databaseConfigErrors.dbUsername.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dbPassword">Password</Label>
                  <Input
                    id="dbPassword"
                    type="password"
                    {...registerDatabaseConfig("dbPassword")}
                    placeholder="••••••••"
                  />
                  {databaseConfigErrors.dbPassword && (
                    <p className="text-destructive text-sm mt-1">
                      {databaseConfigErrors.dbPassword.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sslEnabled">SSL Encryption</Label>
                <Select
                  value={watchDatabaseConfig("sslEnabled")}
                  onValueChange={(value) =>
                    setDatabaseConfigValue("sslEnabled", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select SSL option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
                {databaseConfigErrors.sslEnabled && (
                  <p className="text-destructive text-sm mt-1">
                    {databaseConfigErrors.sslEnabled.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isUpdatingDatabase}
              >
                {isUpdatingDatabase ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
