import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, MoreHorizontal, Trash } from "lucide-react";
import Link from "next/link";
import { TransactionResponseDto } from "@/api/type";

export const columns: ColumnDef<TransactionResponseDto>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="!p-0 font-bold"
        >
          Order ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-bold">{row.getValue("id")}</div>;
    },
  },
  {
    accessorKey: "customer",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="!p-0 font-bold"
        >
          Customer
        </Button>
      );
    },
    cell: ({ row }) => {
      const customer = row.original.customer;
      if (customer) {
        return <div className="text-muted-foreground">{customer.firstName} {customer.lastName}</div>;
      }
      return <div className="text-muted-foreground">Walk-in Customer</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="!p-0 font-bold"
        >
          Date
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return <div className="text-muted-foreground">{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="!p-0 font-bold"
      >
        Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="font-medium text-muted-foreground">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="!p-0 font-bold"
        >
          Status
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;
      const statusClass = status === "completed" 
        ? "bg-green-100 text-green-900" 
        : "bg-yellow-100 text-yellow-900";
      
      return (
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const transaction = row.original;
      
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
              <Link href={"/orders/" + transaction.id}>
                <div className="flex items-center gap-2">
                  <Edit />
                  <span>View Order</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex items-center gap-2 text-destructive">
                <Trash className="text-destructive" />
                <span>Delete Order</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];