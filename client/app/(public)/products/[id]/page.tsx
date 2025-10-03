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
import { UpdateProductForm, UpdateProductSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  useUpdateProduct,
  useGetProductById,
  useDeleteProduct,
} from "@/api/productsApi";
import { useRouter, useParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetCategories,
  useGetSuppliers,
} from "@/api/categoriesAndSuppliersApi";
import H3 from "@/components/typography/H3";

export default function UpdateProduct() {
  const { id } = useParams();
  if (!id) return;
  const productId = parseInt(id.toString());
  const { data: productData, isLoading: productLoading } =
    useGetProductById(productId);
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategories();
  const { data: suppliersData, isLoading: suppliersLoading } =
    useGetSuppliers();

  const categories = categoriesData?.success ? categoriesData.data : [];
  const suppliers = suppliersData?.success ? suppliersData.data : [];

  const product = productData?.success ? productData.data : null;

  const form = useForm<UpdateProductForm>({
    resolver: zodResolver(UpdateProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 1,
      cost: 1,
      categoryId: 1,
      supplierId: 1,
      barcode: "",
      sku: "",
      minStockLevel: 1,
    },
  });

  const {
    mutateAsync: handleUpdateProduct,
    isPending,
    isError,
    error,
    isSuccess,
  } = useUpdateProduct(productId);

  const {
    mutateAsync: handleDeleteProduct,
    isPending: isDeleting,
    isError: isDeleteError,
    error: deleteError,
    isSuccess: isDeleteSuccess,
  } = useDeleteProduct();

  const router = useRouter();

  async function handleDelete() {
    if (
      confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      try {
        await handleDeleteProduct(productId);
        router.push("/inventory");
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  }

  // Set initial form values when product data is loaded
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        price: product.price,
        cost: product.cost,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        barcode: product.barcode,
        sku: product.sku,
        minStockLevel: product.minStockLevel,
      });
    }
  }, [product, form]);

  async function onSubmit(data: UpdateProductForm) {
    try {
      await handleUpdateProduct(data);
      // After successful update, navigate back to inventory page
      setTimeout(() => {
        router.push("/inventory");
      }, 2000); // Wait 2 seconds to show success message
    } catch (error) {
      console.error("Update error:", error);
    }
  }

  if (productLoading || categoriesLoading || suppliersLoading) {
    return <div className="p-4 max-w-4xl mx-auto mt-8">Loading...</div>;
  }

  if (!product) {
    return <div className="p-4 max-w-4xl mx-auto mt-8">Product not found</div>;
  }

  return (
    <>
      <H3 className="pt-4 pb-8">Update Product:</H3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name:</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price:</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost:</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter cost"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minStockLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Stock Level:</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter minimum stock level"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category:</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier:</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem
                          key={supplier.id}
                          value={supplier.id.toString()}
                        >
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode:</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter barcode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU:</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter SKU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{"Description (Optional):"}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
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
              <AlertTitle>Product update failed!</AlertTitle>
              <AlertDescription>
                <p>
                  {error?.message || "Product update failed. Please try again."}
                </p>
              </AlertDescription>
            </Alert>
          )}
          {isSuccess && (
            <Alert variant="success">
              <AlertCircleIcon />
              <AlertTitle>Product update success!</AlertTitle>
              <AlertDescription>
                <p>Product updated successfully.</p>
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
              {isDeleting ? "Deleting..." : "Delete Product"}
            </Button>
            <div className="flex gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/inventory")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </div>

          {isDeleteError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Product deletion failed!</AlertTitle>
              <AlertDescription>
                <p>
                  {deleteError?.message ||
                    "Product deletion failed. Please try again."}
                </p>
              </AlertDescription>
            </Alert>
          )}
          {isDeleteSuccess && (
            <Alert variant="success">
              <AlertCircleIcon />
              <AlertTitle>Product deletion success!</AlertTitle>
              <AlertDescription>
                <p>Product deleted successfully.</p>
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Form>
    </>
  );
}
