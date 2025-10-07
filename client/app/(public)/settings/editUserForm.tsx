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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ApiResponse, CombinedSettingsDto, UserResponseDto } from "@/api/type";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

type Props = {
  userData: UserResponseDto | undefined;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<ApiResponse<CombinedSettingsDto>, Error>>;
};

export default function EditUserForm({ userData, refetch }: Props) {
  const { mutate: updateUserMutation, isPending: isUpdatingUser } =
    useUpdateUserProfile();

  const {
    register: registerUserProfile,
    handleSubmit: handleSubmitUserProfile,
    formState: { errors: userProfileErrors },
    reset: resetUserForm,
    setValue: setUserProfileValue,
    watch: watchUserProfile,
  } = useForm<UserForm>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
    },
  });

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
      resetUserForm({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        username: userData.username || "",
        email: userData.email || "",
        password: "",
      });
    }
  }, [userData, resetUserForm]);

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
            <Input id="email" type="email" {...registerUserProfile("email")} />
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
  );
}
