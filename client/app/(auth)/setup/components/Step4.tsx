import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AdminUserForm } from "../schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSetupStore } from "@/store/setupState";
import { useSetupAdminInfo } from "@/api/setupApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

interface Props {
  form: UseFormReturn<AdminUserForm>;
  previousStep: () => void;
  nextStep: () => void;
}

export default function Step4({ form, previousStep, nextStep }: Props) {
  const { control, handleSubmit } = form;
  const { setUser } = useSetupStore();

  const {
    mutateAsync: setupAdminInfo,
    isPending,
    isError,
    error,
  } = useSetupAdminInfo();

  async function onSubmit(data: AdminUserForm) {
    setUser({
      email: data.email,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    // nextStep(); // Uncomment to skip admin creation
    try {
      let res = await setupAdminInfo(data);
      if (res.success) nextStep();
    } catch (error) {}
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
            name="firstName"
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
            name="lastName"
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
          {isError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Error setting up shop info!</AlertTitle>
              <AlertDescription>
                <p>
                  {error.message ||
                    "Failed to setup Admin info. Please try again."}
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
