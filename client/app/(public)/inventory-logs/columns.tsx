import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

// Define the type for our inventory log data
export type InventoryLog = {
  id: number;
  product: {
    name: string;
  };
  quantityChange: number;
  reason: string;
  dateTime: Date;
};

export const columns: ColumnDef<InventoryLog>[] = [
  {
    accessorKey: "product.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="!p-0 font-bold"
        >
          Product Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-bold">{row.original.product?.name || 'N/A'}</div>;
    },
  },
  {
    accessorKey: "quantityChange",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="!p-0 font-bold"
        >
          Quantity Change
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const quantityChange = row.getValue("quantityChange") as number;
      const displayValue = quantityChange > 0 ? `+${quantityChange}` : quantityChange.toString();
      const bgColor = quantityChange > 0 ? "bg-green-100" : "bg-red-100";
      const textColor = quantityChange > 0 ? "text-green-800" : "text-red-800";
      
      return (
        <div className={`${bgColor} ${textColor} rounded-full px-3 py-1 text-xs font-medium inline-block text-center`}>
          {displayValue}
        </div>
      );
    },
  },
  {
    accessorKey: "reason",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="!p-0 font-bold"
        >
          Reason
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-gray-600">{row.getValue("reason") as string}</div>;
    },
  },
  {
    accessorKey: "dateTime",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="!p-0 font-bold"
        >
          Date Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.original.dateTime;
      return <div className="text-gray-600">{format(date, "MMM dd, yyyy HH:mm")}</div>;
    },
  },
];