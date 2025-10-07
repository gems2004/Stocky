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
  useUpdateUserProfile,
  useUpdateShopInfo,
  useUpdateDatabaseConfig,
} from "@/api/settingsApi";
import { useEffect } from "react";
import { toast } from "sonner";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  userProfileSchema,
  shopInfoSchema,
  databaseConfigSchema,
} from "./schema";

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
    register: registerUserProfile,
    handleSubmit: handleSubmitUserProfile,
    formState: { errors: userProfileErrors },
    reset: resetUserProfile,
    setValue: setUserProfileValue,
    watch: watchUserProfile,
  } = useForm<z.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const {
    register: registerShopInfo,
    handleSubmit: handleSubmitShopInfo,
    formState: { errors: shopInfoErrors },
    reset: resetShopInfo,
    setValue: setShopInfoValue,
    watch: watchShopInfo,
  } = useForm<z.infer<typeof shopInfoSchema>>({
    resolver: zodResolver(shopInfoSchema),
    defaultValues: {
      shopName: "",
      shopAddress: "",
      phone: "",
      shopEmail: "",
      taxRate: 0,
      currency: "USD",
      businessType: "general_retail",
      website: "",
    },
  });

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
      const userData = settings.data.user;
      const shopData = settings.data.shopInfo;
      const dbData = settings.data.databaseConfig;

      if (userData) {
        resetUserProfile({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          username: userData.username || "",
          email: userData.email || "",
          password: "",
        });
      }

      if (shopData) {
        resetShopInfo({
          shopName: shopData.name || "",
          shopAddress: shopData.address || "",
          phone: shopData.phone || "",
          shopEmail: shopData.email || "",
          taxRate: shopData.taxRate || 0,
          currency: shopData.currency || "USD",
          businessType: shopData.businessType || "general_retail",
          website: shopData.website || "",
        });
      }

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
  }, [settings, resetUserProfile, resetShopInfo, resetDatabaseConfig]);

  const { mutate: updateUserMutation, isPending: isUpdatingUser } =
    useUpdateUserProfile();
  const { mutate: updateShopInfoMutation, isPending: isUpdatingShop } =
    useUpdateShopInfo();
  const {
    mutate: updateDatabaseConfigMutation,
    isPending: isUpdatingDatabase,
  } = useUpdateDatabaseConfig();

  const handleUserProfileSubmit: SubmitHandler<
    z.infer<typeof userProfileSchema>
  > = (data) => {
    const userData = {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      email: data.email,
      password: data.password || undefined, // Only send password if changed
    };

    updateUserMutation(userData, {
      onSuccess: () => {
        toast.success("User profile updated successfully");
        refetch(); // Refresh settings data after update
      },
      onError: (error) => {
        toast.error(`Failed to update user profile: ${error.message}`);
      },
    });
  };

  const handleShopInfoSubmit: SubmitHandler<z.infer<typeof shopInfoSchema>> = (
    data
  ) => {
    const shopData = {
      name: data.shopName,
      address: data.shopAddress,
      phone: data.phone || "",
      email: data.shopEmail || "",
      taxRate: data.taxRate || 0,
      currency: data.currency,
      businessType: data.businessType,
      website: data.website || "", // Not available in the form but in DTO
    };

    updateShopInfoMutation(shopData, {
      onSuccess: () => {
        toast.success("Shop information updated successfully");
        refetch(); // Refresh settings data after update
      },
      onError: (error) => {
        toast.error(`Failed to update shop information: ${error.message}`);
      },
    });
  };

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
        <Card className="shadow-none">
          <CardHeader className="p-4 pb-2 border-b border-gray-200">
            <CardTitle className="text-2xl font-bold text-primary">
              User Profile
            </CardTitle>
            <CardDescription>
              Manage your personal information and account settings
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitUserProfile(handleUserProfileSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...registerUserProfile("firstName")} />
                  {userProfileErrors.firstName && (
                    <p className="text-destructive text-sm mt-1">
                      {userProfileErrors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...registerUserProfile("lastName")} />
                  {userProfileErrors.lastName && (
                    <p className="text-destructive text-sm mt-1">
                      {userProfileErrors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...registerUserProfile("username")} />
                {userProfileErrors.username && (
                  <p className="text-destructive text-sm mt-1">
                    {userProfileErrors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...registerUserProfile("email")}
                />
                {userProfileErrors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {userProfileErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...registerUserProfile("password")}
                  placeholder="••••••••"
                />
                {userProfileErrors.password && (
                  <p className="text-destructive text-sm mt-1">
                    {userProfileErrors.password.message}
                  </p>
                )}
              </div>

              </CardContent>
            <CardFooter className="flex justify-end pt-2">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isUpdatingUser}
              >
                {isUpdatingUser ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Shop Info Section */}
        <Card className="shadow-none">
          <CardHeader className="p-4 pb-2 border-b border-gray-200">
            <CardTitle className="text-2xl font-bold text-primary">
              Shop Information
            </CardTitle>
            <CardDescription>
              Manage your shop details and business information
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitShopInfo(handleShopInfoSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input id="shopName" {...registerShopInfo("shopName")} />
                {shopInfoErrors.shopName && (
                  <p className="text-destructive text-sm mt-1">
                    {shopInfoErrors.shopName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopAddress">Shop Address</Label>
                <Input id="shopAddress" {...registerShopInfo("shopAddress")} />
                {shopInfoErrors.shopAddress && (
                  <p className="text-destructive text-sm mt-1">
                    {shopInfoErrors.shopAddress.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...registerShopInfo("phone")} />
                {shopInfoErrors.phone && (
                  <p className="text-destructive text-sm mt-1">
                    {shopInfoErrors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopEmail">Shop Email Address</Label>
                <Input
                  id="shopEmail"
                  type="email"
                  {...registerShopInfo("shopEmail")}
                />
                {shopInfoErrors.shopEmail && (
                  <p className="text-destructive text-sm mt-1">
                    {shopInfoErrors.shopEmail.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    {...registerShopInfo("taxRate", { valueAsNumber: true })}
                  />
                  {shopInfoErrors.taxRate && (
                    <p className="text-destructive text-sm mt-1">
                      {shopInfoErrors.taxRate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    key={`currency-select-${watchShopInfo("currency")}`}
                    value={watchShopInfo("currency") || undefined}
                    onValueChange={(value) =>
                      setShopInfoValue("currency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                      <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                      <SelectItem value="SAR">Saudi Riyal (SAR)</SelectItem>
                      <SelectItem value="SYP">Syrian Pound (SYP)</SelectItem>
                    </SelectContent>
                  </Select>
                  {shopInfoErrors.currency && (
                    <p className="text-destructive text-sm mt-1">
                      {shopInfoErrors.currency.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select
                  key={`businessType-select-${watchShopInfo("businessType")}`}
                  value={watchShopInfo("businessType") || undefined}
                  onValueChange={(value) =>
                    setShopInfoValue("businessType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="general_retail">General Retail</SelectItem>
                  </SelectContent>
                </Select>
                {shopInfoErrors.businessType && (
                  <p className="text-destructive text-sm mt-1">
                    {shopInfoErrors.businessType.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isUpdatingShop}
              >
                {isUpdatingShop ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>

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
                      setDatabaseConfigValue(
                        "databaseType",
                        value
                      )
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
