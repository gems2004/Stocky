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
import { useCreateProduct } from "@/api/productsApi";
import { AlertCircleIcon, Scan } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetSuppliers } from "@/api/suppliersApi";
import { useGetCategories } from "@/api/categoriesApi";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { ProductForm, ProductSchema } from "./schema";
import { toast } from "sonner";

interface CreateProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isPending?: boolean;
}

export default function ProductCreateForm({
  onSuccess,
  onCancel,
  isPending: externalIsPending,
}: CreateProductFormProps) {
  const { data: categoriesData } = useGetCategories();
  const { data: suppliersData } = useGetSuppliers();

  const categories = categoriesData?.success ? categoriesData.data : [];
  const suppliers = suppliersData?.success ? suppliersData.data : [];

  const form = useForm<ProductForm>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 1,
      cost: 1,
      categoryId: 1,
      supplierId: 1,
      barcode: "",
      sku: "",
      stockQuantity: 0,
      minStockLevel: 1,
    },
  });

  const {
    mutateAsync: handleCreateProduct,
    isPending,
    isError,
    error,
  } = useCreateProduct();

  const combinedIsPending = isPending || externalIsPending;

  // Barcode scanner hook
  const onBarcodeScan = (code: string) => {
    form.setValue("barcode", code);
  };

  useBarcodeScanner(onBarcodeScan, { timeout: 150, minLength: 5 });

  async function onSubmit(data: ProductForm) {
    try {
      await handleCreateProduct(data);
      onSuccess?.();
      form.reset();
      toast.success("Product created successfully");
    } catch (error) {
      console.error("Creation error:", error);
      toast.error("Product creation failed. Please try again.");
    }
  }

  return (
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

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode:</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Enter or scan barcode" 
                      {...field} 
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="absolute right-0 top-0 h-full rounded-l-none"
                      onClick={() => {}}
                    >
                      <Scan className="h-4 w-4" />
                    </Button>
                  </div>
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
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price:</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter price"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity:</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter stock quantity"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                <FormLabel>Min Stock Level:</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter min stock level"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
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
              <FormLabel>Description:</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description"
                  {...field}
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
            {combinedIsPending ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}