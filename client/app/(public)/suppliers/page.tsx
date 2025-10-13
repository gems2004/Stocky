"use client";
import H3 from "@/components/typography/H3";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetSuppliers, useDeleteSupplier } from "@/api/suppliersApi";
import { useState } from "react";
import { SupplierResponseDto } from "@/api/type";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SupplierCreateForm from "@/app/(public)/suppliers/new/CreateSupplierForm";
import { toast } from "sonner";
import SupplierEditForm from "@/app/(public)/suppliers/edit/EditSupplierForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import DataTable from "@/components/dataTable";
import { createColumns } from "./columns";
import { PaginationState } from "@tanstack/react-table";

export default function Suppliers() {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: suppliers, isLoading, refetch } = useGetSuppliers();
  const { mutateAsync: handleDeleteSupplier } = useDeleteSupplier();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierResponseDto | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (!suppliers?.success) return <div>Error loading suppliers</div>;

  const pagination = {
    pageIndex,
    pageSize,
  };

  const onPaginationChange = (
    updater: React.SetStateAction<PaginationState>
  ) => {
    setPagination(updater);
  };

  const pageCount = Math.ceil(suppliers.data.total / pageSize);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refetch(); // Refresh the suppliers list
  };

  const handleDeleteDialogConfirm = async () => {
    if (selectedSupplier) {
      try {
        await handleDeleteSupplier(selectedSupplier.id);
        refetch(); // Refresh the suppliers list
        toast.success("Supplier deleted successfully");
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete supplier");
      }
    }
  };

  const openDeleteDialog = (supplier: SupplierResponseDto) => {
    setSelectedSupplier(supplier);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (supplier: SupplierResponseDto) => {
    setSelectedSupplier(supplier);
    setEditDialogOpen(true);
  };

  // Define actions to be passed to columns
  const actions = {
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
  };

  // Use the columns with actions
  const columns = createColumns(actions);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
        <H3>Suppliers:</H3>
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
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <input
            type="text"
            placeholder="Search suppliers..."
            className="bg-white border rounded-md px-3 py-2 text-sm w-full sm:w-64"
          />
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the supplier "
              {selectedSupplier?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDialogConfirm}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update the supplier information.
            </DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <SupplierEditForm
              supplier={selectedSupplier}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Supplier Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Supplier</DialogTitle>
            <DialogDescription>
              Add a new supplier to your system.
            </DialogDescription>
          </DialogHeader>
          <SupplierCreateForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Supplier List */}
      <div className="w-full p-6 bg-white rounded-xl shadow-sm">
        <DataTable
          columns={columns}
          data={suppliers.data}
          total={0}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          pageCount={pageCount}
        />
      </div>
    </div>
  );
}
