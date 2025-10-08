"use client";
import H3 from "@/components/typography/H3";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetSuppliers, useDeleteSupplier } from "@/api/suppliersApi";
import { useEffect, useState } from "react";
import { SupplierResponseDto } from "@/api/type";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SupplierCreateForm from "@/app/(public)/suppliers/new/CreateSupplierForm";
import { toast } from "sonner";
import SupplierEditForm from "@/app/(public)/suppliers/edit/EditSupplierForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Suppliers() {
  const { data: response, isLoading, isSuccess, refetch } = useGetSuppliers();
  const { mutateAsync: handleDeleteSupplier } = useDeleteSupplier();
  const [suppliers, setSuppliers] = useState<SupplierResponseDto[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierResponseDto | null>(null);

  useEffect(() => {
    if (response?.success) {
      setSuppliers(response.data);
    }
  }, [response]);

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
  };

  const handleDialogOpen = () => {
    setIsCreateDialogOpen(true);
  };

  const openDeleteDialog = (supplier: SupplierResponseDto) => {
    setSelectedSupplier(supplier);
    setDeleteDialogOpen(true);
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

  const openEditDialog = (supplier: SupplierResponseDto) => {
    setSelectedSupplier(supplier);
    setEditDialogOpen(true);
  };

  const handleDialogCloseForEdit = () => {
    setEditDialogOpen(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!response?.success) return <div>Error loading suppliers</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
        <H3>Suppliers:</H3>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <Select>
              <SelectTrigger className="w-fit bg-white px-3 py-2 text-black">
                <svg className="w-4 h-4 mr-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
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
                <svg className="w-4 h-4 mr-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleDialogOpen}>
                <Plus className="mr-1 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Supplier</DialogTitle>
                <DialogDescription>
                  Add a new supplier to your system.
                </DialogDescription>
              </DialogHeader>
              <SupplierCreateForm
                onSuccess={() => {
                  refetch();
                  setIsCreateDialogOpen(false);
                }}
                onCancel={handleDialogClose}
              />
            </DialogContent>
          </Dialog>
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDialogConfirm}>
              Delete
            </Button>
          </DialogFooter>
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
              onSuccess={() => {
                refetch();
                setEditDialogOpen(false);
              }}
              onCancel={handleDialogCloseForEdit}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Supplier List */}
      <div className="w-full p-6 bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-bold">Name</th>
              <th className="text-left py-3 px-4 font-bold">Contact Person</th>
              <th className="text-left py-3 px-4 font-bold">Phone</th>
              <th className="text-left py-3 px-4 font-bold">Email</th>
              <th className="text-left py-3 px-4 font-bold">Address</th>
              <th className="text-left py-3 px-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-bold">{supplier.name}</td>
                <td className="py-3 px-4 text-gray-600">{supplier.contact_person}</td>
                <td className="py-3 px-4 text-gray-600">{supplier.phone}</td>
                <td className="py-3 px-4 text-gray-600">{supplier.email}</td>
                <td className="py-3 px-4 text-gray-600">{supplier.address}</td>
                <td className="py-3 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openEditDialog(supplier)}>
                        <div className="flex items-center gap-2">
                          <Edit />
                          <span>Edit Supplier</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(supplier)}>
                        <div className="flex items-center gap-2 text-destructive cursor-pointer">
                          <Trash className="text-destructive" />
                          <span>Delete Supplier</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}