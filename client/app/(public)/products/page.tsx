"use client";
import H3 from "@/components/typography/H3";
import { Plus } from "lucide-react";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/dataTable";
import {
  useGetProducts,
  useDeleteProduct,
  useUpdateProductWithId,
} from "@/api/productsApi";
import { PaginationState } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductCreateForm from "./new/CreateProductForm";
import ProductEditForm from "./edit/EditProductForm";
import { ProductResponseDto } from "@/api/type";
import { toast } from "sonner";
import { createColumns } from "./columns";

export default function Inventory() {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: products,
    isLoading,
    refetch,
  } = useGetProducts(pageIndex + 1, pageSize);
  const { mutateAsync: handleDeleteProduct } = useDeleteProduct();
  const updateMutation = useUpdateProductWithId();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponseDto | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (!products?.success) return <div>Error loading products</div>;

  const pagination = {
    pageIndex,
    pageSize,
  };

  const onPaginationChange = (
    updater: React.SetStateAction<PaginationState>
  ) => {
    setPagination(updater);
  };

  const pageCount = Math.ceil(products.data.total / pageSize);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refetch(); // Refresh the products list
  };

  const handleEditSubmit = async (updatedData: any) => {
    if (selectedProduct) {
      try {
        await updateMutation.mutateAsync({
          id: selectedProduct.id,
          updateProductDto: updatedData,
        });
        refetch(); // Refresh the products list
        toast.success("Product updated successfully");
        setIsEditDialogOpen(false);
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Failed to update product");
      }
    }
  };

  const handleDeleteDialogConfirm = async () => {
    if (selectedProduct) {
      try {
        await handleDeleteProduct(selectedProduct.id);
        refetch(); // Refresh the products list
        toast.success("Product deleted successfully");
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const openDeleteDialog = (product: ProductResponseDto) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (product: ProductResponseDto) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  // Define actions to be passed to columns
  const actions = {
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
  };

  // Use the columns with actions
  const columns = createColumns(actions);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
        <H3 className="py-4">Products</H3>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <Select>
              <SelectTrigger className="w-fit bg-white px-3 py-2 text-black">
                <svg
                  className="w-4 h-4 mr-2 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span>Filter</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-fit bg-white px-3 py-2 text-black">
                <svg
                  className="w-4 h-4 mr-2 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                <span>Sort</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="bg-white border rounded-md px-3 py-2 text-sm w-full sm:w-64"
          />
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="self-end"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
      <div className="w-full p-6 bg-white rounded-xl shadow-sm">
        <DataTable
          columns={columns}
          data={products.data.data}
          total={products.data.total}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          pageCount={pageCount}
        />
      </div>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory.
            </DialogDescription>
          </DialogHeader>
          <ProductCreateForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      {selectedProduct && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the product information.
              </DialogDescription>
            </DialogHeader>
            <ProductEditForm
              product={selectedProduct}
              onSuccess={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedProduct && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this product? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteDialogConfirm();
                }}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
