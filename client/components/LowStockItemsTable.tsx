import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import H4 from "@/components/typography/H4";
import DataTable from "./dataTable";
import { useEffect, useState } from "react";

interface LowStockItem {
  id?: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
}

const LowStockItemsTable = () => {
  const [data, setData] = useState<LowStockItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockData: LowStockItem[] = [
      { id: 1, name: "Notebooks", sku: "NB-001", category: "Stationery", stock: 3 },
      { id: 2, name: "Ballpoint Pens", sku: "BP-002", category: "Stationery", stock: 5 },
      { id: 3, name: "Stapler", sku: "ST-003", category: "Office Supplies", stock: 2 },
      { id: 4, name: "Highlighters", sku: "HL-004", category: "Stationery", stock: 4 },
      { id: 5, name: "Paper Clips", sku: "PC-005", category: "Office Supplies", stock: 1 },
      { id: 6, name: "Pencils", sku: "PC-006", category: "Stationery", stock: 7 },
      { id: 7, name: "Eraser", sku: "ER-007", category: "Stationery", stock: 3 },
      { id: 8, name: "Ruler", sku: "RU-008", category: "Stationery", stock: 4 },
    ];
    
    setData(mockData);
    setTotal(mockData.length);
  }, []);

  const columns: ColumnDef<LowStockItem>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="font-bold">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.original.sku}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.original.category}</div>
      ),
    },
    {
      accessorKey: "stock",
      header: () => <div className="text-center">Stock Left</div>,
      cell: ({ row }) => {
        const stock = row.original.stock;
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

  return (
    <div className="rounded-2xl border border-primary/20 p-6 bg-white">
      <H4 className="mb-4">Low Stock Items</H4>
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