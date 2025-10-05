"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useCreateCategory } from "@/api/categoriesApi";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import H3 from "@/components/typography/H3";
import { CreateCategoryForm, CreateCategorySchema } from "./schema";

export default function NewCategory() {
  const form = useForm<CreateCategoryForm>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const {
    mutateAsync: handleCreateCategory,
    isPending,
    isError,
    error,
    isSuccess,
  } = useCreateCategory();
  const router = useRouter();

  async function onSubmit(data: CreateCategoryForm) {
    try {
      await handleCreateCategory(data);
      setTimeout(() => {
        router.push("/categories");
      }, 2000); // Wait 2 seconds to show success message
    } catch (error) {
      console.error("Creation error:", error);
    }
  }

  return (
    <>
      <H3 className="pt-4 pb-8">Create New Category:</H3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name:</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional):</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter category description"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Category creation failed!</AlertTitle>
              <AlertDescription>
                <p>
                  {error?.message ||
                    "Category creation failed. Please try again."}
                </p>
              </AlertDescription>
            </Alert>
          )}
          {isSuccess && (
            <Alert variant="success">
              <AlertCircleIcon />
              <AlertTitle>Category creation success!</AlertTitle>
              <AlertDescription>
                <p>Category created successfully.</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/categories")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
