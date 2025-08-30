import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { AdminUserForm, AdminUserSchema } from "../schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

interface Props {
  form: UseFormReturn<AdminUserForm>;
  previousStep: () => void;
  nextStep: () => void;
}

export default function Step4({ form, previousStep, nextStep }: Props) {
  const { control, handleSubmit } = form;

  function onSubmit(data: AdminUserForm) {
    console.log(data);
    nextStep();
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-20 justify-center items-center w-1/2">
        <div className="grid grid-cols-2 gap-4 w-full">
          <FormField
            control={control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username:</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email:</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Personal Email"
                    {...field}
                    type="email"
                  />
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
                <FormLabel>password:</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter password"
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password:</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Confirm Password"
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
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name:</FormLabel>
                <FormControl>
                  <Input placeholder="Enter First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{"Last Name (Optional):"}</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Last Name" {...field} />
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
