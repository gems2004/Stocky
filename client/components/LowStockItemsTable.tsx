import {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import H4 from "@/components/typography/H4";
import DataTable from "./dataTable";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { useGetLowStockProducts } from "@/api/reportsApi";
import { ProductResponseDto } from "@/api/type";

const LowStockItemsTable = () => {
  const { data: lowStockData, isLoading, isError, error } = useGetLowStockProducts();
  const lowStockProducts = lowStockData?.success ? lowStockData.data : [];
  const total = lowStockProducts.length;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "stock",
      desc: false, // Sort by stock in ascending order by default
    },
  ]);

  // Apply pagination to the fetched data
  const startIndex = pagination.pageIndex * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const data = lowStockProducts.slice(startIndex, endIndex);

  const columns: ColumnDef<ProductResponseDto>[] = [
    {
      accessorKey: "name",
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
      cell: ({ row }) => <div className="font-bold">{row.original.name}</div>,
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.original.sku}</div>
      ),
    },
    {
      accessorKey: "categoryId",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.original.category?.name || 'N/A'}</div>
      ),
    },
    {
      accessorKey: "stock_quantity",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="!p-0 text-center w-full justify-center"
          >
            Stock Left
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const stock = row.original.stock_quantity;
        let textColor = "";

        if (stock <= 2) {
          textColor = "text-red-600";
        } else if (stock <= 5) {
          textColor = "text-yellow-600";
        } else {
          textColor = "text-green-600";
        }

        return (
          <div className="text-center font-bold">
            <span className={textColor}>{stock}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              className="text-primary font-bold hover:underline p-0 h-auto"
              onClick={() => console.log("Restock item:", row.original.name)}
            >
              Restock
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-primary/20 p-6 bg-white">
        <H4 className="mb-4 text-3xl font-bold">Low Stock Items</H4>
        <div className="text-center py-8">Loading low stock items...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-primary/20 p-6 bg-white">
        <H4 className="mb-4 text-3xl font-bold">Low Stock Items</H4>
        <div className="text-center py-8 text-red-500">Error loading low stock items</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 p-6 bg-white">
      <H4 className="mb-4 text-3xl font-bold">Low Stock Items</H4>
      <DataTable
        columns={columns}
        data={data}
        total={total}
        pagination={pagination}
        onPaginationChange={setPagination}
        pageCount={Math.ceil(total / pagination.pageSize)}
      />
    </div>
  );
};

export default LowStockItemsTable;
