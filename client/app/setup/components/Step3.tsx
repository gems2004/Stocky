import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import {
  DatabaseConfigForm,
  DatabaseConfigSchema,
  DatabaseType,
} from "../schema";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

interface Props {
  form: UseFormReturn<DatabaseConfigForm>;
  previousStep: () => void;
  nextStep: () => void;
}

export default function Step3({ form, previousStep, nextStep }: Props) {
  const { control, handleSubmit } = form;

  function onSubmit(data: DatabaseConfigForm) {
    console.log(data);
    nextStep();
  }
  return (
    <Form {...form}>
      <form className="flex flex-col gap-20 justify-center items-center w-1/2">
        <div className="grid grid-cols-2 gap-4 w-full">
          <FormField
            control={control}
            name="db_type"
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
            name="db_name"
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
            name="db_username"
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
            name="db_password"
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
                  onValueChange={(val) => field.onChange(val === "true")}
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
            name="table_prefix"
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
        </div>
        <div className="flex justify-between w-full">
          <Button
            size="xl"
            onClick={previousStep}
            variant={"outline"}
            type="button"
          >
            Back
          </Button>
          <Button size="xl" onClick={handleSubmit(onSubmit)} type="button">
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
}
