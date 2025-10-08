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
import { useUpdateCategoryWithId } from "@/api/categoriesApi";
import { AlertCircleIcon } from "lucide-react";
import {
  UpdateCategoryForm,
  UpdateCategorySchema,
} from "@/app/(public)/categories/new/schema";
import { CategoryResponseDto } from "@/api/type";
import { toast } from "sonner";

interface EditCategoryFormProps {
  category: CategoryResponseDto;
  onSuccess?: () => void;
  onCancel?: () => void;
  isPending?: boolean;
}

export default function CategoryEditForm({
  category,
  onSuccess,
  onCancel,
  isPending: externalIsPending,
}: EditCategoryFormProps) {
  const updateMutation = useUpdateCategoryWithId();

  const form = useForm<UpdateCategoryForm>({
    resolver: zodResolver(UpdateCategorySchema),
    defaultValues: {
      name: category.name || "",
      description: category.description || "",
    },
  });

  const {
    isPending: isUpdatePending,
    isError,
    error,
    isSuccess,
  } = updateMutation;

  const combinedIsPending = isUpdatePending || externalIsPending;

  async function onSubmit(data: UpdateCategoryForm) {
    try {
      await updateMutation.mutateAsync({
        id: category.id,
        updateCategoryDto: data,
      });
      onSuccess?.();
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Category update failed. Please try again.");
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
            {combinedIsPending ? "Updating..." : "Update Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}