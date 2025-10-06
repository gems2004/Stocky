import { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import H4 from "@/components/typography/H4";
import DataTable from "./dataTable";
import { useEffect, useState } from "react";
import { ArrowUpDown } from "lucide-react";

interface LowStockItem {
  id?: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
}

const LowStockItemsTable = () => {
  const [allData, setAllData] = useState<LowStockItem[]>([]);
  const [data, setData] = useState<LowStockItem[]>([]);
  const [total, setTotal] = useState(0);
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

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockData: LowStockItem[] = [
      {
        id: 1,
        name: "Notebooks",
        sku: "NB-001",
        category: "Stationery",
        stock: 3,
      },
      {
        id: 2,
        name: "Ballpoint Pens",
        sku: "BP-002",
        category: "Stationery",
        stock: 5,
      },
      {
        id: 3,
        name: "Stapler",
        sku: "ST-003",
        category: "Office Supplies",
        stock: 2,
      },
      {
        id: 4,
        name: "Highlighters",
        sku: "HL-004",
        category: "Stationery",
        stock: 4,
      },
      {
        id: 5,
        name: "Paper Clips",
        sku: "PC-005",
        category: "Office Supplies",
        stock: 1,
      },
      {
        id: 6,
        name: "Pencils",
        sku: "PC-006",
        category: "Stationery",
        stock: 7,
      },
      {
        id: 7,
        name: "Eraser",
        sku: "ER-007",
        category: "Stationery",
        stock: 3,
      },
      { id: 8, name: "Ruler", sku: "RU-008", category: "Stationery", stock: 4 },
      {
        id: 9,
        name: "Sticky Notes",
        sku: "SN-009",
        category: "Stationery",
        stock: 6,
      },
      {
        id: 10,
        name: "Scissors",
        sku: "SC-010",
        category: "Office Supplies",
        stock: 0,
      },
      {
        id: 11,
        name: "Tape Dispenser",
        sku: "TD-011",
        category: "Office Supplies",
        stock: 2,
      },
      {
        id: 12,
        name: "Paper Clips Large",
        sku: "PCL-012",
        category: "Office Supplies",
        stock: 5,
      },
      {
        id: 13,
        name: "Index Cards",
        sku: "IC-013",
        category: "Stationery",
        stock: 8,
      },
      {
        id: 14,
        name: "Correction Fluid",
        sku: "CF-014",
        category: "Stationery",
        stock: 1,
      },
      {
        id: 15,
        name: "Paper Tray",
        sku: "PT-015",
        category: "Office Supplies",
        stock: 3,
      },
      {
        id: 16,
        name: "Calculator",
        sku: "CAL-016",
        category: "Office Supplies",
        stock: 2,
      },
      {
        id: 17,
        name: "Staples Refill",
        sku: "SR-017",
        category: "Office Supplies",
        stock: 4,
      },
      {
        id: 18,
        name: "Binder Clips",
        sku: "BC-018",
        category: "Office Supplies",
        stock: 7,
      },
      {
        id: 19,
        name: "Pens Gel",
        sku: "PG-019",
        category: "Stationery",
        stock: 5,
      },
      {
        id: 20,
        name: "Markers Permanent",
        sku: "MP-020",
        category: "Stationery",
        stock: 6,
      },
    ];

    // Apply initial sorting to mock data
    const sortedData = [...mockData].sort((a, b) => a.stock - b.stock);
    setAllData(sortedData);
    setTotal(sortedData.length);
    
    // Set the initial page of data
    const startIndex = pagination.pageIndex * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    setData(sortedData.slice(startIndex, endIndex));
  }, []);

  // Update data when pagination or sorting changes
  useEffect(() => {
    // Apply sorting to all data
    let sortedData = [...allData];
    if (sorting.length > 0) {
      const sortKey = sorting[0].id as keyof LowStockItem;
      const sortDirection = sorting[0].desc ? 'desc' : 'asc';
      
      sortedData.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (a[sortKey] > b[sortKey]) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    // Apply pagination
    const startIndex = pagination.pageIndex * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    setData(sortedData.slice(startIndex, endIndex));
  }, [pagination, sorting, allData]);

  const columns: ColumnDef<LowStockItem>[] = [
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
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.original.category}</div>
      ),
    },
    {
      accessorKey: "stock",
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
      <H4 className="mb-4 text-3xl font-bold">Low Stock Items</H4>
      <DataTable
        columns={columns}
        data={data}
        total={total}
        pagination={pagination}
        onPaginationChange={setPagination}
        pageCount={Math.ceil(total / pagination.pageSize)}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </div>
  );
};

export default LowStockItemsTable;
