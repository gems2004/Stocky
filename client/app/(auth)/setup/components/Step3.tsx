import React from "react";
import { UseFormReturn } from "react-hook-form";
import { DatabaseConfigForm, DatabaseType } from "../schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSetupStore } from "@/store/setupState";
import { useSetupDatabaseConfig } from "@/api/setupApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

interface Props {
  form: UseFormReturn<DatabaseConfigForm>;
  previousStep: () => void;
  nextStep: () => void;
}

export default function Step3({ form, previousStep, nextStep }: Props) {
  const { control, handleSubmit } = form;
  const { setDatabaseConfig } = useSetupStore();
  const {
    mutateAsync: setupDatabaseConfig,
    isPending,
    isError,
    error,
  } = useSetupDatabaseConfig();

  async function onSubmit(data: DatabaseConfigForm) {
    setDatabaseConfig({ ...data, port: Number(data.port) });

    // nextStep(); // Uncomment to skip valid db connection requirement
    try {
      let res = await setupDatabaseConfig(data);
      if (res.success) nextStep();
    } catch (error) {}
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-20 justify-center items-center w-1/2">
        <div className="grid grid-cols-2 gap-4 w-full">
          <FormField
            control={control}
            name="type"
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
                    <SelectItem value={DatabaseType.MYSQL}>MySQL</SelectItem>
                    <SelectItem value={DatabaseType.SQLITE}>SQLite</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="database"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Database Name:</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Database Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hostname:</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Hostname" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port:</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Port Number"
                    {...field}
                    type="number"
                    className="no-spinner"
                    min={1}
                    max={65535}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username:</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Database Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password:</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Database Password"
                    {...field}
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="ssl"
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
          <FormField
            control={control}
            name="tablePrefix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{"Table Prefix (Optional):"}</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Table Prefix" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Error connecting to database!</AlertTitle>
              <AlertDescription>
                <p>
                  {error.message ||
                    "Please check database configuration and try again"}
                  .
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex justify-between w-full">
          <Button
            size="xl"
            onClick={previousStep}
            variant={"outline"}
            type="button"
            disabled={isPending}
          >
            Back
          </Button>
          <Button
            size="xl"
            onClick={handleSubmit(onSubmit)}
            type="button"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Next"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
