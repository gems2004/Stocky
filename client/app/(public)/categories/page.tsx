"use client";
import { Button } from "@/components/ui/button";
import {
  useGetCategories,
  useDeleteCategory,
  useUpdateCategoryWithId,
} from "@/api/categoriesApi";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CategoryResponseDto, UpdateCategoryDto } from "@/api/type";
import { Plus, ArrowRight, MoreHorizontal, Edit, Trash } from "lucide-react";
import H3 from "@/components/typography/H3";
import { Card } from "@/components/ui/card";
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
import CategoryCreateForm from "@/app/(public)/categories/new/CreateCategoryForm";
import { toast } from "sonner";
import CategoryEditForm from "./edit/EditCategoryForm";

export default function Categories() {
  const { data: response, isLoading, isSuccess, refetch } = useGetCategories();
  const { mutateAsync: handleDeleteCategory } = useDeleteCategory();
  const updateMutation = useUpdateCategoryWithId();
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryResponseDto | null>(null);

  useEffect(() => {
    if (response?.success) {
      setCategories(response.data);
    }
  }, [response]);

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
  };

  const handleDialogOpen = () => {
    setIsCreateDialogOpen(true);
  };

  const openDeleteDialog = (category: CategoryResponseDto) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogConfirm = async () => {
    if (selectedCategory) {
      try {
        await handleDeleteCategory(selectedCategory.id);
        refetch(); // Refresh the categories list
        toast.success("Category deleted successfully");
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete category");
      }
    }
  };

  const openEditDialog = (category: CategoryResponseDto) => {
    setSelectedCategory(category);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (updatedData: UpdateCategoryDto) => {
    if (selectedCategory) {
      try {
        await updateMutation.mutateAsync({
          id: selectedCategory.id,
          updateCategoryDto: updatedData,
        });
        refetch(); // Refresh the categories list
        toast.success("Category updated successfully");
        setEditDialogOpen(false);
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Failed to update category");
      }
    }
  };

  const CategoryActionsDropdown = ({
    category,
  }: {
    category: CategoryResponseDto;
  }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 absolute top-2 right-2"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => openEditDialog(category)}>
            <div className="flex items-center gap-2">
              <Edit />
              <span>Edit Category</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDeleteDialog(category)}>
            <div className="flex items-center gap-2 text-destructive cursor-pointer">
              <Trash className="text-destructive" />
              <span>Delete Category</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const handleDialogCloseForEdit = () => {
    setEditDialogOpen(false);
  };

  if (isLoading) {
    return <div className="p-4 max-w-4xl mx-auto mt-8">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between py-4">
        <H3>Categories:</H3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleDialogOpen}>
              <Plus className="mr-1" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new category for your products.
              </DialogDescription>
            </DialogHeader>
            <CategoryCreateForm
              onSuccess={() => {
                refetch();
                setIsCreateDialogOpen(false);
              }}
              onCancel={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "
              {selectedCategory?.name}"? This action cannot be undone.
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

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information.
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <CategoryEditForm
              category={selectedCategory}
              onSuccess={() => {
                refetch();
                setEditDialogOpen(false);
              }}
              onCancel={handleDialogCloseForEdit}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="p-4 h-32 flex flex-col justify-between relative hover:shadow-md transition-shadow"
          >
            <CategoryActionsDropdown category={category} />
            <Link href={`/categories/${category.id}`}>
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg">{category.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {category.productCount || 0}{" "}
                    {category.productCount === 1 ? "product" : "products"}
                  </p>
                </div>
                <ArrowRight className="text-primary size-6 self-end" />
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
