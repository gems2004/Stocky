import { ProductResponseDto } from "@/api/type";
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

interface ProductTableActions {
  onEdit: (product: ProductResponseDto) => void;
  onDelete: (product: ProductResponseDto) => void;
}

export const createColumns = (actions: ProductTableActions): ColumnDef<ProductResponseDto>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="!p-0 font-bold"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-bold">{row.getValue("name")}</div>;
    },
  },
  {
    accessorKey: "sku",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="!p-0 font-bold"
        >
          SKU
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-gray-600">{row.getValue("sku")}</div>;
    },
  },
  {
    accessorKey: "barcode",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="!p-0 font-bold"
        >
          Barcode
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-gray-600">{row.getValue("barcode")}</div>;
    },
  },
  {
    accessorKey: "category.name",
    id: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="!p-0 font-bold"
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-gray-600">{row.original.category?.name}</div>;
    },
  },
  {
    accessorKey: "supplier.name",
    id: "supplier",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="!p-0 font-bold"
        >
          Supplier
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-gray-600">{row.original.supplier?.name}</div>;
    },
  },
  {
    accessorKey: "stockQuantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="!p-0 font-bold"
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-gray-600">{row.getValue("stockQuantity")}</div>;
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="!p-0 font-bold"
      >
        Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);

      return <div className="text-gray-600 font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "cost",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="!p-0 font-bold"
      >
        Cost
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const cost = parseFloat(row.getValue("cost"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(cost);

      return <div className="text-gray-600 font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;

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
            <DropdownMenuItem 
              onClick={() => actions.onEdit(product)}
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Product</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => actions.onDelete(product)}
              className="text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete Product</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
