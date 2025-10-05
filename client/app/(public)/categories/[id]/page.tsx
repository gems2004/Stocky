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
import { UpdateCategoryForm, UpdateCategorySchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  useUpdateCategory,
  useGetCategoryById,
  useDeleteCategory,
} from "@/api/categoriesApi";
import { useRouter, useParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import H3 from "@/components/typography/H3";

export default function UpdateCategory() {
  const { id } = useParams();
  if (!id) return;
  const categoryId = parseInt(id.toString());
  const { data: categoryData, isLoading: categoryLoading } =
    useGetCategoryById(categoryId);

  const category = categoryData?.success ? categoryData.data : null;

  const form = useForm<UpdateCategoryForm>({
    resolver: zodResolver(UpdateCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const {
    mutateAsync: handleUpdateCategory,
    isPending,
    isError,
    error,
    isSuccess,
  } = useUpdateCategory(categoryId);

  const {
    mutateAsync: handleDeleteCategory,
    isPending: isDeleting,
    isError: isDeleteError,
    error: deleteError,
    isSuccess: isDeleteSuccess,
  } = useDeleteCategory();

  const router = useRouter();

  async function handleDelete() {
    if (
      confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      try {
        await handleDeleteCategory(categoryId);
        router.push("/categories");
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  }

  // Set initial form values when category data is loaded
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || "",
      });
    }
  }, [category, form]);

  async function onSubmit(data: UpdateCategoryForm) {
    try {
      await handleUpdateCategory(data);
      // After successful update, navigate back to categories page
      setTimeout(() => {
        router.push("/categories");
      }, 2000); // Wait 2 seconds to show success message
    } catch (error) {
      console.error("Update error:", error);
    }
  }

  if (categoryLoading) {
    return <div className="p-4 max-w-4xl mx-auto mt-8">Loading...</div>;
  }

  if (!category) {
    return <div className="p-4 max-w-4xl mx-auto mt-8">Category not found</div>;
  }

  return (
    <>
      <H3 className="pt-4 pb-8">Update Category:</H3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
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

          {isError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Category update failed!</AlertTitle>
              <AlertDescription>
                <p>
                  {error?.message ||
                    "Category update failed. Please try again."}
                </p>
              </AlertDescription>
            </Alert>
          )}
          {isSuccess && (
            <Alert variant="success">
              <AlertCircleIcon />
              <AlertTitle>Category update success!</AlertTitle>
              <AlertDescription>
                <p>Category updated successfully.</p>
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
              {isDeleting ? "Deleting..." : "Delete Category"}
            </Button>
            <div className="flex gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/categories")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Category"}
              </Button>
            </div>
          </div>

          {isDeleteError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Category deletion failed!</AlertTitle>
              <AlertDescription>
                <p>
                  {deleteError?.message ||
                    "Category deletion failed. Please try again."}
                </p>
              </AlertDescription>
            </Alert>
          )}
          {isDeleteSuccess && (
            <Alert variant="success">
              <AlertCircleIcon />
              <AlertTitle>Category deletion success!</AlertTitle>
              <AlertDescription>
                <p>Category deleted successfully.</p>
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Form>
    </>
  );
}
