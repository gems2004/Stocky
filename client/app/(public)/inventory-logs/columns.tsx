import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

// Define the type for our inventory log data based on backend response
export type InventoryLog = {
  id: number;
  product_id: number;
  change_amount: number;
  reason: string;
  user_id: number;
  created_at: Date;
};

export const columns: ColumnDef<InventoryLog>[] = [
  {
    accessorKey: "product_id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="!p-0 font-bold"
        >
          Product ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-bold">{`Product ID: ${row.original.product_id}`}</div>;
    },
  },
  {
    accessorKey: "change_amount",
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
      const change_amount = row.getValue("change_amount") as number;
      const displayValue = change_amount > 0 ? `+${change_amount}` : change_amount.toString();
      const bgColor = change_amount > 0 ? "bg-green-100" : "bg-red-100";
      const textColor = change_amount > 0 ? "text-green-800" : "text-red-800";
      
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
    accessorKey: "created_at",
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
      const date = new Date(row.original.created_at);
      return <div className="text-gray-600">{format(date, "MMM dd, yyyy HH:mm")}</div>;
    },
  },
];