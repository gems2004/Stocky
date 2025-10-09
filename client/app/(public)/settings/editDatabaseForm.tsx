import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatabaseConfigDto } from "@/api/type";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUpdateDatabaseConfig } from "@/api/settingsApi";
import { toast } from "sonner";
import { DatabaseConfigSchema, DatabaseConfigForm } from "./schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatabaseType } from "@/app/(auth)/setup/schema";

type Props = {
  databaseData: DatabaseConfigDto | undefined;
};

export default function EditDatabaseForm({ databaseData }: Props) {
  const {
    mutate: updateDatabaseConfigMutation,
    isPending: isUpdatingDatabase,
  } = useUpdateDatabaseConfig();

  const form = useForm<DatabaseConfigForm>({
    resolver: zodResolver(DatabaseConfigSchema),
    defaultValues: {
      databaseType: DatabaseType.POSTGRES,
      host: "",
      port: "5432",
      databaseName: "",
      tablePrefix: "",
      dbUsername: "",
      dbPassword: "",
      sslEnabled: false,
    },
  });

  const { handleSubmit, reset } = form;

  const handleDatabaseSubmit: SubmitHandler<DatabaseConfigForm> = (data) => {
    const dbData = {
      type: data.databaseType,
      host: data.host,
      port: data.port,
      username: data.dbUsername,
      password: data.dbPassword || "",
      database: data.databaseName,
      ssl: data.sslEnabled,
      tablePrefix: data.tablePrefix || "",
    };

    updateDatabaseConfigMutation(
      { ...dbData, port: Number(dbData.port) },
      {
        onSuccess: () => {
          toast.success("Database configuration updated successfully");
        },
        onError: (error) => {
          toast.error(
            `Failed to update database configuration: ${error.message}`
          );
        },
      }
    );
  };

  useEffect(() => {
    if (databaseData) {
      reset({
        databaseType: databaseData.type || DatabaseType.POSTGRES,
        host: databaseData.host || "",
        port: databaseData.port?.toString() || "5432",
        databaseName: databaseData.database || "",
        tablePrefix: databaseData.tablePrefix || "",
        dbUsername: databaseData.username || "",
        dbPassword: databaseData.password || "",
        sslEnabled: databaseData.ssl,
      });
    }
  }, [databaseData, reset]);

  return (
    <Card className="shadow-none">
      <CardHeader className="p-4 pb-2 border-b border-gray-200">
        <CardTitle className="text-2xl font-bold text-primary">
          Database Connection
        </CardTitle>
        <CardDescription>
          Configure your database connection settings
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit(handleDatabaseSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="databaseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Database Type:</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a database type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={DatabaseType.POSTGRES}>
                          PostgreSQL
                        </SelectItem>
                        <SelectItem value={DatabaseType.MYSQL}>
                          MySQL
                        </SelectItem>
                        <SelectItem value={DatabaseType.SQLITE}>
                          SQLite
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="databaseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tablePrefix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Prefix</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dbUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dbPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="sslEnabled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"SSL Connection (Advanced):"}</FormLabel>
                  <Select
                    onValueChange={(val: string) =>
                      field.onChange(val === "true")
                    }
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Use SSL? Default is Enabled" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end pt-6">
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isUpdatingDatabase}
            >
              {isUpdatingDatabase ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
