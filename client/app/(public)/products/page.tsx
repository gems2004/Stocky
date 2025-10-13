"use client";
import H3 from "@/components/typography/H3";
import { ArrowUpDown, Filter, Plus } from "lucide-react";

import React, { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/dataTable";
import {
  useGetProducts,
  useDeleteProduct,
  useSearchProduct,
} from "@/api/productsApi";
import { PaginationState } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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

  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay

  const {
    data: products,
    isLoading,
    refetch,
  } = useGetProducts(pageIndex + 1, pageSize);

  const {
    data: searchResults,
    isLoading: isSearching,
    refetch: refetchSearch,
  } = useSearchProduct(debouncedSearchQuery);

  const { mutateAsync: handleDeleteProduct } = useDeleteProduct();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponseDto | null>(null);

  // Determine which data to display based on the debounced query
  // But use searchResults if they exist even if debouncedSearchQuery is empty
  // (this handles the transition state when debouncing)
  const shouldShowSearchResults = debouncedSearchQuery && searchResults;
  const currentData = shouldShowSearchResults ? searchResults : products;

  // Show loading only when the actual data we want to display is loading
  const isLoadingToShow = shouldShowSearchResults ? isSearching : isLoading;

  if (isLoadingToShow) return <div>Loading...</div>;
  if (!currentData?.success) {
    if (shouldShowSearchResults) {
      return <div>Error loading search results</div>;
    } else {
      return <div>Error loading products</div>;
    }
  }

  const pagination = {
    pageIndex,
    pageSize,
  };

  const onPaginationChange = (
    updater: React.SetStateAction<PaginationState>
  ) => {
    setPagination(updater);
  };

  const pageCount = Math.ceil(currentData.data.total / pageSize);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    if (debouncedSearchQuery) {
      refetchSearch(); // Refresh the search results
    } else {
      refetch(); // Refresh the products list
    }
  };

  const handleDeleteDialogConfirm = async () => {
    if (selectedProduct) {
      try {
        await handleDeleteProduct(selectedProduct.id);
        if (debouncedSearchQuery) {
          refetchSearch(); // Refresh the search results
        } else {
          refetch(); // Refresh the products list
        }
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
                <Filter />
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
                <ArrowUpDown />
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          data={currentData.data.data}
          total={currentData.data.total}
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
