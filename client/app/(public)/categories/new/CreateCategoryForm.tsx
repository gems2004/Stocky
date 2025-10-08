"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useCreateCategory } from "@/api/categoriesApi";
import { AlertCircleIcon } from "lucide-react";
import {
  CreateCategoryForm,
  CreateCategorySchema,
} from "@/app/(public)/categories/new/schema";
import { toast } from "sonner";

interface CreateCategoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isPending?: boolean;
}

export default function CategoryCreateForm({
  onSuccess,
  onCancel,
  isPending: externalIsPending,
}: CreateCategoryFormProps) {
  const form = useForm<CreateCategoryForm>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: "",
    },
  });

  const {
    mutateAsync: handleCreateCategory,
    isPending,
    isError,
    error,
    isSuccess,
  } = useCreateCategory();

  const combinedIsPending = isPending || externalIsPending;

  async function onSubmit(data: CreateCategoryForm) {
    try {
      await handleCreateCategory(data);
      onSuccess?.();
      form.reset();
      toast.success("Category created successfully");
    } catch (error) {
      console.error("Creation error:", error);
      toast.error("Category creation failed. Please try again.");
    }
  }

  return (
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
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              form.reset();
              onCancel?.();
            }}
            disabled={combinedIsPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={combinedIsPending}>
            {combinedIsPending ? "Creating..." : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
