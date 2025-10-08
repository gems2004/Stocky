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
import { useUpdateSupplier } from "@/api/suppliersApi";
import { AlertCircleIcon } from "lucide-react";
import {
  UpdateSupplierForm,
  UpdateSupplierSchema,
} from "@/app/(public)/suppliers/new/schema";
import { SupplierResponseDto } from "@/api/type";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface EditSupplierFormProps {
  supplier: SupplierResponseDto;
  onSuccess?: () => void;
  onCancel?: () => void;
  isPending?: boolean;
}

export default function SupplierEditForm({
  supplier,
  onSuccess,
  onCancel,
  isPending: externalIsPending,
}: EditSupplierFormProps) {
  const updateMutation = useUpdateSupplier(supplier.id);

  const form = useForm<UpdateSupplierForm>({
    resolver: zodResolver(UpdateSupplierSchema),
    defaultValues: {
      name: supplier.name || "",
      contact_person: supplier.contact_person || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    },
  });

  const {
    isPending: isUpdatePending,
    isError,
    error,
    isSuccess,
  } = updateMutation;

  const combinedIsPending = isUpdatePending || externalIsPending;

  async function onSubmit(data: UpdateSupplierForm) {
    try {
      await updateMutation.mutateAsync(data);
      onSuccess?.();
      toast.success("Supplier updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Supplier update failed. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter supplier name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_person"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact person name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
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
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter supplier address" 
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {combinedIsPending ? "Updating..." : "Update Supplier"}
          </Button>
        </div>
      </form>
    </Form>
  );
}