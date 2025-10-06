"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React, { useEffect } from "react";
import { UpdateUserForm, UpdateUserSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  useUpdateUser,
  useGetUserById,
  useDeleteUser,
} from "@/api/usersApi";
import { useRouter, useParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import H3 from "@/components/typography/H3";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UpdateEmployee() {
  const { id } = useParams();
  if (!id) return;
  const userId = parseInt(id.toString());
  const { data: userData, isLoading: userLoading } =
    useGetUserById(userId);

  const user = userData?.success ? userData.data : null;

  const form = useForm<UpdateUserForm>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "",
    },
  });

  const {
    mutateAsync: handleUpdateUser,
    isPending,
    isError,
    error,
    isSuccess,
  } = useUpdateUser(userId);

  const {
    mutateAsync: handleDeleteUser,
    isPending: isDeleting,
    isError: isDeleteError,
    error: deleteError,
    isSuccess: isDeleteSuccess,
  } = useDeleteUser();

  const router = useRouter();

  async function handleDelete() {
    if (
      confirm(
        "Are you sure you want to delete this employee? This action cannot be undone."
      )
    ) {
      try {
        await handleDeleteUser(userId);
        router.push("/employees");
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  }

  // Set initial form values when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    }
  }, [user, form]);

  async function onSubmit(data: UpdateUserForm) {
    try {
      await handleUpdateUser(data);
      // After successful update, navigate back to employees page
      setTimeout(() => {
        router.push("/employees");
      }, 2000); // Wait 2 seconds to show success message
    } catch (error) {
      console.error("Update error:", error);
    }
  }

  if (userLoading) {
    return <div className="p-4 max-w-4xl mx-auto mt-8">Loading...</div>;
  }

  if (!user) {
    return <div className="p-4 max-w-4xl mx-auto mt-8">Employee not found</div>;
  }

  return (
    <>
      <H3 className="pt-4 pb-8">Update Employee:</H3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username:</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
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
                  <FormLabel>Email:</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name:</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
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
                  <FormLabel>Last Name:</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role:</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="CASHIER">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Employee update failed!</AlertTitle>
              <AlertDescription>
                <p>
                  {error?.message || "Employee update failed. Please try again."}
                </p>
              </AlertDescription>
            </Alert>
          )}
          {isSuccess && (
            <Alert variant="success">
              <AlertCircleIcon />
              <AlertTitle>Employee update success!</AlertTitle>
              <AlertDescription>
                <p>Employee updated successfully.</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between gap-4 pt-4">
            <Button
              variant="destructive"
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Employee"}
            </Button>
            <div className="flex gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/employees")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Employee"}
              </Button>
            </div>
          </div>

          {isDeleteError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Employee deletion failed!</AlertTitle>
              <AlertDescription>
                <p>
                  {deleteError?.message ||
                    "Employee deletion failed. Please try again."}
                </p>
              </AlertDescription>
            </Alert>
          )}
          {isDeleteSuccess && (
            <Alert variant="success">
              <AlertCircleIcon />
              <AlertTitle>Employee deletion success!</AlertTitle>
              <AlertDescription>
                <p>Employee deleted successfully.</p>
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Form>
    </>
  );
}