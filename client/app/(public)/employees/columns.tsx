import { useDeleteUser } from "@/api/usersApi";
import { UserResponseDto } from "@/api/type";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export const columns: ColumnDef<UserResponseDto>[] = [
  {
    accessorKey: "firstName",
    header: () => <span className="font-bold">Name</span>,
    cell: ({ row }) => {
      return (
        <div className="font-bold">
          {row.original.firstName} {row.original.lastName}
        </div>
      );
    },
  },
  {
    accessorKey: "username",
    header: () => <span className="font-bold">Username</span>,
  },
  {
    accessorKey: "email",
    header: () => <span className="font-bold">Email</span>,
  },
  {
    accessorKey: "role",
    header: () => <span className="font-bold">Role</span>,
  },
  {
    accessorKey: "created_at",
    header: () => <span className="font-bold">Date Created</span>,
    cell: ({ row }) => {
      const date: Date = row.getValue("created_at");
      const formatted = format(date, "MMM dd, yyyy");
      return formatted;
    },
  },
  {
    id: "actions",
    header: () => <span className="font-bold">Actions</span>,
    cell: ({ row }) => {
      const employee = row.original;
      const { mutateAsync: deleteUser } = useDeleteUser();

      async function handleDelete(id: number) {
        if (confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
          try {
            await deleteUser(id);
            toast.success("Employee deleted successfully");
          } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete employee");
          }
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Link href={"/employees/" + employee.id}>
                <div className="flex items-center gap-2">
                  <Edit />
                  <span>Edit Employee</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(employee.id)}>
              <div className="flex items-center gap-2 text-destructive cursor-pointer">
                <Trash className="text-destructive" />
                <span>Delete Employee</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
