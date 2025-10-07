import { useUpdateUserProfile } from "@/api/settingsApi";
import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { UserForm, UserSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ApiResponse, CombinedSettingsDto, UserResponseDto } from "@/api/type";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type Props = {
  userData: UserResponseDto | undefined;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<ApiResponse<CombinedSettingsDto>, Error>>;
};

export default function EditUserForm({ userData, refetch }: Props) {
  const { mutate: updateUserMutation, isPending: isUpdatingUser } =
    useUpdateUserProfile();

  const form = useForm<UserForm>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const { handleSubmit, reset } = form;

  const handleUserProfileSubmit: SubmitHandler<UserForm> = (data) => {
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

  useEffect(() => {
    if (userData) {
      reset({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        username: userData.username || "",
        email: userData.email || "",
        password: "",
      });
    }
  }, [userData, reset]);

  return (
    <Card className="shadow-none">
      <CardHeader className="p-4 pb-2 border-b border-gray-200">
        <CardTitle className="text-2xl font-bold text-primary">
          User Profile
        </CardTitle>
        <CardDescription>
          Manage your personal information and account settings
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit(handleUserProfileSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
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
              name="username"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="••••••••" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end pt-6">
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isUpdatingUser}
            >
              {isUpdatingUser ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
