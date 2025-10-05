"use client";
import { Button } from "@/components/ui/button";
import { useGetCategories } from "@/api/categoriesApi";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryResponseDto } from "@/api/type";
import { Edit, Trash2 } from "lucide-react";
import { useDeleteCategory } from "@/api/categoriesApi";
import H3 from "@/components/typography/H3";

export default function Categories() {
  const { data: response, isLoading, isSuccess, refetch } = useGetCategories();
  const { mutateAsync: handleDeleteCategory } = useDeleteCategory();
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);

  useEffect(() => {
    if (response?.success) {
      setCategories(response.data);
    }
  }, [response]);

  const handleDelete = async (id: number) => {
    try {
      await handleDeleteCategory(id);
      refetch(); // Refresh the categories list
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (isLoading) {
    return <div className="p-4 max-w-4xl mx-auto mt-8">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <H3 className="py-4">Categories:</H3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Description</TableHead>
                <TableHead className="font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>{category.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-4">
                        <Link href={`/categories/${category.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="size-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="border-destructive text-destructive"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No categories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <Link href="/categories/new" className="self-end">
        <Button>Create Category</Button>
      </Link>
    </div>
  );
}
